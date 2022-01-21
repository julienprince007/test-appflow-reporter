<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import eventBus from 'src/eventBus'
export default {
  inject: ['$DB','$cron'],
  created() {
    this.$DB.initLocal(this.$q.platform.is.capacitor)
    eventBus.$on('processQueue', this.processQueue) // APP:startSync called or issue closed on device or talk added on device or tmpIssue added
    eventBus.$on('pauseQueue', this.pauseQueue) // User logged out or device reset
    eventBus.$on('userConnected', this.startSync) // User logged in
    eventBus.$on('localIssueChange', this.loadNotifications)

    if (this.$q.platform.is.capacitor) {
      document.addEventListener('deviceready', this.initOneSignal, false)
      this.$cron.start('getAppUpdatesJob')
      this.$SowellProxy.isOnMobile = true
    }
    document.addEventListener(
      'online',
      (status) => {
        this.startSync()
      },
      false
    )
  },
  watch: {
    '$q.appVisible'(val, ctx) {
      if (val) {
        this.startSync()
      }
    }
  },
  data() {
    return {
      job: null,
      notificationsLoading: false
    }
  },
  computed: {},
  methods: {
    processQueue() {
      this.$cron.start('syncTmpItemsJob')
    },
    pauseQueue() {
      this.$cron.stop('syncTmpItemsJob')
    },
    async startSync() {
      var token = this.$store.getters['reporter/token']
      if (token.length) {
        
        this.$helpers.isTokenValid(token).then(() => {
          this.watchLocalIssuesConflicts()
          this.$DB.initDBSync(
            this.$store.getters['company/attributes'],
            this.$store.getters['reporter/attributes']
          )
          this.$store.dispatch('audits/load')
          this.loadNotifications()
          eventBus.$emit('processQueue')
        })
      }
    },
    async watchLocalIssuesConflicts() {
      var self = this
      self.$DB
        .localIssues()
        .changes({
          since: 'now',
          live: true,
          include_docs: true
        })
        .on('change', (change) => {
          if (!('deleted' in change) || change.deleted === false) {
            self.$DB
              .localIssues()
              .get(change.doc._id, { conflicts: true })
              .then((localDoc) => {
                // NOTE: Gestion des conflits en se basant sur l'attribut meta.updatedAt
                if ('_conflicts' in localDoc) {
                  let lastUpdatedAt = change.doc.meta.updatedAt
                  for (let conflict of localDoc._conflicts) {
                    self.$DB
                      .localIssues()
                      .get(change.doc._id, { rev: conflict })
                      .then((conflictDoc) => {
                        if (
                          new Date(lastUpdatedAt) >
                          new Date(conflictDoc.meta.updatedAt)
                        ) {
                          self.$DB
                            .localIssues()
                            .remove(change.doc._id, conflict)
                        } else {
                          self.$DB
                            .localIssues()
                            .remove(change.doc._id, change.doc.rev)
                        }
                      })
                  }
                }
              })
            eventBus.$emit('localIssueChange', change)
          }
        })
    },
    loadNotifications() {
      if (!this.notificationsLoading) {
        this.notificationsLoading = true
        this.$SowellProxy.loadReporterNotifications().then(
          (response) => {
            this.$store.dispatch(
              'reporter/setNotifications',
              response.data.notifications
            )
            this.$SowellProxy.clearReporterNotifications().then(
              () => {
                this.notificationsLoading = false
                if (this.$q.platform.is.capacitor && this.$q.appVisible) {
                  window.plugins.OneSignal.clearOneSignalNotifications()
                }
              },
              () => {
                this.notificationsLoading = false
                if (this.$q.platform.is.capacitor && this.$q.appVisible) {
                  window.plugins.OneSignal.clearOneSignalNotifications()
                }
              }
            )
          },
          () => {
            this.notificationsLoading = false
            if (this.$q.platform.is.capacitor && this.$q.appVisible) {
              window.plugins.OneSignal.clearOneSignalNotifications()
            }
          }
        )
      }
    },
    initOneSignal() {
      // window.plugins.OneSignal.setLogLevel({logLevel: 5, visualLevel: 2}) // Uncomment to debug.
      window.plugins.OneSignal.startInit('3f6a1f2d-be99-48ff-b70f-17bfc70e4cc3')
        .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
        .handleNotificationReceived((jsonData) => {
          if (this.$store.getters['reporter/token'].length) {
            this.$helpers
              .isTokenValid(this.$store.getters['reporter/token'])
              .then(() => {
                this.loadNotifications()
                // User is connected
                if (
                  'additionalData' in jsonData.payload &&
                  'type' in jsonData.payload.additionalData
                ) {
                  let data = jsonData.payload.additionalData
                  switch (data.type) {
                    case 'issue_status_changed': {
                      this.$q.notify({
                        type: 'info',
                        position: 'top',
                        detail:
                          'La demande #' + data.issue + ' a changé de statut',
                        message: 'La demande #' + data.issue + ' a changé de statut',
                        actions: [
                          {
                            label: 'Voir',
                            icon: 'open_in_new',
                            handler: () => {
                              if (
                                this.$route.name === 'issueDetail' ||
                                this.$route.name === 'issuesList'
                              ) {
                                eventBus.$emit('openModal', data.issue)
                              } else {
                                this.$router.push({
                                  path: '/history/' + data.issue
                                })
                              }
                            }
                          }
                        ]
                      })
                      break
                    }
                    case 'issue_talk_added': {
                      this.$q
                        .dialog({
                          title: 'Nouveau message',
                          message:
                            'La demande #' +
                            data.issue +
                            ' a un nouveau message',
                          // optional
                          color: 'primary',
                          // optional; stacks button vertically instead of horizontally (default)
                          stackButtons: true,
                          // optional; we want an "OK" button
                          ok: 'Voir', // takes i18n value, or String for "OK" button label
                          // optional; we want a "Cancel" button
                          cancel: 'Plus tard' // takes i18n value, or String for "Cancel" button label
                        })
                        .onOk(() => {
                          if (
                            this.$route.name === 'issueDetail' ||
                            this.$route.name === 'issuesList'
                          ) {
                            eventBus.$emit('openModal', data.issue)
                          } else {
                            this.$router.push({
                              path: '/history/' + data.issue
                            })
                          }
                        })
                        .catch(() => {})
                      break
                    }
                    case 'issue_created': {
                      this.$q
                        .dialog({
                          title: 'Nouveau message',
                          message:
                            'La demande #' +
                            data.issue +
                            ' vient d\'être ajoutée sur votre secteur',
                          // optional
                          color: 'primary',
                          // optional; stacks button vertically instead of horizontally (default)
                          stackButtons: true,
                          // optional; we want an "OK" button
                          ok: 'Voir', // takes i18n value, or String for "OK" button label
                          // optional; we want a "Cancel" button
                          cancel: 'Plus tard' // takes i18n value, or String for "Cancel" button label
                        })
                        .onOk(() => {
                          if (
                            this.$route.name === 'issueDetail' ||
                            this.$route.name === 'issuesList'
                          ) {
                            eventBus.$emit('openModal', data.issue)
                          } else {
                            this.$router.push({
                              path: '/history/' + data.issue
                            })
                          }
                        })
                        .catch(() => {})
                      break
                    }
                    default: {
                      this.$q.notify({
                        type: 'info',
                        position: 'top',
                        detail: data.type,
                        message: 'Information de SoWell'
                      })
                    }
                  }
                } else {
                  this.$q.notify({
                    type: 'info',
                    position: 'top',
                    detail: jsonData.payload.body,
                    message: jsonData.payload.title
                  })
                }
              })
          }
        })
        .handleNotificationOpened((jsonData) => {
          let data = jsonData.notification.payload.additionalData
          if (this.$store.getters['reporter/token'].length) {
            this.$helpers
              .isTokenValid(this.$store.getters['reporter/token'])
              .then(() => {
                // User is connected
                if (
                  'type' in data &&
                  (data.type === 'issue_status_changed' ||
                    data.type === 'issue_talk_added' ||
                    data.type === 'issue_created')
                ) {
                  this.$router.push({ path: '/history/' + data.issue })
                }
              })
          }
        })
        .endInit()
    }
  }
}
</script>
