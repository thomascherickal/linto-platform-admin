const clientsStaticModel = require(`${process.cwd()}/model/mongodb/models/clients-static.js`)
const workflowsStaticModel = require(`${process.cwd()}/model/mongodb/models/workflows-static.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)

module.exports = (webServer) => {
    return [{
            // Get all static devices from database
            path: '/static',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Request
                    const getStaticClients = await clientsStaticModel.getAllStaticClients()

                    // Response
                    res.json(getStaticClients)
                } catch (error) {
                    console.error(error)
                    res.json({ error })
                }
            }
        },
        {
            // Get a static device by its serial number
            path: '/static/:sn',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const sn = req.params.sn

                    // Request
                    const getStaticClient = await clientsStaticModel.getStaticClientBySn(sn)

                    // Response
                    res.json(getStaticClient)
                } catch (error) {
                    console.error(error)
                    res.json({ error })
                }
            }
        },
        {
            // Create a new static device
            /* 
            payload = {
              sn: String (static device serial number)
            }
            */
            path: '/static',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const sn = payload.sn
                    const addStaticDevice = await clientsStaticModel.addStaticClient(sn)
                    if (addStaticDevice === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The static client "${sn}" has been added.`
                        })
                    } else {
                        throw addStaticDevice
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
            // Replace a static device Serial Number by a target one (BLS + Database)
            /*
            payload = {
              sn: String (original static device serial number),
              workflow: object,
              targetDevice: Sting (target static device serial number)
            }
          */
            path: '/static/replace',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload

                    // get static workflow data
                    const getWorklfow = await workflowsStaticModel.getStaticWorkflowById(payload.workflow._id)

                    // format data for update
                    let workflowPayload = getWorklfow
                    workflowPayload.associated_device = payload.targetDevice
                    workflowPayload.flow.nodes.map(node => {
                        if (node.type === 'linto-terminal-in') {
                            node.sn = payload.targetDevice
                        }
                    })

                    // Update static workflow in DB
                    const updateWorkflow = await workflowsStaticModel.updateStaticWorkflow(workflowPayload)
                    if (updateWorkflow === 'success') {

                        // Update flow on BLS
                        const updateBLS = await nodered.putBLSFlow(workflowPayload.flowId, workflowPayload.flow)
                        if (updateBLS.status === 'success') {

                            // Update static devices (orignal)
                            const updateCurrentDevice = await clientsStaticModel.updateStaticClient({ sn: payload.sn, associated_workflow: null })

                            // Update static devices (target)
                            const updateTargetDevice = await
                            clientsStaticModel.updateStaticClient({ sn: payload.targetDevice, associated_workflow: payload.workflow })

                            // Response
                            if (updateCurrentDevice === 'success' && updateTargetDevice === 'success')  {
                                res.json({
                                    status: 'success',
                                    msg: `Static device "${payload.sn}" has been replaced by static device "${payload.targetDevice}"`
                                })
                            } else {
                                throw 'Error on updating static devices'
                            }
                            throw 'Error on updating workflow on Business logic server'
                        }
                        throw 'Error on updating workflow on database'
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
            // Update a static client
            /*
            payload = {
              sn: String (static device serial number),
              associated_workflow: {
                _id: String (static workflow id)
                name: String (static workflow name)
              }
            }
          */
            path: '/static',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload

                    // Request
                    const updateStaticClient = await clientsStaticModel.updateStaticClient(payload)

                    // Response
                    if (updateStaticClient === 'success') {
                        res.json({
                            status: 'success',
                            msg: `Static device "${payload.sn}" has been updated`
                        })
                    } else {
                        throw `Error on updating static device "${payload.sn}"`
                    }
                } catch (error) {
                    console.error(error)
                    res.json({ error })
                }
            }
        },
        {
            // Delete a LinTO static device by its serial number

            path: '/static',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const sn = req.body.sn

                    // Request
                    const deleteClient = await clientsStaticModel.deleteStaticDevice(sn)

                    // Response
                    if (deleteClient === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The static device with serial number "${sn}" has been deleted.`
                        })
                    } else {
                        throw 'Error on deleting static client'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({ error })
                }
            }
        }
    ]
}