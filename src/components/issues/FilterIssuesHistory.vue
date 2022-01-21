<template>
  <div>
    <!-- TopZone -->
    <q-field borderless>
      <template v-slot:before>
        <q-icon name="store_mall_directory" color="primary" />
      </template>
      <template v-slot:control>
         <q-select
            outlined
            @input="$refs['topZone'].$el.childNodes[2].blur()"
            v-model="selectedAgencyId"
            option-value="value"
            option-label="label"
            :options="sortList($helpers.resourcesToFormOptions(agencies))"
            behavior="menu"
            label="Agence"
            ref="topZone"
            dense
            class="qSelect"
            emit-value
            :display-value="$helpers.findOptionName(agencies,selectedAgencyId)"
          />
      </template>
    </q-field>
    <!-- Zone -->
    <q-field borderless v-show="selectedAgencyId">
      <template v-slot:before>
        <q-icon name="location_city" color="primary" />
      </template>
      <template v-slot:control>
        <q-select
            outlined
            @input="$refs['zone'].$el.childNodes[2].blur()"
            v-model="selectedResidenceId"
            option-value="value"
            option-label="label"
            :options="sortList($helpers.resourcesToFormOptions(residences))"
            behavior="menu"
            label="Résidence"
            ref="zone"
            dense
            class="qSelect"
            emit-value
            :display-value="$helpers.findOptionName(residences,selectedResidenceId)"
          />
      </template>
    </q-field>
    <!-- Place -->
    <q-field borderless v-show="selectedResidenceId">
      <template v-slot:before>
        <q-icon name="place" color="primary" />
      </template>
      <template v-slot:control>
        <q-select
            outlined
            @input="getPlaceId"
            v-model="selectedPlaceId"
            option-value="value"
            option-label="label"
            :options="sortList($helpers.resourcesToFormOptions(places))"
            behavior="menu"
            label="Adresse"
            ref="place"
            dense
            class="qSelect"
            emit-value
            :display-value="$helpers.findOptionName(places,selectedPlaceId)"
          />
      </template>
    </q-field>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  inject:['$helpers'],
  data() {
    return {
      selectedId: '',
      agencies: [],
      residences: [],
      places: [],
      selectedAgencyId: null,
      selectedResidenceId: null,
      selectedPlaceId: null
    }
  },
  mounted() {
    this.$q.loading.hide()
    this.$SowellProxy
    .loadCompanyAgencies(this.company.id)
    .then((response) => {
      this.agencies = response.data.map((agency) => {
        return {
          id: agency.id,
          name: agency.name
        }
      })
    })
  },
  watch: {
    agencies() {
      if (this.agencies && this.agencies.length === 1) {
        this.selectAgency(this.agencies[0].id)
      }
    },
    residences() {
      if (this.residences.length === 1) {
        this.selectResidence(this.residences[0].id)
      }
    },
    selectedAgencyId(id) {
      this.selectAgency(id)
    },
    selectedResidenceId(id) {
      this.selectResidence(id)
    },
    selectedPlaceId(id) {
      this.$emit('update:placeId', id)
    }
  },
  computed: {
    ...mapGetters({
      company: 'company/attributes',
      zones: 'audits/reduceResidences',
      reducedAudits: 'audits/byPlace'
    })
  },
  methods: {
    sortList(tabOptions) {
      return tabOptions.sort((a, b) => {
        if (a.label === null) {
          return true
        } else {
          return a.label.toString().localeCompare(b.label.toString(), 'fr', {
            ignorePunctuation: true
          })
        }
      })
    },
    selectAgency(id) {
      this.resetSelection(['agencies'])
      if (id !== null && id !== undefined) {
        this.selectedAgencyId = id
        this.$q.loading.show()
        this.residences = []
        this.$SowellProxy
          .loadAgencyResidences(this.selectedAgencyId, true)
          .then((response) => {
            response.data.forEach((residence) => {
              if (residence['has-audits'] === true) {
                this.residences.push({
                  id: residence.id,
                  name: residence.name
                })
              }
            })
            this.$q.loading.hide()
          })
      }
    },
    selectResidence(id) {
      this.resetSelection(['agencies', 'selectedAgencyId', 'residences'])
      if (id !== null && id !== undefined) {
        this.selectedResidenceId = id
        this.$q.loading.show()
        this.places = []
        this.$SowellProxy
          .loadResidencePlaces(this.selectedResidenceId, true)
          .then((response) => {
            response.data.map((place) => {
              if (place['has-audits'] === true) {
                this.places.push({
                  id: +place.id,
                  name: place.name
                })
              }
            })
            this.$q.loading.hide()
          })
      }
    },
    async selectPlace(id) {
      this.reset([
        'agencies',
        'selectedAgencyId',
        'residences',
        'selectedResidenceId',
        'places'
      ])
    },
    resetSelection(excepted = []) {
      switch (excepted) {
        case !excepted.includes('agencies'):
          this.agencies = []
          break
        case !excepted.includes('residences'):
          this.residences = []
          break
        case !excepted.includes('selectedAgencyId'):
          this.selectedAgencyId = null
          break
        case !excepted.includes('selectedResidenceId'):
          this.selectedResidenceId = null
          break
      }
    },
    getPlaceId() {
      this.$refs['place'].$el.childNodes[2].blur()
    }
  }
}
</script>
<style scoped>
.qSelect {
  width: 100%;
}
</style>
