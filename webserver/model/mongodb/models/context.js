const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const contextSchema = require(`${process.env.LINTO_STACK_MONGODB_SHARED_SCHEMAS}/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/context.json`)

class ContextModel extends MongoModel {
    constructor() {
        super('context')
    }

    // Get all contexts
    async getContexts() {
        try {
            const query = {}
            const contexts = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(contexts, contextSchema)) {
                return contexts
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get a context by its "id"
    async getContextById(id) {
        try {
            const query = {
                _id: this.getObjectId(id)
            }
            const context = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(context, contextSchema)) {
                return context
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get all contexts that have "fleet" type
    async getFleetContexts() {
        try {
            const query = { type: 'Fleet' }
            const contexts = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(contexts, contextSchema)) {
                return contexts
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Create a new context
    async createContext(payload) {
        try {
            // compare object with schema
            if (this.testSchema(payload, contextSchema)) {
                return await this.mongoInsert(payload)
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // update existing context data
    async updateContext(payload) {
        try {
            const query = {
                _id: this.getObjectId(payload._id)
            }
            let mutableElements = payload
            delete mutableElements._id

            // compare object with schema
            if (this.testSchema(mutableElements, contextSchema)) {
                return await this.mongoUpdate(query, mutableElements)
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            return err
        }
    }

}


module.exports = new ContextModel()