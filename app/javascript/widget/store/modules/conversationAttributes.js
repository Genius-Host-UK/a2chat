import { SET_CONVERSATION_ATTRIBUTES } from '../types';
import { getConversationAPI } from '../../api/conversation';

const state = {
  id: '',
  status: '',
};

const getters = {
  getConversationParams: $state => $state,
};

const actions = {
  get: async ({ commit }) => {
    try {
      const { data } = await getConversationAPI();
      commit(SET_CONVERSATION_ATTRIBUTES, data);
    } catch (error) {
      // Ignore error
    }
  },
  update({ commit }, data) {
    commit(SET_CONVERSATION_ATTRIBUTES, data);
  },
};

const mutations = {
  [SET_CONVERSATION_ATTRIBUTES]($state, data) {
    $state.id = data.id;
    $state.status = data.status;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
