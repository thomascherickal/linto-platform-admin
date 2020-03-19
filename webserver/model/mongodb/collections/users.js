const MongoModel = require(`${process.cwd()}/model/mongodb/model.js`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class UsersModel extends MongoModel {
    async getUser(id) {
        try {
            const query = {
                _id: MongoClient.mongoDb.ObjectID(id)
            }
            return await this.mongoRequest('users', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getUserByName(userName) {
        try {
            const query = {
                userName: userName
            }
            return await this.mongoRequest('users', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getUsers() {
        try {
            const query = {}
            return await this.mongoRequest('users', query)
        } catch (error) {
            console.error(err)
            return err
        }
    }

    async updateUser(payload) {
        try {
            const query = {
                _id: MongoClient.mongoDb.ObjectID(payload._id)
            }
            let mutableElements = payload
            delete mutableElements._id
            return await this.mongoUpdate('users', query, mutableElements)
        } catch (err) {
            console.error(err)
            return err

        }
    }
}


module.exports = new UsersModel()