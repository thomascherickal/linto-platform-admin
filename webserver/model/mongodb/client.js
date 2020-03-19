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
class MongoClient {
    static mongoDb = mongoDb
    static urlMongo = urlMongo
    static client = mongoDb.MongoClient
    static db = null
    constructor() {
        this.poolOptions = {
            numberOfRetries: 5,
            auto_reconnect: true,
            poolSize: 40,
            connectTimeoutMS: 5000,
            useNewUrlParser: true,
            useUnifiedTopology: false
        }
        return this.init()

    }


    /* ====================== */
    /* ===== MONGO INIT ===== */
    /* ====================== */

    // Try to connect to mongo database
    async init() {
        return new Promise((resolve, reject) => {
            MongoClient.client.connect(MongoClient.urlMongo, MongoClient.poolOptions, (err, client) => {
                if (err) {
                    console.error('> MongoDB ERROR :', err.toString())
                    return (err.toString())
                } else {
                    console.log('> MongoDB : Connected')
                    MongoClient.db = client.db(process.env.LINTO_STACK_MONGODB_DBNAME)


                    const mongoEvent = client.topology

                    mongoEvent.on('close', () => {
                        console.error('> MongoDb : Connection lost ')
                    })
                    mongoEvent.on('error', (e) => {
                        console.error('> MongoDb ERROR: ', e)
                    })
                    mongoEvent.on('reconnect', () => {
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
                    resolve(this)
                }
            })
        })
    }


    // Check mongo database connection status
    async checkConnection() {
        try {
            if (!!MongoClient.db && MongoClient.db.serverConfig) {
                return MongoClient.db.serverConfig.isConnected()
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
                MongoClient.db.collection(collection).find(query).toArray((error, result) => {
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
                MongoClient.db.collection(collection).insertOne(payload, function(error, result) {
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
                MongoClient.db.collection(collection).updateOne(query, {
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
                MongoClient.db.collection(collection).deleteOne(query, function(error, result) {
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

module.exports = MongoClient