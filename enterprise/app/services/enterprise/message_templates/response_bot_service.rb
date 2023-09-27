class Enterprise::MessageTemplates::ResponseBotService
  pattr_initialize [:conversation!]

  def perform
    ActiveRecord::Base.transaction do
      response = get_response(conversation.messages.last.content)
      process_response(response)
    end
  rescue StandardError => e
    process_action('handoff') # something went wrong, pass to agent
    ChatwootExceptionTracker.new(e, account: conversation.account).capture_exception
    true
  end

  def response_sections(content)
    sections = ''

    inbox.get_responses(content).each do |response|
      sections += "{context_id: #{response.id}, context: #{response.question} ? #{response.answer}},"
    end
    sections
  end

  private

  delegate :contact, :account, :inbox, to: :conversation

  def get_response(content)
    previous_messages = []
    get_previous_messages(previous_messages)
    ChatGpt.new(response_sections(content)).generate_response('', previous_messages)
  end

  def get_previous_messages(previous_messages)
    conversation.messages.where(message_type: [:outgoing, :incoming]).where(private: false).find_each do |message|
      next if message.content_type != 'text'

      role = determine_role(message)
      previous_messages << { content: message.content, role: role }
    end
  end

  def determine_role(message)
    message.message_type == 'incoming' ? 'user' : 'system'
  end

  def process_response(response)
    if response['response'] == 'conversation_handoff'
      process_action('handoff')
    else
      create_messages(response)
    end
  end

  def process_action(action)
    case action
    when 'handoff'
      conversation.messages.create!('message_type': :outgoing, 'account_id': conversation.account_id, 'inbox_id': conversation.inbox_id,
                                    'content': 'passing to an agent')
      conversation.update(status: :open)
    end
  end

  def create_messages(response_payload)
    response = response_payload['response']
    article_ids = response_payload['context_ids']
    create_outgoing_message(response)
    create_outgoing_message_with_cards(article_ids) if article_ids.present?
  end

  def create_outgoing_message(response)
    conversation.messages.create!(
      {
        message_type: :outgoing,
        account_id: conversation.account_id,
        inbox_id: conversation.inbox_id,
        content: response
      }
    )
  end

  def create_outgoing_message_with_cards(article_ids)
    content_attributes = get_article_hash(article_ids.uniq)
    return if content_attributes.blank?

    conversation.messages.create!(
      {
        message_type: :outgoing,
        account_id: conversation.account_id,
        inbox_id: conversation.inbox_id,
        content: 'suggested articles',
        content_type: 'article',
        content_attributes: content_attributes
      }
    )
  end

  def get_article_hash(article_ids)
    items = []
    article_ids.first(3).each do |article_id|
      response = Response.find(article_id)
      next if response.nil?

      items << { title: response.question, description: response.answer[0, 80], link: response.response_document.document_link }
    end

    items.present? ? { items: items } : {}
  end
end
