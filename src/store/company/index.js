const state = {
  id: null,
  name: null,
  categories: [],
  showIsPrivate: true,
  updatedAt: '1970-01-01T00:00:00.000Z',
  externalIssuesUrl: null,
  hasAudits: false,
  allowUnplannedAudits: false,
  showUnscopedHistory: false,
  forwardIssues: {}
}

const getters = {
  attributes: (state) => {
    return {
      id: state.id,
      name: state.name,
      showIsPrivate: state.showIsPrivate,
      updatedAt: state.updatedAt,
      externalIssuesUrl: state.externalIssuesUrl,
      hasAudits: state.hasAudits,
      allowUnplannedAudits: state.allowUnplannedAudits,
      showUnscopedHistory: state.showUnscopedHistory,
      forwardIssues: state.forwardIssues
    }
  },
  categories: (state) => state.categories,
  findCategoryBySubcategoryId: (state) => (id) =>
    state.categories.find((category) =>
      category.childs.map((subcategory) => subcategory.id).includes(id)
    ),
  findCategoryById: (state) => (id) => {
    let cat = null
    state.categories.forEach((category) => {
      category.childs.forEach((subcategory) => {
        if (subcategory.id === id) {
          cat = subcategory
        }
      })
    })
    return cat
  }
}

const actions = {
  load({ commit }, company) {
    return new Promise((resolve) =>
      this._vm.$SowellProxy.loadCompanyCategories(company).then((response) => {
        let persistedCompany = {
          id: Math.trunc(company.id),
          name: company.name,
          updatedAt: company['updated-at'],
          showIsPrivate: company['show-is-private'],
          externalIssuesUrl: company['external-issues-url'],
          hasAudits: company['has-audits'],
          allowUnplannedAudits: company['allow-unplanned-audits'],
          showUnscopedHistory: company['show-unscoped-history'],
          forwardIssues: company['forward-issues'],
          categories: response.data
            .filter((category) => category.childs.length)
            .map((category) => {
              return {
                id: Math.trunc(category.id),
                name: category.name,
                img: category.img,
                childs: category.childs.map((subcategory) => {
                  const child = {
                    id: Math.trunc(subcategory.id),
                    name: subcategory.name,
                    img: subcategory.img
                  }
                  if (subcategory['has-reasons']) {
                    this._vm.$SowellProxy
                      .loadCategoryReasons(subcategory.id)
                      .then((reason) => {
                        child.reasons = reason.data
                      })
                  }
                  return child
                })
              }
            })
        }
        commit('SET_ALL', persistedCompany)
        resolve(response)
      })
    )
  },
  reset({ commit }) {
    commit('RESET')
  }
}

const mutations = {
  SET_ALL(state, company) {
    state.id = company.id
    state.name = company.name
    state.categories = company.categories
    state.showIsPrivate = company.showIsPrivate
    state.hasAudits = company.hasAudits
    state.allowUnplannedAudits = company.allowUnplannedAudits
    state.showUnscopedHistory = company.showUnscopedHistory
    state.updatedAt = company.updatedAt
    state.externalIssuesUrl = company.externalIssuesUrl
    state.forwardIssues = company.forwardIssues
  },
  RESET(state) {
    state.id = null
    state.name = null
    state.categories = []
    state.showIsPrivate = true
    state.updatedAt = '1970-01-01T00:00:00.000Z'
    state.externalIssuesUrl = null
    state.hasAudits = false
    state.allowUnplannedAudits = false
    state.showUnscopedHistory = false
    state.forwardIssues = {}
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  namespaced: true
}
