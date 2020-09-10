import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'

// Views
import MonoUserApps from './views/MonoUserApps.vue'
import MonoUserAppDeploy from './views/MonoUserAppDeploy.vue'
import MonoUserAppWorkflowEditor from './views/MonoUserAppWorkflowEditor.vue'
import MultiUserApps from './views/MultiUserApps.vue'
import MultiUserAppDeploy from './views/MultiUserAppDeploy.vue'
import MultiUserAppWorkflowEditor from './views/MultiUserAppWorkflowEditor.vue'
import Terminals from './views/Terminals.vue'
import TerminalsMonitoring from './views/TerminalsMonitoring.vue'
import Users from './views/Users.vue'
import Domains from './views/Domains.vue'
import TockView from './views/TockView.vue'
import WorkflowEditor from './views/WorkflowEditor.vue'
Vue.use(Router)
const router = new Router({
    mode: 'history',
    routes: [{
            path: '/admin/applications/mono',
            name: 'Static devices overview',
            component: MonoUserApps,
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
            path: '/admin/applications/mono/workflow/:workflowId',
            name: 'Static device flow editor',
            component: MonoUserAppWorkflowEditor,
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
                        next('/admin/applications/mono')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/applications/mono')

                }
            }
        },
        {
            path: '/admin/applications/mono/deploy',
            name: 'Static devices - deployment',
            component: MonoUserAppDeploy,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Static clients deployment'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
            /*beforeEnter: async(to, from, next) => {
                try {
                    // Check if the targeted static device exists
                    const sn = to.params.sn
                    const getStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/${sn}`)
                    if (getStaticDevice.data.associated_workflow !== null) {
                        next('/admin/applications/mono')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/applications/mono')
                }
            }*/
        },
        {
            path: '/admin/applications/mono/deploy/:sn',
            name: 'Static devices - deployment by id',
            component: MonoUserAppDeploy,
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
                        next('/admin/applications/mono')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/applications/mono')
                }
            }
        },
        {
            path: '/admin/devices',
            name: 'Devices - statice devices',
            component: Terminals,
            meta: [{
                    name: 'title',
                    content: 'Devices and static devices'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/applications/mono/:sn/monitoring',
            name: 'Static devices - monitoring',
            component: TerminalsMonitoring,
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
                        next('/admin/applications/mono')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/applications/mono')
                }
            }
        },
        {
            path: '/admin/applications/multi',
            name: 'Applications overview',
            component: MultiUserApps,
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
            path: '/admin/applications/multi/deploy',
            name: 'Create new application',
            component: MultiUserAppDeploy,
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
            path: '/admin/applications/multi/workflow/:workflowId',
            name: 'Nodered application flow editor',
            component: MultiUserAppWorkflowEditor,
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
                        next('/admin/applications/multi')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/applications/multi')
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
            path: '/admin/users',
            name: 'Android users interface',
            component: Users,
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
            path: '/admin/domains',
            name: 'Web app hosts interface',
            component: Domains,
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