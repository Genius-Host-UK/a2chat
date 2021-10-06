require 'rails_helper'

RSpec.describe 'Super Admin Account Users API', type: :request do
  let(:super_admin) { create(:super_admin) }

  describe 'GET /super_admin/account_users/new' do
    context 'when it is an unauthenticated super admin' do
      it 'returns unauthorized' do
        get '/super_admin/account_users/new'
        expect(response).to have_http_status(:redirect)
      end
    end

    context 'when it is an authenticated super admin' do
      it 'shows the account user create page' do
        sign_in super_admin
        get '/super_admin/account_users/new'
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe 'DELETE /super_admin/account_users/:id' do
    context 'when user has only one account' do
      let(:account_user) { create(:account_user) }

      it 'redirects to the account details' do
        sign_in super_admin
        delete "/super_admin/account_users/#{account_user.id}"
        expect(response).to have_http_status(:redirect)
        expect(response).to redirect_to("/super_admin/accounts/#{account_user.account.id}")
      end
    end
  end
end
