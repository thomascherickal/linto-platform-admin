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
        this.dbOptions = {
            host: process.env.LINTO_STACK_MONGODB_SERVICE,
            port: process.env.LINTO_STACK_MONGODB_PORT,
            database: process.env.LINTO_STACK_MONGODB_DBNAME,
            auth: process.env.LINTO_STACK_MONGODB_USE_LOGIN,
            user: process.env.LINTO_STACK_MONGODB_USER,
            password: process.env.LINTO_STACK_MONGODB_PASSWORD
        }
        this.cnx_attempt = 0
        this.connect()
    }

    /* ====================== */
    /* ===== MONGO INIT ===== */
    /* ====================== */

    // Try to connect to mongo database
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.client.connect(this.urlMongo, this.poolOptions,
                    (err, db) => {
                        if (err) {
                            this.cnx_attempt += 1
                            if (this.cnx_attempt > this.poolOptions.numberOfRetries) {
                                // Kill process after 5 tries if cannot connect
                                console.error('MongoDB : To many connection attempts > EXIT PROCESS')
                                process.exit(1)
                            } else {
                                // Log attempts to connect
                                console.error('MongoDB : connect attempt -', this.cnx_attempt)
                                setTimeout(async() => {
                                    this.connect()
                                }, this.poolOptions.connectTimeoutMS)
                            }
                        } else {
                            // Connection success
                            console.log('> MongoDB : Connected')
                            this.cnx_attempt = 0
                            this.db = db.db(process.env.LINTO_STACK_MONGODB_DBNAME)
                            resolve(this.db)
                        }
                    })
            } catch (error) {
                console.error('mongo:connect:error')
                console.error(error)
            }
        })
    }

    // Check mongo database connection status
    async checkConnection() {
        try {
            return this.db.serverConfig.isConnected()

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
        if (await this.checkConnection()) {
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
        } else {
            console.error('Cannot connect MongoDB: trying to reconnect...')
            this.connect()
            return {
                error: 'Trying to reconnect database...'
            }
        }
    }

    /**
     * Insert/Create function for mongoDB. This function will create an entry based on the "collection", the "query" and the "values" passed in parmaters.
     * @param {string} collection
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoInsert(collection, payload) {
        if (await this.checkConnection()) {
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
        } else {
            console.error('Cannot connect MongoDB: trying to reconnect...')
            this.connect()
            return {
                status: 'error',
                msg: 'Trying to reconnect database...'
            }
        }
    }

    /**
     * Update function for mongoDB. This function will update an entry based on the "collection", the "query" and the "values" passed in parmaters.
     * @param {string} collection
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoUpdate(collection, query, values) {
        if (await this.checkConnection()) {
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
        } else {
            console.error('Cannot connect MongoDB: trying to reconnect...')
            this.connect()
            return {
                status: 'error',
                msg: 'Trying to reconnect database...'
            }
        }
    }

    /**
     * Delete function for mongoDB. This function will create an entry based on the "collection", the "query" passed in parmaters.
     * @param {string} collection
     * @param {Object} query
     * @returns {Pomise}
     */
    async mongoDelete(collection, query) {
        if (await this.checkConnection()) {
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
        } else {
            console.error('Cannot connect MongoDB: trying to reconnect...')
            this.connect()
            return {
                status: 'error',
                msg: 'Trying to reconnect database...'
            }
        }
    }
}

module.exports = modelMongoDb