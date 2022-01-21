
const routes = [
  {
    name: 'home',
    path: '/',
    redirect: { path: '/login' },
    component: () => import('layouts/Index'),
    children: [
      { path: 'categories', component: () => import('pages/categories/Index') },
      { path: 'zones', component: () => import('pages/zones/Index') },
      { path: 'history', component: () => import('pages/history/Index') }
    ]
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('layouts/Login.vue'),
    children: [
      { path: '', component: () => import('pages/Login.vue'), name: 'Login' }
    ]
  },
  {
    name: 'ResetPassword',
    path: '/ResetPassword',
    component: () => import('layouts/Login'),
    props: (route) => ({ query: route.query.key }),
    children: [{ path: '/', component: () => import('pages/ResetPassword'), name: 'ResetPassword' }]
  },
  {
    name: 'categories',
    path: '/categories',
    component: () => import('layouts/Categories'),
    children: [
      {
        path: ':id/childs',
        component: () => import('pages/categories/Childs.vue'),
        name: 'subcategories'
      },
      { path: ':id/issue', component: () => import('pages/categories/Issue.vue') }
    ]
  },
  {
    name: 'zones',
    path: '/zones',
    component: () => import('layouts/Zones'),
    children: [
      { path: ':id', component: () => import('pages/zones/Places') },
      { path: ':zoneId/places/:placeId', component: () => import('pages/zones/Audits') },
      {
        path: ':zoneId/places/:placeId/audits/:auditId',
        component: () => import('pages/zones/Report'),
        name: 'newReport'
      },
      {
        path: ':zoneId/places/:placeId/audits/:auditId/issue',
        component: () => import('pages/zones/Issue'),
        name: 'newIssue'
      }
    ]
  },
  {
    name: 'issuesList',
    path: '/history',
    component: () => import('layouts/Index'),
    children: [
      {
        name: 'issueDetail',
        path: ':id',
        component: () => import('pages/history/Index')
      } // Allows issue detail popup to be opened automatically when user is comming from a notification
    ]
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/categories'
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
}

export default routes
