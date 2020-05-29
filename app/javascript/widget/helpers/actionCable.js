import BaseActionCableConnector from '../../shared/helpers/BaseActionCableConnector';

class ActionCableConnector extends BaseActionCableConnector {
  constructor(app, pubsubToken) {
    super(app, pubsubToken);
    this.events = {
      'message.created': this.onMessageCreated,
      'message.updated': this.onMessageUpdated,
      'conversation.typing_on': this.onTypingOn,
      'conversation.typing_off': this.onTypingOff,
      'conversation.resolved': this.onStatusChange,
      'conversation.opened': this.onStatusChange,
    };
  }

  onStatusChange = data => {
    this.app.$store.dispatch('conversationAttributes/update', data);
  };

  onMessageCreated = data => {
    this.app.$store.dispatch('conversation/addMessage', data);
  };

  onMessageUpdated = data => {
    this.app.$store.dispatch('conversation/updateMessage', data);
  };

  onTypingOn = ({ user }) => {
    this.clearTimer();
    this.app.$store.dispatch('conversation/toggleAgentTyping', {
      status: 'on',
      user,
    });
    this.initTimer();
  };

  onTypingOff = ({ user }) => {
    this.clearTimer();
    this.app.$store.dispatch('conversation/toggleAgentTyping', {
      status: 'off',
      user,
    });
  };

  clearTimer = () => {
    if (this.CancelTyping) {
      clearTimeout(this.CancelTyping);
      this.CancelTyping = null;
    }
  };

  initTimer = () => {
    // Turn off typing automatically after 30 seconds
    this.CancelTyping = setTimeout(() => {
      this.onTypingOff();
    }, 30000);
  };
}

export const refreshActionCableConnector = pubsubToken => {
  if (!pubsubToken) {
    return;
  }
  window.chatwootPubsubToken = pubsubToken;
  window.actionCable.disconnect();
  window.actionCable = new ActionCableConnector(
    window.WOOT_WIDGET,
    window.chatwootPubsubToken
  );
};

export default ActionCableConnector;
