# == Schema Information
#
# Table name: notifications
#
#  id                   :bigint           not null, primary key
#  last_activity_at     :datetime
#  meta                 :jsonb
#  notification_type    :integer          not null
#  primary_actor_type   :string           not null
#  read_at              :datetime
#  secondary_actor_type :string
#  snoozed_until        :datetime
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  account_id           :bigint           not null
#  primary_actor_id     :bigint           not null
#  secondary_actor_id   :bigint
#  user_id              :bigint           not null
#
# Indexes
#
#  index_notifications_on_account_id               (account_id)
#  index_notifications_on_last_activity_at         (last_activity_at)
#  index_notifications_on_user_id                  (user_id)
#  uniq_primary_actor_per_account_notifications    (primary_actor_type,primary_actor_id)
#  uniq_secondary_actor_per_account_notifications  (secondary_actor_type,secondary_actor_id)
#

class Notification < ApplicationRecord
  include MessageFormatHelper
  belongs_to :account
  belongs_to :user

  belongs_to :primary_actor, polymorphic: true
  belongs_to :secondary_actor, polymorphic: true, optional: true

  NOTIFICATION_TYPES = {
    conversation_creation: 1,
    conversation_assignment: 2,
    assigned_conversation_new_message: 3,
    conversation_mention: 4,
    participating_conversation_new_message: 5
  }.freeze

  enum notification_type: NOTIFICATION_TYPES

  before_create :set_last_activity_at
  after_create_commit :process_notification_delivery, :dispatch_create_event
  after_destroy_commit :dispatch_destroy_event
  after_update_commit :dispatch_update_event

  PRIMARY_ACTORS = ['Conversation'].freeze

  def push_event_data
    # Secondary actor could be nil for cases like system assigning conversation
    payload = {
      id: id,
      notification_type: notification_type,
      primary_actor_type: primary_actor_type,
      primary_actor_id: primary_actor_id,
      read_at: read_at,
      secondary_actor: secondary_actor&.push_event_data,
      user: user&.push_event_data,
      created_at: created_at.to_i,
      last_activity_at: last_activity_at.to_i,
      snoozed_until: snoozed_until,
      meta: meta,
      account_id: account_id

    }
    if primary_actor.present?
      payload[:primary_actor] = primary_actor&.push_event_data
      # TODO: Rename push_message_title to push_message_body
      payload[:push_message_title] = push_message_body
    end
    payload
  end

  def fcm_push_data
    {
      id: id,
      notification_type: notification_type,
      primary_actor_id: primary_actor_id,
      primary_actor_type: primary_actor_type,
      primary_actor: primary_actor.push_event_data.with_indifferent_access.slice('conversation_id', 'id')
    }
  end

  # TODO: move to a data presenter
  def push_message_title
    case notification_type
    when 'conversation_creation'
      I18n.t('notifications.notification_title.conversation_creation', display_id: conversation.display_id, inbox_name: primary_actor.inbox.name)
    when 'conversation_assignment'
      I18n.t('notifications.notification_title.conversation_assignment', display_id: conversation.display_id)
    when 'assigned_conversation_new_message', 'participating_conversation_new_message'
      I18n.t('notifications.notification_title.assigned_conversation_new_message', display_id: conversation.display_id)
    when 'conversation_mention'
      I18n.t('notifications.notification_title.conversation_mention', display_id: conversation.display_id)
    else
      ''
    end
  end

  def push_message_body
    case notification_type
    when 'conversation_creation'
      conversation_creation_body
    when 'assigned_conversation_new_message', 'participating_conversation_new_message', 'conversation_assignment'
      message_created_body
    when 'conversation_mention'
      mention_body
    else
      ''
    end
  end

  def conversation_creation_body
    message_content(conversation.messages.first)
  end

  def message_created_body
    message_content(secondary_actor)
  end

  def mention_body
    message_content(secondary_actor)
  end

  private

  def message_content(actor)
    sender_name = actor&.sender&.name || ''
    content = actor&.content
    attachments = actor&.attachments

    "#{sender_name}: #{if content.present?
                         transform_user_mention_content(content.truncate_words(10))
                       else
                         (attachments.present? ? I18n.t('notifications.attachment') : I18n.t('notifications.no_content'))
                       end}"
  end

  def conversation
    primary_actor
  end

  def process_notification_delivery
    Notification::PushNotificationJob.perform_later(self) if user_subscribed_to_notification?('push')

    # Should we do something about the case where user subscribed to both push and email ?
    # In future, we could probably add condition here to enqueue the job for 30 seconds later
    # when push enabled and then check in email job whether notification has been read already.
    Notification::EmailNotificationJob.perform_later(self) if user_subscribed_to_notification?('email')

    Notification::RemoveDuplicateNotificationJob.perform_later(self)
  end

  def user_subscribed_to_notification?(delivery_type)
    notification_setting = user.notification_settings.find_by(account_id: account.id)
    return false if notification_setting.blank?

    # Check if the user has subscribed to the specified type of notification
    notification_setting.public_send("#{delivery_type}_#{notification_type}?")
  end

  def dispatch_create_event
    Rails.configuration.dispatcher.dispatch(NOTIFICATION_CREATED, Time.zone.now, notification: self)
  end

  def dispatch_update_event
    Rails.configuration.dispatcher.dispatch(NOTIFICATION_UPDATED, Time.zone.now, notification: self)
  end

  def dispatch_destroy_event
    Rails.configuration.dispatcher.dispatch(NOTIFICATION_DELETED, Time.zone.now, notification: self)
  end

  def set_last_activity_at
    self.last_activity_at = created_at
  end
end
