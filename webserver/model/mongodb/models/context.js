const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)

class ContextModel extends MongoModel {

    // Get all contexts
    async getContexts() {
        try {
            const query = {}
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get a context by its "id"
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

    // Get all contexts that have "fleet" type
    async getFleetContexts() {
        try {
            const query = { type: 'Fleet' }
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get all existing context types
    async getContextTypes() {
        try {
            const query = {}
            return await this.mongoRequest('context_types', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Create a new context
    async createContext(payload) {
        try {
            return await this.mongoInsert('context', payload)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // update existing context data
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