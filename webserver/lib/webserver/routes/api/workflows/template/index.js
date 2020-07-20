const flowPatternTmpModel = require(`${process.cwd()}/model/mongodb/models/flow-tmp.js`)
const workflowsTemplatesModel = require(`${process.cwd()}/model/mongodb/models/workflows-templates.js`)

const moment = require('moment')

module.exports = (webServer) => {
    return [{
            // Get all static workflows from database
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    let tmpFlow = await flowPatternTmpModel.getTmpFlow()
                    const payload = {
                        name: req.body.workflowTemplateName,
                        type: req.body.workflowType,
                        flow: tmpFlow,
                        created_date: moment().format()
                    }

                    const addWorkflowTemplate = await workflowsTemplatesModel.addWorkflowTemplate(payload)

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
        },
        {
            // Create a new workflow pattern
            path: '/patterns',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const patternName = req.body.patternName
                    const contextType = req.body.contextType
                    const date = moment().format()
                    let getAllPatterns = await flowPatternModel.getAllWorkflowPatterns()

                    // Test if pattern name already exist
                    getAllPatterns.map(p => {
                        if (p.name.indexOf(patternName) >= 0) {
                            res.json({
                                status: 'error_name',
                                msg: 'This flow pattern name is already used'
                            })
                        }
                    })

                    // Get workflow object to create
                    let tmpFlow = await flowPatternTmpModel.getTmpFlow()
                    const payload = {
                        name: patternName,
                        type: contextType,
                        flow: tmpFlow,
                        created_date: date,
                    }

                    // Create new workflow pattern
                    let addNewPattern = await flowPatternModel.addWorkflowPattern(payload)
                    if (addNewPattern === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The flow pattern "${patternName}" has been added.`
                        })
                    } else {
                        throw 'Error on creating new flow pattern'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: error.toString()
                    })
                }
            }
        }
    ]
}