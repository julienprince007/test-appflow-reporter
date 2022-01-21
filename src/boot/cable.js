import Cable from 'es6-actioncable'
import {boot} from 'quasar/wrappers'
let consumer = null
let url = ''

export default boot(({ app }) => {
  const cable = {
    connect: (urlParam) => {
      url = urlParam
      consumer = Cable.createConsumer(url)
    },
    getConsumer: () => {
      if (!consumer) {
        consumer = Cable.createConsumer(url)
      }
      return consumer
    },
    closeConnection: () => {
      if (consumer) {
        Cable.endConsumer(consumer)
      }
      consumer = null
      url = ''
    }
  }
  app.provide('$cable',cable)
})
