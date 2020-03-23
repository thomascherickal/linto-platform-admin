const debug = require('debug')('linto-admin:setup')

module.exports = (webServer) => {
    return [{
        path: '/',
        method: 'get',
        controller: async(req, res, next) => {
            res.setHeader("Content-Type", "text/html")
            res.sendFile(process.cwd() + '/dist/setup.html')
        }
    }]
}