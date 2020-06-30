const axios = require('axios')
const nodered = require('./nodered.js')
const middlewares = require('./index.js')
const fs = require('fs')
const request = require('request')

async function sttLexicalSeeding(flowId, service_name) {
    try {
        // Get stt service data
        const accessToken = await nodered.getBLSAccessToken()
        const getSttService = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/service/${service_name}`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        const sttService = getSttService.data.data

        // Get lexical seeding data
        const getSttLexicalSeeding = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_API_PATH}/${flowId}/dataset/linstt`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            }
        })
        const sttLexicalSeedingData = getSttLexicalSeeding.data.data
        const intents = sttLexicalSeedingData.intents
        const entities = sttLexicalSeedingData.entities
        let intentsUpdated = false
        let entitiesUpdated = false
        let updateInt = { success: '', errors: '' }
        let updateEnt = { success: '', errors: '' }

        // Update model intents
        const intentsToSend = await filterLMData('intent', sttService.LModelId, intents)
        if (intentsToSend.data.length > 0) {
            updateInt = await updateLangModel(intentsToSend, sttService.LModelId)
            if (!!updateInt.success && !!updateInt.errors) {
                intentsUpdated = true

            }
        } else {
            intentsUpdated = true
        }

        // Update model entities
        const entitiesToSend = await filterLMData('entity', sttService.LModelId, entities)
        if (entitiesToSend.data.length > 0) {
            updateEnt = await updateLangModel(entitiesToSend, sttService.LModelId)
            if (!!updateEnt.success && !!updateEnt.errors) {
                entitiesUpdated = true
            }
        } else {
            entitiesUpdated = true
        }

        const getUpdatedSttLangModel = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodel/${sttService.LModelId}`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        // Generate Graph if model updated
        if (getUpdatedSttLangModel.data.data.isDirty === 1 && getUpdatedSttLangModel.data.data.updateState === 0) {
            try {
                await generateGraph(service_name)
            } catch (error) {
                console.error(error)
            }
        }
        // Result
        if (intentsUpdated && entitiesUpdated) {


            if (updateInt.errors.length === 0 && updateEnt.errors.length === 0) {
                return ({
                    status: 'success',
                    msg: 'Model language has been updated'
                })
            } else {
                errorMsg = 'Model updated BUT : '
                if (updateInt.errors.length > 0) {
                    updateInt.errors.map(e => {
                        errorMsg += `Warning: error on updating intent ${e.name}.`
                    })
                }
                if (updateEnt.errors.length > 0) {
                    updateEnt.errors.map(e => {
                        errorMsg += `Warning: error on updating entity ${e.name}.`
                    })
                }
                return ({
                    status: 'success',
                    msg: errorMsg
                })
            }
        } else {
            throw 'Error on updating langage model'
        }
    } catch (error) {
        console.error(error)
        return ({
            status: 'error',
            msg: 'Error on updating language model',
            error: error.toString()
        })
    }
}

async function filterLMData(type, modelId, newData) {
    let getDataroutePath = ''
    if (type === 'intent') {
        getDataroutePath = 'intents'
    } else if (type === 'entity') {
        getDataroutePath = 'entities'
    }
    // Current Values of the langage model
    const getData = await axios.get(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodel/${modelId}/${getDataroutePath}`)
    const currentData = getData.data.data
    let dataToSend = []

    newData.map(d => {
        let toAdd = []
        let toSendMethod = ''
        let toCompare = currentData.filter(c => c.name === d.name)
        if (toCompare.length === 0) {
            toAdd.push(...d.items)
            toSendMethod = 'post'
        } else {
            toSendMethod = 'patch'
            d.items.map(val => {
                if (toCompare[0]['items'].indexOf(val) < 0) {
                    toAdd.push(val)
                }
            })
        }
        if (toAdd.length > 0) {
            dataToSend.push({
                name: d.name,
                items: toAdd,
                method: toSendMethod
            })
        }
    })
    return {
        type,
        data: dataToSend
    }
}

async function generateGraph(service_name) {
    try {
        const getSttService = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/service/${service_name}`, {
            method: 'get'
        })
        const sttService = getSttService.data.data
        const generateGraph = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodel/${sttService.LModelId}/generate/graph`, {
            method: 'get'
        })
        return ({
            status: 'success',
            msg: generateGraph.data.data
        })
    } catch (error) {
        console.error(error)
        return ({
            status: 'error',
            msg: 'error on generating graph'
        })
    }
}

// Update a langage model with intents/entities object to add/update
async function updateLangModel(payload, modelId) {
    try {
        let success = []
        let errors = []
        const type = payload.type
        for (let i in payload.data) {
            const name = payload.data[i].name
            const items = payload.data[i].items
            const method = payload.data[i].method
            const url = `${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodel/${modelId}/${type}/${name}`
            const req = await axios(url, {
                method,
                data: items
            })
            if (req.status === 200 || req.status === '200') {
                success.push(payload.data[i])
            } else {
                errors.push(payload.data[i])
            }
            if (success.length + errors.length === payload.data.length) {
                return ({
                    errors,
                    success
                })
            }
        }
    } catch (error) {
        console.error('ERR:', error.toString())
        return ('an error has occured')
    }
}

async function nluLexicalSeeding(flowId) {
    try {
        const accessToken = await nodered.getBLSAccessToken()

        // Get lexical seeding object to send to TOCK
        const getNluLexicalSeeding = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_API_PATH}/${flowId}/dataset/tock`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            }
        })
        const jsonContent = JSON.stringify(getNluLexicalSeeding.data.application)

        // get Tock auth token
        const token = middlewares.basicAuthToken(process.env.LINTO_STACK_TOCK_USER, process.env.LINTO_STACK_TOCK_PASSWORD)

        // Tmp json file path
        const filePath = process.cwd() + '/public/tockapp.json'

        // Create json file
        return new Promise(function(resolve, reject) {
            fs.writeFile(filePath, jsonContent, (err) => {
                if (err) throw err
                else {
                    // Tock service post request
                    request.post({
                        url: `${middlewares.useSSL() + process.env.LINTO_STACK_TOCK_SERVICE}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}/rest/admin/dump/sentences`,
                        headers: {
                            'Authorization': token
                        },
                        formData: {
                            file: fs.createReadStream(filePath),
                            filetype: 'json'
                        },
                    }, function(error, response, body) {
                        let resp
                        if (typeof(body) !== 'object') {
                            resp = JSON.parse(body)
                        } else {
                            resp = body
                        }
                        if (error) {
                            reject(error)
                        }
                        if (resp.success) {
                            fs.unlinkSync(filePath)
                            resolve({
                                status: 'success',
                                msg: 'Tock application has been deployed'
                            })
                        } else {
                            reject('Error on creating tock application')
                        }
                    })
                }
            })
        })
    } catch (error) {
        console.error(error)
        return ({
            status: 'error',
            msg: error.toString()
        })
    }
}

module.exports = {
    nluLexicalSeeding,
    sttLexicalSeeding,
    generateGraph
}