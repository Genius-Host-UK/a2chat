class RoomChannel < ApplicationCable::Channel
  def subscribed
    stream_from params[:pubsub_token]
    ::OnlineStatusTracker.update_presence(params[:pubsub_token])
  end

  def unsubscribed
    ::OnlineStatusTracker.remove_presence(params[:pubsub_token])
  end
end
