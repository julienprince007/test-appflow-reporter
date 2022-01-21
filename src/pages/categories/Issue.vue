<template>
  <q-page padding>
    <new-issue v-on:goNext="goNext" :category="category"></new-issue>
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
    goNext() {
      this.$router.push({ path: '/categories' })
    }
  },
  computed: {
    ...mapGetters({
      categories: 'company/categories'
    }),
    category() {
      let cat = this.categories.find(
        (category) => category.id === Math.trunc(this.$route.params.id)
      )
      if (cat === undefined) {
        this.categories.every((category) => {
          cat = category.childs.find(
            (category) => category.id === Math.trunc(this.$route.params.id)
          )
          return cat === undefined
        })
      }
      return cat
    }
  }
}
</script>
