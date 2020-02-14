require 'rails_helper'

RSpec.describe 'Webhooks API', type: :request do
  let(:account) { create(:account) }
  let(:inbox) { create(:inbox, account: account) }
  let(:webhook) { create(:webhook, account: account, inbox: inbox, urls: ['https://hello.com']) }
  let(:administrator) { create(:user, account: account, role: :administrator) }
  let(:agent) { create(:user, account: account, role: :agent) }

  describe 'GET /api/v1/inbox/webhooks' do
    context 'when it is an authenticated agent' do
      it 'returns unauthorized' do
        get '/api/v1/inbox/webhooks',
            headers: agent.create_new_auth_token,
            as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when it is an authenticated admin user' do
      it 'gets all webhook' do
        get '/api/v1/inbox/webhooks',
            headers: administrator.create_new_auth_token,
            as: :json

        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body)['payload']['webhooks'].count).to eql account.webhooks.count
      end
    end
  end

  describe 'POST /api/v1/inbox/webhooks' do
    context 'when it is an authenticated agent' do
      it 'returns unauthorized' do
        post '/api/v1/inbox/webhooks',
             headers: agent.create_new_auth_token,
             as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when it is an authenticated admin user' do
      it 'creates webhook' do
        post '/api/v1/inbox/webhooks',
             params: { account_id: account.id, inbox_id: inbox.id, urls: ['https://hello.com'] },
             headers: administrator.create_new_auth_token,
             as: :json

        expect(response).to have_http_status(:success)

        expect(JSON.parse(response.body)['payload']['webhook']['urls']).to eql ['https://hello.com']
      end
    end
  end

  describe 'PUT /api/v1/inbox/webhooks/:id' do
    context 'when it is an authenticated agent' do
      it 'returns unauthorized' do
        put "/api/v1/inbox/webhooks/#{webhook.id}",
            headers: agent.create_new_auth_token,
            as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when it is an authenticated admin user' do
      it 'updates webhook' do
        put "/api/v1/inbox/webhooks/#{webhook.id}",
            params: { urls: ['https://hello.com', 'https://world.com'] },
            headers: administrator.create_new_auth_token,
            as: :json

        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body)['payload']['webhook']['urls']).to eql ['https://hello.com', 'https://world.com']
      end
    end
  end

  describe 'DELETE /api/v1/inbox/webhooks/:id' do
    context 'when it is an authenticated agent' do
      it 'returns unauthorized' do
        delete "/api/v1/inbox/webhooks/#{webhook.id}",
               headers: agent.create_new_auth_token,
               as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when it is an authenticated admin user' do
      it 'deletes webhook' do
        delete "/api/v1/inbox/webhooks/#{webhook.id}",
               headers: administrator.create_new_auth_token,
               as: :json

        expect(response).to have_http_status(:success)
        expect(account.webhooks.count).to be 0
      end
    end
  end
end
