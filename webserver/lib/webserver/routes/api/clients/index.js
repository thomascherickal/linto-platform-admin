const clientsStaticModel = require(`${process.cwd()}/model/mongodb/models/clients-static.js`)
const workflowsStaticModel = require(`${process.cwd()}/model/mongodb/models/workflows-static.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)

module.exports = (webServer) => {
    return [{
            // Get all LinTO static devices from database
            path: '/static',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getStaticClients = await clientsStaticModel.getAllStaticClients()
                    res.json(getStaticClients)
                } catch (error) {
                    console.error(error)
                    res.json({ error })
                }
            }
        },
        {
            // Get all LinTO static devices from database
            path: '/static/:sn',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const sn = req.params.sn
                    const getStaticClient = await clientsStaticModel.getStaticClientBySn(sn)
                    res.json(getStaticClient)
                } catch (error) {
                    console.error(error)
                    res.json({ error })
                }
            }
        },
        {
            // Replace a static device Serial Number by a target one (BLS + Database)
            path: '/static/replace',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const getWorklfow = await workflowsStaticModel.getStaticWorkflowById(payload.workflow._id)

                    // replace serial number in workflow collecion
                    let workflowPayload = getWorklfow
                    workflowPayload.associated_device = payload.targetDevice

                    workflowPayload.flow.nodes.map(node => {
                        if (node.type === 'linto-terminal-in') {
                            node.sn = payload.targetDevice
                        }
                    })

                    // Update workflow
                    const updateWorkflow = await workflowsStaticModel.updateStaticWorkflow(workflowPayload)
                    if (updateWorkflow === 'success') {
                        // Update workflow on BLS
                        const updateBLS = await nodered.putBLSFlow(workflowPayload.flowId, workflowPayload.flow)
                        if (updateBLS.status === 'success') {
                            // Update static devices (orignal and target) 
                            const updateCurrentDevice = await clientsStaticModel.updateStaticClient({ sn: payload.sn, associated_workflow: null })
                            const updateTargetDevice = await clientsStaticModel.updateStaticClient({ sn: payload.targetDevice, associated_workflow: payload.workflow })

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
            path: '/static',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const updateStaticClient = await clientsStaticModel.updateStaticClient(payload)
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
            // Delete a LinTO static device by its serial number from database
            path: '/static',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const sn = req.body.sn

                    const deleteClient = await clientsStaticModel.deleteStaticDevice(sn)
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