<template>
  <q-page class="q-px-md">
    <div
      v-if="loadingAudits && zones.length === 0"
      class="fullscreen column flex-center z-max text-center"
    >
      <h5>
        Chargement des contrôles
        <q-spinner-dots class="sw-c-loader" size="50px" />
      </h5>
    </div>
    <h5
      v-show="!loadingAudits"
      v-if="!zones.length"
      class="text-center absolute-center full-width text-grey-7 q-pb-xl"
    >
      Plus de contrôle en attente, <br />bon boulot !
    </h5>
    <div v-show="!loadingAudits" v-for="zone in zones" :key="zone.id">
      <div
        class="row q-py-md"
        :key="zone.id"
        @click="$router.push(`/zones/${zone.id}`)"
      >
        <div class="col-xs-2 col-sm-3 col-md-4 col-lg-5">
          <q-btn
            round
            color="primary"
            size="15px"
            :key="'btn' + zone.id"
            class="float-right"
          >
            <q-icon name="location_city" size="30px" />
          </q-btn>
        </div>
        <div class="col-xs-10 col-sm-9 col-md-8 col-lg-7 q-pl-sm">
          <span class="uppercase">{{ zone.name }} </span>
          <span class="q-caption">
            <br /><i>( {{ displayNbControls(zone.auditsCount) }})</i>
          </span>
        </div>
      </div>
    </div>
  </q-page>
</template>
<script>
export default {
  name: 'AuditsList',
  props: {
    zones: Array,
    loadingAudits: Boolean
  },
  data() {
    return {}
  },
  methods: {
    displayNbControls(count) {
      return count > 1 ? count + ' contrôles' : count + ' contrôle'
    }
  }
}
</script>
