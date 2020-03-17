const Session = require('express-session')
const redis = require('redis')
const redisStore = require('connect-redis')(Session)

class redisClient {
    constructor() {
        this.poolOpitons = {
            host: process.env.LINTO_STACK_REDIS_SESSION_SERVICE,
            port: process.env.LINTO_STACK_REDIS_SESSION_SERVICE_PORT,
        }
        this.maxAttempt = 5
        this.client = null
        this.redisStore = null
        this.init()
    }

    init() {
        this.client = redis.createClient({
            host: this.poolOpitons.host,
            port: this.poolOpitons.port,
            retry_strategy: function(options) {
                try {
                    console.log(options)
                        //console.log('retry strategy options', options)
                    if (options.error && options.error.code === "ECONNREFUSED" && options.attempt < this.maxAttempt) {
                        console.log('try to RECONNECT')
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        // End reconnecting after a specific timeout and flush all commands
                        // with a individual error
                        throw "Retry time exhausted"
                    }
                    if (options.attempt > 5) {
                        // End reconnecting with built in error
                        throw "Redis disconnected > To many attempts"
                    }
                    // reconnect after
                    return Math.min(options.attempt * 100, 3000);
                } catch (error) {
                    console.error('Redis error :', error)
                    process.exit(1)
                }
            }
        })

        this.redisStore = new redisStore({
            host: process.env.LINTO_STACK_REDIS_SESSION_SERVICE,
            port: process.env.LINTO_STACK_REDIS_SESSION_SERVICE_PORT,
            client: this.client
        })

        this.client.on('connect', () => {
            console.log('> Redis : Connected')
        })
        this.client.on('reconnect', () => {
            console.log('> Redis reconnect')
        })
        this.client.on('error', (e) => {
            console.log('REDIS Error :')
            console.log(e)
        })
        this.client.on('end', (e) => {
            console.log('REDIS: Disconnected')
        })
    }

    checkConnection() {
        return this.client.connected
    }
}

module.exports = redisClient