module AssignmentConcern
  # sync up assignee info between contact and the initial conversation
  def initial_conversation?
    contact = @conversation.contact
    @conversation.id == contact.initial_conversation&.id
  end

  def update_contact
    return unless initial_conversation?

    contact = @conversation.contact
    contact.assignee = @agent if params[:assignee_id].present?
    contact.team = @team if params[:team_id].present?
    contact.save!
  end

  def update_conversation
    return unless contact_update_params[:assignee_id].present? || contact_update_params[:team_id].present?

    conversation = @contact.initial_conversation
    return if conversation.blank?

    update_conversation_assignee(conversation) if contact_update_params[:assignee_id].present?
    update_conversation_team(conversation) if contact_update_params[:team_id].present?
    conversation.save!
  end

  def update_conversation_assignee(conversation)
    assignee = @contact.assignee
    return if assignee.present? && conversation.inbox.assignable_agents.exclude?(assignee)

    conversation.assignee = assignee
  end

  def update_conversation_team(conversation)
    team = @contact.team
    return if team.present? && conversation.inbox.team.present? && conversation.inbox.team.id != team.id

    conversation.team = team
  end
end
