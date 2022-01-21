<template>
  <q-page class="q-px-md">
    <div v-for="audit in audits" :key="audit.id">
      <div class="row q-py-md" @click="openAudit(audit)">
        <div class="col-xs-2 col-sm-3 col-md-4 col-lg-5">
          <q-btn
            round
            color="primary"
            size="15px"
            :key="'btn' + audit.id"
            class="float-right"
          >
            <img
              :src="
                auditCategory(audit).img
                  ? 'data:' + auditCategory(audit).img
                  : audit.checklist.category.img
              "
              style="max-height: 25px;"
            />
          </q-btn>
        </div>
        <div class="col-xs-10 col-sm-9 col-md-8 col-lg-7 q-pl-sm">
          <span class="uppercase">{{ audit.checklist.name }}</span>
          <span class="q-caption">
            <br /><i>Avant le {{ $helpers.stringToDate(audit.dueAt) }}</i>
          </span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      audits: []
    }
  },
  mounted() {
    this.setAudits()
  },
  computed: {
    ...mapGetters({
      categories: 'company/categories',
      reducedAudits: 'audits/byPlace',
      auditsInOtherScopes: 'audits/auditsInOtherScopes'
    })
  },
  methods: {
    setAudits() {
      this.$route.query.tab === 'myScope'
        ? (this.audits = this.reducedAudits(this.$route.params.placeId))
        : (this.audits = this.auditsInOtherScopes)
      if (this.audits.length === 0) {
        this.$router.go(-1)
      }else {
        this.$emit('title', this.audits[0].place.name)
      }
    },
    auditCategory: function (currAudit) {
      let category = { name: '', id: '', img: '' }
      if (this.categories.length) {
        this.categories.forEach((topCat) => {
          let subcat = topCat.childs.filter(
            (currCat) => currCat.id === currAudit.checklist.category.id
          )
          if (subcat.length) {
            category = subcat[0]
          }
        })
      }
      return category
    },
    openAudit(audit) {
      const url = `/zones/${audit.place.zone.id}/places/${
        audit.place.id
      }/audits/${audit.id}?tab=${
        this.$route.query.tab ? this.$route.query.tab : 'myScope'
      }`
      this.$router.push(url)
      if (this.$route.query.tab === 'other') {
        this.$emit('title', audit.checklist.name)
      }
    }
  }
}
</script>
