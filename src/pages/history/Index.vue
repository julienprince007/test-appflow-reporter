<template>
  <q-page>
    <q-tabs
      v-model="selectedTab"
      inverted
      class="q-pb-lg text-primary"
      v-show="company.showUnscopedHistory"
    >
      <q-tab name="myScope" icon="person_pin_circle" :label="checkUser" />
      <q-tab
        name="other"
        icon="add_circle_outline"
        @click="resetPlaceId"
        label="Autre"
      />
    </q-tabs>
    <div v-if="selectedTab === 'myScope'">
      <q-input
        :disable="opened"
        borderless
        dense
        v-model="search"
        :debounce="600"
        placeholder="Rechercher"
        class="q-px-md"
      >
        <template v-slot:append>
          <q-icon v-if="search !== ''" name="close" @click="clearSearch" />
        </template>
      </q-input>
      <div
        v-infinite-scroll="loadMore"
        infinite-scroll-disabled="busy"
        infinite-scroll-distance="10"
      >
        <issues-by-place :issues="initializedIssues"></issues-by-place>
        <div v-if="busy" class="q-subheading q-pa-md">
          <q-spinner-ios size="30" color="primary" /> Chargement en cours ...
        </div>
      </div>
      <div
        v-if="!busy && !issues.length && !search.length"
        class="q-subheading q-pt-lg q-px-md"
      >
        Aucun signalement à afficher pour le moment
      </div>
      <div
        v-if="search.length && search.length < 3"
        class="q-subheading q-pt-lg q-px-md"
      >
        La recherche nécessite au minimum 3 charactères
      </div>
      <div
        v-if="!issues.length && search.length > 2"
        class="q-subheading q-pt-lg q-px-md"
      >
        Aucun signalement ne correspond à votre recherche
      </div>
      <div v-if="loaded" class="q-pa-md"></div>
      <q-dialog v-model="opened" maximized ref="modalRef">
        <template v-if="opened">
          <existing-issue :issueId="currentIssue._id"></existing-issue>
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
    <div v-else>
      <filter-issues-history v-model:placeId="placeId"></filter-issues-history>
      <issues-by-place
        v-if="placeId"
        :issues="issuesByPlaceId"
      ></issues-by-place>
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
import infiniteScroll from 'vue-infinite-scroll'
import diacritic from 'diacritic-helper'
import ExistingIssue from 'src/components/issues/Existing'
import FilterIssuesHistory from 'src/components/issues/FilterIssuesHistory'
import IssuesByPlace from 'src/components/issues/IssuesByPlace'
import eventBus from 'src/eventBus'

export default {
  inject: ['$DB'],
  directives: { infiniteScroll },
  components: { ExistingIssue, FilterIssuesHistory, IssuesByPlace },
  created() {
    eventBus.$on('localIssueChange', this.reflectIssueChanges)
    eventBus.$on('openModal', this.openModal)
    eventBus.$on('closeIssueModal', this.closeModal)
  },
  mounted() {
    this.initIssues()
    if ('id' in this.$route.params) {
      this.openModal(this.$route.params.id)
    }
  },
  data() {
    return {
      selectedTab: 'myScope',
      issues: [],
      currentIssue: null,
      opened: false,
      options: {},
      busy: false,
      loaded: false,
      search: '',
      placeId: null,
      issuesByPlaceId: []
    }
  },
  computed: {
    ...mapGetters({
      company: 'company/attributes',
      categories: 'company/categories',
      user: 'reporter/attributes',
      notifications: 'reporter/notifications'
    }),
    initializedIssues() {
      // Show all issues in current_user's scopes except the private ones authored by another user
      return this.issues.filter((issue) =>
        issue.author.id == this.user.id
          ? 'meta' in issue
          : issue.meta.isPrivate == false && 'meta' in issue
      )
    },
    checkUser() {
      const DECODED_TOKEN = this.$helpers.decodeToken(
        this.$store.getters['reporter/token']
      )
      return !DECODED_TOKEN.roles.includes('reporter')
        ? 'Mes signalements'
        : 'Mon secteur'
    }
  },
  methods: {
    clearSearch() {
      this.search = ''
    },
    resetPlaceId() {
      this.placeId = null
    },
    openModal(issueId) {
      this.$DB
        .localIssues()
        .get(issueId.toString())
        .then((doc) => {
          this.currentIssue = doc
          this.opened = true
        })
    },
    closeModal() {
      if (this.opened) {
        this.opend = false
      }
      if (this.search.length !== 0) {
        this.filterIssues(this.search)
      }
      this.currentIssue = null
    },
    initIssues() {
      if (this.search.length === 0) {
        this.loadMore(true)
      }
    },
    reflectIssueChanges(incommingChange) {
      var issueExists = false
      this.issues.forEach((issue, i) => {
        if (issue._id === incommingChange.id) {
          // TODO: Notify user that the issue was updated ?
          issueExists = true
          issue.tracking = incommingChange.doc.tracking
          this.issues = this.issues.filter(
            (el) => el._id !== incommingChange.id
          )
          this.issues.unshift(issue)
        }
      })
      if (!issueExists) {
        // TODO: Notify user that a new issue was added ?
        this.issues.unshift(incommingChange.doc)
      }
      if (this.search.length !== 0) {
        this.filterIssues(this.search)
      }
    },
    resetIssues() {
      this.issues = []
      this.loaded = false
      this.options = { limit: 20, skip: 0 }
    },
    async loadMore(reset = false) {
      var self = this
      if (reset) {
        this.resetIssues()
      }
      if (!this.loaded) {
        var results = []
        this.busy = true
        await this.$DB
          .localIssues()
          .find({
            selector: { 'meta.updatedAt': { $gt: 0 } },
            sort: [{ 'meta.updatedAt': 'desc' }],
            skip: this.options.skip,
            limit: this.options.limit
          })
          .then((response) => {
            results = response.docs
            if (results.length > 0) {
              // There are some issues loaded
              this.options.skip += this.options.limit
              results.forEach((row) => {
                if (!self.issues.some((issue) => issue._id === row._id)) {
                  self.issues.push(row)
                }
              })
            } else {
              // There is no (more) issue to load
              this.loaded = true
            }
            this.busy = false
            this.$q.loading.hide()
          })
      }
    },
    issueCategory(issueId) {
      let cat = { img: null }
      this.categories.forEach((category) => {
        category.childs.forEach((subcat) => {
          if (subcat.id === issueId) {
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
    },
    filterIssues(term) {
      if (term.length > 2) {
        let pending = RegExp(diacritic('.*' + 'attente' + '.*'), 'gi')
        let ongoing = RegExp(diacritic('.*' + 'cour' + '.*'), 'gi')
        let done = RegExp(diacritic('.*' + 'traité' + '.*'), 'gi')
        let rejected = RegExp(diacritic('.*' + 'rejeté' + '.*'), 'gi')
        let canceled = RegExp(diacritic('.*' + 'annulé' + '.*'), 'gi')

        term = term.replace(pending, 'pending')
        term = term.replace(ongoing, 'ongoing')
        term = term.replace(done, 'done')
        term = term.replace(rejected, 'rejected')
        term = term.replace(canceled, 'canceled')

        let dateFound = term.match('\\d{1,2}/\\d{1,2}/\\d{4}')
        let dtstart = null
        let dtend = null
        if (dateFound !== null) {
          let parts = dateFound[0].split('/')
          dtstart = new Date(
            parseInt(parts[2], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[0], 10)
          )
          dtend = new Date(
            parseInt(parts[2], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[0], 10)
          )
          dtend.setDate(dtend.getDate() + 1)
          dtstart = dtstart.toISOString()
          dtend = dtend.toISOString()
        }

        let searchTerm = RegExp(diacritic('.*' + term + '.*'), 'gi')

        let criterias = {
          $or: [
            { _id: { $regex: searchTerm } },
            { 'author.firstName': { $regex: searchTerm } },
            { 'author.lastName': { $regex: searchTerm } },
            { 'content.message': { $regex: searchTerm } },
            { 'category.name': { $regex: searchTerm } },
            { 'category.parent.name': { $regex: searchTerm } },
            { 'location.agency.name': { $regex: searchTerm } },
            { 'location.place.name': { $regex: searchTerm } },
            { 'location.place.code': { $regex: searchTerm } },
            { 'location.residence.name': { $regex: searchTerm } },
            { 'location.spot.name': { $regex: searchTerm } },
            { 'location.spot.code': { $regex: searchTerm } },
            { 'meta.agency.name': { $regex: searchTerm } },
            { 'tracking.status': { $regex: searchTerm } }
          ]
        }

        if (dtstart !== null) {
          criterias.$and = [
            { 'meta.createdAt': { $gt: dtstart } },
            { 'meta.createdAt': { $lt: dtend } }
          ]
        }

        this.$DB
          .localIssues()
          .find({
            selector: criterias
          })
          .then((results) => {
            this.issues = results.docs
          })
      } else if (term.length === 0) {
        // NOTE: No terms or search reseted
        this.initIssues()
      } else if (this.issues.length === 0) {
        // NOTE: Issues not loaded
        this.resetIssues()
      }
    },
    async getIssuesByPlaceId(placeId) {
      return this.$SowellProxy
        .issuesByPlaceId(placeId)
        .then((response) => {
          // console.log('response api', response)
          this.issuesByPlaceId = this.formatObjectIssues(response)
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          this.$q.loading.hide()
        })
    },
    formatObjectIssues(issues) {
      return issues.map((issue) => {
        let issueItem = {
          meta: {
            id: issue['id'],
            isPrivate: issue['is-private'],
            createdAt: issue['created-at']
          },
          location: {
            place: {
              name: issue['location']['place']
            }
          },
          content: {
            message: issue['message'],
            img: issue['img'],
            imgsUrls: issue['imgsUrls']
          },
          tracking: {
            status: issue['status'],
            talks: issue['talks']
          },
          author: {
            id: Number(issue['author']['id']),
            firstName: issue['author']['first-name']
          },
          fromApi: true
        }
        return { ...issue, ...issueItem }
      })
    }
  },
  watch: {
    search: function (term) {
      this.filterIssues(term)
    },
    placeId: function (newPlaceId) {
      if (!newPlaceId) return
      this.$q.loading.show()
      this.getIssuesByPlaceId(newPlaceId)
    }
  }
}
</script>

<style lang="stylus" scoped>
.separator
  border-bottom: 1px dotted grey
.q-item
  // padding 15px 5px
.q-item-main
  margin-left 10px
  max-height 82px
  overflow hidden
.q-item-sublabel
  overflow: hidden
  max-width: 90%
  white-space: nowrap
  text-overflow: ellipsis
.comment
  overflow: hidden
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
  font-size: 15px
  padding: 5px 0px
  quotes: "\201C""\201D""\2018""\2019"
.comment::before
  content: open-quote
  display: inline
  height: 0
  line-height: 0
  left: 0px
  position: relative
  top: 5px
  color: #000
  font-size: 1.3em
.comment::after
  content: close-quote
  display: inline
  height: 0
  line-height: 0
  left: 0px
  position: relative
  top: 5px
  color: #000
  font-size: 1.3em
.q-chip-dense
  font-size 9px
  padding 2px 5px
  font-weight 600
.q-chip-floating
  left: -0.5em
  right: auto
  top: -0.5em
</style>
