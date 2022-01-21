import { boot } from 'quasar/wrappers'

export default boot(({ app, store }) => {
  const $helpers = app.config.globalProperties.$helpers
  const $SowellProxy = app.config.globalProperties.$SowellProxy
  const $DB = app.config.globalProperties.$DB
  store._vm = { $helpers, $SowellProxy, $DB }
})
