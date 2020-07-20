const axios = require('axios')
const uuid = require('uuid/v1')
const middlewares = require('./index.js')

/* Format a workflow pattern to be post in database */
function createFlowPattern(flow, workspaceId, workspaceLabel) {
    let formattedFlow = {
        id: workspaceId,
        label: workspaceLabel,
        configs: [],
        nodes: []
    }
    let idCorrespond = []
    let nodesArray = []

    // make a an array to store current ids and new ids
    flow.filter(node => node.type !== 'tab').map(f => {
        if (!idCorrespond[f.id]) {
            idCorrespond[f.id] = uuid()
        }
    })

    // update ids for each node
    flow.filter(node => node.type !== 'tab').map(f => {
        f.z = workspaceId
        f.id = idCorrespond[f.id]

        // update wires ids
        if (!!f.wires && f.wires.length > 0) {
            for (let i = 0; i < f.wires.length; i++) {
                if (!!idCorrespond[f.wires[i]]) {
                    f.wires[i] = idCorrespond[f.wires[i]]
                }
            }
        }
        nodesArray.push(f)
    })

    formattedFlow.nodes = nodesArray
    return formattedFlow
}

/*
  Format a nodered flow from grouped nodes to splitted nodes
  {id, label, nodes[]} => [{tab},{node},{node}...]
*/
function formaFlowSplitNodes(flow, workspaceId) {
    let formattedFlow = []
    let tabNode = {
        id: workspaceId,
        type: 'tab',
        label: flow.label,
        disabled: false,
        info: ''
    }
    formattedFlow.push(tabNode)

    flow.nodes.map(n => {
        formattedFlow.push(n)
    })
    return formattedFlow
}
/*
  Format a nodered flow from splitted nodes to grouped nodes
  [{tab},{node},{node}...] => {id, label, nodes[]}
*/
function formatFlowGroupedNodes(flow) {
    let formattedFlow = {}
    let nodes = []
    flow.map(f => {
        if (f.type === 'tab') {
            formattedFlow.id = f.id
            formattedFlow.label = f.label
            formattedFlow.configs = []
            formattedFlow.nodes = []
        } else {
            nodes.push(f)
        }
    })
    formattedFlow.nodes = nodes
    return formattedFlow
}

/* Update an existing workflow with a flow pattern */
function updateGroupedNodesId(workFlow, patternFlow) {
    const workspaceId = workFlow.id
    let formatted = workFlow
    let updatedNodes = []
    patternFlow.flow.map(p => {
        if (p.type !== 'tab') {
            if (p.z !== workspaceId) {
                p.z = workspaceId
            }
            updatedNodes.push(p)
        }
    })
    formatted.nodes = updatedNodes
    return formatted
}
/* Generate a workflow to be posted on BLS */
function generateStaticWorkflowFromTemplate(flow, payload) {
    const flowId = uuid()
    const mqttId = flowId + '-mqtt'
    const nluId = flowId + '-nlu'
    const sttId = flowId + '-stt'
    const configId = flowId + '-config'

    let idMap = [] // ID correlation array
    let nodesArray = []
    let configsArray = []
    flow.filter(node => node.type === 'linto-config').map(f => {
        // Update language
        f.language = payload.language

        // Update linto-config node ID
        idMap[f.id] = configId
        f.id = configId

        // Update config-transcribe node ID
        idMap[f.configTranscribe] = sttId
        f.configTranscribe = sttId

        // Update config-mqtt node ID
        idMap[f.configMqtt] = mqttId
        f.configMqtt = mqttId

        // Update config-nlu node ID
        idMap[f.configEvaluate] = nluId
        f.configEvaluate = nluId

        nodesArray.push(f)
    })

    flow.filter(node => node.type !== 'tab' && node.type !== 'linto-config').map(f => {
        // uppdate STT node
        if (f.type === 'linto-config-transcribe') {
            f.id = sttId
            f.host = `${process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/${payload.stt.service_name}`
            f.api = 'linstt'
        }
        // uppdate NLU node
        else if (f.type === 'linto-config-evaluate') {
            f.id = nluId
            f.api = 'tock'
            f.host = `${process.env.LINTO_STACK_TOCK_SERVICE}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}`
            f.appname = payload.nlu.app_name
            f.namespace = 'app'
        }
        // uppdate MQTT node
        else if (f.type === 'linto-config-mqtt') {
            f.id = mqttId
            f.host = process.env.LINTO_STACK_MQTT_HOST
            f.port = process.env.LINTO_STACK_MQTT_PORT
            f.scope = process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE
            f.login = process.env.LINTO_STACK_MQTT_USER
            f.password = process.env.LINTO_STACK_MQTT_PASSWORD
        }
        // Update Terminal-in node > serial number
        else {
            if (f.type === 'linto-terminal-in') {
                f.id = uuid()
                f.sn = payload.sn
            }

            if (typeof(idMap[f.id]) === 'undefined') {
                idMap[f.id] = uuid()
            }
            f.id = idMap[f.id]
            f.z = flowId

            if (!!f.wires) {
                for (let i = 0; i < f.wires.length; i++) {
                    if (typeof(idMap[f.wires[i]]) === 'undefined') {
                        idMap[f.wires[i]] = uuid()
                    }
                    f.wires[i] = idMap[f.wires[i]]
                }
            }
        }
        nodesArray.push(f)
    })
    const formattedFlow = {
        label: payload.workflowName,
        configs: [],
        nodes: nodesArray,
        id: flowId
    }
    return formattedFlow
}

/* Get a business logic server bearer token */
async function getBLSAccessToken() {
    if (!process.env.LINTO_STACK_BLS_USE_LOGIN || process.env.LINTO_STACK_BLS_USE_LOGIN === 'false') {
        return ''
    }
    const login = process.env.LINTO_STACK_BLS_USER
    const pswd = process.env.LINTO_STACK_BLS_PASSWORD
    const request = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/auth/token`, {
        method: 'post',
        data: {
            "client_id": "node-red-admin",
            "grant_type": "password",
            "scope": "*",
            "username": login,
            "password": pswd
        }
    })
    return 'Bearer ' + request.data.access_token
}

async function putBLSFlow(flowId, workflow) {
    try {
        const accessToken = await getBLSAccessToken()
        let blsUpdate = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/flow/${flowId}`, {
            method: 'put',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            },
            data: workflow
        })
        if (blsUpdate.status == 200) {
            return {
                status: 'success'
            }
        } else {
            throw 'Error on updating flow on the Business Logic Server'
        }
    } catch (error) {
        console.error(error)
        return {
            status: 'error',
            msg: error
        }
    }
}
async function postBLSFlow(flow) {
    try {
        const accessToken = await getBLSAccessToken()
        let blsPost = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/redui/flow`, {
            method: 'post',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            },
            data: flow
        })

        // Validtion
        if (blsPost.status == 200 && blsPost.data) {
            return {
                status: 'success',
                msg: 'The worfklow has been deployed',
                flowId: blsPost.data.id
            }
        } else {
            throw {
                msg: 'Error on posting flow on the business logic server'
            }
        }
    } catch (error) {
        console.error(error)
        return {
            status: 'error',
            error
        }
    }
}
async function deleteBLSFlow(flowId) {
    try {
        const accessToken = await getBLSAccessToken()
        let blsDelete = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/redui/flow/${flowId}`, {
                method: 'delete',
                headers: {
                    'charset': 'utf-8',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Node-RED-Deployment-Type': 'flows',
                    'Authorization': accessToken
                },
            })
            // Validtion
        if (blsDelete.status == 204) {
            return {
                status: 'success',
                msg: 'The worfklow has been removed'
            }
        } else {
            throw {
                msg: 'Error on deleting flow on the business logic server'
            }
        }
    } catch (error) {
        console.error(error)
        return {
            status: 'error',
            error
        }
    }
}
async function getFlowById(id) {
    try {
        const accessToken = await getBLSAccessToken()
        let getFlow = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/redui/flow/${id}`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            }
        })
        return getFlow.data

    } catch (error) {
        return {
            status: 'error',
            msg: error
        }
    }
}
module.exports = {
    createFlowPattern,
    deleteBLSFlow,
    formaFlowSplitNodes,
    formatFlowGroupedNodes,
    getBLSAccessToken,
    generateStaticWorkflowFromTemplate,
    getFlowById,
    postBLSFlow,
    putBLSFlow,
    updateGroupedNodesId
}