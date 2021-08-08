import AvailabilityStatus from '../AvailabilityStatus';
import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import VueI18n from 'vue-i18n';

import WootButton from 'dashboard/components/ui/WootButton';
import i18n from 'dashboard/i18n';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueI18n);
localVue.component('woot-button', WootButton);

const i18nConfig = new VueI18n({
  locale: 'en',
  messages: i18n,
});

describe('AvailabilityStatus', () => {
  const currentUser = { availability_status: 'offline' };
  let store = null;
  let actions = null;
  let modules = null;
  let availabilityStatus = null;

  beforeEach(() => {
    actions = {
      updateAvailability: jest.fn(() => {
        return Promise.resolve();
      }),
    };

    modules = {
      auth: {
        getters: {
          getCurrentUser: () => currentUser,
        },
      },
    };

    store = new Vuex.Store({
      actions,
      modules,
    });

    availabilityStatus = mount(AvailabilityStatus, {
      store,
      localVue,
      i18n: i18nConfig,
    });
  });

  it('dispatches an action when user changes status', async () => {
    await availabilityStatus.find('button:first-child').trigger('click');

    expect(actions.updateAvailability).toBeCalledWith(
      expect.any(Object),
      { availability: 'online' },
      undefined
    );
  });
});
