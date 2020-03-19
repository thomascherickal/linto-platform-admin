const MongoDriver = require(`${process.cwd()}/model/mongodb/driver.js`)


// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class MongoModel {

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
                MongoDriver.constructor.db.collection(collection).find(query).toArray((error, result) => {
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
                MongoDriver.constructor.db.collection(collection).insertOne(payload, function(error, result) {
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
                MongoDriver.constructor.db.collection(collection).updateOne(query, {
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
                MongoDriver.constructor.db.collection(collection).deleteOne(query, function(error, result) {
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

module.exports = MongoModel