const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const moment = require('moment')
const applicationWorkflowsModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)
const androidUsersModel = require(`${process.cwd()}/model/mongodb/models/android-users.js`)
const tmpFlowModel = require(`${process.cwd()}/model/mongodb/models/flow-tmp.js`)

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
                    res.json({
                        status: 'error',
                        error
                    })
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
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Delete a workflow application
            /* 
            payload : {
              workflowName: String
            }
            */
            path: '/:workflowId',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const workflowId = req.params.workflowId
                    const workflowName = req.body.workflowName
                    const removeApplication = await applicationWorkflowsModel.deleteApplicationWorkflow(workflowId)
                    if (removeApplication === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The application workflow "${workflowName}" has been removed.`
                        })
                    } else {
                        throw removeApplication.msg
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
    ]
}