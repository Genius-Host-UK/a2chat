json.source_id @contact_inbox.source_id
json.pubsub_token @contact_inbox.pubsub_token
json.partial! 'public/api/v1/models/contact', resource: @contact_inbox.contact, formats: [:json]
