const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)
const lintosSchemas = require(`${process.env.LINTO_STACK_MONGODB_SHARED_SCHEMAS}/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/schemas/lintos.json`)

class LintosModel extends MongoModel {
    constructor() {
        super('lintos')
    }

    // Get all lintos that have "fleet" type 
    async getLintoFleet() {
        try {
            const lintoFleet = await this.mongoRequest({ type: 'fleet' })

            // compare object with schema
            if (this.testSchema(lintoFleet, lintosSchemas)) {
                return lintoFleet
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }

    // Get a linto by its "sn" (serial number)
    async getLintoBySn(sn) {
        try {
            const lintoSn = await this.mongoRequest({ sn })

            // compare object with schema
            if (this.testSchema(lintoSn, lintosSchemas)) {
                return lintoSn
            } else {
                // compare object with schema
                throw 'Invalid document format'
            }
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

            // compare object with schema
            if (this.testSchema(mutableElements, lintosSchemas)) {
                return await this.mongoUpdate(query, mutableElements)
            } else {
                throw 'Invalid document format'
            }
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

            // compare object with schema
            if (this.testSchema(payload, lintosSchemas)) {
                return await this.mongoInsert(payload)
            } else {
                throw 'Invalid document format'
            }
        } catch (err) {
            console.error(err)
            return err
        }
    }
}

module.exports = new LintosModel()