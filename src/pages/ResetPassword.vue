<template>
  <q-page>
    <div v-if="pageLoading" class="sw-c-loader-overlay">
      <q-spinner-ios class="sw-c-loader" color="white" size="10px" />
    </div>
    <div v-if="!tokenExist" class="fixed-center text-center">
      <p class="text-faded">
        Le lien que vous avez suivi a expiré ...
      </p>
      <q-btn color="primary" style="width: 130px;" @click="$router.push('/')">
      <q-icon name="arrow_back" color="white" /> Retour
      </q-btn
      >
    </div>
    <div v-else class="row q-pt-lg" ref="top">
      <div class="col-12 text-center q-pt-xl">
        <p style="font-family: 'Arima'; opacity: 0.7;">
          Veuillez saisir un nouveau mot de passe.
          <br />
        </p>
      </div>
      <div class="col-10 offset-1 q-pb-sm">
        <form>
          <q-field
            icon="lock"
            label="Mot de passe"
            icon-color="primary"
            error-label="Merci de saisir votre nouveau mot de passe"
            borderless
          >
            <q-input
              type="password"
              v-model="form.password"
              @change="$v.form.password.$touch"
              @blur.stop="$helpers.scrollToElement($refs.top)"
              @keyup.enter="submit"
              :error="$v.form.password.$error"
              class="full-width"
            />
          </q-field>
          <q-field
            icon="lock"
            label="Confirmez le mot de passe"
            icon-color="primary"
            error-label="Merci de saisir le même mot de passe"
            borderless
          >
            <q-input
              ref="pws"
              type="password"
              v-model="form.password_confirmation"
              @change="$v.form.password_confirmation.$touch"
              @blur.stop="$helpers.scrollToElement($refs.top)"
              @keyup.enter="submit"
              :error="$v.form.password_confirmation.$error"
              class="full-width"
            />
          </q-field>
        </form>
      </div>
      <div class="col-12 text-center">
        <q-btn color="primary" @click="submit">Enregistrer</q-btn>
      </div>
    </div>
  </q-page>
</template>

<script>
import { required, minLength, sameAs } from 'vuelidate/lib/validators'

export default {
  mounted() {
    this.$q.loading.hide()
  },
  data() {
    return {
      infoOnReset: false,
      form: {
        password: '',
        password_confirmation: '',
      },
      tokenExist: false,
      pageLoading: false
    }
  },
  validations: {
    form: {
      password: { required, minLength: minLength(6) },
      password_confirmation: { sameAsPass: sameAs('password') }
    }
  },
  beforeMount() {
    this.loginWithToken()
  },
  methods: {
   async loginWithToken() {
     this.pageLoading = true
      // remove backslash to avoid decoding error
      const key = this.$route.query.key.replace(/\\n/g, '')
      const decodedKey = decodeURIComponent(escape(window.atob(key))).split(',')
      // split instead of JSON.parse as JSON.parse doesn't work

      const email = decodedKey[0].replace('{', '').split(':')[1]
      const tmpToken = decodedKey[1].replace('}', '').split(':')[1]
      await this.$SowellProxy.
        authenticateWithToken(
          { email: email, token: tmpToken }
          )
        .then((response) => {
          this.tokenExist = true
          this.pageLoading = false
        })
        .catch(() => {
          this.pageLoading = false
          this.tokenExist = false 
        })
    },
    async submit() {
      this.$q.loading.show({ delay: 0 })
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        this.$q.notify({
          message: 'Merci de saisir votre nouveau mot de passe deux fois',
          type: 'warning',
          position: 'top'
        })
        this.$q.loading.hide()
      } else {
        await this.$SowellProxy
          .updateUserPassword(this.form.password)
          .then(() => 
            {
              this.$router.push({
                path: '/'
              })
              this.$q.notify({
                message: 'Votre Mot de passe a été modifié',
                type: 'info',
                position: 'top'
              })
            },
            () => {
              this.$q.notify({
                message: 'Une erreur s\'est produite',
                type: 'warning',
                position: 'top'
              })
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
  margin: 15px;
  cursor: pointer;
}
</style>
