class Api::V1::Accounts::TicketsController < Api::V1::Accounts::BaseController
  before_action :fetch_ticket, only: [:show, :update, :destroy, :assign, :resolve]
  before_action :create_or_update_labels, only: [:update]
  before_action :check_authorization

  def index
    @tickets = current_account.tickets.search(params[:query])
  end

  def show
    head :not_found if @ticket.nil?
  end

  def create
    @ticket = current_account.tickets.create!(ticket_params.merge(user: current_user))
    create_or_update_labels
  end

  def update
    @ticket.update!(ticket_params)
  end

  def destroy
    @ticket.destroy!
    head :ok
  end

  def assign
    @ticket.assignee = User.find(params[:user_id]) || current_user
    @ticket.save!
  end

  def resolve
    raise CustomExceptions::Ticket, I18n.t('activerecord.errors.models.ticket.errors.already_resolved') if @ticket.resolved?

    @ticket.update!(status: :resolved)
  end

  private

  def create_or_update_labels
    @ticket.labels << find_labels(params[:labels]) if params.key?(:labels)
  rescue ActiveRecord::RecordNotUnique
    raise CustomExceptions::Ticket, I18n.t('activerecord.errors.models.ticket.errors.already_label_assigned')
  end

  def find_labels(labels)
    return [] if labels.blank?

    labels.map { |label| current_account.labels.find_id_or_title(label[:id] || label[:title]) }.flatten
  end

  def fetch_ticket
    @ticket = current_account.tickets.find(params[:id])
  end

  def ticket_params
    request_params = params.require(:ticket).permit(:title, :description, :status, :assigned_to, :conversation_id)
    request_params[:conversation_id] = params.dig(:conversation, :id) if params.dig(:conversation, :id).present?
    request_params
  end
end
