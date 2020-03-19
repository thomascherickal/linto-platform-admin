const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class FLowPatternModel extends MongoModel {
    async getAllWorkflowPatterns() {
        try {
            const query = {}
            return await this.mongoRequest('flow_pattern', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getWorkflowPatternByName(name) {
        try {
            const query = { name }
            return await this.mongoRequest('flow_pattern', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getWorkflowPatternById(id) {
        try {
            const query = { _id: MongoClient.mongoDb.ObjectID(id) }
            const tmpFlow = await this.mongoRequest('flow_pattern', query)
            return tmpFlow[0]
        } catch (err) {
            return err
        }
    }

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