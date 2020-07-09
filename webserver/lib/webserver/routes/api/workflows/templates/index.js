const workflowTemplatesModel = require(`${process.cwd()}/model/mongodb/models/workflows-templates.js`)

module.exports = (webServer) => {
    return [{
        // Get all static workflows from database
        path: '/',
        method: 'get',
        requireAuth: true,
        controller: async(req, res, next) => {
            try {
                const getWorkflowTemplates = await workflowTemplatesModel.getAllWorkflowsTemplates()
                res.json(getWorkflowTemplates)
            } catch (error) {
                console.error(error)
                res.json({
                    status: 'error',
                    error
                })
            }
        }
    }]
}