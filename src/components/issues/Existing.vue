<template>
  <q-layout view="lHh Lpr lFf" container>
    <q-header>
      <q-toolbar>
        <q-toolbar-title class="text-center q-pl-md">
          <span class="sw-title-secondary"
            >Signalement N°{{ issue.meta.id }}</span
          >
        </q-toolbar-title>
        <q-btn class="absolute-left" flat icon="close" @click="closeModal" />
        <q-btn
          unelevated
          color="primary"
          icon="more_vert"
          v-if="
            ((issue.meta.isPrivate || isManageable) &&
            ['pending', 'ongoing'].includes(issue.tracking.status)) ||
            showForwardIssueButton(issue)
          "
        >
          <q-menu>
            <q-list style="min-width: 160px;">
              <q-item
                clickable
                v-close-popup
                v-if="
                  (issue.meta.isPrivate || isManageable) &&
                  ['pending', 'ongoing'].includes(issue.tracking.status)
                "
              >
                <q-btn
                  class="block"
                  dense
                  flat
                  icon="done"
                  color="positive"
                  label="Cloturer"
                  @click="closeIssue()"
                />
              </q-item>
              <q-item clickable v-close-popup v-if="showForwardIssueButton(issue)">
                <q-btn
                  dense
                  flat
                  :disable="issueBeingTransferred"
                  color="primary"
                  :label="
                    forwardIssueHasAttribute('message')
                      ? company.forwardIssues.message
                      : 'Envoyer à l\'ERP'
                  "
                  size="sm"
                  :icon-right="
                    forwardIssueHasAttribute('icon')
                      ? company.forwardIssues.icon
                      : 'send'
                  "
                  @click="forwardIssue(issue.meta.id)"
                />
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page class="bg-white" :style="'width:' + calcWidth + 'px;'">
        <!-- DETAIL DU SIGNALEMENT -->
        <div
          class="row justify-center"
          :style="'width:' + calcWidth + 'px;'"
        >
          <q-scroll-area :style="'width:100%; height:' + calcHeight + 'px;'">
            <div
              class="col-xs-12 col-sm-10 col-md-auto"
              style="overflow-x: hidden;"
            >
              <q-field label="Date de création" stack-label>
                <template v-slot:prepend>
                  <q-icon name="today" color="primary" />
                </template>
                <template v-slot:control>
                  <div>
                    Le {{ $helpers.stringToDateTime(issue.meta.createdAt) }}
                  </div>
                </template>
              </q-field>
              <q-field label="Type" stack-label>
                <template v-slot:prepend>
                  <q-icon name="label" color="primary" />
                </template>
                <template v-slot:control>
                  <div>{{ issue.category.name }}</div>
                </template>
              </q-field>
              <q-field label="Statut" stack-label>
                <template v-slot:prepend>
                  <q-icon name="flag" color="primary" />
                </template>
                <template v-slot:control>
                  <div v-if="issue.tracking.status">
                    {{
                      $helpers.statusTranslation(issue.tracking.status).label
                    }}
                  </div>
                </template>
              </q-field>
              <q-field
                label="Priorité"
                stack-label
                v-show="
                  'disturbance' in issue && !issue.meta.disturbance === null
                "
              >
                <template v-slot:prepend>
                  <q-icon name="report_problem" color="primary" />
                </template>
                <template v-slot:control>
                  <div>
                    {{ $helpers.priorityApiIdToFrench(issue.meta.disturbance) }}
                  </div>
                </template>
              </q-field>
              <q-field
                label="Résidence"
                stack-label
                v-if="'residence' in issue.location"
              >
                <template v-slot:prepend>
                  <q-icon name="location_city" color="primary" />
                </template>
                <template v-slot:control>
                  <div>{{ issue.location.residence.name }}</div>
                </template>
              </q-field>
              <q-field
                label="Adresse"
                stack-label
                v-if="'place' in issue.location"
              >
                <template v-slot:prepend>
                  <q-icon name="edit_location" color="primary" />
                </template>
                <template v-slot:control>
                  <div>{{ issue.location.place.name }}</div>
                </template>
              </q-field>
              <q-field
                label="Localisation"
                stack-label
                v-if="'spot' in issue.location"
              >
                <template v-slot:prepend>
                  <q-icon name="my_location" color="primary" />
                </template>
                <template v-slot:control>
                  <div>{{ issue.location.spot.name }}</div>
                </template>
              </q-field>
              <!-- Reasons -->
              <q-field
                label="Motif"
                stack-label
                v-if="'reason' in issue.category && Object.keys(issue.category.reason).length > 0"
              >
                <template v-slot:prepend>
                  <q-icon name="apps" color="primary" />
                </template>
                <template v-slot:control>
                  <div>
                    {{ issue.category.reason.name }}
                  </div>
                </template>
              </q-field>
              <q-field
                :label="
                  company.externalIssuesUrl
                    ? 'Lien vers le signalement'
                    : 'Numéro de réclamation'
                "
                stack-label
                v-if="issueHasCode(issue)"
              >
                <template v-slot:prepend>
                  <q-icon
                    color="primary"
                    :name="
                      company.externalIssuesUrl
                        ? 'east'
                        : 'list_alt'
                    "
                  />
                </template>
                <template v-slot:control>
                  <a
                    v-if="company.externalIssuesUrl"
                    class="text-primary"
                    target="_blank"
                    :href="externalIssuesUrl(issue.tracking.code)"
                    >Ouvrir</a
                  >
                  <div v-else>{{ issue.tracking.code }}</div>
                </template>
              </q-field>
              <q-field
                v-if="
                  'report' in issue.tracking &&
                  'checklist' in issue.tracking.report
                "
                label="Audit"
                stack-label
              >
                <template v-slot:prepend>
                  <q-icon name="assignment_late" color="warning" />
                </template>
                <template v-slot:control>
                  {{ issue.tracking.report.checklist.name }}
                  > {{ issue.tracking.report.checkpoint.name }}
                </template>
              </q-field>
              <q-field
                label="Détails"
                stack-label
                :borderless="
                  issue.content.img === null && !issue.tracking.talks.length
                "
              >
                <template v-slot:prepend>
                  <q-icon name="list" color="primary" />
                </template>
                <template v-slot:control>
                  <div>{{ issue.content.message }}</div>
                </template>
              </q-field>
              <q-field
                label="Photo"
                stack-label
                v-if="
                  issue.content.img !== null ||
                  (issue.content.imgsUrls && issue.content.imgsUrls.length > 0)
                "
                borderless
              >
                <template v-slot:prepend>
                  <q-icon name="camera_alt" color="primary" />
                </template>
                <template v-slot:control>
                  <div class="row q-pt-sm full-width q-pr-md">
                    <div class="col text-center" ref="imgContainer">
                      <q-carousel
                        class="sw-c-carousel"
                        v-if="
                          issue.content.imgsUrls &&
                          Array.isArray(issue.content.imgsUrls) &&
                          issue.content.imgsUrls.length > 1
                        "
                        animated
                        v-model="slide"
                        arrows
                        navigation
                        infinite
                      >
                        <q-carousel-slide
                          v-for="(imgUrl, index) in issue.content.imgsUrls"
                          :key="index"
                          :name="index"
                          :img-src="imgUrl"
                        />
                      </q-carousel>
                      <img
                        v-else
                        :src="issue.content.img"
                        style="max-width: 100%;"
                      />
                    </div>
                  </div>
                </template>
              </q-field>
              <!-- LISTE DES CHATS -->
              <q-field
                label="Messagerie"
                stack-label
                borderless
                class="chat-messages-wrapper"
              >
                <template v-slot:prepend>
                  <q-icon name="forum" color="primary" />
                </template>
                <template v-slot:control>
                  <div
                    class="full-width q-pr-xl"
                    v-for="chat in issue.tracking.talks"
                    :key="'chat-' + issue.tracking.talks.indexOf(chat)"
                  >
                    <q-chat-message
                      class="chat-message"
                      v-if="!chat.message.startsWith('data:image/')"
                      :name="
                        chat.author.id === issue.author.id
                          ? 'Moi'
                          : chat.author.name
                      "
                      :avatar="avatarURL(chat.author.id)"
                      :text="[chat.message]"
                      :stamp="$helpers.stringToDateTime(chat['created_at'])"
                      :bg-color="
                        chat.author.id === issue.author.id ? 'grey-4' : 'blue-5'
                      "
                      :sent="chat.author.id === issue.author.id"
                    />
                    <!-- <q-chat-message
                      class="chat-message"
                      v-else-if="chat.file && chat.message === ''"
                      :name="
                        chat.author.id === issue.author.id
                          ? 'Moi'
                          : chat.author.name
                      "
                      :avatar="avatarURL(chat.author.id)"
                      :stamp="$helpers.stringToDateTime(chat['created_at'])"
                      :bg-color="
                        chat.author.id === issue.author.id ? 'grey-4' : 'blue-5'
                      "
                      :sent="chat.author.id === issue.author.id"
                    >
                      <q-icon size="15px" color="black" name="attach_file" />
                      <q-btn
                        flat
                        push
                        no-caps
                        color="black"
                        @click="downloadFile(file)"
                        :label="chat.message"
                      >
                      </q-btn>
                    </q-chat-message> -->
                    <q-chat-message
                      v-else
                      :name="
                        chat.author.id === issue.author.id
                          ? 'Moi'
                          : chat.author.name
                      "
                      :avatar="avatarURL(chat.author.id)"
                      :stamp="$helpers.stringToDateTime(chat['created_at'])"
                      :bg-color="
                        chat.author.id === issue.author.id ? 'grey-4' : 'blue-5'
                      "
                      :sent="chat.author.id === issue.author.id"
                    >
                      <img
                        :src="chat.message"
                        style="
                          height: 200px;
                          border-radius: 10px;
                          margin-bottom: 5px;
                        "
                      />
                    </q-chat-message>
                  </div>
                  <q-dialog v-model="onDownload">
                    <q-card style="min-width: 300px;">
                      <q-card-section class="row items-center q-pb-none">
                        <div class="text-h6">Patientez s'il vous plaît.</div>
                        <q-space></q-space>
                        <q-btn
                          icon="visibility_off"
                          flat
                          round
                          dense
                          v-close-popup
                        ></q-btn>
                      </q-card-section>
                      <q-card-section style="text-align: center;">
                        <q-linear-progress
                          stripe
                          size="10px"
                          :value="parseFloat(progressValue)"
                          color="warning"
                        ></q-linear-progress>
                        <p class="q-mt-lg">
                          Téléchargement en cours ...
                        </p>
                      </q-card-section>
                    </q-card>
                  </q-dialog>
                  <form class="window-width">
                    <div class="row justify-between no-wrap">
                      <div style="height: fit-content; margin-top: auto;">
                        <q-btn
                          @click="openActionSheet()"
                          color="primary"
                          round
                          size="sm"
                          icon="camera_alt"
                          class="buttonHover q-mr-md"
                          :disabled="message.length !== 0"
                          v-show="isCameraSupported"
                        />
                      </div>
                      <div style="width: 100%">
                        <q-input
                          v-model="message"
                          autogrow
                          dense
                          @blur.stop="$helpers.scrollToElement($refs.bottom)"
                        />
                      </div>
                      <div style="height: fit-content; margin-top: auto;">
                        <q-btn
                          round
                          class="q-ml-md"
                          dense
                          flat
                          icon="send"
                          color="primary"
                          @click="sendTalk()"
                          :disabled="!message.length"
                        />
                      </div>
                    </div>
                  </form>
                </template>
              </q-field>
            </div>
            <div ref="bottom">&nbsp;</div>
          </q-scroll-area>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { dom } from 'quasar'
const { height, width } = dom
import { mapGetters } from 'vuex'
import { Notify } from 'quasar'
import eventBus from 'src/eventBus'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

export default {
  props: ['issueId', 'opened', 'currentIssue'],
  inject: ['$DB'],
  data() {
    return {
      calcHeight: 0,
      calcWidth: 0,
      onDownload: false,
      progressValue: 0,
      issue: {
        meta: {},
        tracking: {
          status: ''
        },
        category: {},
        location: {},
        content: {}
      },
      message: '',
      img: '',
      isCameraSupported: false,
      slide: 0,
      issueBeingTransferred: false,
      isIssueForwarded: false,
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
      }
    }
  },
  created() {
    eventBus.$on('localIssueChange', this.loadIssue)
  },
  mounted() {
    this.loadIssue()
    window.addEventListener('deviceready', this.deviceReady(), false)
  },
  updated() {
    // NOTE: Set focus at the bottom of the page
    if (this.opened) {
      setTimeout(() => {
        this.$helpers.scrollToElement(this.$refs.bottom)
      }, 0)
    }
  },
  watch: {
    issueId: function () {
      this.loadIssue()
    }
  },
  computed: {
    ...mapGetters({
      reporter: 'reporter/attributes',
      company: 'company/attributes'
    }),
    isManageable() {
      return this.reporter.canCloseIssues
    }
  },
  methods: {
    externalIssuesUrl(code) {
      return this.company.externalIssuesUrl.replace('%code%', code)
    },
    issueHasCode(issue) {
      return 'code' in issue.tracking && issue.tracking.code
    },
    forwardIssueHasAttribute(info) {
      return (
        this.company.forwardIssues &&
        info in this.company.forwardIssues &&
        this.company.forwardIssues[info]
      )
    },
    showForwardIssueButton(issue) {
      return (
        !this.issueHasCode(issue) &&
        this.forwardIssueHasAttribute('url') &&
        !this.isIssueForwarded
      )
    },
    forwardIssue(issueId) {
      this.issueBeingTransferred = true
      this.$SowellProxy
        .forwardIssue(issueId, { data: { type: 'issues' } })
        .then(
          () => {
            this.isIssueForwarded = true
            this.issueBeingTransferred = false
            this.$q.notify({
              message: 'Signalement transmis avec succès',
              color: 'info',
              position: 'top'
            })
          },
          () => {
            this.isIssueForwarded = false
            this.issueBeingTransferred = false
            this.$q.notify({
              message: 'Le transfert du signalement a échoué, une erreur est survenue',
              color: 'warning',
              position: 'top'
            })
          }
        )
    },
    // NOTE: function not used
    
    // downloadFile(file) {
    //   this.onDownload = true
    //   let vm = this
    //   const url = file.url
    //   const fileName = file.name
    //   const ext = `.${file.ext}`
    //   if (this.$q.platform.is.capacitor) {
    //     let fileTransfer = new FileTransfer()
    //     let uri = encodeURI(url)
    //     let filePath = ''
    //     switch (device.platform.toLowerCase()) {
    //       case 'android':
    //         filePath =
    //           cordova.file.externalRootDirectory + 'Download/' + fileName + ext
    //         break
    //       case 'ios':
    //         filePath =
    //           cordova.file.applicationStorageDirectory +
    //           'Documents/' +
    //           fileName +
    //           ext
    //         break
    //       default:
    //         filePath = cordova.file.syncedDataDirectory + fileName + ext
    //     }

    //     fileTransfer.download(
    //       uri,
    //       filePath,
    //       function (entry) {},
    //       function (error) {
    //         if (error) {
    //           vm.onDownload = false
    //         }

    //         Notify.create({
    //           message: "Le fichier n'a pas été téléchargé",
    //           type: 'warning',
    //           position: 'top'
    //         })
    //       },
    //       false
    //     )
    //     fileTransfer.onprogress = function (progressEvent) {
    //       if (progressEvent.lengthComputable) {
    //         vm.progressValue = (
    //           progressEvent.loaded / progressEvent.total
    //         ).toFixed(2)
    //         if (vm.progressValue >= 1) {
    //           vm.$q.notify({
    //             message: 'Fichier téléchargé avec succès',
    //             type: 'info',
    //             position: 'top',
    //             actions: [
    //               {
    //                 label: 'ouvrir',
    //                 color: 'yellow-12',
    //                 handler: () => {
    //                   cordova.plugins.fileOpener2.open(
    //                     filePath,
    //                     'application/pdf',
    //                     {
    //                       error: function (e) {
    //                         console.log(
    //                           'Error status: ' +
    //                             e.status +
    //                             ' - Error message: ' +
    //                             e.message
    //                         )
    //                       },
    //                       success: function () {
    //                         console.log('file opened successfully')
    //                       }
    //                     }
    //                   )
    //                 }
    //               }
    //             ]
    //           })
    //           vm.onDownload = false
    //           vm.progressValue = 0
    //         }
    //       }
    //     }
    //   } else {
    //     window.open(url)
    //   }
    // },
    closeModal() {
      eventBus.$emit('closeIssueModal')
    },
    loadIssue() {
      var self = this
      self.message = ''
      self.issue = self.currentIssue
      if (self.currentIssue.fromApi) {
        self.issue = self.currentIssue
        self.$store.dispatch('reporter/clearIssueNotifications', self.issue)
        self.calcHeight = height(window) - 50
        self.calcWidth = width(window)
      } else {
        self.$DB
        .localIssues()
        .get(self.issueId)
        .then(function (doc) {
          self.issue = doc
          self.$store.dispatch('reporter/clearIssueNotifications', self.issue)
          self.calcHeight = height(window) - 50
          self.calcWidth = width(window)
        })
      }
    },
    async findOrCreateTmpIssue() {
      var self = this
      let tmpIssue = {}

      await self.$DB
        .tmpIssues()
        .get(self.issueId)
        .then(function (doc) {
          tmpIssue = doc
        })
        .catch(function () {
          tmpIssue = {
            _id: self.issue._id,
            tracking: {
              status: self.issue.tracking.status,
              talks: []
            }
          }
        })
      return tmpIssue
    },
    closeIssue() {
      var self = this
      self.issue.tracking.status = 'done'
      if (self.issue.fromApi) {
        self.$SowellProxy.update('issue', { id: self.issue.meta.id, status: self.issue.tracking.status})
        .then((res) => {
          console.log('response status', res)
        })
        .catch((err) => {
          console.log('status issue not to update', err)
        })
      } else {
        self.$DB
        .localIssues()
        .put(self.issue)
        .then(function () {
          self.findOrCreateTmpIssue().then((tmpIssue) => {
            tmpIssue.tracking.status = 'done'
            tmpIssue.event = 'close'
            self.$DB
              .tmpIssues()
              .put(tmpIssue)
              .then(() => {
                eventBus.$emit('processQueue')
                self.closeModal()
              })
          })
        })
        .catch(function (err) {
          console.info('closeIssue error')
          console.log(err)
        })
      }
    },
    sendTalk() {
      var self = this

      if (self.message.replace(/\s/g, '').length || self.img.length) {
        var talk = {
          author: {
            id: self.reporter.id,
            img: self.reporter.img,
            name: self.reporter.firstName + ' ' + self.reporter.lastName
          },
          created_at: new Date().toISOString(),
          message: self.message || self.img
        }

        self.issue.tracking.talks.push(talk)
        self.$DB
          .localIssues()
          .put(self.issue)
          .then(function () {
            self.findOrCreateTmpIssue().then((tmpIssue) => {
              tmpIssue.event = 'talk'
              tmpIssue.tracking.talks.push(talk)
              self.$DB
                .tmpIssues()
                .put(tmpIssue)
                .then(() => self.$root.$emit('processQueue'))
            })
          })
          .catch(function (err) {
            if (self.issue.fromApi) {
              self.$SowellProxy.createTalk(self.issue.meta.id, talk.message).then(
              () => {
                console.log('talk sending to API')
              })
            } else {
              console.info('sendTalk error')
              console.log(err)
            }
          })
        this.message = ''
      }
    },
    avatarURL(authorID) {
      return (
        'https://res.cloudinary.com/sowell/image/upload/v1552407985/ua/' +
        authorID +
        '.png'
      )
    },
    deviceReady() {
      if (this.$q.platform.is.capacitor) {
        this.isCameraSupported = true
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
    shootSuccess(imageData) {
      this.img = 'data:image/jpeg;base64,' + imageData
      this.sendTalk()
    }
  }
}
</script>
<style lang="stylus">
.notVisible {
  visibility: hidden;
}

.chat-messages-wrapper .q-pr-xl {
  padding-right: 0;
}

.chat-messages-wrapper .q-field__control {
  position: relative;
  display: flex;
  flex-direction: column;
}

.chat-messages-wrapper .q-field__label {
  position: absolute;
  top: 0;
  left: 0;
  padding-left: 2rem;
  height: 56px;
  display: flex;
  align-items: center;
  transform: translateY(0%);
}

.chat-messages-wrapper > .q-field__inner > .q-field__control > .q-field__control-container {
  position: static;
  padding-top: 0;
}
</style>
