const axios = require('axios')
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares/index.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)


module.exports = (webServer) => {
    return [{
            // Get sandbox workflow ID from BLS
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    let sandBoxId = null

                    // Get nodered access token
                    const accessToken = await nodered.getBLSAccessToken()

                    // Request
                    const fullFlow = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/flows`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': accessToken
                        }
                    })

                    // Search for the "SandBox" workflow Id
                    fullFlow.data.map(f => {
                        if (f.type === 'tab' && f.label === "SandBox") {
                            sandBoxId = f.id
                        }
                    })

                    // Response
                    res.json({ sandBoxId })
                } catch (e) {
                    console.error(e)
                    res.json({ error: e })
                }
            }
        },
        {
            // Create sandbox workflow if it doesn't exist
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = {
                        label: 'SandBox',
                        nodes: [],
                        configs: []
                    }

                    // Get nodered access token
                    const accessToken = await nodered.getBLSAccessToken()

                    // Request
                    const createSandbox = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/flow`, {
                        method: 'post',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': accessToken
                        },
                        data: payload
                    })

                    // Response
                    if (createSandbox.status === 200) {
                        res.json({
                            status: 'success'
                        })
                    } else {
                        throw 'Error on creating SandBox workflow'
                    }
                } catch (e) {
                    console.error(e)
                    res.json({ error: e })
                }
            }
        },
    ]
}