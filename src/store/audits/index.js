const state = {
  untillDate: null,
  all: [],
  isLoadingAudits: true,
  auditsInOtherScopes: []
}

const getters = {
  all: (state) => state.all,
  reduceResidences: (state) => {
    let zones = helpers.removeDuplicates(
      Array.from(state.all, (audit) => audit.place.zone),
      'id'
    )
    zones.forEach((zone) => {
      let zoneAudits = state.all.filter(
        (audit) => audit.place.zone.id === zone.id
      )
      let places = helpers.removeDuplicates(
        Array.from(zoneAudits, (audit) => audit.place),
        'id'
      )
      let count = 0
      places.forEach((place) => {
        let placeAudits = state.all.filter(
          (audit) => audit.place.id === place.id
        )
        place.auditsCount = placeAudits.length
        count += place.auditsCount
      })
      zone.auditsCount = count
    })
    return zones.sort((a, b) => a.name.localeCompare(b.name))
  },
  reducePlacesByResidence: (state) => (residenceId) => {
    let zoneAudits = state.all.filter(
      (audit) => audit.place.zone.id === parseInt(residenceId)
    )
    let places = helpers.removeDuplicates(
      Array.from(zoneAudits, (audit) => audit.place),
      'id'
    )
    places.forEach((place) => {
      let placeAudits = state.all.filter((audit) => audit.place.id === place.id)
      place.auditsCount = placeAudits.length
    })
    return places.sort((a, b) => {
      let splitedA = a.name.split(' ')
      let numberA = splitedA[0]
      delete splitedA[0]
      let sortNameA = splitedA + numberA

      let splitedB = b.name.split(' ')
      let numberB = splitedB[0]
      delete splitedB[0]
      let sortNameB = splitedB + numberB

      return sortNameA.localeCompare(sortNameB, 'fr', {
        numeric: true,
        ignorePunctuation: true
      })
    })
  },
  byPlace: (state) => (placeId) =>
    state.all.filter((audit) => audit.place.id === parseInt(placeId)),
  isControleChanged: (state) => {
    return state.isLoadingAudits
  },
  auditsInOtherScopes: (state) => state.auditsInOtherScopes
}

const actions = {
  load({ commit, state }) {
    return new Promise((resolve) => {
      let untillDate = this._vm.$helpers.stringToDate(helpers.nextDueDate())
      if (state.untillDate !== untillDate) {
        this._vm.$SowellProxy.loadAudits(untillDate).then(async (response) => {
          // FIXME: Remove audits that are already marked as done on tmpReports local DB
          commit('COMMIT_UNTILL_DATE', untillDate)
          let audits = response.data
          for (const auditIndex in audits) {
            let audit = audits[auditIndex]
            audit.report = {
              id: null,
              checkpoints: [],
              'done-at': null
            }
            audit.checklist.id = Math.trunc(audit.checklist.id)
            audit.checklist.category.id = Math.trunc(
              audit.checklist.category.id
            )
            // FIXME:Audit.place.spots should be filtered in order to contain only spots with a category matching the audit's checklist category
            audit.place.id = Math.trunc(audit.place.id)
            audit.place.zone.id = Math.trunc(audit.place.zone.id)
            audit.report.id = Math.trunc(audit.report.id)

            await this._vm.$SowellProxy
              .loadCheckpoints(audit.id)
              .then((response) => {
                audit.checklist.checkpoints = helpers.serialize(response.data)
              })
          }
          commit('COMMIT_ALL', helpers.serialize(response.data))
          resolve()
          commit('SET_CONTROL_LOADED')
        })
      } else {
        resolve()
        commit('SET_CONTROL_LOADED')
      }
    })
  },
  loadAuditsInOtherScopes({ commit }, place) {
    return new Promise((resolve, reject) => {
      commit('SET_CONTROL_LOADING')
      this._vm.$SowellProxy.loadPlaceAudits(place.id).then(
        async (response) => {
          if (response.data.length === 0) {
            return resolve([])
          } else {
            let audits = response.data
            let results = []
            for (const auditIndex in audits) {
              let audit = { ...audits[auditIndex] }
              // convert id to integer
              audit.id = +audit.id
              audit.report = {
                id: null,
                checkpoints: [],
                'done-at': null
              }
              // convert id to integer
              audit.checklist.id = +audit.checklist.id
              audit.checklist.category.id = +audit.checklist.category.id
              audit.place.id = +audit.place.id
              audit.place.zone.id = +audit.place.zone.id
              audit.report.id = +audit.report.id

              await this._vm.$SowellProxy
                .loadCheckpoints(audit.id)
                .then((response) => {
                  audit.checklist.checkpoints = helpers.serialize(response.data)
                })
              results = [...results, audit]
            }

            commit('ADD_AUDITS_FROM_OTHER_SCOPE', results)
            commit('SET_CONTROL_LOADED')
            return resolve(results)
          }
        },
        () => {
          commit('SET_CONTROL_LOADED')
          this.$q.loading.hide()
          return reject('ERROR LOADING AUDITS')
        }
      )
    })
  },
  close({ commit }, next) {
    commit('CLOSE_AUDIT', next)
  },
  reset({ commit }, next) {
    commit('RESET', next)
    commit('RESET_AUDITS_IN_OTHER_SCOPES', next)
  }
}

const mutations = {
  COMMIT_ALL(state, next) {
    state.all = next
  },
  COMMIT_UNTILL_DATE(state, next) {
    state.untillDate = next
  },
  RESET(state) {
    state.untillDate = null
    state.all = []
    state.isLoadingAudits = true
  },
  CLOSE_AUDIT(state, next) {
    state.all = state.all.filter((audit) => audit.id !== next.id)
  },
  SET_CONTROL_LOADED(state) {
    state.isLoadingAudits = false
  },
  SET_CONTROL_LOADING(state) {
    state.isLoadingAudits = true
  },
  RESET_AUDITS_IN_OTHER_SCOPES(state) {
    state.auditsInOtherScopes = []
  },
  ADD_AUDITS_FROM_OTHER_SCOPE(state, audits) {
    state.auditsInOtherScopes = audits.map((next) => helpers.serialize(next))
  }
}

const helpers = {
  serialize: (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        item.id = Math.trunc(item.id)
        return item
      })
    } else {
      data.id = Math.trunc(data.id)
      return data
    }
  },

  nextDueDate: () => {
    var sunday = 7 // sunday
    var date = new Date()
    var diff = sunday - date.getDay()
    if (diff < 7) {
      date.setDate(date.getDate() + diff)
    } else {
      date.setDate(date.getDate())
    }
    return date
  },

  removeDuplicates: (myArr, prop) => {
    return myArr.filter((obj, pos, arr) => {
      return arr.map((mapObj) => mapObj[prop]).indexOf(obj[prop]) === pos
    })
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  namespaced: true
}
