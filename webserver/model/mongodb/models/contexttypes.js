const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)

class ContextTypesModel extends MongoModel {
    constructor() {
        super('context_types')
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
}

module.exports = new ContextTypesModel()