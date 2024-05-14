import * as MutationHelpers from 'shared/helpers/vuex/mutationHelpers';
import types from '../mutation-types';
import StageAPI from '../../api/stages';

export const state = {
  records: [],
  uiFlags: {
    isFetching: false,
    isCreating: false,
    isUpdating: false,
  },
};

export const getters = {
  getUIFlags(_state) {
    return _state.uiFlags;
  },
  getStages: _state => {
    return _state.records;
  },
  getEnabledStages: _state => {
    return _state.records.filter(record => record.disabled === false);
  },
  getStagesByType:
    _state =>
    (stageType, disableIncluded = true) => {
      return _state.records.filter(
        record =>
          (record.stage_type === stageType ||
            record.stage_type === 'both' ||
            stageType === 'both') &&
          (record.disabled === false || disableIncluded)
      );
    },
};

export const actions = {
  get: async ({ commit }) => {
    commit(types.SET_STAGE_UI_FLAG, { isFetching: true });
    try {
      const response = await StageAPI.get();
      commit(types.SET_STAGE, response.data);
    } catch (error) {
      // Ignore error
    } finally {
      commit(types.SET_STAGE_UI_FLAG, { isFetching: false });
    }
  },
  update: async ({ commit }, { id, ...updateObj }) => {
    commit(types.SET_STAGE_UI_FLAG, { isUpdating: true });
    try {
      const response = await StageAPI.update(id, updateObj);
      commit(types.EDIT_STAGE, response.data);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      throw new Error(errorMessage);
    } finally {
      commit(types.SET_STAGE_UI_FLAG, { isUpdating: false });
    }
  },
};

export const mutations = {
  [types.SET_STAGE_UI_FLAG](_state, data) {
    _state.uiFlags = {
      ..._state.uiFlags,
      ...data,
    };
  },

  [types.ADD_STAGE]: MutationHelpers.create,
  [types.SET_STAGE]: MutationHelpers.set,
  [types.EDIT_STAGE]: MutationHelpers.update,
  [types.DELETE_STAGE]: MutationHelpers.destroy,
};

export default {
  namespaced: true,
  actions,
  state,
  getters,
  mutations,
};
