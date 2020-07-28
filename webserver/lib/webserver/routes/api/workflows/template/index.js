const flowPatternTmpModel = require(`${process.cwd()}/model/mongodb/models/flow-tmp.js`)
const workflowsTemplatesModel = require(`${process.cwd()}/model/mongodb/models/workflows-templates.js`)

const moment = require('moment')

module.exports = (webServer) => {
    return [{
        // Create a new workflow template
        /*
        payload = {
          workflowType,
          workflowTemplateName
        }
        */
        path: '/',
        method: 'post',
        requireAuth: true,
        controller: async(req, res, next) => {
            try {
                // Get current working workflow
                let tmpFlow = await flowPatternTmpModel.getTmpFlow()
                const payload = {
                    name: req.body.workflowTemplateName,
                    type: req.body.workflowType,
                    flow: tmpFlow,
                    created_date: moment().format()
                }

                // Request
                const addWorkflowTemplate = await workflowsTemplatesModel.addWorkflowTemplate(payload)

                // Response
                if (addWorkflowTemplate === 'success') {
                    res.json({
                        status: 'success',
                        msg: `The "${req.body.workflowType}" workflow template "${req.body.workflowTemplateName}" has been created`
                    })

                } else {
                    throw 'Error on creating a new workflow template'
                }
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