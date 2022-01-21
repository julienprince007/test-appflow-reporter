const state = {
  checkedReports: []
}

const getters = {
  checkedReports: (state) => {
    return state.checkedReports
  }
}

const actions = {
  setcheckedReport({ commit }, next) {
    commit('SET_CHECKED_REPORT', next)
  },
  reset({ commit }, auditId) {
    commit('RESET', auditId)
  }
}

const mutations = {
  SET_CHECKED_REPORT(state, next) {
    const report = state.checkedReports.find(
      (el) => el.auditId === next.auditId
    )
    if (!report) {
      state.checkedReports.push(next)
    } else {
      state.checkedReports.find((el) => {
        if (el.auditId === next.auditId) {
          el.auditId = next.auditId
          el.id = next.id
        }
      })
    }
  },
  RESET(state, auditId) {
    state.checkedReports = state.checkedReports.filter(
      (el) => el.auditId !== auditId
    )
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  namespaced: true
}
