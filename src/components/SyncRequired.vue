<template>
  <div class="networkInfo q-body-2" v-if="hasPendingChanges">
    <q-icon name="cached" size="20px" /> Synchronisation en attente
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      hasPendingChanges: 'common/hasPendingChanges'
    })
  }
}
</script>

<style lang="stylus" scoped>
.networkInfo {
  padding: 2px
  text-align: center
  background-color: #f2c037
  color: white
}
</style>
