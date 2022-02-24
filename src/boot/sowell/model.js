import JsonApi from 'devour-client'

export default {
  init: (options) => {
    let jsonapi = new JsonApi({ apiUrl: options.apiUrl })

    jsonapi.define('reporter', {
      'first-name': '',
      'last-name': '',
      email: '',
      password: '',
      img: '',
      recipients: [],
      notifications: [],
      'can-close-issues': false,
      company: {
        jsonApi: 'hasOne',
        type: 'companies'
      },
      scopes: {
        jsonApi: 'hasMany',
        type: 'scopes'
      },
      residences: {
        jsonApi: 'hasMany',
        type: 'zones'
      }
    })
    jsonapi.define('scope', {
      name: '',
      'updated-at': ''
    })
    jsonapi.define('user', {
      'first-name': '',
      'last-name': '',
      notifications: [],
      email: '',
      password: ''
    })
    jsonapi.define('company', {
      name: '',
      img: '',
      'updated-at': '',
      'show-is-private': true,
      'external-issues-url': '',
      'forward-issues': {},
      'has-audits': false,
      'allow-unplanned-audits': false,
      'show-unscoped-history': false,
      categories: {
        jsonApi: 'hasMany',
        type: 'categories'
      },
      agencies: {
        jsonApi: 'hasMany',
        type: 'agencies'
      }
    })
    jsonapi.define('category', {
      name: '',
      img: '',
      'has-reasons': false,
      'updated-at': '',
      'is-cleaning-related':'',
      childs: {
        jsonApi: 'hasMany',
        type: 'categories'
      },
      reasons: {
        jsonApi: 'hasMany',
        type: 'reasons'
      }
    })
    jsonapi.define('reason', {
      name: '',
      code: ''
    })
    jsonapi.define('place', {
      name: '',
      'has-audits': '',
      spots: {
        jsonApi: 'hasMany',
        type: 'spots'
      },
      zone: {
        jsonApi: 'hasOne',
        type: 'zones'
      },
      residence: {
        jsonApi: 'hasOne',
        type: 'zones'
      },
      issues: {
        jsonApi: 'hasMany',
        type: 'issues'
      },
      author: {
        jsonApi: 'hasOne',
        type: 'reporter'
      }
    })
    jsonapi.define('agency', {
      name: '',
      residences: {
        jsonApi: 'hasMany',
        type: 'zones'
      }
    })
    jsonapi.define('residence', {
      name: '',
      agency: {
        jsonApi: 'hasOne',
        type: 'zones'
      },
      places: {
        jsonApi: 'hasMany',
        type: 'places'
      }
    })
    jsonapi.define('zone', {
      name: '',
      'has-audits': '',
      agency: {
        jsonApi: 'hasOne',
        type: 'zones'
      },
      residences: {
        jsonApi: 'hasMany',
        type: 'zones'
      }
    })
    jsonapi.define('spot', {
      name: '',
      nature: '',
      location: '',
      code: '',
      category: {
        jsonApi: 'hasOne',
        type: 'categories'
      }
    })
    jsonapi.define('issue', {
      message: '',
      img: null,
      status: '',
      location: {},
      people: {},
      note: '',
      disturbance: '',
      imgs: [],
      imgsUrls: [],
      'is-private': false,
      'created-at': '',
      'updated-at': '',
      category: {
        jsonApi: 'hasOne',
        type: 'categories'
      },
      author: {
        jsonApi: 'hasOne',
        type: 'users'
      },
      spot: {
        jsonApi: 'hasOne',
        type: 'spots'
      },
      report: {
        jsonApi: 'hasOne',
        type: 'reports'
      },
      checkpoint: {
        jsonApi: 'hasOne',
        type: 'checkpoints'
      },
      reason: {
        jsonApi: 'hasOne',
        type: 'reasons'
      },
      talks: []
    })
    jsonapi.define('talk', {
      message: '',
      issue: {
        jsonApi: 'hasOne',
        type: 'issues'
      },
      author: {
        jsonApi: 'hasOne',
        type: 'manager'
      }
    })
    jsonapi.define('audit', {
      dueAt: '',
      place: {
        jsonApi: 'hasOne',
        type: 'places'
      },
      checklist: {
        jsonApi: 'hasOne',
        type: 'audits'
      },
      reports: {
        jsonApi: 'hasMany',
        type: 'reports'
      }
    })
    jsonapi.define('report', {
      checkpoints: [],
      audit: {
        jsonApi: 'hasOne',
        type: 'audits'
      },
      author: {
        jsonApi: 'hasOne',
        type: 'reporter'
      }
    })
    jsonapi.define('checklist', {
      name: '',
      category: {
        jsonApi: 'hasOne',
        type: 'places'
      },
      checkpoints: {
        jsonApi: 'hasMany',
        type: 'checkpoints'
      }
    })
    jsonapi.define('checkpoint', {
      question: '',
      description: '',
      category: {
        jsonApi: 'hasOne',
        type: 'checklists'
      }
    })

    return jsonapi
  }
}
