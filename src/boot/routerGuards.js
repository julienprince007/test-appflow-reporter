import { boot } from 'quasar/wrappers'
import { helpers } from 'src/boot/helper'

export default boot(({ router, store }) => {
  router.beforeEach((to, from, next) => {
    const token = store.getters['reporter/token'] || null
    if (!token && to.path !== '/login' && to.path !== '/ResetPassword') {
      next('/login')
    } else if (helpers.isTokenValid(token) && to.name === 'login' && from.name === 'issueDetails') {
      next({ path: '/history' })
    } else {
      next()
    }
  })
})
