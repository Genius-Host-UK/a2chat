import ApiClient from '../ApiClient';

class TwilioChannel extends ApiClient {
  constructor() {
    super('channels/twilio_channels', { accountScoped: true });
  }
}

export default new TwilioChannel();
