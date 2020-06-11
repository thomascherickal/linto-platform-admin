const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const contextTypeSchema = require(`${process.env.LINTO_STACK_MONGODB_SHARED_SCHEMAS}/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/context_types.json`)

class ContextTypesModel extends MongoModel {
    constructor() {
        super('context_types')
    }

    // Get all existing context types
    async getContextTypes() {
        try {
            const query = {}
            const contextTypes = await this.mongoRequest('context_types', query)

            // compare object with schema
            if (this.testSchema(contextTypes, contextTypeSchema)) {
                return contextTypes
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }
}

module.exports = new ContextTypesModel()