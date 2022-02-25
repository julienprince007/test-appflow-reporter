/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

/* eslint-env node */
const ESLintPlugin = require('eslint-webpack-plugin')
const { configure } = require('quasar/wrappers')

module.exports = configure(function (ctx) {
  return {
    /* eslint-disable */
    boot: [
      'sowell',
      'helper',
      'errorHandler',
      'pouchDB',
      'cron',
      'routerGuards',
      'initStoreVM'
    ],
    css: ['app.scss'],
    extras: [
      // ctx.theme.mat ? 'roboto-font' : null,
      'material-icons'
      // 'ionicons',
      // 'mdi',
      // 'fontawesome'
    ],
    supportIE: false,
    build: {
      scopeHoisting: true,
      // vueRouterMode: 'history',
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      env: ctx.dev
        ? {
            // so on dev we'll have
            // API_URL: JSON.stringify('http://localhost:5000')
            API_URL: JSON.stringify('https://api.sowellapp.com')
          }
        : {
            // and on build (production):
            API_URL: JSON.stringify('https://api.sowellapp.com')
          },
      chainWebpack(chain) {
        const nodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin')
        chain.plugin('node-polyfill').use(nodePolyfillWebpackPlugin)
      }
    },
    devServer: {
      // https: true,
      // port: 8080,
      open: 'google chrome' // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        'QSelect',
        'QLayout',
        'QHeader',
        'QFooter',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QTabs',
        'QTab',
        'QTabPanels',
        'QTabPanel',
        'QLinearProgress',
        'QScrollArea',
        'QSpinnerDots',
        'QSpinner',
        // 'QTabPane',
        'QRouteTab',
        'QList',
        // 'QCollapsible',
        'QItem',
        'QItemSection',
        'QItemLabel',
        // 'QItemSide',
        // 'QItemTile',
        // 'QItemMain',
        'QChip',
        'QField',
        'QInput',
        'QBtn',
        'QIcon',
        'QTooltip',
        // 'QModal',
        // 'QActionSheet',
        // 'QModalLayout',
        'QSlider',
        'QCheckbox',
        'QChatMessage',
        'QDialog',
        'QTable',
        'QCard',
        'QSpace',
        'QCardSection',
        'QCardActions',
        // 'QCardSeparator',
        // 'QSearch',
        'QSpinner',
        'QSpinnerIos',
        'QPageSticky',
        'QPageScroller',
        'QMenu',
        'QSeparator',
        'QCarousel',
        'QCarouselSlide',
        'QBadge'
      ],
      directives: [
        'Ripple',
        // 'CloseOverlay',
        'TouchHold',
        // 'BackToTop'
        'ClosePopup'
      ],
      // Quasar plugins
      plugins: [
        'Dialog',
        'Notify',
        'Loading',
        'LocalStorage',
        'AppVisibility',
        'BottomSheet'
      ],
      iconSet: 'material-icons',
      // i18n: 'de' // Quasar language
      config: {
        capacitor: {
          backButtonExit: ['/login'],
          iosStatusBarPadding: true
        }
      }
    },
    // animations: 'all' --- includes all animations
    animations: [],
    ssr: {
      pwa: false
    },
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {},
      manifest: {
        name: 'SoWell',
        // short_name: 'Quasar-PWA',
        description:
          "L'application qui permet de signaler facilement les désordres techniques dans un batiment",
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },
    capacitor: {
      id: 'fr.sowell.gardien',
      // (Optional) If not present, will look for package.json > version
      version: '2.0.0',
      // androidVersionCode: '1006002',
      // (Optional) If not present, will look for package.json > description
      description:
        "L'application qui permet de signaler facilement les désordres techniques dans un batiment",
      defaultlocale: 'fr'
    },
    electron: {
      // bundler: 'builder', // or 'packager'
      extendWebpack(cfg) {
        // do something with Electron process Webpack cfg
      },
      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Window only
        // win32metadata: { ... }
      },
      builder: {
        // https://www.electron.build/configuration/configuration
        // appId: 'quasar-app'
      }
    }
  }
})
