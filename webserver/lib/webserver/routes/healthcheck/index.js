const debug = require('debug')('linto-admin:routes/api/healthcheck')
const redisTest = require(`${process.cwd()}/lib/redis`)
module.exports = (webServer) => {
    return [{
            path: '/overview',
            method: 'get',
            requireAuth: false,
            controller: async(req, res, next) => {
                res.setHeader("Content-Type", "text/html")
                res.sendFile(process.cwd() + '/dist/healthcheck.html')
            }
        }, {
            path: '/mongo',
            method: 'get',
            controller: async(req, res, next) => {
                try {
                    const mongoUp = await webServer.app.mongo.checkConnection()
                    res.json({
                        service: 'mongo',
                        connected: mongoUp
                    })
                } catch (error) {
                    console.error(error)
                    res.json({
                        service: 'mongo',
                        connected: 'undefined',
                        error: 'Cannot get Mongo connection status'
                    })
                }
            }
        },
        {
            path: '/redis',
            method: 'get',
            controller: async(req, res, next) => {
                try {
                    const redisUp = await webServer.app.redis.checkConnection()
                    res.json({
                        service: 'redis',
                        connected: redisUp
                    })
                } catch (error) {
                    console.error(error)
                    res.json({
                        service: 'redis',
                        connected: 'undefined',
                        error: 'Cannot get Mongo connection status'
                    })
                }
            }
        }
    ]
}