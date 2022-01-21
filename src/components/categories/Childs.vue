<template>
  <div class="row q-py-md">
    <div
      class="col-6 q-py-md text-center"
      v-for="category in subcategories"
      :key="'subcat-' + category.id"
    >
      <q-btn
        round
        color="primary"
        size="20px"
        @click="goNext(category.id)"
      >
        <img :src="category.img" style="max-height: 30px;" />
      </q-btn>
      <div class="text-subtitle2 q-pt-sm" @click="goNext(category.id)">
        {{ category.name }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  mounted() {},
  data() {
    return {}
  },
  methods: {
    async goNext(subCategoryId) {
      await this.$router.push({ path: '/categories/' + subCategoryId + '/issue' })
    }
  },
  computed: {
    ...mapGetters({
      categories: 'company/categories'
    }),
    subcategories() {
      return this.categories.find(
        (category) => category.id === Math.trunc(this.$route.params.id)
      ).childs
    }
  }
}
</script>
