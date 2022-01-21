import { boot } from 'quasar/wrappers'
import SowellProxy from './sowell/proxy'

export default boot(({ app, router, store }) => {
  if (window.Cypress) {
    // only available during E2E tests
    window.app = {
      $store: store
    }
  }
  
  app.use(SowellProxy, {
    //FIXME: Find a way to use process.env.API_URL
    apiUrl: "https://api.sowellapp.com",
    store: store,
    router: router,
    app: app
  })
})
