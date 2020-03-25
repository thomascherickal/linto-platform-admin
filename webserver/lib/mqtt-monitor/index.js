const debug = require('debug')(`linto-admin:mqtt-monitor`)
const EventEmitter = require('eventemitter3')
const Mqtt = require('mqtt')

class MqttMonitor extends EventEmitter {
    constructor() {
        super()
        this.subscribtionTopics = new Array()
        this.subscribtionTopics['status'] = `${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/fromlinto/+/status`
        this.subscribtionTopics['pong'] = `${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/fromlinto/+/pong`
        this.subscribtionTopics['muteack'] = `${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/fromlinto/+/muteack`
        this.subscribtionTopics['unmuteack'] = `${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/fromlinto/+/unmuteack`
        this.subscribtionTopics['tts_lang'] = `${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/fromlinto/+/tts_lang`
        this.subscribtionTopics['say'] = `${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/fromlinto/+/say`

        this.cnxParam = {
            clean: true,
            servers: [{
                host: process.env.LINTO_STACK_MQTT_HOST,
                port: process.env.LINTO_STACK_MQTT_PORT
            }],
            qos: 2
        }
        if (process.env.LINTO_STACK_MQTT_USE_LOGIN) {
            this.cnxParam.username = process.env.LINTO_STACK_MQTT_USER
            this.cnxParam.password = process.env.LINTO_STACK_MQTT_PASSWORD
        }
        return this.init()
    }
    async init() {
        return new Promise((resolve, reject) => {
            let cnxError = setTimeout(() => {
                console.error('Logic MQTT Broker - Unable to connect')
            }, 5000)
            this.client = Mqtt.connect(this.cnxParam)
            this.client.on('error', e => {
                console.error('Logic MQTT Broker error : ' + e)
            })
            this.client.on('connect', () => {
                console.log('> Logic MQTT Broker: Connected')
                for (let index in this.subscribtionTopics) {
                    const topic = this.subscribtionTopics[index]
                    this.client.unsubscribe(topic, (err) => {
                        if (err) console.error('disconnecting while unsubscribing', err)
                            //Subscribe to the client topics
                        debug(`subscribing topics...`)
                        this.client.subscribe(topic, (err) => {
                            if (!err) {
                                debug(`subscribed successfully to ${topic}`)
                            } else {
                                console.error(err)
                            }
                        })
                    })
                }
            })
            this.client.once('connect', () => {
                clearTimeout(cnxError)
                this.client.on('offline', () => {
                    debug('Logic MQTT Broker connexion down')
                })
                resolve(this)
            })
            this.client.on('message', (topics, payload) => {
                try {

                    let topicArray = topics.split('/')
                    payload = payload.toString()
                    debug(payload)
                    payload = JSON.parse(payload)
                    payload = Object.assign(payload, {
                        topicArray
                    })
                    this.emit(`mqtt-monitor::message`, payload)
                } catch (err) {
                    debug(err)
                }
            })
        })
    }
    ping(payload) {
        try {
            this.client.publish(`${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/tolinto/${payload.sn}/ping`, '{}', (err) => {
                if (err) {
                    this.emit('tolinto_debug', {
                        status: 'error',
                        message: 'error on pong response'
                    })
                    return
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
    mute(payload) {
        try {
            this.client.publish(`${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/tolinto/${payload.sn}/mute`, '{}', (err) => {
                let msg = `Mute - ${payload.sn}`
                if (!err) {

                    this.emit('tolinto_debug', {
                        status: 'success',
                        message: msg + ' - success'
                    })
                    return
                } else {
                    this.emit('tolinto_debug', {
                        status: 'error',
                        message: msg + ' - error'
                    })
                    return
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
    unmute(payload) {
        try {
            this.client.publish(`${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/tolinto/${payload.sn}/unmute`, '{}', (err) => {
                let msg = `Unmute - ${payload.sn}`
                if (!err) {
                    this.emit('tolinto_debug', {
                        status: 'success',
                        message: msg + ' - success'
                    })
                    return
                } else {
                    this.emit('tolinto_debug', {
                        status: 'error',
                        message: msg + ' - error'
                    })
                    return
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
    setVolume(payload) {
        try {
            this.client.publish(`${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/tolinto/${payload.sn}/volume`, `{"value":"${payload.value}"}`, (err) => {
                if (!err) {
                    return
                } else {
                    this.emit('tolinto_debug', {
                        status: 'error',
                        message: 'error on updating volume'
                    })
                    return
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
    setVolumeEnd(payload) {
        try {
            this.client.publish(`${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/tolinto/${payload.sn}/endvolume`, `{"value":"${payload.value}"}`, (err) => {
                if (!err) {
                    const message = `Volume - ${payload.sn} - Set to "${payload.value}"`
                    this.emit('tolinto_debug', {
                        status: 'success',
                        message
                    })
                    return
                } else {
                    this.emit('tolinto_debug', {
                        status: 'error',
                        message: 'error on updating volume'
                    })
                    return
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
    setLang(payload) {
        try {
            const lang = payload.lang;
            const sn = payload.sn;
            this.client.publish(`${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/tolinto/${sn}/tts_lang`, `{"value":"${lang.code}"}`, (err) => {
                const message = `Set LinTO language to ${lang.code} - ${sn}`
                if (!err) {
                    this.emit('tolinto_debug', {
                        status: 'success',
                        message: message + ' - success'
                    })
                    return
                } else {
                    this.emit('tolinto_debug', {
                        status: 'error',
                        message: message + ' - error'
                    })
                    return
                }
            })

        } catch (err) {
            console.error(err)
        }
    }
    startDemo(payload) {
        try {
            this.client.publish(`${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/tolinto/${payload.sn}/demo_mode`, `{"value":"start"}`, (err) => {
                const message = `Demo start - ${payload.sn}`
                if (!err) {
                    this.emit('tolinto_debug', {
                        status: 'success',
                        message: message + ' - success'
                    })
                    return
                } else {
                    this.emit('tolinto_debug', {
                        status: 'error',
                        message: message + ' - error'
                    })
                    return
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
    stopDemo(payload) {
        try {
            this.client.publish(`${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/tolinto/${payload.sn}/demo_mode`, `{"value":"stop"}`, (err) => {
                const message = `Demo stop - ${payload.sn}`
                if (!err) {
                    this.emit('tolinto_debug', {
                        status: 'success',
                        message: message + ' - success'
                    })
                    return
                } else {
                    this.emit('tolinto_debug', {
                        status: 'error',
                        message: message + ' - error'
                    })
                    return
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
    lintoSay(payload) {
        try {
            this.client.publish(`${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/tolinto/${payload.sn}/say`, `{"value":"${payload.content}"}`, (err) => {
                const message = `LinTO Say : "${payload.content}" - ${payload.sn}`
                if (!err) {
                    this.emit('tolinto_debug', {
                        status: 'success',
                        message: message + ' - success'
                    })
                    return
                } else {
                    this.emit('tolinto_debug', {
                        status: 'error',
                        message: message + ' - error'
                    })
                    return
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
    managemeeting(payload) {
        try {
            this.client.publish(`${process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE}/tolinto/${payload.sn}/managemeeting`, `{"sessionname":"${payload.sessionname}", "command": "${payload.command}"}`, (err) => {
                const message = `LinTO recording : "${payload.command}" - ${payload.sessionname}`
                if (!err) {
                    this.emit('tolinto_debug', {
                        status: 'success',
                        message: message + ' - success'
                    })
                    return
                } else {
                    this.emit('tolinto_debug', {
                        status: 'error',
                        message: message + ' - error'
                    })
                    return
                }
            })
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = new MqttMonitor()