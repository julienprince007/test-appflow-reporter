<template>
  <q-page>
    <div class="row q-pt-lg justify-center" ref="top">
      <div class="col-12 text-center q-pt-xl">
        <p style="font-family: 'Arima'; opacity: 0.7">
          Veuillez saisir vos identifiants d'accès
          <br />
        </p>
      </div>
      <div class="col-10 offset-1 q-pb-sm">
        <form>
          <q-field
            icon="mail"
            label="Email"
            icon-color="primary"
            error-label="Merci de saisir une adresse email valide"
            borderless
          >
            <q-input
              type="email"
              v-model="form.email"
              @change="v$.form.email.$touch"
              @blur.stop="$helpers.scrollToElement($refs.pws.$el)"
              @keyup.enter="$helpers.scrollToElement($refs.pws.$el)"
              :error="v$.form.email.$error"
              class="full-width"
              autocomplete="username"
            />
          </q-field>
          <q-field
            icon="lock"
            label="Mot de passe"
            icon-color="primary"
            error-label="Merci de saisir votre mot de passe"
            borderless
          >
            <q-input
              ref="pws"
              type="password"
              v-model="form.pass"
              @change="v$.form.pass.$touch"
              @blur.stop="$helpers.scrollToElement($refs.top)"
              @keyup.enter="submit"
              :error="v$.form.pass.$error"
              class="full-width"
              autocomplete="current-password"
            />
          </q-field>
          <div class="forgottenPass">
            <q-btn
              @click="forgottenPassword = true"
              no-caps
              flat
              dense
              label="Mot de passe oublié ?"
            />
          </div>
        </form>
      </div>
      <div>
        <q-dialog v-model="forgottenPassword" persistent>
          <q-card style="min-width: 350px">
            <q-card-section>
              <p style="font-family: 'Arima'; opacity: 0.7">
                Veuillez entrer votre email :
              </p>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input
                dense
                v-model="form.email"
                placeholder="Email"
                :error="v$.form.email.$error"
                autofocus
                @keyup.enter="resetPassword"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn outline label="Annuler" v-close-popup />
              <q-btn
                color="primary"
                :disable="form.email"
                label="Envoyer"
                @click="resetPassword"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
      <div>
        <q-dialog v-model="infoOnReset" persistent>
          <q-card>
            <q-card-section class="row items-center q-pb-none rgpd">
              <div><b>Précisions :</b></div>
              <q-space />
              <q-btn
                icon="close"
                flat
                round
                dense
                v-close-popup
                absolute-right
              />
            </q-card-section>

            <q-card-section class="rgpd">
              En cochant cette case, l'application va recharger l'ensemble de
              votre patrimoine. Assurez-vous d'avoir un bon réseau.
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
      <div class="col-12 text-center">
        <q-btn color="primary" @click="submit">Connexion</q-btn>
      </div>
      <div class="col-12 text-center sw-login-clear">
        <q-checkbox v-model="clearOnLogin" label="Réinitialiser" />
        <q-icon
          name="info_outline"
          color="primary"
          class="iconInfoReset"
          @click="infoOnReset = true"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import useVuelidate from '@vuelidate/core'
import { Device } from '@capacitor/device'
import { useQuasar } from 'quasar'
import { required, email, minLength } from '@vuelidate/validators'
import * as packageInfo from '../../package.json'
import eventBus from 'src/eventBus'

export default {
  inject: ['$helpers', '$DB'],
  setup() {
    return { v$: useVuelidate(), q: useQuasar() }
  },
  mounted() {
    this.q.loading.hide()
    window.addEventListener('deviceready', this.deviceReady(), false)
  },
  validations() {
    return {
      form: {
        email: { required, email },
        pass: { required, minLength: minLength(6) }
      }
    }
  },
  data() {
    return {
      infoOnReset: false,
      email: '',
      forgottenPassword: false,
      clearOnLogin: false,
      form: {
        email: '',
        pass: ''
      },
      appVersion: {
        versionNumber: ''
      },
      device: {
        manufacturer: '',
        model: '',
        platform: '',
        version: ''
      },
      // TODO: Implement redirections from this.$route.query
      nextRoute: { path: '/categories' }
    }
  },
  methods: {
    resetPassword() {
      this.$v.form.email.$touch()
      if (!this.$v.form.email.$error) {
        this.$SowellProxy
          .resetPassword(this.form.email)
          .then(() => {
            this.q.notify({
              message:
                'Vous recevrez un lien de récupération de mot de passe dans votre boîte email dans quelques minutes',
              type: 'info',
              position: 'top'
            })
            this.forgottenPassword = false
          })
          .catch((error) => {
            this.q.notify({
              message: "Votre adresse email n'est pas dans notre base",
              type: 'warning',
              position: 'top'
            })
            this.forgottenPassword = false
          })
      }
    },
    deviceReady() {
      if (this.q.localStorage.has('credentials')) {
        this.form.email = this.q.localStorage.getItem('credentials').email
        this.form.pass = this.q.localStorage.getItem('credentials').pass
      }
      if (this.q.platform.is.capacitor) {
        this.setDevice()
        this.setAppVersion()
      }
    },
    async setDevice() {
      await Device.getInfo().then((info) => {
        this.device = {
          manufacturer: info.manufacturer,
          model: info.model,
          platform: info.platform,
          version: info.version
        }
      })
    },
    setAppVersion() {
      this.appVersion = {
        versionNumber: packageInfo.version
      }
    },
    submit() {
      this.q.loading.show({ delay: 0 })
      this.v$.form.$touch()
      if (this.clearOnLogin) {
        this.$store.dispatch('reporter/reset')
      }
      if (this.v$.form.$error) {
        this.q.notify({
          message: 'Merci de saisir vos identifiants',
          type: 'warning',
          position: 'top'
        })
        this.q.loading.hide()
      } else {
        if (
          !this.q.localStorage.has('credentials') ||
          (this.q.localStorage.has('credentials') &&
            this.q.localStorage.getItem('credentials').email !==
              this.form.email)
        ) {
          this.q.localStorage.clear()
          this.$DB.resetLocalDBs(this.q.platform.is.capacitor)
          this.$store.dispatch('reporter/reset')
        }
        this.$store
          .dispatch('reporter/authenticate', {
            credentials: { email: this.form.email, password: this.form.pass },
            device: this.device,
            appVersion: this.appVersion
          })
          .then(
            () => {
              const DECODED_TOKEN = this.$helpers.decodeToken(
                this.$store.getters['reporter/token']
              )
              this.q.localStorage.set('credentials', this.form)
              let currentUserId = String(DECODED_TOKEN.sub)
              if (this.q.platform.is.capacitor) {
                window['plugins'].OneSignal.setEmail(this.form.email)
                window['plugins'].OneSignal.setExternalUserId(currentUserId)
                window['plugins'].OneSignal.sendTag('sw_user_id', currentUserId)
              }

              eventBus.$emit('userConnected')
              if ('redirect' in this.$route.query) {
                this.$router.push(this.$route.query.redirect)
              } else {
                switch (DECODED_TOKEN.company_hp) {
                  case 1:
                    if (DECODED_TOKEN.roles.includes('checklister'))
                      this.nextRoute = { path: '/zones' }
                    break
                  case 2:
                    this.nextRoute = { path: '/history' }
                    break
                }
                this.$router.push(this.nextRoute)
              }
            },
            () => {
              this.form.pass = ''
              this.q.loading.hide()
            }
          )
      }
    }
  }
}
</script>
<style lang="stylus">
.sw-login-clear {
  margin-top: 50px;
  bottom: 20px;
  color: #808080;
}

.forgottenPass {
  margin-top: 0px !important;
  margin-left: -3px !important;
  cursor: pointer;
  color: #40c4ff
}

.iconInfoReset {
  margin-left: 3px
}
</style>
