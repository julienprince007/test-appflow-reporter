import Model from "./model.js";

let store = null;
let vm = null;

const Helpers = {
  getSubscriber: (vm, token) => {
    return vm.config.globalProperties.$helpers.decodeToken(token).sub;
  },
};

export default {
  install: (Vue, options) => {
    store = options.store;
    vm = Vue;
    let Proxy = Model.init(options);
    const $axios = Proxy.axios.create({baseURL : options.apiUrl})
    Proxy.axios = $axios
    Proxy.insertMiddlewareBefore("axios-request", {
      name: "axios-request",
      req: function (payload) {
        payload.req.timeout = 10000;
        return payload;
      },
    });

    Proxy.isOnMobile = false;

    Proxy.axios.interceptors.request.use(function (config) {
      config.headers["X-Is-Request-From-Mobile"] = Proxy.isOnMobile;
      return config;
    });

   



    // ******************************       HELPERS        ******************************
    Proxy.authenticate = (credentials, device, appVersion) => {
      return new Promise((resolve, reject) => {
        Proxy.axios
          .post(
            "/tokens",
            {
              auth: {
                email: credentials.email,
                password: credentials.password,
              },
              device: {
                manufacturer: device.manufacturer,
                model: device.model,
                platform: device.platform,
                version: device.version,
              },
              app: {
                versionNumber: appVersion.versionNumber,
              },
            },
            {
              "Content-Type": "application/vnd.api+json",
              Accept: "application/vnd.api+json",
            }
          )
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
                reject(response);
              });
            }
          );
      });
    };

    Proxy.authenticateWithToken = (credentials) => {
      return new Promise((resolve, reject) => {
        Proxy.axios
          .post(
            Proxy.apiUrl + `/auth`,
            {
              auth: { email: credentials.email, token: credentials.token },
            },
            {
              "Content-Type": "application/vnd.api+json",
              Accept: "application/vnd.api+json",
            }
          )
          .then(
            (response) => {
              options.store.dispatch("reporter/setToken", response.data.jwt);
              options.store.dispatch("reporter/setReporter");
              resolve(response);
            },
            (error) => {
              console.log("passwordReset => Error");
              reject(error);
            }
          );
      });
    };

    Proxy.resetPassword = (email) => {
      return new Promise((resolve, reject) => {
        Proxy.axios
          .post(
            Proxy.apiUrl + "/auth/reset_password",
            {
              auth: { email: email, base: "https://reporter.sowellapp.com" },
            },
            {
              "Content-Type": "application/vnd.api+json",
              Accept: "application/vnd.api+json",
            }
          )
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              console.log("resetPassword => Error");
              reject(error);
            }
          );
      });
    };

    Proxy.loadReporter = () => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.find(
          "reporter",
          Helpers.getSubscriber(vm, store.getters["reporter/token"]),
          {
            "fields[reporters]":
              "email,first-name,last-name,img,company,recipients,can-close-issues",
            "fields[companies]":
              "id,name,updated-at,show-is-private,external-issues-url,forward-issues,has-audits,allow-unplanned-audits,show-unscoped-history",
            include: "company",
          }
        ).then(
          (response) => {
            resolve(response);
          },
          (error) => {
            vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
              reject(response);
            });
          }
        );
      });
    };

    Proxy.loadReporterScopes = () => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one(
          "reporter",
          Helpers.getSubscriber(vm, store.getters["reporter/token"])
        )
          .all("scopes")
          .get({ "fields[scopes]": "name,updated-at" })
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
                reject(response);
              });
            }
          );
      });
    };

    Proxy.loadCompanyCategories = (company) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one("company", company.id)
          .all("categories")
          .get({
            'fields[categories]': 'id,name,img,has-reasons,is-cleaning-related,childs',
            include: 'childs'
          })
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
                reject(response);
              });
            }
          );
      });
    };

    Proxy.loadCategoryReasons = (categoryId) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one("category", categoryId)
          .all("reasons")
          .get({
            "fields[reasons]": "id,name",
          })
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
                reject(response);
              });
            }
          );
      });
    };

    Proxy.loadReporterResidences = () => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one(
          "reporter",
          Helpers.getSubscriber(vm, store.getters["reporter/token"])
        )
          .all("residences")
          .get({
            "fields[zones]": "id,name",
            "fields[residences]": "id,name,agency,places",
            "fields[places]": "id,name",
            include: "agency,places",
          })
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
                reject(response);
              });
            }
          );
      });
    };

    Proxy.loadReporterPlaces = () => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one(
          "reporter",
          Helpers.getSubscriber(vm, store.getters["reporter/token"])
        )
          .all("places")
          .get({
            "fields[places]": "id,name,residence",
            "fields[residences]": "id,name,agency,places",
            "fields[zones]": "id,name",
            "page[limit]": 200,
            include: "residence.agency",
          })
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
                reject(response);
              });
            }
          );
      });
    };

    Proxy.loadReporterNotifications = () => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.find(
          "reporter",
          Helpers.getSubscriber(vm, store.getters["reporter/token"]),
          { "fields[reporters]": "notifications" }
        ).then(
          (response) => {
            resolve(response);
          },
          (error) => {
            vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
              reject(response);
            });
          }
        );
      });
    };

    Proxy.clearReporterNotifications = () => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.headers["Accept"] = "application/vnd.api+json";
        Proxy.headers["Content-Type"] = "application/vnd.api+json";
        // FIXME: Change user to reporter on the folowing endpoint (make this available on the API before)
        Proxy.one(
          "user",
          Helpers.getSubscriber(vm, store.getters["reporter/token"])
        )
          .all("notifications")
          .destroy()
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
                reject(response);
              });
            }
          );
      });
    };

    Proxy.loadReporterIssues = (
      updatedAt = "1970-01-01T00:00:00.000Z",
      pagelimit = 50
    ) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one(
          "reporter",
          Helpers.getSubscriber(vm, store.getters["reporter/token"])
        )
          .all("issues")
          .get({
            "fields[issues]":
              "disturbance,talks,status,message,people,location,is-private,created-at,updated-at,category,author",
            "fields[categories]": "id",
            "fields[users]": "id",
            "page[limit]": pagelimit,
            "filter[since]": updatedAt,
            sort: "-updated-at",
            include: "category,author",
          })
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
                reject(response);
              });
            }
          );
      });
    };

    Proxy.updateUserPassword = (password) => {
      return new Promise((resolve, reject) => {
        Proxy.update("user", {
          id: store.getters["reporter/attributes"].id,
          password: password,
        }).then(
          (response) => {
            resolve(response);
          },
          (error) => {
            vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
              reject(response);
            });
          }
        );
      });
    };

    Proxy.updateIssue = (issue) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.headers["Content-Type"] = "application/vnd.api+json";
        Proxy.update("issue", {
          id: issue.id,
          status: issue.status,
        }).then(
          (response) => {
            resolve(response);
          },
          (error) => {
            vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
              reject(response);
            });
          }
        );
      });
    };

    Proxy.createIssue = (issue) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.headers["Content-Type"] = "application/vnd.api+json";
        Proxy.create("issue", issue).then(
          (response) => {
            resolve(response);
          },
          (error) => {
            vm.config.globalProperties.$ErrorHandler
              .process("Impossible de créer ce signalement", error)
              .then((response) => {
                reject(response);
              });
          }
        );
      });
    };

    Proxy.loadAudits = (untillDate) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one(
          "checklister",
          Helpers.getSubscriber(vm, store.getters["reporter/token"])
        )
          .all("audits")
          .get({
            "fields[audits]": "due-at,place,checklist",
            "fields[places]": "name,zone,spots",
            "fields[spots]": "name,category",
            "fields[zones]": "name",
            "fields[checklists]": "name,category",
            "fields[categories]": "id",
            "filter[due-until]": untillDate,
            include: "place.zone,place.spots.category,checklist.category",
            "page[limit]": 200,
          })
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
                reject(response);
              });
            }
          );
      });
    };

    Proxy.loadPlaceAudits = (placeId) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one("place", placeId)
          .all("audits")
          .get({
            "fields[audits]": "due-at,place,checklist",
            "fields[checklists]": "name,category",
            "fields[places]": "name,zone,spots",
            "fields[spots]": "name,category",
            "fields[categories]": "id,img",
            include: "place.zone,place.spots.category,checklist.category",
            "page[limit]": 200,
          })
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              vm.config.globalProperties.$ErrorHandler.process("", error).then((response) => {
                reject(response);
              });
            }
          );
      });
    };

    Proxy.loadCheckpoints = (auditId) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one("audit", auditId)
          .all("checkpoints")
          .get({
            include: "category",
            "fields[checkpoints]": "question,description,category",
            "fields[categories]": "id",
          })
          .then(
            (response) => resolve(response),
            (error) =>
              vm.config.globalProperties.$ErrorHandler
                .process("", error)
                .then((response) => reject(response))
          );
      });
    };

    Proxy.createReport = (report) => {
      return new Promise((resolve, reject) => {
        report.checkpoints.forEach((chkp) => {
          chkp.asserted === null ? delete chkp.asserted : delete chkp.missing;
        });
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.headers["Content-Type"] = "application/vnd.api+json";
        Proxy.create("report", {
          checkpoints: report.checkpoints,
          audit: { id: report.audit.id },
        }).then(
          (response) => {
            resolve(response);
          },
          (error) => {
            let message = "Impossible d'intialiser ce rapport";
            vm.config.globalProperties.$ErrorHandler
              .process(message, error)
              .then((response) => {
                reject(response);
              });
          }
        );
      });
    };

    Proxy.createTalk = (issueId = "", message = "") => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.headers["Content-Type"] = "application/vnd.api+json";
        Proxy.create("talk", {
          message: message,
          issue: { id: issueId.toString() },
        }).then(
          (response) => {
            resolve(response);
          },
          (error) => {
            let message = "Impossible d'envoyer votre message";
            vm.config.globalProperties.$ErrorHandler
              .process(message, error)
              .then((response) => {
                reject(response);
              });
          }
        );
      });
    };

    Proxy.sendAlert = (lonlat = "", message = "") => {
      return new Promise((resolve, reject) => {
        let endpoint = Proxy.apiUrl + "/alerts";
        let headers = {
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
          Authorization: "Bearer " + store.getters["reporter/token"],
        };
        Proxy.axios
          .post(
            endpoint,
            {
              data: {
                type: "alerts",
                attributes: {
                  lonlat: lonlat,
                  message: message,
                },
              },
            },
            { headers }
          )
          .then(
            (response) => resolve(response),
            (error) => {
              let message = "Impossible de créer ce signalement";
              vm.config.globalProperties.$ErrorHandler
                .process(message, error)
                .then((response) => {
                  reject(response);
                });
            }
          );
      });
    };

    Proxy.loadCompanyAgencies = (companyId) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one("company", companyId)
          .all("agencies")
          .get({
            "fields[agencies]": "id,name",
            "page[limit]": 500,
          })
          .then(
            (response) => resolve(response),
            (error) => {
              vm.config.globalProperties.$ErrorHandler
                .process("", error)
                .then((response) => reject(response));
            }
          );
      });
    };

    Proxy.loadAgencyResidences = (agencyId, hasAudits = false) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one("agency", agencyId)
          .all("residences")
          .get({
            "fields[residences]": hasAudits ? "id,name,has-audits" : "id,name",
            "page[limit]": 500,
          })
          .then(
            (response) => resolve(response),
            (error) =>
              vm.config.globalProperties.$ErrorHandler
                .process("", error)
                .then((response) => reject(response))
          );
      });
    };

    Proxy.loadResidencePlaces = (residenceId, hasAudits = false) => {
      return new Promise((resolve, reject) => {
        const { id } = store.getters["company/attributes"];
        const companyIds = [191, 21];
        const placesPageLimit = companyIds.includes(id) ? 1000 : 500;
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one("residence", residenceId)
          .all("places")
          .get({
            "fields[places]": hasAudits ? "id,name,has-audits" : "id,name",
            // we fetch 1000 places for OPH MONTREUILLOIS FLUX TEL company only
            "page[limit]": placesPageLimit,
          })
          .then(
            (response) => resolve(response),
            (error) =>
              vm.config.globalProperties.$ErrorHandler
                .process("", error)
                .then((response) => reject(response))
          );
      });
    };

    Proxy.loadPlaceSpots = (placeId) => {
      return new Promise((resolve, reject) => {
        Proxy.headers["Authorization"] =
          "Bearer " + store.getters["reporter/token"];
        Proxy.one("place", placeId)
          .all("spots")
          .get({
            "fields[spots]": "id,name,category",
            "fields[categories]": "id",
            "page[limit]": 500,
            include: "category",
          })
          .then(
            (response) => resolve(response),
            (error) =>
              vm.config.globalProperties.$ErrorHandler
                .process("", error)
                .then((response) => reject(response))
          );
      });
    };

    Proxy.forwardIssue = (issue_id, data) => {
      return new Promise((resolve, reject) => {
        Proxy.axios
          .post(Proxy.apiUrl + `/issues/${issue_id}/forward`, data, {
            headers: {
              Accept: "application/vnd.api+json",
              Authorization: "Bearer " + store.getters["reporter/token"],
            },
          })
          .then(
            (response) => {
              resolve(response);
            },
            (error) => {
              console.log("sowell-api => forward-issue => error");
              reject(error);
            }
          );
      });
    };

    Proxy.issuesByPlaceId = (placeId) => {
      return new Promise((resolve, reject) => {
        Proxy.one("place", placeId)
          .all("issues")
          .get({
            "fields[categories]": "id,img,name",
            "fields[users]": "id,first-name",
            "page[limit]": 500,
            include: "category,author",
          })
          .then((response) => {
            resolve(response.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    };

    Vue.config.globalProperties.$SowellProxy = Proxy;
  },
};
