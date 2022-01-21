<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title class="text-center">
          <img src="~assets/sowell-icon-min.png" class="sw-brand-icon" />
          <span class="sw-brand">SoWell</span>
        </q-toolbar-title>
      </q-toolbar>
      <q-btn
        class="absolute-right"
        flat
        color="secondary"
        v-touch-hold:3000="reset"
        @click="logout"
        icon="exit_to_app"
      />
    </q-header>

    <q-page-container>
      <sync-required></sync-required>
      <router-view />
    </q-page-container>

    <q-footer>
      <q-tabs dense position="bottom" align="center">
        <q-route-tab label="Signaler" icon="send" to="/categories" exact />
        <q-route-tab
          v-if="showControlButton"
          label="Contrôler"
          icon="check_circle_outline"
          to="/zones"
          exact
        />
        <q-route-tab
          label="Historique"
          icon="history"
          to="/history"
          exact
        >
          <q-badge floating color="negative" v-if="hasNotifications">{{
            isManager ? managerNotificationsCount : reporterNotificationsCount
          }}</q-badge>
        </q-route-tab>
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import SyncRequired from 'src/components/SyncRequired'
import { mapGetters } from 'vuex'
import eventBus from 'src/eventBus'

export default {
  components: { SyncRequired },
  inject: ['$DB'],
  data() {
    return {
      managerNotificationsCount: 0
    }
  },
  computed: {
    ...mapGetters({
      reporterNotificationsCount: 'reporter/notificationsCount',
      notifications: 'reporter/notifications',
      audits: 'audits/all',
      company: 'company/attributes'
    }),
    showControlButton() {
      if (this.company.allowUnplannedAudits) {
        return this.company.hasAudits
      }else{
        return this.$helpers.decodeToken(
          this.$store.getters['reporter/token']
        ).roles.includes("checklister")
      }
    },
    isManager() {
      const DECODED_TOKEN = this.$helpers.decodeToken(this.$store.getters['reporter/token'])
      return DECODED_TOKEN.roles.includes('manager')
    },
    hasNotifications () {
      return this.isManager ? this.managerNotificationsCount > 0 : this.reporterNotificationsCount > 0
    }
  },
  methods: {
    async countNotifications() {
      // This function counts the total of notifications from which it substracts the ones
      // from issues that are not visible by the user
      const notificationsIssuesIds = this.notifications.map(n => n.id)
      await this.$DB
        .localIssues()
        .find({ selector: { "meta.id": { $in: notificationsIssuesIds }}}).then((results) => {
          this.managerNotificationsCount = results.docs.length
        })
    },
    logout() {
      eventBus.$emit('pauseQueue')
      this.$store.dispatch('reporter/logout')
      this.$router.push({ path: '/login' })
    },
    reset() {
      eventBus.$emit('pauseQueue')
      this.$DB.resetLocalDBs(this.$q.platform.is.capacitor)
      this.$store.dispatch('reporter/reset')
      this.$router.push({ path: '/login' })
    }
  },
  watch: {
    notifications: function () {
      this.countNotifications()
    }
  }
}
</script>
