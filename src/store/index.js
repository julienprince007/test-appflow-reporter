import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import common from './common'
import reporter from './reporter'
import company from './company'
import audits from './audits'
import report from './report'

// import example from './module-example'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      common,
      reporter,
      company,
      audits,
      report
    },
    plugins: [
      createPersistedState({
        paths: ['common', 'reporter', 'company', 'audits', 'report']
      })
    ],
  })

  return Store
})
