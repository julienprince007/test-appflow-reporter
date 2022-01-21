const state = {
  id: null,
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  img: '',
  canCloseIssues: false,
  recipients: [],
  agencies: [],
  notifications: [],
  token: '',
  scopes: []
}

const getters = {
  attributes: (state) => {
    // *
    return {
      id: state.id,
      firstName: state.firstName,
      lastName: state.lastName,
      img: state.img,
      canCloseIssues: state.canCloseIssues,
      recipients: state.recipients,
      scopes: state.scopes
    }
  },
  token: (state) => state.token, // *
  agencies: (state) => state.agencies, // *
  residences: (state) => {
    let residences = []
    state.agencies.forEach((agency) => {
      residences = [...residences, ...agency.residences]
    })
    return residences
  }, // *
  places: (state) => {
    let places = []
    state.agencies.forEach((agency) => {
      agency.residences.forEach((residence) => {
        places = [...places, ...residence.places]
      })
    })
    return places
  },
  notifications: (state) => state.notifications,
  notificationsCount: (state) => state.notifications.length
}

const actions = {
  authenticate(
    { commit, dispatch, rootGetters },
    { credentials, device, appVersion }
  ) {
    // *
    return new Promise((resolve) => {
      this._vm.$SowellProxy
        .authenticate(credentials, device, appVersion)
        .then((response) => {
          commit('SET_TOKEN', response.data.jwt)
          dispatch('setReporter').then((reporter) => {
            let promise1 = null
            let promise2 = null
            if (
              new Date(reporter.data.company['updated-at']).getTime() >=
              new Date(rootGetters['company/attributes'].updatedAt).getTime()
            ) {
              /*
            NOTE: Never logged in before or one of the company assets (zones/places/spots)
            has changed since the last download so that we retrieve all
            */
              promise1 = dispatch('company/load', reporter.data.company, {
                root: true
              })
              promise2 = new Promise((resolve) => {
                this._vm.$SowellProxy.loadReporterPlaces().then((response) => {
                  dispatch('setAgencies', response.data)
                  dispatch('setSpots', response.data)
                  resolve()
                })
              })
            } else {
              promise1 = new Promise((resolve) => resolve())
              promise2 = new Promise((resolve) => resolve())
            }
            Promise.all([promise1, promise2]).then(() => resolve())
          })
        })
    })
  },
  setToken: ({ commit }, token) => {
    commit('SET_TOKEN', token)
  },
  setReporter({ commit }) {
    return new Promise((resolve) => {
      this._vm.$SowellProxy.loadReporter().then((response) => {
        let reporter = {
          id: Math.trunc(response.data.id),
          email: response.data.email,
          firstName: response.data['first-name'],
          lastName: response.data['last-name'],
          recipients: response.data.recipients,
          img: response.data.img,
          canCloseIssues: response.data['can-close-issues']
        }
        this._vm.$SowellProxy.loadReporterScopes().then((scopes) => {
          reporter.scopes = scopes.data.map((key) => key.id)
          commit('SET_ALL', reporter)
          resolve(response)
        })
      })
    })
  },
  async setAgencies({ commit }, places) {
    let agencies = []
    
    places.forEach(async (place) => {
      if(place.residence?.agency?.id) {
        let agency = agencies.find(
          (agency) => agency.id === place.residence.agency.id
        )
        if (agency === undefined) {
          agency = place.residence.agency
          agency.residences = []
          agencies.push(agency)
        }
  
        let residence = agency.residences.find(
          (residence) => residence.id === place.residence.id
        )
        if (!residence) {
          residence = place.residence
          delete residence.agency
          agency.residences.push(residence)
        }
        delete place.residence
        residence.places.push(place)
      } 
    })
    commit('SET_AGENCIES', agencies)
  },
  async setSpots({ commit }, places) {
    const spots = []
    for (const place of places) {
      await this._vm.$SowellProxy.loadPlaceSpots(place.id).then((response) => {
        spots.push({
          placeId: place.id,
          spots: response.data.map((spot) => {
            return {
              id: Math.trunc(spot.id),
              name: spot.name,
              categoryId: Math.trunc(spot.category.id)
            }
          })
        })
      })
    }
    commit('SET_SPOTS', spots)
  },
  sendAlert({ commit }, next) {
    // *
    return new Promise((resolve) => {
      this._vm.$SowellProxy
        .sendAlert(next.lonlat, next.message)
        .then((response) => resolve(response))
    })
  },
  logout({ commit }) {
    // *
    commit('LOGOUT')
  },
  setNotifications({ commit }, next) {
    commit('SET_NOTIFICATIONS', next)
  },
  clearIssueNotifications({ commit }, next) {
    commit('CLEAR_ISSUE_NOTIFICATIONS', next)
  },
  reset({ dispatch, commit }) {
    // *
    commit('RESET')
    dispatch('audits/reset', null, { root: true })
    dispatch('company/reset', null, { root: true })
    dispatch('common/reset', null, { root: true })
  }
}

const mutations = {
  SET_ALL(state, reporter) {
    state.id = reporter.id
    state.email = reporter.email
    state.firstName = reporter.firstName
    state.lastName = reporter.lastName
    state.img = reporter.img
    state.canCloseIssues = reporter.canCloseIssues
    state.recipients = reporter.recipients
    state.scopes = reporter.scopes
  },
  SET_AGENCIES(state, next) {
    state.agencies = next
  },
  SET_SPOTS(state, next) {
    state.agencies.forEach((agency) => {
      agency.residences.forEach((residence) => {
        residence.places.forEach((place) => {
          place.spots = next.find(
            (el) => parseInt(el.placeId) === parseInt(place.id)
          ).spots
        })
      })
    })
  },
  SET_TOKEN(state, next) {
    state.token = next
  },
  SET_NOTIFICATIONS(state, next) {
    next.forEach((notif) => {
      state.notifications.push(notif)
    })
  },
  CLEAR_ISSUE_NOTIFICATIONS(state, next) {
    state.notifications = state.notifications.filter(
      (notif) => notif.id !== next.meta.id
    )
  },
  LOGOUT(state) {
    state.token = ''
  },
  RESET(state) {
    // NOTE: We don't reset the reporter email/password so that we can auto populate corresponding fields
    state.id = null
    state.firstName = ''
    state.lastName = ''
    state.img = ''
    state.canCloseIssues = false
    state.recipients = []
    state.agencies = []
    state.token = ''
    state.notifications = []
    state.scopes = []
  }
}
export default {
  state,
  getters,
  actions,
  mutations,
  namespaced: true
}
