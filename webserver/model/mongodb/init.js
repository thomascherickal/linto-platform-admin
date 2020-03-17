const mongoDb = require('mongodb')
let urlMongo = 'mongodb://'
if (process.env.LINTO_STACK_MONGODB_USE_LOGIN) {
    urlMongo += process.env.LINTO_STACK_MONGODB_USER + ':' + process.env.LINTO_STACK_MONGODB_PASSWORD + '@'
}
urlMongo += process.env.LINTO_STACK_MONGODB_SERVICE + ':' + process.env.LINTO_STACK_MONGODB_PORT + '/'
if (process.env.LINTO_STACK_MONGODB_USE_LOGIN) {
    urlMongo += '?authSource=' + process.env.LINTO_STACK_MONGODB_DBNAME
}

// Connect to the db
class modelMongoDb {
    constructor() {
        this.mongoDb = mongoDb
        this.urlMongo = urlMongo
        this.client = mongoDb.MongoClient
        this.poolOptions = {
            numberOfRetries: 5,
            auto_reconnect: true,
            poolSize: 40,
            connectTimeoutMS: 5000,
            useNewUrlParser: true,
            useUnifiedTopology: false
        }
    }

    /* ====================== */
    /* ===== MONGO INIT ===== */
    /* ====================== */

    // Try to connect to mongo database
    async connect() {
        try {
            await this.client.connect(this.urlMongo, this.poolOptions,
                (err, client) => {
                    if (err) {
                        console.error('> MongoDB ERROR :', err.toString())
                        return (err.toString())
                    } else {
                        // Connection success
                        console.log('> MongoDB : Connected')
                        this.db = client.db(process.env.LINTO_STACK_MONGODB_DBNAME)

                        client.topology.on('close', () => {
                            console.error('> MongoDb : Connection lost ')
                        })
                        client.topology.on('error', (e) => {
                            console.error('> MongoDb ERROR: ', e)
                        })
                        client.topology.on('reconnect', () => {
                            console.error('> MongoDb : reconnect')
                        })

                        /* ALL EVENTS */
                        /*
                        commandStarted: [Function (anonymous)],
                        commandSucceeded: [Function (anonymous)],
                        commandFailed: [Function (anonymous)],
                        serverOpening: [Function (anonymous)],
                        serverClosed: [Function (anonymous)],
                        serverDescriptionChanged: [Function (anonymous)],
                        serverHeartbeatStarted: [Function (anonymous)],
                        serverHeartbeatSucceeded: [Function (anonymous)],
                        serverHeartbeatFailed: [Function (anonymous)],
                        topologyOpening: [Function (anonymous)],
                        topologyClosed: [Function (anonymous)],
                        topologyDescriptionChanged: [Function (anonymous)],
                        joined: [Function (anonymous)],
                        left: [Function (anonymous)],
                        ping: [Function (anonymous)],
                        ha: [Function (anonymous)],
                        connectionPoolCreated: [Function (anonymous)],
                        connectionPoolClosed: [Function (anonymous)],
                        connectionCreated: [Function (anonymous)],
                        connectionReady: [Function (anonymous)],
                        connectionClosed: [Function (anonymous)],
                        connectionCheckOutStarted: [Function (anonymous)],
                        connectionCheckOutFailed: [Function (anonymous)],
                        connectionCheckedOut: [Function (anonymous)],
                        connectionCheckedIn: [Function (anonymous)],
                        connectionPoolCleared: [Function (anonymous)],
                        authenticated: [Function (anonymous)],
                        error: [ [Function (anonymous)], [Function: listener] ],
                        timeout: [ [Function (anonymous)], [Function: listener] ],
                        close: [ [Function (anonymous)], [Function: listener] ],
                        parseError: [ [Function (anonymous)], [Function: listener] ],
                        open: [ [Function], [Function] ],
                        fullsetup: [ [Function], [Function] ],
                        all: [ [Function], [Function] ],
                        reconnect: [ [Function (anonymous)], [Function: listener] ]
                        */
                    }
                })
        } catch (error) {
            console.error('mongo:connect:error')
            console.error(error)
        }
    }

    // Check mongo database connection status
    async checkConnection() {
        try {
            if (!!this.db && this.db.serverConfig) {
                return this.db.serverConfig.isConnected()
            } else {
                return false
            }

        } catch (error) {
            console.error(error)
        }
    }

    /* ========================= */
    /* ===== MONGO METHODS ===== */
    /* ========================= */

    /**
     * Request function for mongoDB. This function will make a request on the "collection", filtered by the "query" passed in paramters.
     * @param {string} collection
     * @param {Object} query
     * @returns {Pomise}
     */
    async mongoRequest(collection, query) {
        return new Promise((resolve, reject) => {
            try {
                this.db.collection(collection).find(query).toArray((error, result) => {
                    if (error) {
                        reject(error)
                    }
                    resolve(result)
                })
            } catch (error) {
                console.error(error.toString())
                reject(error)
            }
        })
    }

    /**
     * Insert/Create function for mongoDB. This function will create an entry based on the "collection", the "query" and the "values" passed in parmaters.
     * @param {string} collection
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoInsert(collection, payload) {
        return new Promise((resolve, reject) => {
            try {
                this.db.collection(collection).insertOne(payload, function(error, result) {
                    if (error) {
                        reject(error)
                    }
                    resolve('success')
                })
            } catch (error) {
                console.error(error.toString())
                reject(error)
            }
        })
    }

    /**
     * Update function for mongoDB. This function will update an entry based on the "collection", the "query" and the "values" passed in parmaters.
     * @param {string} collection
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoUpdate(collection, query, values) {
        if (values._id) {
            delete values._id
        }
        return new Promise((resolve, reject) => {
            try {
                this.db.collection(collection).updateOne(query, {
                    $set: values
                }, function(error, result) {
                    if (error) {
                        reject(error)
                    }
                    resolve('success')
                })
            } catch (error) {
                console.error(error.toString())
                reject(error)
            }
        })
    }

    /**
     * Delete function for mongoDB. This function will create an entry based on the "collection", the "query" passed in parmaters.
     * @param {string} collection
     * @param {Object} query
     * @returns {Pomise}
     */
    async mongoDelete(collection, query) {
        return new Promise((resolve, reject) => {
            try {
                this.db.collection(collection).deleteOne(query, function(error, result) {
                    if (error) {
                        reject(error)
                    }
                    resolve("success")
                })
            } catch (error) {
                console.error(error.toString())
                reject(error)
            }
        })
    }
}

module.exports = modelMongoDb