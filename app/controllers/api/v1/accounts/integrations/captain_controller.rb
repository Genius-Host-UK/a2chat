class Api::V1::Accounts::Integrations::CaptainController < Api::V1::Accounts::BaseController
  before_action :check_admin_authorization?
  before_action :hook
  before_action :validate_method, only: :proxy

  def proxy
    base_url = InstallationConfig.find_by(name: 'CAPTAIN_API_URL').value

    # even if the base_url has /api URL.join will get
    # rid of it, so the request path has to include it
    url = URI.join(base_url, request_path).to_s

    # permit all
    params[:body].permit! if params[:body].present?

    # make the request to the Captain service
    # also add the access token and email to header use X-User-Email and X-User-Token
    response = HTTParty.send(params[:method].downcase, url, body: params[:body].to_json, headers: headers)

    response.headers.each { |key, value| headers[key] = value }
    render plain: response.body, status: response.code
  end

  private

  def headers
    {
      'X-User-Email' => hook.settings['account_email'],
      'X-User-Token' => hook.settings['access_token'],
      'Content-Type' => 'application/json',
      'Accept' => '*/*'
    }
  end

  def request_path
    paths = if params[:route] === '/sessions/profile'
              %w[api sessions profile]
            else
              ['api', 'accounts', hook.settings['account_id'], params[:route]]
            end

    File.join(*paths)
  end

  def hook
    @hook ||= Current.account.hooks.find_by!(app_id: 'captain')
  end

  def validate_method
    return if params[:method].present? && %w[get post put patch delete options head].include?(params[:method].downcase)

    render json: { error: 'Invalid or missing HTTP method' }, status: :unprocessable_entity
  end
end