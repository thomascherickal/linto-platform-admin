import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'

// Views
/*import ContextAdd from './views/ContextAdd.vue'
import ContextOverview from './views/ContextOverview.vue'
import ContextWorkflow from './views/ContextWorkflow.vue'

import FleetManagement from './views/FleetManagement.vue'
import FleetMonitoring from './views/FleetMonitoring.vue'
import SttManagement from './views/SttManagement.vue'
import page404 from './views/404.vue'*/

import ClientStaticOverview from './views/ClientStaticOverview.vue'
import ClientStaticDeploy from './views/ClientStaticDeploy.vue'
import WorkflowEditor from './views/WorkflowEditor.vue'
import TockView from './views/TockView.vue'
import ClientStaticWorkflowEditor from './views/ClientStaticWorkflowEditor.vue'
import ApplicationsOverview from './views/ApplicationsOverview.vue'
import ApplicationCreate from './views/ApplicationCreate.vue'
import ApplicationWorkflowEditor from './views/ApplicationWorkflowEditor.vue'
import ClientStaticMonitoring from './views/ClientStaticMonitoring.vue'
import AndroidUsers from './views/AndroidUsers.vue'
import WebappHosts from './views/WebappHosts.vue'
Vue.use(Router)
const router = new Router({
    mode: 'history',
    routes: [{
            path: '/admin/clients/static',
            name: 'Static devices overview',
            component: ClientStaticOverview,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Static clients'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/clients/static/workflow/:workflowId',
            name: 'Static device flow editor',
            component: ClientStaticWorkflowEditor,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Static clients workflow editor'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
            beforeEnter: async(to, from, next) => {
                try {
                    // Check if the targeted static workflow exists
                    const workflowId = to.params.workflowId
                    const getWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/static/${workflowId}`)
                    if (!!getWorkflow.data.error) {
                        next('/admin/clients/static')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/clients/static')

                }
            }
        },
        {
            path: '/admin/clients/static/:sn/deploy',
            name: 'Static devices - deployment',
            component: ClientStaticDeploy,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Static clients deployment'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
            beforeEnter: async(to, from, next) => {
                try {
                    // Check if the targeted static device exists
                    const sn = to.params.sn
                    const getStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/${sn}`)
                    if (getStaticDevice.data.associated_workflow !== null) {
                        next('/admin/clients/static')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/clients/static')
                }
            }
        },
        {
            path: '/admin/clients/static/:sn/monitoring',
            name: 'Static devices - monitoring',
            component: ClientStaticMonitoring,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Static clients monitoring'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
            beforeEnter: async(to, from, next) => {
                try {
                    // Check if the targeted static device exists
                    const sn = to.params.sn
                    const getStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/${sn}`)
                    if (getStaticDevice.data.associated_workflow === null) {
                        next('/admin/clients/static')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/clients/static')
                }
            }
        },
        {
            path: '/admin/clients/application',
            name: 'Applications overview',
            component: ApplicationsOverview,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - applications'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        }, {
            path: '/admin/clients/application/create',
            name: 'Create new application',
            component: ApplicationCreate,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Create an application workflow'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
        },
        {
            path: '/admin/clients/application/workflow/:workflowId',
            name: 'Nodered application flow editor',
            component: ApplicationWorkflowEditor,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Application flow editor'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
            beforeEnter: async(to, from, next) => {
                try {
                    // Check if the targeted application workflow exists
                    const workflowId = to.params.workflowId
                    const getWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/application/${workflowId}`)
                    if (!!getWorkflow.data.error) {
                        next('/admin/clients/application')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/clients/application')
                }
            }
        },
        {
            path: '/admin/workflow-editor',
            name: 'Worflow editor',
            component: WorkflowEditor,
            meta: [{
                    name: 'title',
                    content: 'Sandbox workflow editor'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
        }, {
            path: '/admin/nlu',
            name: 'tock interface',
            component: TockView,
            meta: [{
                    name: 'title',
                    content: 'Tock interface'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/users/android',
            name: 'Android users interface',
            component: AndroidUsers,
            meta: [{
                    name: 'title',
                    content: 'LinTO admin - android users'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/users/webapp',
            name: 'Web app hosts interface',
            component: WebappHosts,
            meta: [{
                    name: 'title',
                    content: 'LinTO admin - Web app hosts'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        }
    ]
})

/* The following function parse the route.meta attribtue to set page "title" and "meta" before entering a route" */
router.beforeEach((to, from, next) => {
    if (to.meta.length > 0) {
        to.meta.map(m => {
            if (m.name === 'title') {
                document.title = m.content
            } else {
                let meta = document.createElement('meta')
                meta.setAttribute('name', m.name)
                meta.setAttribute('content', m.content)
                document.getElementsByTagName('head')[0].appendChild(meta)
            }
        })
    }
    next()
})

export default router