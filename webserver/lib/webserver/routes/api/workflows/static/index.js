const workflowsStaticModel = require(`${process.cwd()}/model/mongodb/models/workflows-static.js`)
const clientsStaticModel = require(`${process.cwd()}/model/mongodb/models/clients-static.js`)
const tmpFlowModel = require(`${process.cwd()}/model/mongodb/models/flow-tmp.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const moment = require('moment')

module.exports = (webServer) => {
    return [{
            // Get all static workflows from database
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getStaticWorkflows = await workflowsStaticModel.getAllStaticWorkflows()
                    res.json(getStaticWorkflows)
                } catch (error) {
                    console.error(error)
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Get a workflow by its name
            path: '/name/:name',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const name = req.params.name
                    const getStaticWorkflow = await workflowsStaticModel.getStaticWorkflowByName(name)
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
                    const payload = req.body.payload
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
                    const postWorkflow = await workflowsStaticModel.postStaticWorkflow(workflowPayload)
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
            path: '/:id',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const workflowId = req.params.id

                    const getWorkflow = await workflowsStaticModel.getStaticWorkflowById(workflowId)
                    let workflowPayload = getWorkflow

                    // get worlflow name
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
                        const host = nodeSttConfig[0].host
                        let splitHost = host.split('/')
                        splitHost[splitHost.length - 1] = payload.sttService
                        nodeSttConfig[0].host = splitHost.join('/')

                    }

                    // set Tock application
                    const nodeNluConfig = workflowPayload.flow.configs.filter(node => node.type === 'linto-config-evaluate')
                    if (nodeNluConfig.length > 0) {
                        nodeNluConfig[0].appname = payload.tockApplicationName
                    }

                    const updateWorkflow = await workflowsStaticModel.updateStaticWorkflow(workflowPayload)

                    if (updateWorkflow === 'success') {
                        // update static device 
                        const updateStaticDevice = await clientsStaticModel.updateStaticClient({
                            sn: workflowPayload.associated_device,
                            associated_workflow: {
                                _id: workflowId,
                                name: workflowPayload.name,
                                updated_date: moment().format()
                            }
                        })
                        if (updateStaticDevice === 'success') {
                            // Update workflow on BLS
                            const updateBls = await nodered.putBLSFlow(workflowPayload.flowId, workflowPayload.flow)

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
                    const payload = req.body.payload
                    const workflowId = req.params.id
                    const getWorkflow = await workflowsStaticModel.getStaticWorkflowById(workflowId)
                    const staticDeviceSn = payload.sn

                    // Delete workflow from BLS
                    const removeBlsWorkflow = await nodered.deleteBLSFlow(getWorkflow.flowId)
                    if (removeBlsWorkflow.status === 'success') {
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
                    } else {
                        throw `Error on deleting workflow "${getWorkflow.name}" from Business logic server`
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
                            res.json({
                                status: 'success',
                                msg: `The static workflow "${payload.workflowName}" has been updated`
                            })
                        } else {
                            c
                            throw 'Error on updating static workflow'
                        }
                    } else {
                        throw 'Error on updating flow on Business Logic Server'
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