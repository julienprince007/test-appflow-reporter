import PouchDB from 'pouchdb'
import sqlite from 'pouchdb-adapter-cordova-sqlite'
import find from 'pouchdb-find'
import { boot } from 'quasar/wrappers'
import { v4 as uuidv1 } from 'uuid'

PouchDB.plugin(find)

export default boot(({ app }) => {
  var localIssues = null
  var tmpReports = null
  var tmpIssues = null
  var remoteIssues = null
  var replicationHandler = null

  const helpers = {
    initRemote: (username, password, DB) => {
      let URI =
        'https://' +
        username +
        ':' +
        password +
        '@5b209f9d-f355-4198-8ba2-896b990b307d-bluemix.cloudantnosqldb.appdomain.cloud/' +
        DB
      let options = { name: 'remoteCmpIssues', skip_setup: true }
      remoteIssues = new PouchDB(URI, options)
    },

    processTmpReport: async (tmpReport, proxy) => {
      if (!('wip' in tmpReport) || tmpReport.wip === false) {
        tmpReport.wip = true
        tmpReports.put(tmpReport)
        await proxy.createReport(tmpReport).then(
          (report) => {
            for (let issue of tmpReport.issues) {
              issue._id = uuidv1()
              issue.report.id = parseInt(report.data.id)
              tmpIssues.put(issue)
            }
            tmpReports.get(tmpReport._id).then((doc) => {
              tmpReports.remove(doc)
            })
          },
          (e) => {
            if(e[0]['title'].startsWith("duplicate detected") || e[0]['title'] == "Resource not found") {
              tmpReports.get(tmpReport._id).then((doc) => {
                tmpReports.remove(doc)
              })
              app.config.globalProperties.$q.notify({
                message: 'Ce contrôle a déjà été réalisé il y a moins de 24h',
                color: 'warning',
                position: 'top'
              })
            } else {
              tmpReport.wip = false
              tmpReports.put(tmpReport)
            }
          }
        )
      }
    },

    processTmpIssue: async (tmpIssue, proxy) => {
      if (tmpIssue.event === 'new') {
        if (!('wip' in tmpIssue) || tmpIssue.wip === false) {
          tmpIssue.wip = true
          tmpIssues.put(tmpIssue)
          if ('report' in tmpIssue && tmpIssue.report.id === null) {
            delete tmpIssue.report
          }
          await proxy.createIssue(tmpIssue).then(
            (response) => {
              if (tmpIssue.toForward) {
                proxy.forwardIssue(response.data.id, { data: { type: 'issues' } })
                .then(
                  () => {
                    app.config.globalProperties.$q.notify({
                      message: 'Nouveau signalement transmis avec succès',
                      color: 'info',
                      position: 'top'
                    })
                  },
                  () => {
                    app.config.globalProperties.$q.notify({
                      message: 'Le transfert du nouveau signalement a échoué, une erreur est survenue',
                      color: 'warning',
                      position: 'top'
                    })
                  }
                )
              }
              helpers.deleteTmpIssue(tmpIssue)
            },
            (e) => {
              if(e[0]['title'].startsWith("duplicate detected")) {
                helpers.deleteTmpIssue(tmpIssue)
              }
              else {
                tmpIssue.wip = false
                tmpIssues.put(tmpIssue)
              }
            }
          )
        }
      }

      if (tmpIssue.event === 'talk') {
        if (!('wip' in tmpIssue) || tmpIssue.wip === false) {
          tmpIssue.wip = true
          tmpIssues.put(tmpIssue)

          for (const talk of tmpIssue.tracking.talks) {
            await proxy.createTalk(tmpIssue._id, talk.message).then(
              () => {
                let filtered = tmpIssue.tracking.talks.filter((el) => {
                  return el.message !== talk.message
                })
                tmpIssue.tracking.talks = filtered
                tmpIssues.put(tmpIssue)
              },
              (e) => {
                if(e[0]['title'].startsWith("duplicate detected")) {
                  helpers.deleteTmpIssue(tmpIssue)
                }
                else {
                  tmpIssue.wip = false
                  tmpIssues.put(tmpIssue)
                }
              }
            )
          }

          if (tmpIssue.tracking.talks.length === 0) {
            helpers.deleteTmpIssue(tmpIssue)
          }
        }
      }

      if (tmpIssue.event === 'close') {
        if (!('wip' in tmpIssue) || tmpIssue.wip === false) {
          tmpIssue.wip = true
          tmpIssues.put(tmpIssue)

          await proxy
            .updateIssue({
              id: tmpIssue._id,
              status: tmpIssue.tracking.status
            })
            .then(
              () => {
                helpers.deleteTmpIssue(tmpIssue)
              },
              (error) => {
                if ('0' in error) {
                  if (
                    'title' in error[0] &&
                    (error[0]['title'] === 'Access forbiden' ||
                    error[0]['title'].startsWith("duplicate detected"))
                  ) {
                    helpers.deleteTmpIssue(tmpIssue)
                    // TODO: Notify the user that the issue is not closed because it's already ongoing
                  } else {
                    tmpIssue.wip = false
                    tmpIssues.put(tmpIssue)
                  }
                } else {
                  tmpIssue.wip = false
                  tmpIssues.put(tmpIssue)
                }
              }
            )
        }
      }
    },

    deleteTmpIssue: (tmpIssue) => {
      return tmpIssues.get(tmpIssue._id).then((doc) => {
        return tmpIssues.remove(doc)
      })
    },

    replicateIssues: (scopes, owner) => {
      if (replicationHandler !== null) {
        replicationHandler.cancel()
      }
      replicationHandler = localIssues.replicate.from(remoteIssues, {
        live: true,
        retry: true,
        batch_size: 20,
        checkpoint: 'target',
        filter: 'remoteFilters/byScopesOrOwner',
        query_params: { scopes: scopes.join(','), owner: owner }
      })
    }
  }

  const DB = {
    initLocal: (capacitor) => {
      let options = { auto_compaction: true }
      if (capacitor) {
        PouchDB.plugin(sqlite)
        options = {
          auto_compaction: true,
          adapter: 'cordova-sqlite',
          location: 'default',
          androidDatabaseImplementation: 2
        }
      }
      localIssues = new PouchDB('localCmpIssues.db', options)
      localIssues.createIndex({
        index: { fields: ['meta.updatedAt'] }
      })
      tmpReports = new PouchDB('tmpReports.db', options)
      tmpIssues = new PouchDB('tmpIssues.db', options)
    },
    initDBSync(company, user) {
      // NOTE: Replicate issues DB from remote
      helpers.initRemote('cmp_' + company.id, 'dfhgs_dih!', 'cmp_' + company.id)
      helpers.replicateIssues(user.scopes, user.id)
      tmpReports.find({ selector: { wip: true } }).then((results) => {
        for (let tmpReport of results.docs) {
          tmpReport.wip = false
          tmpReports.put(tmpReport)
        }
      })

      tmpIssues.find({ selector: { wip: true } }).then((results) => {
        for (let tmpIssue of results.docs) {
          tmpIssue.wip = false
          tmpIssues.put(tmpIssue)
        }
      })
    },
    syncTmpItems: (store, proxy) => {
      tmpReports
        .find({
          selector: {
            ready: true
          }
        })
        .then((result) => {
          if (result.docs.length === 0) {
            store.dispatch('common/clearPendingReports')
          } else {
            store.dispatch('common/setPendingReports')
            for (let tmpReport of result.docs) {
              helpers.processTmpReport(tmpReport, proxy)
            }
          }
        })
      tmpIssues.allDocs({ include_docs: true }).then((docs) => {
        // NOTE: Process existing issues on user login
        if (docs.rows.length === 0) {
          store.dispatch('common/clearPendingIssues')
        } else {
          store.dispatch('common/setPendingIssues')
          for (let tmpIssue of docs.rows) {
            helpers.processTmpIssue(tmpIssue.doc, proxy)
          }
        }
      })
    },
    localIssues: () => localIssues,
    tmpReports: () => tmpReports,
    tmpIssues: () => tmpIssues,
    resetLocalDBs: (capacitor) => {
      tmpReports.destroy().then(() => {
        tmpIssues.destroy().then(() => {
          localIssues.destroy().then(() => DB.initLocal(capacitor))
        })
      })
    }
  }
  app.config.globalProperties.$DB = DB
  app.provide('$DB',DB)
})
