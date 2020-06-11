const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const flowPatternSchema = require(`${process.env.LINTO_STACK_MONGODB_SHARED_SCHEMAS}/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/flow_pattern.json`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class FLowPatternModel extends MongoModel {
    constructor() {
        super('flow_pattern')
    }

    // Get all workflow patterns
    async getAllWorkflowPatterns() {
        try {
            const query = {}
            const patterns = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(patterns, flowPatternSchema)) {
                return patterns
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get a workflow pattern by its "name"
    async getWorkflowPatternByName(name) {
        try {
            const query = { name }
            const pattern = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(pattern, flowPatternSchema)) {
                return pattern
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get a workflow pattern by its "id"
    async getWorkflowPatternById(id) {
        try {
            const query = { _id: this.getObjectId(id) }
            const tmpFlow = await this.mongoRequest(query)

            // compare object with schema
            if (this.testSchema(tmpFlow[0], flowPatternSchema)) {
                return tmpFlow[0]
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            return err
        }
    }

    // Create a new workflow pattern
    async addWorkflowPattern(payload) {
        try {
            // compare object with schema
            if (this.testSchema(payload, flowPatternSchema)) {
                return await this.mongoInsert(payload)
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }
}


module.exports = new FLowPatternModel()