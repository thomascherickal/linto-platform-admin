const axios = require('axios')
const multer = require('multer')
const moment = require('moment')
const lexSeed = require(`${process.cwd()}/lib/webserver/middlewares/lexicalseeding.js`)
const AMPath = `${process.cwd()}/acousticModels/`
const AMstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AMPath)
    },
    filename: (req, file, cb) => {
        let filename = moment().format('x') + '-' + file.originalname
        cb(null, filename)
    }
})

const AMupload = multer({ storage: AMstorage }).any()
const request = require('request')
const fs = require('fs')

module.exports = (webServer) => {
    return [{
            // Get all services in stt-service-manager
            path: '/services',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getServices = await axios(`${process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/services`, {
                        method: 'get'
                    })
                    res.json({ services: getServices.data })
                } catch (error) {
                    console.error(error)
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            // Create a service in stt-service-manager
            path: '/service',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body
                    const createService = await axios(`${process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/service/${payload.serviceId}`, {
                        method: 'post',
                        data: payload
                    })
                    if (!!createService.status && createService.status === 200) {
                        res.json({
                            status: 'success',
                            msg: createService.data
                        })
                    } else {
                        throw createService
                    }
                } catch (error) {
                    if (!!error.response.status && error.response.status !== 200) {
                        res.json({
                            status: 'error',
                            msg: error.response.data.status
                        })
                    } else {
                        res.json({
                            error: 'An error has occured'
                        })
                    }
                }
            }
        },
        {
            path: '/langmodels',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getLanguageModels = await axios(`${process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodels`, {
                        method: 'get'
                    })
                    res.json({ services: getLanguageModels.data })
                } catch (error) {
                    res.json({ error: error.toString() })
                }
            }
        },
        {
            path: '/langmodel',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const acmodel = req.body.acmodelname
                    const lmodel = req.body.lmodelname.replace(/\s/g, '_')
                    const createLM = await axios(`${process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodel/${lmodel}`, {
                        method: 'post',
                        data: {
                            acousticModel: acmodel
                        }
                    })
                    if (!!createLM.status && createLM.status === 200) {
                        res.json({
                            status: 'success',
                            msg: createLM.data
                        })
                    } else {
                        throw createLM
                    }
                } catch (error) {
                    if (!!error.response.status && error.response.status !== 200) {
                        res.json({
                            status: 'error',
                            msg: error.response.data.status
                        })
                    } else {
                        res.json({
                            error: 'An error has occured'
                        })
                    }
                }
            }
        },
        {
            path: '/langmodel',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const modelId = req.body.modelId
                    const deleteModel = await axios(`${process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodel/${modelId}`, {
                        method: 'delete'
                    })
                    if (!!deleteModel.status && deleteModel.status === 200) {
                        res.json({
                            status: 'success',
                            msg: deleteModel.data
                        })
                    } else {
                        throw deleteModel
                    }
                } catch (error) {
                    if (!!error.response.status && error.response.status !== 200) {
                        res.json({
                            status: 'error',
                            msg: error.response.data.status
                        })
                    } else {
                        res.json({
                            error: 'An error has occured'
                        })
                    }
                }
            }
        },
        {
            path: '/acmodels',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getACModels = await axios(`${process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/acmodels`, {
                        method: 'get'
                    })
                    res.json({ services: getACModels.data })
                } catch (e) {
                    res.json({ error: e })
                }
            }
        },
        {
            path: '/acmodel',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    AMupload(req, res, async(error) => {
                        if (error ||  error instanceof multer.MulterError) {
                            // A Multer error occurred when uploading.
                            console.error(error)
                            throw error
                        }
                        const infos = JSON.parse(req.body.infos)
                        const file = req.files[0]
                        const acModelName = infos.acmodel.replace(/\s/g, '_')
                        request.post({
                            url: `${process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/acmodel/${acModelName}`,
                            formData: {
                                file: fs.createReadStream(AMPath + file.filename),
                                filetype: file.mimetype,
                                lang: infos.lang

                            },
                        }, (err, response, body) => {
                            if (err) {
                                res.json({
                                    status: 'error',
                                    error: err
                                })
                            }
                            if (response.statusCode === 200) {
                                fs.unlinkSync(AMPath + file.filename)
                                res.json({
                                    status: 'success',
                                    msg: body
                                })
                            } else {
                                res.json({
                                    status: 'error',
                                    msg: body
                                })
                            }
                        })
                    })
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: error
                    })
                }
            }
        },
        {
            path: '/acmodel',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const modelId = req.body.modelId
                    const deleteModel = await axios(`${process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/acmodel/${modelId}`, {
                        method: 'delete'
                    })
                    if (!!deleteModel.status && deleteModel.status === 200) {
                        res.json({
                            status: 'success',
                            msg: deleteModel.data
                        })
                    } else {
                        throw deleteModel
                    }
                } catch (error) {
                    if (!!error.response.status && error.response.status !== 200) {
                        res.json({
                            status: 'error',
                            msg: error.response.data.status
                        })
                    } else {
                        res.json({
                            error: 'An error has occured'
                        })
                    }
                }
            }
        },
        {
            path: '/lexicalseeding',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const flowId = req.body.flowId
                    const service_name = req.body.service_name
                    const lexicalseeding = await lexSeed.sttLexicalSeeding(flowId, service_name)
                    res.json(lexicalseeding)
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on updating language model',
                        error: error.toString()
                    })
                }
            }
        }, {
            path: '/generategraph',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    await lexSeed.generateGraph()
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'error on generating graph'
                    })
                }
            }
        }, {
            path: '/healthcheck',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getSttManager = await axios(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE)
                    if (getSttManager.status === 200) {
                        res.json({
                            status: 'success',
                            msg: ''
                        })
                    } else {
                        throw 'error on connecting'
                    }
                } catch (error) {
                    res.json({
                        status: 'error',
                        msg: 'unable to connect STT services'
                    })
                }
            }
        }
    ]
}