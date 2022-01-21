import jwt from 'jwt-simple'
import { scroll } from 'quasar'
import { boot } from 'quasar/wrappers'
const { getScrollTarget, setVerticalScrollPosition } = scroll

let helpers

export default boot(({ app,store }) => {
  helpers = {
    stringToDateTime: (sDate) => {
      var dateobj = new Date(sDate)
      var year = ('' + dateobj.getFullYear()).slice(-4)
      var month = ('0' + (dateobj.getMonth() + 1)).slice(-2)
      var date = ('0' + dateobj.getDate()).slice(-2)
      var hours = ('0' + dateobj.getHours()).slice(-2)
      var minutes = ('0' + dateobj.getMinutes()).slice(-2)
      return date + '/' + month + '/' + year + ' à ' + hours + 'H' + minutes
    },
    stringToDate: (sDate) => {
      var dateobj = new Date(sDate)
      var year = ('' + dateobj.getFullYear()).slice(-4)
      var month = ('0' + (dateobj.getMonth() + 1)).slice(-2)
      var date = ('0' + dateobj.getDate()).slice(-2)
      return date + '/' + month + '/' + year
    },
    stringToDayMonthYear: (sDate) => {
      var dateobj = new Date(sDate)
      var monthNames = [
        'JAN',
        'FEV',
        'MAR',
        'AVR',
        'MAI',
        'JUN',
        'JUL',
        'AUO',
        'SEP',
        'OCT',
        'NOV',
        'DEC'
      ]
      var month = monthNames[dateobj.getMonth()]
      var year = dateobj.getFullYear()
      var date = ('0' + dateobj.getDate()).slice(-2)
      return date + ' ' + month + ' ' + year
    },

    refFromUID: (sRef) => {
      let ref = ('000000' + sRef).slice(-6)
      return ref
    },

    removeDuplicates: (myArr, prop) => {
      return myArr.filter((obj, pos, arr) => {
        return arr.map((mapObj) => mapObj[prop]).indexOf(obj[prop]) === pos
      })
    },

    resourcesToFormOptions: (resources) => {
      let uniKeys = [...new Set(resources.map(({ id }) => id))]
      let unics = []
      uniKeys.forEach((key) => {
        unics.push(resources.find((resource) => resource.id === key))
      })
      let options = []
      unics.forEach(function (resource) {
        let option = {
          label: resource.name,
          value: resource.id
        }
        options.push(option)
      })
      return options
    },

    priorityQuasarIdToApiId: (priority) => {
      switch (priority) {
        case -1:
          return 'low'
        case 0:
          return 'normal'
        case 1:
          return 'high'
      }
    },

    priorityApiIdToFrench: (priority) => {
      switch (priority) {
        case 'low':
          return 'Basse'
        case 'normal':
          return 'Normale'
        case 'high':
          return 'Elevée'
      }
    },

    priorityQuasarIdToFrench: (priority) => {
      switch (priority) {
        case -1:
          return 'Basse'
        case 0:
          return 'Normale'
        case 1:
          return 'Elevée'
      }
    },

    decodeToken: (token) => {
      if (token !== null && token !== '') {
        let decoded = jwt.decode(token, 'secret', true)
        if (
          decoded !== null &&
          decoded.hasOwnProperty('exp') &&
          new Date(decoded.exp * 1000) >= new Date()
        ) {
          return decoded
        }
      }
      return { sub: null, exp: null }
    },

    isTokenValid: (token) => {
      return new Promise((resolve, reject) => {
        if (token !== null && token.length) {
          let decoded = jwt.decode(token, 'secret', true)
          if (
            decoded !== null &&
            decoded.hasOwnProperty('exp') &&
            new Date(decoded.exp * 1000) >= new Date()
          ) {
            resolve(decoded)
          } else {
            reject(
              app.config.globalProperties.$ErrorHandler.throwNoSession(
                '',
                new Error('no Session')
              )
            )
          }
        } else {
          reject(
            app.config.globalProperties.$ErrorHandler.throwNoSession(
              '',
              new Error('no Session')
            )
          )
        }
      })
    },

    statusTranslation: (status) => {
      let statuses = {
        pending: {
          color: 'warning',
          label: 'En attente',
          icon: ''
        },
        ongoing: {
          color: 'primary',
          label: 'En cours',
          icon: ''
        },
        done: {
          color: 'positive',
          label: 'Traité',
          icon: ''
        },
        rejected: {
          color: 'accent',
          label: 'Rejeté',
          icon: ''
        }
      }
      return statuses[status]
    },

    translatePush: (data) => {
      let msg = JSON.parse(data)
      switch (msg.type) {
        case 'UserConnected': {
          return {
            type: msg.type,
            data: msg.data,
            message: 'Bienvenue :',
            detail: 'Vous êtes maintenant connecté sur SoWell'
          }
        }
        case 'IssueCreated': {
          return {
            type: msg.type,
            data: msg.data,
            message: 'Nouvelle demande :',
            detail:
              'La demande #' + msg.data.id.toString() + " vient d'être créée"
          }
        }
        case 'IssueUpdated': {
          return {
            type: msg.type,
            data: msg.data,
            message: 'Mise à jour :',
            detail:
              'La demande #' +
              msg.data.id.toString() +
              " vient d'être mise à jour"
          }
        }
        case 'IssueTalkCreated': {
          return {
            type: msg.type,
            data: msg.data,
            message: 'Nouveau message :',
            detail:
              "Un nouveau message vient d'être enregistré sur la demande #" +
              msg.data.id.toString()
          }
        }
        default: {
          return {
            type: msg.type,
            data: msg.data,
            message: 'Notification :',
            detail: msg.data.toString()
          }
        }
      }
    },

    scrollToElement: (el) => {
      let target = getScrollTarget(el)
      let offset = el.offsetTop - el.scrollHeight
      setVerticalScrollPosition(target, offset, 100)
    }, 

    findOptionName: (options, id) => {
      return id ? options.find(option => option.id === id)?.name || '' : ''
    }
  }
  
  app.config.globalProperties.$helpers = helpers
  app.provide('$helpers', helpers)
})

export { helpers }
