class RenameSenderIdToContactInConversation < ActiveRecord::Migration[6.1]
  def change
    rename_column :conversations, :sender_id, :contact_id
  end
end
