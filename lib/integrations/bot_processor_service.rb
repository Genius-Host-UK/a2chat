class Integrations::BotProcessorService
  pattr_initialize [:event_name!, :hook!, :event_data!]

  def perform
    message = event_data[:message]
    return if message.private?
    return unless processable_message?(message)
    return unless conversation.pending?

    content = message_content(message)
    response = get_response(conversation.contact_inbox.source_id, content) if content.present?
    process_response(message, response) if response.present?
  rescue StandardError => e
    ChatwootExceptionTracker.new(e, account: agent_bot).capture_exception
  end

  private

  def conversation
    message = event_data[:message]
    @conversation ||= message.conversation
  end

  def message_content(message)
    # TODO: might needs to change this to a way that we fetch the updated value from event data instead
    # cause the message.updated event could be that that the message was deleted

    return message.content_attributes['submitted_values']&.first&.dig('value') if event_name == 'message.updated'

    message.content
  end

  def processable_message?(message)
    # TODO: change from reportable and create a dedicated method for this?
    return unless message.reportable?
    return if message.outgoing? && !processable_outgoing_message?(message)

    true
  end

  def processable_outgoing_message?(message)
    event_name == 'message.updated' && ['input_select'].include?(message.content_type)
  end

  def process_action(message, action)
    case action
    when 'handoff'
      message.conversation.open!
    when 'resolve'
      message.conversation.resolved!
    end
  end
end
