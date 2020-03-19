const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class LintoModel extends MongoModel {

    async getLintoFleet() {
        try {
            return await this.mongoRequest('lintos', { type: 'fleet' })
        } catch (err) {
            console.error(err)
            return err
        }
    }
    async getLintoBySn(sn) {
        try {
            return await this.mongoRequest('lintos', { sn })
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async updateLinto(payload) {
        try {
            let mutableElements = payload
            delete mutableElements._id

            return await this.mongoUpdate('lintos', { _id: MongoClient.mongoDb.ObjectID(payload._id) }, mutableElements)

        } catch (err) {
            return err
        }
    }

    async addLintoFleet(sn) {
        try {
            const payload = {
                enrolled: true,
                connexion: 'offline',
                last_up: '-',
                last_down: '-',
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
            return await this.mongoInsert('lintos', payload)
        } catch (err) {
            console.error(err)
            return err
        }
    }
}

module.exports = new LintoModel()