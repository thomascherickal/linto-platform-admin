const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const moment = require('moment')
const applicationWorkflowsModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)
const androidUsersModel = require(`${process.cwd()}/model/mongodb/models/android-users.js`)
module.exports = (webServer) => {
    return [{
            // Get all application workflows from database
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getApplicationWorkflows = await applicationWorkflowsModel.getAllApplicationWorkflows()
                    res.json(getApplicationWorkflows)
                } catch (error) {
                    console.error(error)
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Create a new application workflow
            /*
              payload : {
              workflowName: String,
              workflowTemplate: String,
              sttServiceLanguage: String,
              sttService: String,
              tockApplicationName: String
              }
            */
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const getPostedFlow = await nodered.getFlowById(payload.flowId)

                    // Create workflow 
                    const workflowPayload = {
                        name: payload.workflowName,
                        flowId: payload.flowId,
                        created_date: moment().format(),
                        updated_date: moment().format(),
                        flow: getPostedFlow
                    }

                    const postWorkflow = await applicationWorkflowsModel.postApplicationWorkflow(workflowPayload)
                    if (postWorkflow === 'success') {
                        res.json({
                            status: 'success',
                            msg: `Workflow "${payload.workFlowName} has been created`
                        })
                    } else {
                        throw postWorkflow
                    }
                } catch (error) {
                    console.error(error)
                    res.json({ error })
                }
            }
        },
        {
            path: '/androidusers',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getAndroidUsers = await androidUsersModel.getAllAndroidUsers()
                    res.json(getAndroidUsers)
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
            // Get android users list by workflow ID
            path: '/:workflowId/androidusers',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const workflowId = req.params.workflowId
                    const getAndroidUsers = await androidUsersModel.getAllAndroidUsers()

                    const users = getAndroidUsers.filter(user => workflowId.indexOf(user.applications) >= 0)

                    res.json(users)
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
            path: '/:id/androiduser',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload

                    const getUserByEmail = await androidUsersModel.getUserByEmail(payload.email)

                    // update existing user
                    let userPayload = getUserByEmail[0]
                    userPayload.applications.push(payload.workflowId)

                    const updateUser = await androidUsersModel.updateAndroidUser(userPayload)

                    if (updateUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The Android user "${payload.email}" has been added to application "${payload.appName}".`
                        })
                    } else {
                        throw `Error on updating android user "${payload.email}"`
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        }
    ]
}