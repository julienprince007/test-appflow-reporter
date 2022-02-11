<template>
  <q-page padding>
    <parents-categories v-on:goNext="goNext"></parents-categories>
    <div class="absolute-bottom-right q-ma-md" v-if="hasRecipients">
      <q-btn round color="negative" @click="initALert">
        <q-icon name="warning" />
      </q-btn>
    </div>
    <!-- Alert -->
    <q-dialog maximized v-model="alertModalOpened">
      <q-layout class="alert-modal">
        <div class="row text-center">
          <div class="col-12 absolute-top alert-header">
            <h4>Envoyer une alerte</h4>
          </div>
          <div class="col-12 absolute-center">
            <q-btn round color="negative" size="50px">
              <big>{{ secondsRemaining }}</big>
            </q-btn>
          </div>
          <div class="col-12 absolute-bottom alert-bottom">
            <q-btn
              size="22px"
              icon="clear"
              outline
              round
              @click="dismissAlert"
            />
            <div class="alert-label">Annuler</div>
          </div>
        </div>
      </q-layout>
    </q-dialog>
  </q-page>
</template>

<style lang="stylus">

.alert-modal {
  background: rgba(0, 0, 0, 0.85);
}

.alert-header {
  color: white;
  padding-top: 25px;
  text-align: center;
}

.alert-bottom {
  color: white;
  padding-bottom: 25px;
  text-align: center;
}

.alert-label {
  padding-top: 5px;
  font-size: 16px;
}
</style>

<script>
import ParentsCategories from 'src/components/categories/Parents'
import { mapGetters } from 'vuex'
import { scroll } from 'quasar'
import { Geolocation } from '@capacitor/geolocation'

const { setScrollPosition } = scroll

export default {
  components: { ParentsCategories },
  async mounted() {
    this.setGeolocation()
    this.geoId = await Geolocation.watchPosition({}, (position, err) => {
      this.position = position
      if (err && err.message !== 'User denied Geolocation') {
        window.setTimeout(() => {
          this.setGeolocation()
        }, 5000)
      }
    })
    this.$q.loading.hide()
  },
  beforeDestroy() {
    // we do cleanup
    Geolocation.clearWatch(this.geoId)
  },
  data() {
    return {
      alertModalOpened: false,
      secondsRemaining: 5,
      intervalHandle: null,
      position: {},
      isPositionKnown: false,
      alertError: {
        title: "Erreur d'envoi",
        message: "Suite à un problème réseau, votre alerte n'a pas été envoyée."
      },
      geoId: null
    }
  },
  computed: {
    // mix the getters into computed with object spread operator
    ...mapGetters({
      reporter: 'reporter/attributes'
    }),
    hasRecipients() {
      return (
        this.reporter &&
        'recipients' in this.reporter &&
        Array.isArray(this.reporter.recipients) &&
        this.reporter.recipients.length
      )
    }
  },
  methods: {
    async setGeolocation() {
      if (this.hasRecipients) {
        const newPosition = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
        this.position = newPosition
        console.log('this.position', JSON.stringify(this.position))
      }
    },
    goNext(categoryId) {
      this.$router.push({ path: '/categories/' + categoryId + '/childs' })
    },
    initALert() {
      this.setGeolocation()
      this.alertModalOpened = true
      window.clearInterval(this.intervalHandle)
      this.countdown(5).then(() => this.sendAlert())
    },
    initAlertDetails() {
      this.$q
        .dialog({
          title: 'Précisions :',
          prompt: {
            type: 'textarea',
            label: 'Votre message ...',
            model: ''
          },
          ok: 'Envoyer',
          cancel: 'Annuler'
        })
        .onOk((data) => this.sendAlertDetails(data))
        .onCancel(() =>
          setScrollPosition(window, window.document.body.scrollHeight)
        )
    },
    dismissAlert() {
      this.alertModalOpened = false
      clearInterval(this.intervalHandle)
    },
    sendAlert() {
      this.dismissAlert()
      let lonlat = ''
      if (this.isPositionKnown) {
        lonlat =
          this.position.coords.longitude + ',' + this.position.coords.latitude
      }
      this.$store
        .dispatch('reporter/sendAlert', { lonlat: lonlat, message: '' })
        .then(
          () => this.initAlertDetails(),
          () => this.$q.dialog(this.alertError)
        )
    },
    sendAlertDetails(message) {
      this.$store
        .dispatch('reporter/sendAlert', { lonlat: '', message: message })
        .then(
          () => setScrollPosition(window, window.document.body.scrollHeight),
          () => {
            this.$q.dialog(this.alertError)
            setScrollPosition(window, window.document.body.scrollHeight)
          }
        )
    },
    countdown(duration) {
      return new Promise((resolve, reject) => {
        // how many seconds
        this.secondsRemaining = duration

        // every second, call the "tick" function
        // have to make it into a variable so that you can stop the interval later!!!
        this.intervalHandle = setInterval(() => {
          // stop is down to zero
          if (this.secondsRemaining === 1) {
            resolve()
          }
          // subtract from seconds remaining
          this.secondsRemaining--
        }, 1000)
      })
    }
  }
}
</script>
