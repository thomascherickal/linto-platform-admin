const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class ContextModel extends MongoModel {
    async getContexts() {
        try {
            const query = {}
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getContextById(id) {
        try {
            const query = {
                _id: MongoClient.mongoDb.ObjectID(id)
            }
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getFleetContexts() {
        try {
            const query = { type: 'Fleet' }
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getContextTypes() {
        try {
            const query = {}
            return await this.mongoRequest('context_types', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async createContext(payload) {
        try {
            return await this.mongoInsert('context', payload)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async updateContext(payload) {
        try {
            const query = {
                _id: MongoClient.mongoDb.ObjectID(payload._id)
            }
            let mutableElements = payload
            delete mutableElements._id
            return await this.mongoUpdate('context', query, mutableElements)
        } catch (err) {
            return err
        }
    }

}


module.exports = new ContextModel()