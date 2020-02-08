require 'rails_helper'

RSpec.describe 'Agents API', type: :request do
  let(:account) { create(:account) }

  describe 'GET /api/v1/agents' do
    context 'when it is an unauthenticated user' do
      it 'returns unauthorized' do
        get '/api/v1/agents'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when it is an authenticated user' do
      let(:agent) { create(:user, account: account, role: :agent) }

      it 'returns all agents of account' do
        get '/api/v1/agents',
            headers: agent.create_new_auth_token,
            as: :json

        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body).size).to eq(account.users.count)
      end
    end
  end

  describe 'DELETE /api/v1/agents/:id' do
    let(:other_agent) { create(:user, account: account, role: :agent) }

    context 'when it is an unauthenticated user' do
      it 'returns unauthorized' do
        delete "/api/v1/agents/#{other_agent.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when it is an authenticated user' do
      let(:admin) { create(:user, account: account, role: :administrator) }

      it 'deletes an agent' do
        delete "/api/v1/agents/#{other_agent.id}",
               headers: admin.create_new_auth_token,
               as: :json

        expect(response).to have_http_status(:success)
        expect(account.users.size).to eq(1)
      end
    end
  end

  describe 'PUT /api/v1/agents/:id' do
    let(:other_agent) { create(:user, account: account, role: :agent) }

    context 'when it is an unauthenticated user' do
      it 'returns unauthorized' do
        put "/api/v1/agents/#{other_agent.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when it is an authenticated user' do
      let(:admin) { create(:user, account: account, role: :administrator) }

      params = { name: 'TestUser' }

      it 'modifies an agent' do
        put "/api/v1/agents/#{other_agent.id}",
            params: params,
            headers: admin.create_new_auth_token,
            as: :json

        expect(response).to have_http_status(:success)
        expect(other_agent.reload.name).to eq(params[:name])
      end
    end
  end

  describe 'POST /api/v1/agents' do
    let(:other_agent) { create(:user, account: account, role: :agent) }

    context 'when it is an unauthenticated user' do
      it 'returns unauthorized' do
        post '/api/v1/agents'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when it is an authenticated user' do
      let(:admin) { create(:user, account: account, role: :administrator) }

      params = { name: 'NewUser', email: Faker::Internet.email, role: :agent }

      it 'creates a new agent' do
        post '/api/v1/agents',
             params: params,
             headers: admin.create_new_auth_token,
             as: :json

        expect(response).to have_http_status(:success)
        expect(account.users.last.name).to eq('NewUser')
      end
    end
  end
end
