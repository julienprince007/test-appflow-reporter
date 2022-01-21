import { boot } from 'quasar/wrappers'

export default boot(({ app}) => {
  const ErrorHandler = {
    process: (message, error) => {
      return new Promise((resolve, reject) => {
        if (error.hasOwnProperty('response')) {
          if (error.response === undefined) {
            resolve(ErrorHandler.throwNoNetwork(message, error))
          } else if (error.response.status === 401) {
            // ********************* NO SESSION
            resolve(ErrorHandler.throwNoSession(message, error))
          } else if (error.response.status === 404) {
            // ********************* BAD CREDENTIALS
            resolve(ErrorHandler.throwBadCredentials(message, error))
          } else {
            resolve(ErrorHandler.throwUnmanaged(message, error))
          }
        } else if (error.hasOwnProperty('data')) {
          if (error.data.title === 'Unauthorized') {
            // ********************* NO SESSION AGAIN
            resolve(ErrorHandler.throwNoSession(message, error))
          } else if (error.data.title === 'Not Found') {
            resolve(ErrorHandler.throwNotFound(message, error))
          } else {
            resolve(ErrorHandler.throwUnmanaged(message, error))
          }
        } else {
          if (error.hasOwnProperty('0') && error[0].hasOwnProperty('title')) {
            if(error[0]['title'].startsWith("duplicate detected")) {
              resolve(ErrorHandler.suppressErrors(error))
            } else if(error[0]['title'] == "Resource not found"){
              resolve(ErrorHandler.throwNonExistingElement(error))
            } else {
              resolve(ErrorHandler.throwJsonApiErrors(message, error))
            }
          } else {
            resolve(ErrorHandler.throwUnproceseable(message, error))
          }
        }
      })
    },
    throwUnmanaged: (message, error) => {
      app.config.globalProperties.$q.loading.hide()
      app.config.globalProperties.$q.notify({
        message: "Une erreur non gerée s'est produite",
        type: 'warning',
        position: 'top'
      })
      app.router.replace({ path: '/login' })
      return error
    },
    throwNotFound: (message, error) => {
      app.config.globalProperties.$q.loading.hide()
      return error
    },
    throwUnproceseable: (message, error) => {
      app.config.globalProperties.$q.loading.hide()
      let currentMessage = "Une erreur s'est produite pendant l'enregistrement"
      if (message.length) {
        currentMessage = message
      }
      app.config.globalProperties.$q.notify({
        message: currentMessage,
        type: 'warning',
        position: 'top'
      })
      return error
    },
    throwJsonApiErrors: (message, error) => {
      app.config.globalProperties.$q.loading.hide()
      let currentMessage = "Une erreur s'est produite pendant l'enregistrement"
      if (message.length) {
        currentMessage = message + ' detail : \r\n' + JSON.stringify(error)
      }
      app.config.globalProperties.$q.notify({
        message: currentMessage,
        type: 'warning',
        position: 'top'
      })
      return error
    },
    throwNoSession: (message, error) => {
      app.config.globalProperties.$q.loading.hide()
      app.config.globalProperties.$q.notify({
        message: 'Votre session a expiré, merci de vous reconnecter',
        type: 'warning',
        position: 'top'
      })
      //FIXME: Find a way to restore this
      //app.router.replace({ path: '/login' })
      return error
    },
    throwBadCredentials: (message, error) => {
      app.config.globalProperties.$q.loading.hide()
      app.config.globalProperties.$q.notify({
        message: 'Les identifiants fournis sont incorrects',
        type: 'warning',
        position: 'top'
      })
      return error
    },
    throwNoNetwork: (message, error) => {
      app.config.globalProperties.$q.loading.hide()
      app.config.globalProperties.$q.notify({
        message:
          'Impossible de joindre le serveur, veuillez vérifier votre accès à internet',
        type: 'warning',
        position: 'top'
      })
      return error
    },
    throwNonExistingElement: (error) => {
      app.config.globalProperties.$q.loading.hide()
      app.config.globalProperties.$q.notify({
        message:
          'Une erreur est survenue, veuillez vous reconnecter en cochant la case réinitialiser. Si le problème persiste, veuillez contacter votre responsable',
        type: 'warning',
        position: 'top',
        timeout: 6000
      })
      return error
    },
    suppressErrors: (error) => {
      app.config.globalProperties.$q.loading.hide()
      return error
    }
  }

  app.config.globalProperties.$ErrorHandler = ErrorHandler
})
