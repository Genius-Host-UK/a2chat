import { createConsumer } from '@rails/actioncable';
import { BUS_EVENTS } from 'shared/constants/busEvents';

const PRESENCE_INTERVAL = 20000;

class BaseActionCableConnector {
  constructor(app, pubsubToken, websocketHost = '') {
    const websocketURL = websocketHost ? `${websocketHost}/cable` : undefined;
    this.consumer = createConsumer(websocketURL);
    this.subscription = this.consumer.subscriptions.create(
      {
        channel: 'RoomChannel',
        pubsub_token: pubsubToken,
        account_id: app.$store.getters.getCurrentAccountId,
        user_id: app.$store.getters.getCurrentUserID,
      },
      {
        updatePresence() {
          this.perform('update_presence');
          if (this.isDisconnected) {
            console.log(
              'Are you ready to refresh the conversation?',
              this.isDisconnected
            );
            window.bus.$emit(BUS_EVENTS.REFRESH_CONVERSATION);
          }
          this.isDisconnected = false;
        },
        received: this.onReceived,
        disconnected: this.onDisconnected,
      }
    );
    this.app = app;
    this.events = {};
    this.isAValidEvent = () => true;
    this.isDisconnected = false;

    setInterval(() => {
      this.subscription.updatePresence();
    }, PRESENCE_INTERVAL);
  }

  disconnect() {
    this.consumer.disconnect();
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnected() {
    this.isDisconnected = true;
    console.log('onDisconnected', this.isDisconnected);
    window.bus.$emit(BUS_EVENTS.WEBSOCKET_DISCONNECT);
  }

  onReceived = ({ event, data } = {}) => {
    if (this.isAValidEvent(data)) {
      if (this.events[event] && typeof this.events[event] === 'function') {
        this.events[event](data);
      }
    }
  };
}

export default BaseActionCableConnector;
