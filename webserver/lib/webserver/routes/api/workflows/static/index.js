const workflowsStaticModel = require(`${process.cwd()}/model/mongodb/models/workflows-static.js`)
const workflowsApplicationModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)
const clientsStaticModel = require(`${process.cwd()}/model/mongodb/models/clients-static.js`)
const tmpFlowModel = require(`${process.cwd()}/model/mongodb/models/flow-tmp.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const lexSeed = require(`${process.cwd()}/lib/webserver/middlewares/lexicalseeding.js`)
const moment = require('moment')

module.exports = (webServer) => {
    return [{
            // Get all static workflows from database
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Request
                    const getStaticWorkflows = await workflowsStaticModel.getAllStaticWorkflows()

                    // Response
                    res.json(getStaticWorkflows)
                } catch (error) {
                    console.error(error)
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Get a static workflow by its name
            path: '/name/:name',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const name = req.params.name
                        // Request
                    const getStaticWorkflow = await workflowsStaticModel.getStaticWorkflowByName(name)

                    // Response
                    res.json(getStaticWorkflow)
                } catch (error) {
                    console.error(error)
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Create a new static workflow
            /*
            payload : {
            sn: String,
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
                    // Set variables & values
                    const payload = req.body.payload

                    // get flow object
                    const getPostedFlow = await nodered.getFlowById(payload.flowId)

                    // Create workflow 
                    const workflowPayload = {
                        name: payload.workflowName,
                        flowId: payload.flowId,
                        created_date: moment().format(),
                        updated_date: moment().format(),
                        associated_device: payload.sn,
                        flow: getPostedFlow
                    }

                    // Request
                    const postWorkflow = await workflowsStaticModel.postStaticWorkflow(workflowPayload)

                    // Response
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
            // Update a static workflow services parameters
            /* 
            payload = {
              workflowName,
              sttServiceLanguage,
              sttService,
              tockApplicationName,
            }
            */
            path: '/:id/services',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload
                    const workflowId = req.params.id
                    let getWorkflow = []

                    // Get static workflow object
                    if (payload.type === 'static') {
                        getWorkflow = await workflowsStaticModel.getStaticWorkflowById(workflowId)

                    } else if (payload.type === 'application') {
                        getWorkflow = await workflowsApplicationModel.getApplicationWorkflowById(workflowId)
                    }
                    let workflowPayload = getWorkflow

                    // set worlflow name
                    workflowPayload.name = payload.workflowName
                    workflowPayload.flow.label = payload.workflowName

                    // set worlflow language
                    const nodeConfig = workflowPayload.flow.nodes.filter(node => node.type === 'linto-config')
                    if (nodeConfig.length > 0) {
                        nodeConfig[0].language = payload.sttServiceLanguage
                    }

                    // set STT service 
                    const nodeSttConfig = workflowPayload.flow.configs.filter(node => node.type === 'linto-config-transcribe')
                    if (nodeSttConfig.length > 0) {
                        nodeSttConfig[0].service = payload.sttService
                    }

                    // set Tock application
                    const nodeNluConfig = workflowPayload.flow.configs.filter(node => node.type === 'linto-config-evaluate')
                    if (nodeNluConfig.length > 0) {
                        nodeNluConfig[0].appname = payload.tockApplicationName
                    }

                    let updateWorkflow = null

                    if (payload.type === 'static') {
                        // Update static workflow
                        updateWorkflow = await workflowsStaticModel.updateStaticWorkflow(workflowPayload)
                    } else if (payload.type === 'application') {
                        // Update application workflow
                        updateWorkflow = await workflowsApplicationModel.updateApplicationWorkflow(workflowPayload)
                    }

                    if (updateWorkflow === 'success') {
                        if (payload.type === 'static') {
                            // STATIC WORKFLOW
                            // Update static device 
                            const updateStaticDevice = await clientsStaticModel.updateStaticClient({
                                sn: workflowPayload.associated_device,
                                associated_workflow: {
                                    _id: workflowId,
                                    name: workflowPayload.name
                                }
                            })
                            if (updateStaticDevice === 'success') {
                                // Update workflow on BLS (put)
                                const updateBls = await nodered.putBLSFlow(workflowPayload.flowId, workflowPayload.flow)

                                // Resonse
                                if (updateBls.status === 'success') {
                                    res.json({
                                        status: 'success',
                                        msg: `The workflow "${payload.workflowName}" has been updated`
                                    })
                                } else {
                                    throw `Error on updating workflow ${getWorkflow.name} on Business logic server`
                                }
                            } else {
                                throw `Error on updating associated static device "${workflowPayload.associated_device}"`
                            }

                        } else if (payload.type === 'application') {
                            // APPLICATION WORKFLOW
                            // Update workflow on BLS (put)
                            const updateBls = await nodered.putBLSFlow(workflowPayload.flowId, workflowPayload.flow)

                            // Resonse
                            if (updateBls.status === 'success') {
                                res.json({
                                    status: 'success',
                                    msg: `The workflow "${payload.workflowName}" has been updated`
                                })
                            } else {
                                throw `Error on updating workflow ${getWorkflow.name} on Business logic server`
                            }
                        }
                    } else {
                        throw `Error on updating workflow ${getWorkflow.name}`
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
            // Remove a static workflow and dissociate Static device and workflow template
            path: '/:id',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload
                    const workflowId = req.params.id

                    // Get static workflow
                    const getWorkflow = await workflowsStaticModel.getStaticWorkflowById(workflowId)
                    const staticDeviceSn = payload.sn

                    // Delete workflow from BLS 
                    // "Success" is not required (if the workflow has been removed manually for exemple)
                    await nodered.deleteBLSFlow(getWorkflow.flowId)

                    // Delete Static workflow from DB
                    const deleteStaticWorkflow = await workflowsStaticModel.deleteStaticWorkflowById({ _id: workflowId })
                    if (deleteStaticWorkflow === 'success') {
                        // Update static client in DB 
                        const updateStaticDevice = await clientsStaticModel.updateStaticClient({ sn: staticDeviceSn, associated_workflow: null })
                        if (updateStaticDevice === 'success') {
                            res.json({
                                status: 'success',
                                msg: `The static device "${staticDeviceSn}" has been dissocaited from workflow "${getWorkflow.name}"`
                            })
                        } else {
                            throw `Error on updating static device "${staticDeviceSn}"`
                        }
                    } else {
                        throw `Error on deleting static workflow "${getWorkflow.name}"`
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: error.toString(),
                        error
                    })
                }
            }
        }, {
            path: '/saveandpublish',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload

                    // Get tmp flow
                    const getTmpFlow = await tmpFlowModel.getTmpFlow()
                    const formattedFlow = nodered.formatFlowGroupedNodes(getTmpFlow)

                    // Update BLS
                    const putBls = await nodered.putBLSFlow(payload.noderedFlowId, formattedFlow)
                    if (putBls.status === 'success') {
                        const getUdpatedFlow = await nodered.getFlowById(payload.noderedFlowId)

                        // update static workflow
                        const updateStaticWorkflow = await workflowsStaticModel.updateStaticWorkflow({
                            _id: payload.workflowId,
                            flow: getUdpatedFlow,
                            updated_date: moment().format()
                        })
                        if (updateStaticWorkflow === 'success') {
                            // Lexical Seeding
                            const sttService = formattedFlow.nodes.filter(f => f.type === 'linto-config-transcribe')
                            if (sttService.length > 0 && !!sttService[0].service) {
                                const lexicalSeeding = await lexSeed.doLexicalSeeding(sttService[0].service, payload.noderedFlowId)
                                if (lexicalSeeding.status === 'success') {
                                    res.json({
                                        status: 'success',
                                        msg: `The static workflow "${payload.workflowName}" has been updated`
                                    })
                                } else {
                                    throw lexicalSeeding
                                }
                            }
                        } else {
                            throw 'Error on updating static workflow'
                        }
                    } else {
                        throw 'Error on updating flow on Business Logic Server'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: !!error.msg ? error.msg : 'Error on updating workflow',
                        error
                    })
                }
            }
        }
    ]
}