const webappHostsModel = require(`${process.cwd()}/model/mongodb/models/webapp-hosts.js`)
const applicationWorkflowsModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)

module.exports = (webServer) => {
    return [{
            // Get all webapp hosts
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Request
                    const getWebAppHosts = await webappHostsModel.getAllWebAppHosts()

                    // Response
                    res.json(getWebAppHosts)
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Create a webapp host
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload

                    // Request
                    const createWebappHost = await webappHostsModel.createWebAppHost(payload)

                    // Response
                    if (createWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The host "${payload.originUrl}" has been created`
                        })
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Create a webapp host
            path: '/:id',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const webappHostId = req.params.id
                    const payload = req.body.payload

                    // Request
                    const removeWebappHost = await webappHostsModel.deleteWebAppHost(webappHostId)

                    // Response
                    if (removeWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The host "${payload.originUrl}" has been removed`
                        })
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Update a webapp host
            path: '/:id',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload

                    // Request
                    const updateWebappHost = await webappHostsModel.updateWebAppHost(payload)

                    // Response
                    if (updateWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The host "${payload.originUrl}" has been updated`
                        })
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Dissociate an application from a web app host
            path: '/:webappHostId/applications/:applicationId/remove',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const applicationId = req.params.applicationId
                    const webappHostId = req.params.webappHostId

                    // get Webapp host data
                    const webappHost = await webappHostsModel.getWebappHostById(webappHostId)

                    // get application workflow data
                    const applicationWorkflow = await applicationWorkflowsModel.getApplicationWorkflowById(applicationId)

                    // Format data for update
                    let applications = webappHost.applications
                    applications.pop(applicationId)

                    // Request
                    const updateWebappHost = await webappHostsModel.updateWebappHost({
                        _id: webappHostId,
                        applications
                    })

                    // Response
                    if (updateWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The Web application host "${webappHost.originUrl}" has been dissociated from the application "${applicationWorkflow.name}"`
                        })
                    } else {
                        throw 'Error on updating Web application host'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Add an application to an android user
            /* 
            payload = {
              applications: Array (Array of application workflow_id)
            }
            */
            // Link : /api-docs/#/android_users/AddApplicationToAndroidUser
            path: '/:webappHostId/applications',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload
                    const webappHostId = req.params.webappHostId
                    const applicationsToAdd = payload.applications

                    // get Webapp host data
                    const getWebappHost = await webappHostsModel.getWebappHostById(webappHostId)

                    // Format data for update
                    let webappHost = getWebappHost
                    webappHost.applications.push(...applicationsToAdd)

                    // Request
                    const updateWebappHost = await webappHostsModel.updateWebappHost(webappHost)

                    // Response
                    if (updateWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `New applications have been attached to Web appliaction host "${webappHost.originUrl}"`
                        })
                    } else {
                        throw 'Error on updating user'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Remove an application for all web-application hosts
            /* 
            paylaod = {
              _id: String (application workflow_id),
              name: String (application worfklow name),
            }
            */
            path: '/applications',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values 
                    const payload = req.body.payload

                    // Request
                    const updateWebappHost = await webappHostsModel.removeApplicationForAllHosts(payload._id)

                    // Response
                    if (updateWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The application ${payload.name} has been removed for all web-app hosts`
                        })
                    } else {
                        throw updateWebappHost
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error: 'Error on deleting application from web-app hosts'
                    })
                }
            }
        },
    ]
}