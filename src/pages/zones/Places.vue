<template>
  <q-page class="q-px-md">
    <h4 v-if="places.length === 0" class="text-center text-grey-7">
      Aucun contrôle en attente
      <br />cette semaine
    </h4>
    <template v-for="place in places" :key="place.id">
      <div
        class="row q-py-md"
        @click="
          $router.push(`/zones/${place.zone.id}/places/${place.id}?tab=myScope`)
        "
      >
        <div class="col-xs-2 col-sm-3 col-md-4 col-lg-5">
          <q-btn
            round
            color="primary"
            size="15px"
            :key="'btn' + place.id"
            class="float-right"
          >
            <q-icon name="place" size="30px" />
          </q-btn>
        </div>
        <div class="col-xs-10 col-sm-9 col-md-8 col-lg-7 q-pl-sm">
          <span class="uppercase">{{ place.name }}</span>
          <span class="q-caption">
            <br />
            <i>( {{ displayNbControls(place.auditsCount) }} )</i>
          </span>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      places: []
    }
  },
  mounted() {
    this.setPlaces()
  },
  computed: {
    ...mapGetters({
      categories: 'company/categories',
      reducedPlaces: 'audits/reducePlacesByResidence'
    })
  },
  methods: {
    setPlaces() {
      this.places = this.reducedPlaces(this.$route.params.id)
      if (this.places.length === 0) {
        this.$router.go(-1)
      } else {
        this.$emit('title', this.places[0].zone.name)
      }
    },
    displayNbControls(count) {
      if (count > 1) {
        return count + ' contrôles'
      } else {
        return count + ' contrôle'
      }
    }
  }
}
</script>
