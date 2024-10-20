class Conversations::ReopenSnoozedConversationsJob < ApplicationJob
  queue_as :low

  def perform
    ConversationPlan.where(status: :todo).where(snoozed_until: 3.days.ago..Time.current).all.find_each(batch_size: 100) do |conversation_plan|
      conversation = conversation_plan.conversation
      I18n.with_locale(conversation.account.locale) do
        content = I18n.t('conversations.activity.status.open_from_snoozed')
        message_params = { account_id: conversation.account_id, inbox_id: conversation.inbox_id, message_type: :activity, content: content }
        conversation.messages.create!(message_params)
        conversation.open!
        conversation_plan.doing!
      end
    end
  end
end
