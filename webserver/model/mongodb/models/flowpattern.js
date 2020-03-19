const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class FLowPatternModel extends MongoModel {
    // Get all workflow patterns
    async getAllWorkflowPatterns() {
        try {
            const query = {}
            return await this.mongoRequest('flow_pattern', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get a workflow pattern by its "name"
    async getWorkflowPatternByName(name) {
        try {
            const query = { name }
            return await this.mongoRequest('flow_pattern', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get a workflow pattern by its "id"
    async getWorkflowPatternById(id) {
        try {
            const query = { _id: MongoClient.mongoDb.ObjectID(id) }
            const tmpFlow = await this.mongoRequest('flow_pattern', query)
            return tmpFlow[0]
        } catch (err) {
            return err
        }
    }

    // Create a new workflow pattern
    async addWorkflowPattern(payload) {
        try {
            return await this.mongoInsert('flow_pattern', payload)
        } catch (err) {
            console.error(err)
            return err
        }
    }
}


module.exports = new FLowPatternModel()