<template>
  <div class="row justify-center">
    <div class="col-12 text-center q-py-none q-px-lg">
      <q-tabs
        v-model="selectedTab"
        inverted
        class="q-pb-lg text-primary"
        v-show="userAgencies.length && !auditRelated"
      >
        <q-tab
          name="mon-secteur"
          icon="person_pin_circle"
          label="Mon secteur"
        />
        <q-tab
          name="autre"
          icon="add_circle_outline"
          label="Autre"
          v-if="!auditRelated"
        />
      </q-tabs>
      <!-- Top Zone -->
      <q-field
        v-if="!auditRelated"
        borderless
        v-show="agencies.length > 1"
        :error="v$.selectedAgencyId.$error"
      >
        <template v-slot:before>
          <q-icon name="store_mall_directory" color="primary" />
        </template>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            <q-select
              outlined
              @input="$refs['topZone'].$el.childNodes[2].blur()"
              @blur="v$.selectedAgencyId.$touch"
              :error="v$.selectedAgencyId.$error"
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
              :display-value="
                $helpers.findOptionName(agencies, selectedAgencyId)
              "
            />
          </div>
        </template>
      </q-field>

      <!-- Zone -->
      <q-field
        v-if="!auditRelated"
        borderless
        v-show="residences.length > 1"
        :error="v$.selectedResidenceId.$error"
      >
        <template v-slot:before>
          <q-icon name="location_city" color="primary" />
        </template>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            <q-select
              outlined
              @input="$refs['zone'].$el.childNodes[2].blur()"
              @blur="v$.selectedResidenceId.$touch"
              :error="v$.selectedResidenceId.$error"
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
              :display-value="
                $helpers.findOptionName(residences, selectedResidenceId)
              "
            />
          </div>
        </template>
      </q-field>

      <!-- Place -->
      <q-field
        v-if="!auditRelated"
        borderless
        v-show="places.length > 1"
        :error="v$.selectedPlaceId.$error"
      >
        <template v-slot:before>
          <q-icon name="place" color="primary" />
        </template>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            <q-select
              outlined
              @input="$refs['place'].$el.childNodes[2].blur()"
              @blur="v$.selectedPlaceId.$touch"
              :error="v$.selectedPlaceId.$error"
              v-model="selectedPlaceId"
              option-value="value"
              option-label="label"
              :options="sortPlaces($helpers.resourcesToFormOptions(places))"
              behavior="menu"
              label="Adresse"
              ref="place"
              dense
              class="qSelect"
              emit-value
              :display-value="$helpers.findOptionName(places, selectedPlaceId)"
            />
          </div>
        </template>
      </q-field>

      <!-- Spot -->
      <q-field
        borderless
        v-show="spots.length > 1"
        :error="v$.selectedSpotId.$error"
      >
        <template v-slot:before>
          <q-icon name="my_location" color="primary" />
        </template>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            <q-select
              outlined
              @input="$refs['spot'].$el.childNodes[2].blur()"
              @blur="v$.selectedSpotId.$touch"
              :error="v$.selectedSpotId.$error"
              v-model="selectedSpotId"
              option-value="value"
              option-label="label"
              :options="sortList($helpers.resourcesToFormOptions(spots))"
              behavior="menu"
              label="Localisation"
              ref="spot"
              dense
              class="qSelect"
              emit-value
              :display-value="$helpers.findOptionName(spots, selectedSpotId)"
            />
          </div>
        </template>
      </q-field>
      <!-- reasons -->
      <q-field borderless v-if="spots.length && reasons">
        <template v-slot:before>
          <q-icon name="apps" color="primary" />
        </template>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            <q-select
              outlined
              v-model="selectedPlaceId"
              option-value="id"
              option-label="name"
              :options="reasons"
              behavior="menu"
              label="Motif"
              dense
              class="qSelect"
              emit-value
            />
          </div>
        </template>
      </q-field>

      <!-- Pictures -->
      <q-field borderless v-if="images.length > 0">
        <template v-slot:before>
          <q-icon name="camera_alt" color="primary" />
        </template>
        <template v-slot:control>
          <div
            class="row q-mb-lg full-width q-pr-none"
            v-for="(img, index) in images"
            :key="index"
            style="border: 1px dotted #d3d3d3"
          >
            <div
              class="col text-center"
              ref="imgContainer"
              style="position: relative"
            >
              <img :src="img" style="max-width: 100%" />
              <q-btn
                color="negative"
                round
                icon="clear"
                size="sm"
                @click="removeImg(index)"
                class="removeImg"
              />
            </div>
          </div>
        </template>
      </q-field>
      <!-- RGPD Mentions -->
      <q-field borderless class="rgpdField q-pt-md q-pb-md">
        <template>
          <q-icon name="info" color="primary" class="icon-rgpd" />
        </template>
        <template>
          <div>
            <div @click="rgpdDialog = true" class="rgpdButton">Info RGPD</div>
            <q-dialog v-model="rgpdDialog">
              <q-card>
                <q-card-section class="row items-center q-pb-none rgpd">
                  <div>Information RGPD</div>
                  <q-space />
                  <q-btn
                    icon="close"
                    flat
                    round
                    dense
                    v-close-popup
                    absolute-right
                  />
                </q-card-section>

                <q-card-section class="rgpd">
                  « Conformément à la réglementation sur la protection des
                  données personnelles,
                  <b
                    >les locataires peuvent accéder aux commentaires sur simple
                    demande</b
                  >. Il est rappelé que les informations collectées doivent être
                  objectives, adéquates, pertinentes et non excessives au regard
                  de la finalité poursuivie. Pour en savoir plus sur
                  l’utilisation des zones de commentaires libres, contactez
                  votre DPO »
                </q-card-section>
              </q-card>
            </q-dialog>
          </div>
        </template>
      </q-field>
      <!-- Details -->
      <q-field
        borderless
        :error="v$.message.$error"
        helper="Préciser le signalement"
      >
        <template v-slot:before>
          <q-icon name="list" color="primary" />
        </template>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            <q-input
              placeholder="Détails"
              borderless
              type="textarea"
              name="detail"
              v-model="message"
              class="bordered"
              rows="5"
              tabindex="3"
              @blur="v$.message.$touch"
              ref="message"
            />
          </div>
        </template>
      </q-field>
      <q-btn
        v-if="$q.platform.is.mobile && images.length < 3"
        color="primary"
        round
        icon="camera_alt"
        size="sm"
        @click="openActionSheet()"
        style="top: -155px"
        class="buttonHover"
      />

      <!-- Priority -->
      <q-field borderless>
        <template v-slot:before>
          <q-icon name="report_problem" color="primary" />
        </template>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            <q-slider
              v-model="priority"
              :min="-1"
              :max="1"
              :step="1"
              :label="true"
              :label-always="true"
              :snap="true"
              :markers="true"
              :label-value="$helpers.priorityQuasarIdToFrench(priority)"
            />
          </div>
        </template>
      </q-field>

      <!-- Set private -->
      <q-field borderless v-if="company.showIsPrivate">
        <template v-slot:before>
          <q-icon name="pan_tool" color="primary" />
        </template>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            <q-checkbox
              v-model="isPrivate"
              label="Je m'en charge"
              color="primary"
            />
          </div>
        </template>
      </q-field>
      <q-field borderless v-if="forwardIssueHasAttribute('url')">
        <template v-slot:before>
          <q-icon name="arrow_forward" color="primary" />
        </template>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            <q-checkbox
              v-model="toForward"
              :label="
                forwardIssueHasAttribute('message')
                  ? company.forwardIssues.message
                  : 'Envoyer à l\'ERP'
              "
              color="primary"
            />
          </div>
        </template>
      </q-field>
    </div>
    <div class="row">
      <div class="col text-center">
        <q-btn
          small
          color="primary"
          @click="send()"
          :disabled="disableSubmitButton"
          class="q-mt-xl"
          style="height: 60"
        >
          <q-icon left size="sm" name="save_alt" />
          <div>Enregistrer</div>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import heic2any from 'heic2any'
import useVuelidate from '@vuelidate/core'
import eventBus from 'src/eventBus'
const uuidv1 = require('uuid/v1')
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export default {
  inject: ['$DB', '$helpers'],
  props: ['category', 'audit'],
  setup() {
    return { v$: useVuelidate() }
  },
  mounted() {
    window.addEventListener('deviceready', this.deviceReady(), false)
    this.agencies = this.userAgencies
    if (this.audit instanceof Object) {
      this.auditRelated = true
      this.selectedPlaceId = this.audit.place.id
      this.issueCategory = this.getCheckpointCategory()
    } else {
      this.issueCategory = this.category
    }
    this.reasons = this.issueCategory.reasons
  },
  data() {
    return {
      rgpdDialog: false,
      agencies: [],
      residences: [],
      places: [],
      spots: [],
      reasons: [],
      selectedTab: 'mon-secteur',
      selectedAgencyId: null,
      reasonId: null,
      selectedResidenceId: null,
      selectedPlaceId: null,
      selectedSpotId: null,
      message: '',
      images: [],
      priority: 0,
      disableSubmitButton: false,
      isPrivate: false,
      auditRelated: false,
      toForward: false,
      actionSheetConfig: {
        actions: [
          {
            label: 'Ouvrir la galerie',
            icon: 'add_photo_alternate',
            color: 'primary',
            handler: () => {
              this.openGallery()
            }
          },
          {
            label: 'Prendre une photo',
            icon: 'add_a_photo',
            color: 'primary',
            handler: () => {
              this.shootPhoto()
            }
          }
        ],
        dismissLabel: 'Annuler'
      },
      issueCategory: null,
      fieldsToValidate: [
        'selectedAgencyId',
        'selectedResidenceId',
        'selectedPlaceId',
        'selectedSpotId'
      ]
    }
  },
  computed: {
    ...mapGetters({
      company: 'company/attributes',
      userAgencies: 'reporter/agencies',
      categoryBySubcategoryId: 'company/findCategoryBySubcategoryId',
      categoryById: 'company/findCategoryById'
    })
  },
  methods: {
    deviceReady() {
      if (this.$q.platform.is.capacitor) {
        this.camera = Camera
      }
    },
    openActionSheet() {
      this.$q
        .bottomSheet({
          actions: [
            {
              label: 'Ouvrir la galerie',
              icon: 'add_photo_alternate',
              color: 'primary',
              id: 'photoGalery'
            },
            {
              label: 'Prendre une photo',
              icon: 'add_a_photo',
              color: 'primary',
              id: 'takePhoto'
            }
          ]
        })
        .onOk((action) => {
          this.handleActionSheetEvent(action.id)
        })
        .onCancel(() => {
          // console.log('Dismissed')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        })
    },
    handleActionSheetEvent(actionId) {
      switch (actionId) {
        case 'photoGalery':
          this.openGallery()
          break
        case 'takePhoto':
          this.shootPhoto()
          break
      }
    },
    async shootPhoto() {
      const image = await this.camera.getPhoto({
        quality: 50,
        allowEditing: true,
        width: 350,
        height: 350,
        allowEditing: false,
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64
      })
      this.shootSuccess(image.base64String)
    },
    async openGallery() {
      const image = await this.camera.getPhoto({
        quality: 50,
        allowEditing: true,
        width: 350,
        height: 350,
        allowEditing: false,
        source: CameraSource.Photos,
        resultType: CameraResultType.Base64
      })
      this.shootSuccess(image.base64String)
    },
    removeImg(index) {
      this.images.splice(index, 1)
    },
    shootSuccess(imageData) {
      if (
        imageData.toUpperCase().endsWith('.HEIC') ||
        imageData.toUpperCase().endsWith('.HEIF')
      ) {
        fetch(imageData)
          .then((res) => res.blob())
          .then((blob) =>
            heic2any({
              blob,
              toType: 'image/jpeg',
              quality: 1
            })
          )
          .then((conversionResult) => {
            var reader = new FileReader()
            reader.onload = function () {
              var base64img = reader.result
              this.images.push(base64img)
            }
            reader.readAsDataURL(conversionResult)
          })
      } else {
        this.images.push('data:image/jpeg;base64,' + imageData)
      }
    },
    getCheckpointCategory() {
      console.log('getCheckpointCategory>category')
      console.dir(this.category)
      let currentCheckpoint = this.audit.checklist.checkpoints.find(
        (element) =>
          parseInt(element.id) === parseInt(this.$route.query.checkpoint)
      )
      console.log('getCheckpointCategory>currentCheckpoint')
      console.dir(currentCheckpoint)
      let currentCheckpointHasCategory =
        currentCheckpoint.hasOwnProperty('category') &&
        currentCheckpoint.category.hasOwnProperty('id') &&
        currentCheckpoint.category.id > 0
      console.log('getCheckpointCategory>currentCheckpointHasCategory')
      console.dir(currentCheckpointHasCategory)
      return currentCheckpointHasCategory
        ? this.categoryById(parseInt(currentCheckpoint.category.id))
        : this.category
    },
    forwardIssueHasAttribute(info) {
      return (
        this.company.forwardIssues &&
        info in this.company.forwardIssues &&
        this.company.forwardIssues[info]
      )
    },
    getErrorsMessages() {
      return {
        selectedAgencyId: {
          message: "Aucune agence n'est selectionnée"
        },
        selectedResidenceId: {
          message:
            "Aucune résidence n'existe sur cette agence, veuillez contacter votre service technique"
        },
        selectedPlaceId: {
          message:
            "Aucune adresse n'existe sur cette residence, veuillez contacter votre service technique"
        },
        selectedSpotId: {
          message:
            "Aucune localisation n'existe sur cette adresse, veuillez contacter votre service technique"
        },
        defaultMessage: 'Merci de compléter les champs en rouge'
      }
    },
    validateField(field) {
      if (!this.v$[field].$error) return true

      let fieldsMapping = {
        selectedAgencyId: 'agencies',
        selectedResidenceId: 'residences',
        selectedPlaceId: 'places',
        selectedSpotId: 'spots'
      }
      let errorsMessage = this.getErrorsMessages()
      this.$q.notify({
        message:
          this.$data[fieldsMapping[field]].length < 1
            ? errorsMessage[field].message
            : errorsMessage.defaultMessage,
        color: 'warning',
        position: 'top'
      })
    },
    send() {
      this.v$.selectedAgencyId.$touch()
      this.v$.selectedResidenceId.$touch()
      this.v$.selectedPlaceId.$touch()
      this.v$.selectedSpotId.$touch()
      this.v$.message.$touch()

      this.fieldsToValidate.some((field) => {
        return !this.validateField(field)
      })

      if (this.v$.message.$error) {
        this.$q.notify({
          message: this.getErrorsMessages().defaultMessage,
          color: 'warning',
          position: 'top'
        })
        return
      }

      this.disableSubmitButton = true

      let tmpIssue = {
        _id: uuidv1(),
        type: 'issues',
        event: 'new',
        message: this.message,
        'is-private': this.isPrivate,
        disturbance: this.$helpers.priorityQuasarIdToApiId(this.priority),
        spot: {
          id: this.selectedSpotId
        },
        category: {
          id: this.issueCategory.id
        },
        report: {
          id: null
        }
      }

      if (this.images.length > 0) {
        tmpIssue['imgs'] = this.images
      }
      if (this.reasonId) {
        tmpIssue['reason'] = {
          id: parseInt(this.reasonId)
        }
      }
      if (this.forwardIssueHasAttribute('url') && this.toForward) {
        tmpIssue['toForward'] = this.toForward
      }
      this.$DB
        .tmpIssues()
        .find({
          selector: {
            message: tmpIssue.message,
            category: { $eq: tmpIssue.category },
            spot: { $eq: tmpIssue.spot },
            report: { $eq: tmpIssue.report }
          }
        })
        .then((res) => {
          if (res.docs.length == 0) {
            if (this.auditRelated) {
              tmpIssue.checkpoint = { id: this.$route.query.checkpoint }
              this.$DB
                .tmpReports()
                .get(this.$route.query.report)
                .then((report) => {
                  report.issues.push(tmpIssue)
                  this.$DB
                    .tmpReports()
                    .put(report)
                    .then(() => {
                      this.$router.go(-1)
                    })
                })
            } else {
              this.$DB
                .tmpIssues()
                .put(tmpIssue)
                .then(() => {
                  this.$router.push({ path: '/categories' })
                  eventBus.$emit('processQueue')
                })
            }
          }
        })
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
    sortPlaces(places) {
      return places.sort((a, b) => {
        let splitedA = a.label.split(' ')
        let numberA = splitedA[0]
        delete splitedA[0]
        let sortNameA = splitedA + numberA

        let splitedB = b.label.split(' ')
        let numberB = splitedB[0]
        delete splitedB[0]
        let sortNameB = splitedB + numberB

        return sortNameA.localeCompare(sortNameB, 'fr', {
          numeric: true,
          ignorePunctuation: true
        })
      })
    },
    selectAgency(id) {
      this.reset(['agencies'])
      if (id !== null && id !== undefined) {
        this.selectedAgencyId = id
        if (this.selectedTab === 'mon-secteur') {
          this.residences = this.agencies.find(
            (agency) => agency.id === id
          ).residences
          // console.log('loadAgencyResidences', this.residences)
        } else {
          this.$q.loading.show()
          this.$SowellProxy
            .loadAgencyResidences(this.selectedAgencyId)
            .then((response) => {
              this.residences = response.data.map((residence) => {
                return {
                  id: Math.trunc(residence.id),
                  name: residence.name
                }
              })
              // console.log('loadAgencyResidences', this.residences)
              this.$q.loading.hide()
            })
        }
      }
    },
    selectResidence(id) {
      this.reset(['agencies', 'selectedAgencyId', 'residences'])
      if (id !== null && id !== undefined) {
        this.selectedResidenceId = id
        if (this.selectedTab === 'mon-secteur') {
          this.places = this.residences.find(
            (residence) => residence.id === id
          ).places
        } else {
          this.$q.loading.show()
          this.$SowellProxy
            .loadResidencePlaces(this.selectedResidenceId)
            .then((response) => {
              this.places = response.data.map((place) => {
                return {
                  id: Math.trunc(place.id),
                  name: place.name
                }
              })
              this.$q.loading.hide()
            })
        }
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
      if (id !== null && id !== undefined) {
        this.selectedPlaceId = id
        if (this.selectedTab === 'mon-secteur' && !this.auditRelated) {
          this.spots = this.places
            .find((place) => place.id === id)
            .spots.filter(
              (spot) =>
                parseInt(spot.categoryId) ===
                parseInt(this.categoryBySubcategoryId(this.issueCategory.id).id)
            )
        } else if (this.auditRelated) {
          this.spots = this.audit.place.spots.filter(
            (spot) =>
              parseInt(spot.category.id) ===
              parseInt(this.categoryBySubcategoryId(this.issueCategory.id).id)
          )
        } else {
          this.$q.loading.show()
          await this.$SowellProxy.loadPlaceSpots(id).then((response) => {
            this.spots = response.data
              .map((spot) => {
                return {
                  id: Math.trunc(spot.id),
                  name: spot.name,
                  categoryId: Math.trunc(spot.category.id)
                }
              })
              .filter(
                (spot) =>
                  parseInt(spot.categoryId) ===
                  parseInt(
                    this.categoryBySubcategoryId(this.issueCategory.id).id
                  )
              )
            this.$q.loading.hide()
          })
        }
      }
    },
    reset(excepted = []) {
      if (!excepted.includes('agencies')) {
        this.agencies = []
      }
      if (!excepted.includes('residences')) {
        this.residences = []
      }
      if (!excepted.includes('places')) {
        this.places = []
      }
      if (!excepted.includes('spots')) {
        this.spots = []
      }
      if (!excepted.includes('selectedAgencyId')) {
        this.selectedAgencyId = null
      }
      if (!excepted.includes('selectedResidenceId')) {
        this.selectedResidenceId = null
      }
      if (!excepted.includes('selectedPlaceId')) {
        this.selectedPlaceId = null
      }
      if (!excepted.includes('selectedSpotId')) {
        this.selectedSpotId = null
      }
    }
  },
  watch: {
    selectedTab() {
      this.reset()
      if (this.selectedTab === 'mon-secteur') {
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
    },
    agencies() {
      if (this.auditRelated) {
        this.selectedAgencyId = 0
        this.selectedResidenceId = 0
      } else {
        // User is not a reporter or he has no agency so we move it to full lists
        if (this.agencies.length === 0 && this.selectedTab !== 'autre') {
          this.selectedTab = 'autre'
        }
        // Automatically select the agency since there is only one available
        if (this.agencies.length === 1) {
          this.selectAgency(this.agencies[0].id)
        }
      }
    },
    residences() {
      if (this.auditRelated) {
        this.selectedAgencyId = 0
        this.selectedResidenceId = 0
      } else {
        // Automatically select the residence since there is only one available
        if (this.residences.length === 1) {
          this.selectResidence(this.residences[0].id)
        }
      }
    },
    places() {
      if (this.auditRelated === true) {
        this.selectedAgencyId = 0
        this.selectedResidenceId = 0
        this.selectPlace(this.audit.place.id)
      } else {
        // Automatically select the place since there is only one available
        if (this.places.length === 1) {
          this.selectPlace(this.places[0].id)
        }
      }
    },
    spots() {
      // Automatically select the spot since there is only one available
      if (this.spots.length === 1) {
        this.selectedSpotId = this.spots[0].id
      }
    },
    selectedAgencyId(id) {
      if (!this.auditRelated) {
        this.selectAgency(id)
      }
    },
    selectedResidenceId(id) {
      if (!this.auditRelated) {
        this.selectResidence(id)
      }
    },
    selectedPlaceId(id) {
      this.selectPlace(id)
    }
  },
  validations() {
    return {
      selectedAgencyId: {
        required
      },
      selectedResidenceId: {
        required
      },
      selectedPlaceId: {
        required
      },
      selectedSpotId: {
        required
      },
      message: {
        required
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.buttonHover {
  left: 50%;
  z-index: 1;
}

.bordered {
  border-style: dotted dotted dotted dotted;
  border-color: silver;
  border-width: thin;
}

.removeImg {
  position: absolute;
  right: -15px;
  top: -10px;
  z-index: 1;
}

.rgpdField {
  height: 10px;
  margin-top: 10px
}

.rgpd {
  font-style: italic;
}

.icon-rgpd {
  font-size: 23px;
  margin-right: 10px;
}

.rgpdButton {
  text-decoration: underline;
  font-style: italic;
  cursor: pointer;
}

.qSelect {
  width: 100%;
}
</style>
