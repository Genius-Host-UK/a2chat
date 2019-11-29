# frozen_string_literal: true

# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  confirmation_sent_at   :datetime
#  confirmation_token     :string
#  confirmed_at           :datetime
#  current_sign_in_at     :datetime
#  current_sign_in_ip     :string
#  email                  :string
#  encrypted_password     :string           default(""), not null
#  image                  :string
#  last_sign_in_at        :datetime
#  last_sign_in_ip        :string
#  name                   :string           not null
#  nickname               :string
#  provider               :string           default("email"), not null
#  pubsub_token           :string
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  role                   :integer          default("agent")
#  sign_in_count          :integer          default(0), not null
#  tokens                 :json
#  uid                    :string           default(""), not null
#  unconfirmed_email      :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  account_id             :integer          not null
#  inviter_id             :bigint
#
# Indexes
#
#  index_users_on_email                 (email)
#  index_users_on_inviter_id            (inviter_id)
#  index_users_on_pubsub_token          (pubsub_token) UNIQUE
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#  index_users_on_uid_and_provider      (uid,provider) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (inviter_id => users.id) ON DELETE => nullify
#


FactoryBot.define do
  factory :user do
    transient do
      skip_confirmation { true }
    end

    provider { 'email' }
    uid { SecureRandom.uuid }
    name { Faker::Name.name }
    nickname { Faker::Name.first_name }
    email { nickname + '@example.com' }
    role { 'agent' }
    password { 'password' }
    account

    after(:build) do |user, evaluator|
      user.skip_confirmation! if evaluator.skip_confirmation
    end
  end
end
