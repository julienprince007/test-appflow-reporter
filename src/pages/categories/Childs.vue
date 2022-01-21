<template>
  <q-page>
    <childs-categories></childs-categories>
  </q-page>
</template>

<style></style>

<script>
import ChildsCategories from 'src/components/categories/Childs'

export default {
  components: { ChildsCategories },
  mounted() {
    this.$q.loading.hide()
  },
  data() {
    return {}
  },
  methods: {
  }
}
</script>
