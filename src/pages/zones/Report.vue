<template>
  <q-page padding v-if="ready">
    <!-- content -->
    <template v-for="checkpoint in report.checkpoints" :key="checkpoint.id">
      <div :ref="`${checkpoint.id}`">
        <div class="row text-subtitle1 text-grey-6 q-pt-md">
          <q-icon
            v-if="hasDetails(checkpoint)"
            name="info_outline"
            size="20px"
            class="q-mr-xs q-pt-sm"
            color="primary"
            @click="showDetails(checkpoint)"
          />
          {{ checkpoint.question }}
        </div>
        <div class="row">
          <div class="col-xs-5 q-px-sm">
            <q-btn
              class="full-width"
              dense
              :outline="checkpoint.asserted !== true"
              :disable="checkpoint.asserted === true || isIssuePresent(checkpoint.id) != null"
              :color="checkpoint.asserted === true ? 'positive' : 'grey-7'"
              @click="toggleAsserted(checkpoint, true)"
            >
              <span v-if="checkpoint.asserted === true"
                ><q-icon name="assignment_turned_in"
              /></span>
              <span v-else>Ok</span>
            </q-btn>
          </div>
          <div class="col-xs-5 q-px-sm">
            <q-btn
              class="full-width"
              dense
              :outline="!isIssuePresent(checkpoint.id)"
              :color="
                checkpoint.asserted === false && isIssuePresent(checkpoint.id)
                  ? 'negative'
                  : 'grey-7'
              "
              @click="toggleAsserted(checkpoint, false)"
            >
              <span v-if="isIssuePresent(checkpoint.id)"
                ><q-icon name="assignment_late"
              /></span>
              <span v-else>Anomalie</span>
            </q-btn>
          </div>
          <div class="col-xs-2 q-px-sm">
            <q-btn
              class="full-width"
              dense
              :outline="checkpoint.missing !== true"
              :disable="checkpoint.missing === true || isIssuePresent(checkpoint.id) != null"
              color="warning"
              @click="toggleMissing(checkpoint, true)"
            >
              <span v-if="checkpoint.missing === true"
                ><q-icon name="visibility_off"
              /></span>
              <span v-else><q-icon name="clear" /></span>
            </q-btn>
          </div>
        </div>
      </div>
    </template>
    <div class="row q-pt-md">
      <div class="col text-center">
        <q-btn
          small
          color="primary"
          :disable="isLoading"
          @click="sendReport()"
          v-if="reportComplete"
        >
          <q-icon left size="sm" name="archive" />
          Archiver 
          <q-spinner size="20" color="white" v-if="isLoading" /> 
        </q-btn>
      </div>
    </div>
    <q-dialog v-model="dialogOpened">
      <q-card>
        <q-card-section>
          <div class="text-h6">Précisions :</div>
        </q-card-section>
        <q-card-section>
          <span v-html="currentCheckpoint.description" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            color="primary"
            @click="dialogOpened = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
const uuidv1 = require('uuid/v1')
import { scroll } from 'quasar'
const { getScrollTarget, setVerticalScrollPosition } = scroll
import eventBus from 'src/eventBus'

export default {
  name: 'Checklist',
  mounted() {
    this.setAudit().then(() => {
      this.findOrCreateReport().then(() => {
        this.$q.loading.hide()
        this.ready = true
      })
    })
    if (this.checkedReports){
      let checkedReport = this.checkedReports.find((el) => el.auditId === Number(this.$route.params.auditId))
      if(checkedReport !== undefined){
        setTimeout(() => {
          this.scrollToElement(checkedReport.id)
        }, 500)     
      }
    } 
  },
  data() {
    return {
      ready: false,
      dialogOpened: false,
      currentCheckpoint: {},
      report: {},
      audit: {id: this.$route.params.auditId, checklist: { checkpoints: {}}},
      isLoading: false
      
    }
  },
  methods: {
    scrollToElement (el) {
      const element = this.$refs[el][0]
      const target = getScrollTarget(element)
      const offset = element.offsetTop
      const duration = 300
      setTimeout(() => {
        element.style.backgroundColor = 'rgba(64, 196, 255, 0.15)'
      }, 400)
      setTimeout(() => {
        element.style.backgroundColor = 'white'
      }, 1000)
      setVerticalScrollPosition(target, offset, duration)
    },
    isIssuePresent(checkpointId) {
      return this.report.issues.find(
        (issue) => Number(issue.checkpoint.id) === Number(checkpointId)
      )
    },
    async setAudit() {
      let audit = this.audits.find(
        (audit) => audit.id === Math.trunc(this.$route.params.auditId)
      )
      if (audit) {
        this.audit = audit
        this.$emit('title', audit.checklist.name)
      } else {
        await this.$SowellProxy
          .loadCheckpoints(this.audit.id)
          .then((response) => {
            this.audit.checklist.checkpoints = response.data
          })
      }
    },
    async findOrCreateReport() {
      let self = this
      await self.$DB
        .tmpReports()
        .find({
          selector: {
            'audit.id': self.audit.id
          }
        })
        .then(async (results) => {
          if (results.docs.length) {
            self.report = results.docs[0]
          } else {
            let checkpoints = []
            self.audit.checklist.checkpoints.forEach((element) => {
              checkpoints.push({
                id: element.id,
                question: element.question,
                asserted: null,
                missing: null
              })
            })
            let report = {
              _id: uuidv1(),
              audit: { id: self.audit.id },
              checkpoints: checkpoints,
              issues: [],
              ready: false
            }
            await self.$DB
              .tmpReports()
              .put(report)
              .then(async (result) => {
                await self.findOrCreateReport()
                // eslint-disable-next-line handle-callback-err
              }).catch(function (err) {
                // TODO handle error
                // console.log('initReport error')
                // console.log(err)
              })
          }
        })
    },
    findCheckpoint(checkpoint) {
      return this.report.checkpoints.find((item) => item.id === checkpoint.id)
    },
    toggleAsserted(checkpoint, newState) {
      let checkedReport = {
        id: Number(checkpoint.id),
        auditId: Number(this.$route.params.auditId)
      }
      this.$store.dispatch('report/setcheckedReport', checkedReport)
      let el = this.findCheckpoint(checkpoint)
      el.asserted = newState
      if (newState !== null) {
        this.toggleMissing(checkpoint, null)
        this.$DB
          .tmpReports()
          .put(this.report)
          .then(() => {
            this.findOrCreateReport()
          })
        if (newState === false) {
          this.$router.push({
            path:
              '/zones/' +
              this.$route.params.zoneId +
              '/places/' +
              this.$route.params.placeId +
              '/audits/' +
              this.audit.id +
              '/issue',
            query: {
              checkpoint: checkpoint.id,
              report: this.report._id,
              tab: this.$route.query.tab ? this.$route.query.tab : 'myScope'
            }
          })
        }
      }
    },
    toggleMissing(checkpoint, newState) {
      let el = this.findCheckpoint(checkpoint)
      el.missing = newState
      if (newState !== null) {
        this.$q.dialog({
          title: 'Contrôle impossible',
          message:
            "Vous venez d'indiquer que l'élément à contrôler n'existe pas. Cette question sera supprimée après validation de vos responsables."
        })
        this.toggleAsserted(checkpoint, null)
        this.$DB
          .tmpReports()
          .put(this.report)
          .then(() => {
            this.findOrCreateReport()
          })
      }
    },
    sendReport() {
      this.report.ready = true
      this.isLoading = true
      this.$DB
        .tmpReports()
        .put(this.report)
        .then(() => {
          this.$store.dispatch('report/reset', Number(this.$route.params.auditId))
          this.$store.dispatch('audits/close', this.report.audit)
          eventBus.$emit('processQueue')
          this.isLoading = false    
          this.$router.go(-1)
        }).catch(() =>{
          this.isLoading = false
          this.$q.notify({
            message: 'Une erreur s\'est produite veuillez résssayez',
            color: 'warning',
            position: 'top'
          })
        })
    },
    hasDetails(checkpoint) {
      let currentCheckpoint = this.audit.checklist.checkpoints.find(
        (el) => el.id === checkpoint.id
      )
      return (
        'description' in currentCheckpoint &&
        currentCheckpoint.description !== null &&
        currentCheckpoint.description.length
      )
    },
    showDetails(checkpoint) {
      this.currentCheckpoint = this.audit.checklist.checkpoints.find(
        (el) => el.id === checkpoint.id
      )
      this.dialogOpened = true
    }
  },
  computed: {
    ...mapGetters({
      audits: 'audits/all',
      categories: 'company/categories',
      checkedReports: 'report/checkedReports'
    }),
    reportComplete() {
      let hasMissingCheckpoints = this.report.checkpoints.filter(
        (el) => (el.asserted === null && el.missing === null) || (el.asserted === false && !this.isIssuePresent(el.id))
      )
      return hasMissingCheckpoints.length === 0 
    }
  }
}
</script>

<style lang="stylus" scoped>
.q-btn {
  margin: 5px;
}

.btn-fixed-width {
  max-width: 300px;
  width: 40%;
  min-width: 150px;
}

.modal-body {
  margin-top: 15px;
}
</style>
