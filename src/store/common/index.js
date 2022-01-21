const state = {
  hasPendingReports: false,
  hasPendingIssues: false,
  appRestartRequired: false
}

const getters = {
  hasPendingChanges: (state) =>
    state.hasPendingReports || state.hasPendingIssues,
  appRestartRequired: (state) => state.appRestartRequired
}

const actions = {
  setPendingReports({ commit }) {
    commit('SET_HAS_PENDING_REPORTS', true)
  },
  clearPendingReports({ commit }) {
    commit('SET_HAS_PENDING_REPORTS', false)
  },
  setPendingIssues({ commit }) {
    commit('SET_HAS_PENDING_ISSUES', true)
  },
  clearPendingIssues({ commit }) {
    commit('SET_HAS_PENDING_ISSUES', false)
  },
  setAppRequiresRestart({ commit }, isRequired) {
    commit('SET_APP_RESTART_REQUIRED', isRequired)
  },
  reset({ commit }) {
    commit('RESET')
  }
}

const mutations = {
  SET_HAS_PENDING_REPORTS(state, next) {
    state.hasPendingReports = next
  },
  SET_HAS_PENDING_ISSUES(state, next) {
    state.hasPendingIssues = next
  },
  SET_APP_RESTART_REQUIRED(state, next) {
    state.appRestartRequired = next
  },
  RESET(state) {
    // NOTE: We don't reset the reporter email/password so that we can auto populate corresponding fields
    state.hasPendingReports = false
    state.hasPendingIssues = false
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  namespaced: true
}
