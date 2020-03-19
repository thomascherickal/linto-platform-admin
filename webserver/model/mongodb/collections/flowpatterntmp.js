const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class FLowPatternTmpModel extends MongoModel {
    async getFullTmpFlow() {
        try {
            const query = {}
            const tmpFlow = await this.mongoRequest('flow_pattern_tmp', query)
            let tmpFlowUnformatted = tmpFlow[0].flow
            let formattedFlow = []
            tmpFlowUnformatted.map(tmp => {
                if ((formattedFlow.filter(f => f.id === tmp.id)).length === 0) {
                    formattedFlow.push(tmp)
                }
            })
            return formattedFlow
        } catch (err) {
            return err
        }
    }

    async getTmpFlow() {
        try {
            const query = {}
            const tmpFlow = await this.mongoRequest('flow_pattern_tmp', query)
            return tmpFlow[0].flow
        } catch (err) {
            return err
        }
    }

    async updateTmpFlow(payload) {
        try {
            const query = {
                id: "tmp"
            }
            return await this.mongoUpdate('flow_pattern_tmp', query, {
                flow: payload.flow,
                workspaceId: payload.workspaceId
            })
        } catch (err) {
            console.error(err)
            return err
        }
    }
}


module.exports = new FLowPatternTmpModel()