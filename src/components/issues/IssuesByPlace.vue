<template>
  <div>
    <q-list bordered separator v-if="issues">
      <q-item
        clickable
        v-ripple
        v-for="issue in issues"
        :key="'issue' + issue.meta.id"
        @click="openModal(issue.meta.id)"
      >
        <q-item-section avatar>
          <q-btn round color="primary">
            <q-avatar v-if="issueCategory(issue.category.id).img">
              <img
                class="q-pa-sm"
                :src="issueCategory(issue.category.id).img"
                width="40px"
              />
            </q-avatar>
            <q-badge
              floating
              color="negative"
              v-if="issueNotificationsCount(issue.meta.id) > 0"
              >{{ issueNotificationsCount(issue.meta.id) }}</q-badge
            >
          </q-btn>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ issue.location.place.name }}</q-item-label>
          <q-item-label caption lines="2"
            ><q-icon
              name="person_pin"
              color="warning"
              v-if="issue.meta.isPrivate"
              style="font-size: 20px; padding-right: 5px;"
            />
            <span v-if="issue.author.id != user.id">
              <i
                >"<u>{{ issue.author.firstName }} a écrit</u>"</i
              >
              :
            </span>
            {{ issue.content.message }}
          </q-item-label>
        </q-item-section>
        <q-item-section side top class="text-center">
          <q-item-label caption>{{
            $helpers.stringToDate(issue.meta.createdAt)
          }}</q-item-label>
          <q-chip
            dense
            outline
            :color="translateStatus(issue.tracking.status).color"
            class="q-mx-none"
            style="font-size: 11px;"
          >
            {{ translateStatus(issue.tracking.status).label }}
          </q-chip>
        </q-item-section>
      </q-item>
    </q-list>
    <div v-else>
      Aucun signalement à afficher pour le moment
    </div>
    <q-dialog v-model="opened" maximized ref="modalRef">
      <template v-if="opened">
        <existing-issue :currentIssue="currentIssue" :issueId="currentIssue._id"></existing-issue>
      </template>
    </q-dialog>
    <q-page-scroller
      position="bottom-right"
      :scroll-offset="150"
      :offset="[18, 18]"
    >
      <q-btn round icon="keyboard_arrow_up" color="accent" />
    </q-page-scroller>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ExistingIssue from 'src/components/issues/Existing'
import eventBus from 'src/eventBus'

export default {
  name: 'IssuesByPlace',
  props: ['issues'],
  components: { ExistingIssue },
  inject: ['$DB'],
  data () {
    return {
      currentIssue: null,
      opened: false
    }
  },
  created() {
    eventBus.$on('openModal', this.openModal)
    eventBus.$on('closeIssueModal', this.closeModal)
  },
  mounted() {
    if ('id' in this.$route.params) {
      this.openModal(this.$route.params.id)
    }
  },
  computed: {
    ...mapGetters({
      categories: 'company/categories',
      user: 'reporter/attributes',
      notifications: 'reporter/notifications'
    })
  },
  methods: {
    openModal(issueId) {
      let issue = this.issues.find((issue) => {
        if (issue.hasOwnProperty('fromApi')) {
          if (issue.id === issueId){
            return issue
          }
        } else {
          const issueApi = {
            fromApi: false
          }
          return issue = {...issue, ...issueApi}
        }
      })
      if (issue.fromApi) {
        this.currentIssue = issue
        this.opened = true
      } else {
        this.$DB
        .localIssues()
        .get(issueId.toString())
        .then((doc) => {
          this.currentIssue = doc
          this.currentIssue = {...this.currentIssue, fromApi: false}
          this.opened = true
        })
      }
    },
    closeModal() {
      if (this.opened) {
        this.opened = false
      }
      this.currentIssue = null
    },
    issueCategory(issueId) {
      let cat = { img: null }
      this.categories.forEach((category) => {
        category.childs.forEach((subcat) => {
          if (subcat.id === Number(issueId)) {
            cat = subcat
          }
        })
      })
      return cat
    },
    issueNotificationsCount(issueId) {
      return this.notifications.filter(
        (notif) => parseInt(notif.id) === parseInt(issueId)
      ).length
    },

    translateStatus(status) {
      return this.$helpers.statusTranslation(status)
    }
  }
}
</script>
