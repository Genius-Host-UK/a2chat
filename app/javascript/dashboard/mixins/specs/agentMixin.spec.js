import { shallowMount, createLocalVue } from '@vue/test-utils';
import agentMixin from '../agentMixin';
import agentFixtures from './agentFixtures';
import Vuex from 'vuex';
const localVue = createLocalVue();
localVue.use(Vuex);

describe('agentMixin', () => {
  let getters;
  let store;
  beforeEach(() => {
    getters = {
      getCurrentUser: () => ({
        id: 1,
        availability_status: 'busy',
      }),
    };
    store = new Vuex.Store({ getters });
  });

  it('return agents by availability', () => {
    const Component = {
      render() {},
      title: 'TestComponent',
      mixins: [agentMixin],
      data() {
        return {
          inboxId: 1,
          currentChat: { meta: { assignee: { name: 'John' } } },
        };
      },
      computed: {
        assignableAgents() {
          return agentFixtures.allAgents;
        },
      },
    };
    const wrapper = shallowMount(Component, { store, localVue });
    expect(
      wrapper.vm.getAgentsByAvailability(agentFixtures.allAgents, 'online')
    ).toEqual(agentFixtures.onlineAgents);
    expect(
      wrapper.vm.getAgentsByAvailability(agentFixtures.allAgents, 'busy')
    ).toEqual(agentFixtures.busyAgents);
    expect(
      wrapper.vm.getAgentsByAvailability(agentFixtures.allAgents, 'offline')
    ).toEqual(agentFixtures.offlineAgents);
  });

  it('return sorted agents by availability', () => {
    const Component = {
      render() {},
      title: 'TestComponent',
      mixins: [agentMixin],
      data() {
        return {
          inboxId: 1,
          currentChat: { meta: { assignee: { name: 'John' } } },
        };
      },
      computed: {
        assignableAgents() {
          return agentFixtures.allAgents;
        },
      },
    };
    const wrapper = shallowMount(Component, { store, localVue });
    expect(
      wrapper.vm.sortedAgentsByAvailability(agentFixtures.allAgents)
    ).toEqual(agentFixtures.sortedByAvailability);
  });

  it('return formatted agents', () => {
    const Component = {
      render() {},
      title: 'TestComponent',
      mixins: [agentMixin],
      data() {
        return {
          inboxId: 1,
          currentChat: { meta: { assignee: { name: 'John' } } },
        };
      },
      computed: {
        assignableAgents() {
          return agentFixtures.allAgents;
        },
      },
    };
    const wrapper = shallowMount(Component, { store, localVue });
    expect(wrapper.vm.agentsList).toEqual(agentFixtures.formattedAgents);
  });
});
