const debug = require('debug')(`linto-admin:mqtt-monitor`)
const EventEmitter = require('eventemitter3')
const Mqtt = require('mqtt')

class MqttMonitor extends EventEmitter {
    constructor(scope) {
        super()

        this.scope = scope
        this.client = null
        this.subscribtionTopics = []
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

        this.subscribeScope()
        this.init()

        return this
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
                    this.client.emit(`mqtt-monitor::message`, payload)
                } catch (err) {
                    debug(err)
                }
            })
        })
    }

    subscribeScope() {
        this.subscribtionTopics['status'] = `${this.scope}/fromlinto/+/status`
        this.subscribtionTopics['pong'] = `${this.scope}/fromlinto/+/pong`
        this.subscribtionTopics['muteack'] = `${this.scope}/fromlinto/+/muteack`
        this.subscribtionTopics['unmuteack'] = `${this.scope}/fromlinto/+/unmuteack`
        this.subscribtionTopics['tts_lang'] = `${this.scope}/fromlinto/+/tts_lang`
        this.subscribtionTopics['say'] = `${this.scope}/fromlinto/+/say`
    }

    ping(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/ping`, '{}', (err) => {
                if (err) {
                    throw err
                }
            })
        } catch (err) {
            console.error(err)
            this.client.emit('tolinto_debug', {
                status: 'error',
                message: 'error on pong response'
            })
        }
    }

    mute(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/mute`, '{}', (err) => {
                let msg = `Mute - ${payload.sn}`
                if (err) {
                    throw err
                }
                this.client.emit('tolinto_debug', {
                    status: 'success',
                    message: msg + ' - success'
                })
            })
        } catch (err) {
            console.error(err)
            this.client.emit('tolinto_debug', {
                status: 'error',
                message: 'error on mute ack'
            })
        }
    }

    unmute(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/unmute`, '{}', (err) => {
                let msg = `Unmute - ${payload.sn}`
                if (err) {
                    throw err
                }
                this.client.emit('tolinto_debug', {
                    status: 'success',
                    message: msg + ' - success'
                })
            })
        } catch (err) {
            console.error(err)
            this.client.emit('tolinto_debug', {
                status: 'error',
                message: 'error on unmute ack'
            })
        }
    }

    setVolume(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/volume`, `{"value":"${payload.value}"}`, (err) => {
                if (!err) {
                    return
                } else {
                    this.client.emit('tolinto_debug', {
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
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/endvolume`, `{"value":"${payload.value}"}`, (err) => {
                if (!err) {
                    const message = `Volume - ${payload.sn} - Set to "${payload.value}"`
                    this.client.emit('tolinto_debug', {
                        status: 'success',
                        message
                    })
                    return
                } else {
                    this.client.emit('tolinto_debug', {
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

    lintoSay(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/say`, `{"value":"${payload.content}"}`, (err) => {
                const message = `LinTO Say : "${payload.content}" - ${payload.sn}`
                if (!err) {
                    this.client.emit('tolinto_debug', {
                        status: 'success',
                        message: message + ' - success'
                    })
                    return
                } else {
                    this.client.emit('tolinto_debug', {
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

module.exports = scope => new MqttMonitor(scope)