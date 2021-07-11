import * as MutationHelpers from 'shared/helpers/vuex/mutationHelpers';
import types from '../mutation-types';
import CSATReports from '../../api/csatReports';

const computeDistribution = (value, total) =>
  ((value * 100) / total).toFixed(2);

export const state = {
  records: [],
  metrics: {
    totalResponseCount: 0,
    ratingsCount: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
    totalSentMessagesCount: 0,
  },
  uiFlags: {
    isFetching: false,
    isFetchingItem: false,
    isCreating: false,
    isDeleting: false,
    isFetchingMetrics: false,
  },
};

export const getters = {
  getCSATResponses(_state) {
    return _state.records;
  },
  getMetrics(_state) {
    return _state.metrics;
  },
  getUIFlags(_state) {
    return _state.uiFlags;
  },
  getSatisfactionScore(_state) {
    if (!_state.metrics.totalResponseCount) {
      return 0;
    }
    return computeDistribution(
      _state.metrics.ratingsCount[4] + _state.metrics.ratingsCount[5],
      _state.metrics.totalResponseCount
    );
  },
  getResponseRate(_state) {
    if (!_state.metrics.totalSentMessagesCount) {
      return 0;
    }
    return computeDistribution(
      _state.metrics.totalResponseCount,
      _state.metrics.totalSentMessagesCount
    );
  },
  getRatingPercentage(_state) {
    if (!_state.metrics.totalResponseCount) {
      return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
    return {
      1: computeDistribution(
        _state.metrics.ratingsCount[1],
        _state.metrics.totalResponseCount
      ),
      2: computeDistribution(
        _state.metrics.ratingsCount[2],
        _state.metrics.totalResponseCount
      ),
      3: computeDistribution(
        _state.metrics.ratingsCount[3],
        _state.metrics.totalResponseCount
      ),
      4: computeDistribution(
        _state.metrics.ratingsCount[4],
        _state.metrics.totalResponseCount
      ),
      5: computeDistribution(
        _state.metrics.ratingsCount[5],
        _state.metrics.totalResponseCount
      ),
    };
  },
};

export const actions = {
  get: async function getResponses({ commit }, { page = 1 } = {}) {
    commit(types.SET_CSAT_RESPONSE_UI_FLAG, { isFetching: true });
    try {
      const response = await CSATReports.get({ page });
      commit(types.SET_CSAT_RESPONSE, response.data);
    } catch (error) {
      // Ignore error
    } finally {
      commit(types.SET_CSAT_RESPONSE_UI_FLAG, { isFetching: false });
    }
  },
  getMetrics: async function getMetrics({ commit }) {
    commit(types.SET_CSAT_RESPONSE_UI_FLAG, { isFetching: true });
    try {
      const response = await CSATReports.getMetrics();
      commit(types.SET_CSAT_RESPONSE_METRICS, response.data);
    } catch (error) {
      // Ignore error
    } finally {
      commit(types.SET_CSAT_RESPONSE_UI_FLAG, { isFetching: false });
    }
  },
};

export const mutations = {
  [types.SET_CSAT_RESPONSE_UI_FLAG](_state, data) {
    _state.uiFlags = {
      ..._state.uiFlags,
      ...data,
    };
  },

  [types.SET_CSAT_RESPONSE]: MutationHelpers.set,
  [types.SET_CSAT_RESPONSE_METRICS](
    _state,
    {
      total_count: totalResponseCount,
      ratings_count: ratingsCount,
      total_sent_messages_count: totalSentMessagesCount,
    }
  ) {
    _state.metrics.totalResponseCount = totalResponseCount;
    _state.metrics.ratingsCount = ratingsCount;
    _state.metrics.totalSentMessagesCount = totalSentMessagesCount;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
