const debug = require('debug')(`linto-admin:webserver`)
const express = require('express')
const Session = require('express-session')
const bodyParser = require('body-parser')
const EventEmitter = require('eventemitter3')
const cookieParser = require('cookie-parser')
const path = require('path')
const IoHandler = require('./iohandler')
const CORS = require('cors')
const redisClient = require(`${process.cwd()}/lib/redis`)
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares/index.js`)
let corsOptions = {}
let whitelistDomains = [`${middlewares.useSSL() + process.env.LINTO_STACK_DOMAIN}`]

if (process.env.LINTO_STACK_ADMIN_API_WHITELIST_DOMAINS.length > 0) {
    whitelistDomains.push(...process.env.LINTO_STACK_ADMIN_API_WHITELIST_DOMAINS.split(','))
    corsOptions = {
        origin: function(origin, callback) {
            if (!origin || whitelistDomains.indexOf(origin) !== -1 || origin === 'undefined') {
                callback(null, true)
            } else {
                console.log('whitelist: ', whitelistDomains)
                callback(new Error('Not allowed by CORS'))
            }
        }
    }
}

class WebServer extends EventEmitter {
    constructor() {
        super()
        this.app = express()
        this.app.set('etag', false)
        this.app.set('trust proxy', true)
        this.app.use('/assets', express.static(path.resolve(__dirname, '../../dist')))
        this.app.use('/public', express.static(path.resolve(__dirname, '../../public')))
        this.app.use(bodyParser.json({ limit: '1000mb' }))
        this.app.use(bodyParser.urlencoded({
            extended: false
        }))
        this.app.use(cookieParser())
        this.app.use(CORS(corsOptions))
        let sessionConfig = {
            resave: false,
            saveUninitialized: true,
            secret: process.env.LINTO_STACK_ADMIN_COOKIE_SECRET,
            cookie: {
                secure: false,
                maxAge: 604800 // 7 days
            }
        }

        // Redis
        if (process.env.NODE_ENV === 'production') {
            this.app.redis = new redisClient()
            sessionConfig.store = this.app.redis.redisStore
        }

        this.session = Session(sessionConfig)
        this.app.use(this.session)
        this.httpServer = this.app.listen(process.env.LINTO_STACK_ADMIN_HTTP_PORT, "0.0.0.0", (err) => {
            if (err) console.error(err)
        })
        console.log('Webserver started on port : ', process.env.LINTO_STACK_ADMIN_HTTP_PORT)
        return this.init()
    }
    async init() {
        // Set ioHandler
        this.ioHandler = new IoHandler(this)

        // Router
        require('./routes')(this)

        this.app.use((req, res, next) => {
            res.status(404)
            res.setHeader("Content-Type", "text/html")
            res.sendFile(process.cwd() + '/dist/404.html')
        })

        this.app.use((err, req, res, next) => {
            console.error(err)
            res.status(500)
            res.end()
        })
        return this
    }
}

module.exports = new WebServer()