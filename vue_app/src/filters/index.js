import Vue from 'vue'
import store from '../store.js'

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

// TEST CONTEXT NAME
Vue.filter('testContextName', function(obj) {
    const contexts = store.state.contextFleet
    if (contexts.filter(l => l.name === obj.value).length > 0) {
        obj.error = 'This context name is already used'
        obj.valid = false
    }
})

// TEST PATTERN NAME
Vue.filter('testPatternName', function(obj) {
    const patterns = store.state.flowPatterns
    if (patterns.filter(l => l.name === obj.value).length > 0) {
        obj.error = 'This pattern name is already used'
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
    } else if (obj.value.length < 3) {
        obj.error = 'This field must contain at least 3 characters'
    } else if (obj.value.match(regex)) {
        obj.valid = true
    } else {
        obj.error = 'Invalid name'
    }
})

Vue.filter('testPassword', function(obj) {
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
})
Vue.filter('testEmail', function(obj) {
    obj.valid = false
    obj.error = null
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (obj.value.match(regex)) {
        obj.valid = true
    } else {
        obj.error = 'Invalid email'
    }

})

Vue.filter('testSentence', function(obj) {
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.error = 'This field is required'
    } else {
        obj.valid = true
    }

})