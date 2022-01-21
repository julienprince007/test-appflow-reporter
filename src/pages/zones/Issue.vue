<template>
  <q-page padding>
    <new-issue
      v-on:goNext="goBack"
      :audit="audit"
      :category="category"
    ></new-issue>
  </q-page>
</template>

<script>
import NewIssue from 'src/components/issues/New'
import { mapGetters } from 'vuex'

export default {
  components: {
    NewIssue
  },
  mounted() {
    this.$q.loading.hide()
  },
  data() {
    return {}
  },
  methods: {
    checkpointIsValidated() {
      let existingCheckpoint = this.audit.report.checkpoints.find(
        (item) => item.id === this.checkpoint.id
      )
      return existingCheckpoint !== undefined
        ? existingCheckpoint.asserted
        : false
    },
    goBack(issue) {
      this.$router.go(-1)
    }
  },
  computed: {
    ...mapGetters({
      audits: 'audits/all',
      categories: 'company/categories',
      auditsInOtherScopes: 'audits/auditsInOtherScopes'
    }),
    audit() {
      return this.$route.query.tab === 'myScope'
        ? this.audits.find((audit) => audit.id === +this.$route.params.auditId)
        : this.auditsInOtherScopes.find(
            (audit) => audit.id === +this.$route.params.auditId
          )
    },
    checkpoint() {
      return this.audit.checklist.checkpoints.find(
        (checkpoint) =>
          checkpoint.id === Math.trunc(this.$route.query.checkpoint)
      )
    },
    category() {
      let cat = this.categories.find(
        (category) => category.id === this.audit.checklist.category.id
      )
      if (cat === undefined) {
        this.categories.every((category) => {
          cat = category.childs.find(
            (category) => category.id === this.audit.checklist.category.id
          )
          return cat === undefined
        })
      }
      return cat
    }
  }
}
</script>
