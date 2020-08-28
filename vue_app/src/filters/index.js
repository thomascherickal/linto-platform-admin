import Vue from 'vue'
import store from '../store.js'

// Test password format
const testPassword = (obj) => {
    obj.valid = false
    obj.error = null
    const regex = /^[0-9A-Za-z\!\@\#\$\%\-\_\s]{4,}$/ // alphanumeric + special chars "!","@","#","$","%","-","_"
    if (obj.value.length === 0) {
        obj.error = 'This field is required'
    } else if (obj.value.length < 6) {
        obj.error = 'This field must contain at least 6 characters'
    } else if (obj.value.match(regex)) {
        obj.valid = true
    } else {
        obj.error = 'Invalid password'
    }
    return obj
}

// Test email format
const testEmail = (obj) => {
    obj.valid = false
    obj.error = null
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (obj.value.match(regex)) {
        obj.valid = true
    } else {
        obj.error = 'Invalid email'
    }
    return obj
}

// DISPATCH STORE
Vue.filter('dispatchStore', async function(label) {
    try {
        const req = await store.dispatch(label)
        if (!!req.error) {
            throw req.error
        }
        if (typeof req !== 'undefined') {
            return {
                status: 'success',
                msg: ''
            }
        } else {
            throw 'an error has occured'
        }
    } catch (error) {
        return ({
            status: 'error',
            msg: error
        })
    }
})

// TEST SELECT FIELD
Vue.filter('testSelectField', function(obj) {
    obj.error = null
    obj.valid = false
    if (typeof(obj.value) === 'undefined') {
        obj.value = ''
    }
    if (obj.value === '' || obj.value.length === 0) {
        obj.error = 'This field is required'
    } else {
        obj.valid = true
    }
})

// TEST STATIC WORKFLOW NAME
Vue.filter('testStaticWorkflowName', function(obj) {
    obj.error = null
    obj.valid = false
    const workflows = store.state.staticWorkflows
    if (workflows.length > 0 && workflows.filter(wf => wf.name === obj.value).length > 0) {
        obj.error = 'This workflow name is already used'
        obj.valid = false
    }
})

// TEST APPLICATION WORKFLOW NAME
Vue.filter('testApplicationWorkflowName', function(obj) {
    obj.error = null
    obj.valid = false
    const workflows = store.state.applicationWorkflows
    if (workflows.length > 0 && workflows.filter(wf => wf.name === obj.value).length > 0) {
        obj.error = 'This workflow name is already used'
        obj.valid = false
    }
})

// TEST STATIC DEVICE SERIAL NUMBER
Vue.filter('testStaticClientsSN', function(obj) {
    obj.error = null
    obj.valid = false
    const clients = store.state.staticClients
    if (clients.length > 0 && clients.filter(wf => wf.sn === obj.value).length > 0) {
        obj.error = 'This serial number is already used'
        obj.valid = false
    }
})

// TEST WORKFLOW TEMPLATE NAME
Vue.filter('testWorkflowTemplateName', function(obj) {
    obj.error = null
    obj.valid = false
    const workflowsTemplates = store.state.workflowsTemplates
    if (workflowsTemplates.length > 0 && workflowsTemplates.filter(wf => wf.name === obj.value).length > 0) {
        obj.error = 'This workflow template name is already used'
        obj.valid = false
    }
})


// TEST SERIAL NUMBER
Vue.filter('testSerialNumber', function(obj) {
    const lintos = store.state.lintoFleet
    if (lintos.filter(l => l.sn === obj.value).length > 0) {
        obj.error = 'This serial number is already used'
        obj.valid = false
    }
})

// TEST NAME
Vue.filter('testName', function(obj) {
    const regex = /^[0-9A-Za-z\s\-\_]+$/
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.error = 'This field is required'
    } else if (obj.value.length < 6) {
        obj.error = 'This field must contain at least 6 characters'
    } else if (obj.value.match(regex)) {
        obj.valid = true
    } else {
        obj.error = 'Invalid name'
    }
})

// TEST PASSWORD FORMAT
Vue.filter('testPassword', function(obj) {
    obj = testPassword(obj)
})

// TEST PASSWORD CONFIRMATION
Vue.filter('testPasswordConfirm', function(obj, compareObj) {
    obj = testPassword(obj)
    if (obj.valid) {
        if (obj.value === compareObj.value) {
            obj.valid = true
        } else {
            obj.valid = false
            obj.error = 'The confirmation password is different from password'
        }
    }
})

// TEST EMAIL FORMAT
Vue.filter('testEmail', function(obj) {
    obj = testEmail(obj)
})

// TEST ANDROID USER EMAIL EXIST
Vue.filter('testAndroidUserEmail', function(obj) {
    obj.valid = false
    obj.error = null
    obj = testEmail(obj)
    if (obj.valid) {
        const users = store.state.androidUsers
        const userExist = users.filter(user => user.email === obj.value)
        if (userExist.length > 0) {
            obj.valid = false
            obj.error = 'This email address is already used'
        } else {
            obj.valid = true
            obj.error = null
        }
    }
})
Vue.filter('testContent', function(obj) {
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.valid = true
    } else {
        const regex = /[0-9A-Za-z\?\!\@\#\$\%\-\_\.\/\:\;\(\)\[\]\=\+\s]+$/g
        if (obj.value.match(regex)) {
            obj.valid = true
        } else {
            obj.error = 'Invalid content. Unauthorized characters.'
        }
    }
})

Vue.filter('testUrl', function(obj) {
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.valid = false
        obj.error = 'This field is required'
    } else {
        const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g
        if (obj.value.match(regex)) {
            obj.valid = true
        } else {
            obj.error = 'Invalid content url format.'
        }
    }
})

Vue.filter('testInteger', function(obj) {
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.valid = false
        obj.error = 'This field is required'
    } else {
        if (typeof(obj.value) !== 'number') {
            obj.valid = false
            obj.error = 'the value of the field must be a number'
        } else {
            obj.valid = true
        }
    }
})