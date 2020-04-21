const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)

class LintosModel extends MongoModel {
    constructor() {
        super('lintos')
    }

    // Get all lintos that have "fleet" type 
    async getLintoFleet() {
        try {
            return await this.mongoRequest({ type: 'fleet' })
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get a linto by its "sn" (serial number)
    async getLintoBySn(sn) {
        try {
            return await this.mongoRequest({ sn })
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Update a linto
    async updateLinto(payload) {
        try {
            const query = { _id: this.getObjectId(payload._id) }
            let mutableElements = payload
            delete mutableElements._id
            return await this.mongoUpdate(query, mutableElements)
        } catch (err) {
            return err
        }
    }

    // Create a new linto that have "fleet" type
    async addLintoFleet(sn) {
        try {
            const payload = {
                enrolled: true,
                connexion: 'offline',
                last_up: null,
                last_down: null,
                associated_context: null,
                type: 'fleet',
                sn,
                config: {
                    network: [],
                    firmware: '0.0.1',
                    ftp: {},
                    sound: {},
                    disk: {},
                    mqtt: {}
                },
                meeting: []
            }
            return await this.mongoInsert(payload)
        } catch (err) {
            console.error(err)
            return err
        }
    }
}

module.exports = new LintosModel()