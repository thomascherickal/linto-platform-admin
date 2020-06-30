const axios = require('axios')
const moment = require('moment')
const contexTypestModel = require(`${process.cwd()}/model/mongodb/models/contexttypes.js`)
const contextModel = require(`${process.cwd()}/model/mongodb/models/context.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares/index.js`)
module.exports = (webServer) => {
    return [{
            // Get all existing contexts from database
            path: '/fleet',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const fleetContexts = await contextModel.getFleetContexts()
                    res.json(fleetContexts)
                } catch (error) {
                    res.json({ error })
                }
            }
        },
        {
            // Create a context in database
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const flowId = req.body.flowId

                    // Get workflow
                    const accessToken = await nodered.getBLSAccessToken()
                    const getFinalFlow = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/flow/${flowId}`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Node-RED-Deployment-Type': 'flows',
                            'Authorization': accessToken
                        }
                    })

                    // Format workflow 
                    let flow = getFinalFlow.data
                    if (flow.configs.length > 0) {
                        flow.configs.map(conf => {
                            if (flow.nodes.filter(n => n.id === conf.id).length === 0) {
                                flow.nodes.push(conf)
                            } else {}
                        })
                    }
                    flow.configs = []

                    // Post context
                    const now = moment().format()
                    const contextPayload = {
                        name: payload.context_name,
                        flowId: flowId,
                        type: payload.type,
                        associated_linto: payload.linto,
                        created_date: now,
                        updated_date: now,
                        flow
                    }
                    const postContext = await contextModel.createContext(contextPayload)

                    // Validation
                    if (postContext === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The context "${payload.context_name}" has been created`
                        })
                    } else {
                        throw 'Error on creating context'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: error.toString()
                    })
                }
            }
        },
        {
            // Get all existing context types
            path: '/types',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const contextTypes = await contexTypestModel.getContextTypes()
                    res.json(contextTypes)
                } catch (error) {
                    console.error(error)
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Get existing NLU services (by default = "tock")
            path: '/nluservices',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    res.json([{
                        "service_name": "tock",
                        "host": `${middlewares.useSSL() + process.env.LINTO_STACK_TOCK_SERVICE}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}/tock`
                    }])
                } catch (error) {
                    console.error(error)
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Get MQTT default settings
            path: '/getMqttDefaultSettings',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    res.json({
                        "host": process.env.LINTO_STACK_MQTT_HOST,
                        "port": process.env.LINTO_STACK_MQTT_PORT,
                        "scope": process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE
                    })
                } catch (error) {
                    console.error(error)
                    res.json({ error: error.toString() })
                }
            }
        }
    ]
}