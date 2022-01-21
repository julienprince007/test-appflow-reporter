import { boot } from 'quasar/wrappers'

const CronJob = require('cron').CronJob

export default boot(({ app, store }) => {
  // NOTE: Check and react to codepush sync progress status
  const syncStatus = (status) => {
    switch (status) {
      case SyncStatus.DOWNLOADING_PACKAGE:
        // An available update is being downloaded from the CodePush server.
        app.config.globalProperties.$q.notify({
          message:
            'Une mise à jour est disponible, elle sera installée automatiquement',
          type: 'info',
          position: 'top'
        })
        break
      case SyncStatus.UPDATE_INSTALLED:
        // An available update has been installed and will be run either
        // immediately after the callback function returns or the next time
        // the app resumes/restarts, depending on the InstallMode specified in SyncOptions.
        syncApp(true)
        break
      case SyncStatus.ERROR:
        // An error occurred during the sync operation.
        // This might be an error while communicating with the server, downloading
        // or unzipping the update.
        // The console logs should contain more information about what happened.
        // No update has been applied in this case.
        if (store.getters['common/appRestartRequired']) {
          app.config.globalProperties.$q.notify({
            message:
              'Une mise à jour est disponible mais ne peut être installée',
            type: 'warning',
            position: 'top'
          })
          store.dispatch('common/setAppRequiresRestart', false)
        }
        break
    }
  }

  const syncApp = (retry) => {
    if (retry) {
      store.dispatch('common/setAppRequiresRestart', true)
      restartAppJob.start()
    }
    if (
      // NOTE: Force app to restart unless the user is currently creating
      // a new issue or a new report
      store.$router.history.current.name !== 'newIssue' &&
      store.$router.history.current.name !== 'newReport'
    ) {
      store.dispatch('common/setAppRequiresRestart', false)
      alert(
        "Une mise à jour a été installée, l'application SoWell va redémarrer ..."
      )
      //FIXME: a changer le codePush
      // codePush.restartApplication()
    }
  }

  // NOTE: Checks if there is pending tmp issues to be sent
  const syncTmpItemsJob = new CronJob({
    cronTime: '*/10 * * * * *',
    onTick: () => {
      app.config.globalProperties.$DB.syncTmpItems(store, store._vm.$SowellProxy)
    },
    onComplete: null,
    start: null,
    timezone: null,
    context: null,
    runOnInit: false
  })

  // NOTE: Checks if there is pending app updates available on codepush
  const getAppUpdatesJob = new CronJob({
    cronTime: '* */5 * * * *', // FIXME: Change '*/10 * * * * *' to '* **/30 * * * *'
    onTick: () => {
      // eslint-disable-next-line no-undef
      //FIXME: a changer le codePush
      // codePush.sync(syncStatus, {
      //   updateDialog: false,
      //   installMode: InstallMode.ON_NEXT_RESTART,
      //   mandatoryInstallMode: InstallMode.ON_NEXT_RESTART
      // })
    },
    onComplete: null,
    start: null,
    timezone: null,
    context: null,
    runOnInit: false
  })

  // NOTE: Checks if app requires to be restarded
  const restartAppJob = new CronJob({
    cronTime: '*/10 * * * * *', // FIXME: Change '*/10 * * * * *' to '* **/30 * * * *'
    onTick: () => {
      if (
        // NOTE: We are on a mobile app and this app has been updated by codepush
        store.getters['common/appRestartRequired']
      ) {
        syncApp(false)
      }
    },
    onComplete: null,
    start: null,
    timezone: null,
    context: null,
    runOnInit: false
  })

  const cron = {
    start: (jobName) => {
      eval(jobName).stop()
      eval(jobName).start()
      eval(jobName).fireOnTick()
    },
    stop: (jobName) => {
      eval(jobName).stop()
    }
  }

  app.config.globalProperties.$cron = cron
  app.provide('$cron', cron)
})
