class Line::SendOnLineService < Base::SendOnChannelService
  private

  def channel_class
    Channel::Line
  end

  def perform_reply
    @channel.client.push_message(message.conversation.contact_inbox.source_id, [{ type: 'text', text: message.content }])
  end

  def inbox
    @inbox ||= message.inbox
  end

  def channel
    @channel ||= inbox.channel
  end
end
