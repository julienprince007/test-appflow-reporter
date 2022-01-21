<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title class="text-center q-pl-md">
          <span class="sw-title">{{ category.name }}</span>
        </q-toolbar-title>
      </q-toolbar>
      <q-btn
        class="absolute-left"
        flat
        icon="arrow_back_ios"
        @click="$router.go(-1)"
      />
      <sync-required></sync-required>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import SyncRequired from 'src/components/SyncRequired'

export default {
  components: { SyncRequired },
  name: 'Index',
  data() {
    return {}
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
