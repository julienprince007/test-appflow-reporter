<template>
  <q-page class="q-px-md">
    <q-tabs
      v-model="selectedTab"
      inverted
      class="q-pb-lg text-primary"
      v-show="company.allowUnplannedAudits && isChecklister()"
    >
      <q-tab name="myScope" icon="person_pin_circle" label="Mon secteur" />
      <q-tab name="other" icon="add_circle_outline" label="Autre" />
    </q-tabs>
    <audits-list
      v-if="selectedTab === 'myScope'"
      :zones="zones"
      :loadingAudits="loadingAudits"
    />
    <div v-else>
      <!-- TopZone -->
      <q-field borderless v-show="agencies.length > 1">
        <template v-slot:before>
          <q-icon name="store_mall_directory" color="primary" />
        </template>
        <template v-slot:control>
          <q-select
            outlined
            @input="$refs['topZone'].$el.childNodes[2].blur()"
            v-model="selectedAgencyId"
            :option-value="value"
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
      <q-field borderless class="q-ma-md">
        <q-list>
          <q-item
            clickable
            :disable="loadingAudits"
            v-ripple
            v-for="place in places"
            :key="place.id"
            @click="loadAuditsInOtherScopes(place)"
          >
            <q-item-section avatar>
              <q-btn
                round
                color="primary"
                size="15px"
                :key="'btn' + place.id"
                class="float-right"
              >
                <q-icon name="place" size="30px" />
              </q-btn>
            </q-item-section>
            <q-item-section class="uppercase text-black">{{
              place.name
            }}</q-item-section>
            <q-item-section avatar v-if="loadingAudits && place.id == selectedId">
              <q-spinner-ios
                class="sw-c-loader"
                color="primary"
                size="sm"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-field>
    </div>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex'
import AuditsList from 'src/components/audits/List'
export default {
  inject: ['$helpers'],
  components: {
    AuditsList
  },
  data() {
    return {
      selectedTab: 'myScope',
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
    let selectedTab = ''
    this.isChecklister()
      ? (selectedTab = this.$route.query.tab
          ? this.$route.query.tab
          : 'myScope')
      : (selectedTab = 'other')
    this.selectedTab = selectedTab
  },
  watch: {
    selectedTab() {
      this.resetAuditsInOtherScopes()
      if (this.selectedTab === 'myScope') {
        this.agencies = this.userAgencies
      } else {
        this.$q.loading.show()
        this.$SowellProxy
          .loadCompanyAgencies(this.company.id)
          .then((response) => {
            this.agencies = response.data.map((agency) => {
              return {
                id: agency.id,
                name: agency.name
              }
            })
            this.$q.loading.hide()
          })
      }
      const newPath = `${this.$route.path}?tab=${this.selectedTab}`
      if (newPath !== this.$route.fullPath) {
        this.$router.push(newPath)
      }
    },
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
    }
  },
  computed: {
    ...mapGetters({
      company: 'company/attributes',
      zones: 'audits/reduceResidences',
      loadingAudits: 'audits/isControleChanged',
      reducedAudits: 'audits/byPlace'
    })
  },
  methods: {
    isChecklister() {
      return this.$helpers
        .decodeToken(this.$store.getters['reporter/token'])
        .roles.includes('checklister')
    },
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
      this.resetAuditsInOtherScopes(['agencies'])
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
      this.resetAuditsInOtherScopes(['agencies', 'selectedAgencyId', 'residences'])
      if (id !== null && id !== undefined) {
        this.selectedResidenceId = id
        this.$q.loading.show()
        this.places = []
        this.$SowellProxy
          .loadResidencePlaces(id, true)
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
    resetAuditsInOtherScopes(excepted = []) {
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
    loadAuditsInOtherScopes(place) {
      this.selectedId = place.id
      this.$store.dispatch('audits/loadAuditsInOtherScopes', place).then(() => {
        this.$router.push(
          `/zones/${this.selectedResidenceId}/places/${place.id}?tab=${this.selectedTab}`
        )
      })
    },
  }
}
</script>

<style scoped>
.hide_tabs {
  display: none;
}
.qSelect {
  width: 100%;
}
</style>
