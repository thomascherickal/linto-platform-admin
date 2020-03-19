const MongoClient = require(`${process.cwd()}/model/mongodb/client.js`)

// This class is a child of 'modelMongoDb' class. It contains all methods and requests to database used on API routes.
class MongoModel extends MongoClient {

    /*************/
    /*** USERS ***/
    /*************/
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
        /* ================= */
        /* ===== LINTOS =====*/
        /* ================= */

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

    /****************/
    /*** CONTEXTS ***/
    /****************/
    async getContexts() {
        try {
            const query = {}
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getContextById(id) {
        try {
            const query = {
                _id: MongoClient.mongoDb.ObjectID(id)
            }
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getFleetContexts() {
        try {
            const query = { type: 'Fleet' }
            return await this.mongoRequest('context', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getContextTypes() {
        try {
            const query = {}
            return await this.mongoRequest('context_types', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async createContext(payload) {
        try {
            return await this.mongoInsert('context', payload)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async updateContext(payload) {
        try {
            const query = {
                _id: MongoClient.mongoDb.ObjectID(payload._id)
            }
            let mutableElements = payload
            delete mutableElements._id
            return await this.mongoUpdate('context', query, mutableElements)
        } catch (err) {
            return err
        }
    }

    /****************/
    /*** WORFLOWS ***/
    /****************/
    async getAllWorkflowPatterns() {
        try {
            const query = {}
            return await this.mongoRequest('flow_pattern', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getWorkflowPatternByName(name) {
        try {
            const query = { name }
            return await this.mongoRequest('flow_pattern', query)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async getWorkflowPatternById(id) {
        try {
            const query = { _id: MongoClient.mongoDb.ObjectID(id) }
            const tmpFlow = await this.mongoRequest('flow_pattern', query)
            return tmpFlow[0]
        } catch (err) {
            return err
        }
    }

    async addWorkflowPattern(payload) {
            try {
                return await this.mongoInsert('flow_pattern', payload)
            } catch (err) {
                console.error(err)
                return err
            }
        }
        /*******************/
        /*** TMP WORFLOW ***/
        /*******************/
    async getFullTmpFlow() {
        try {
            const query = {}
            const tmpFlow = await this.mongoRequest('flow_pattern_tmp', query)
            let tmpFlowUnformatted = tmpFlow[0].flow
            let formattedFlow = []
            tmpFlowUnformatted.map(tmp => {
                if ((formattedFlow.filter(f => f.id === tmp.id)).length === 0) {
                    formattedFlow.push(tmp)
                }
            })
            return formattedFlow
        } catch (err) {
            return err
        }
    }

    async getTmpFlow() {
        try {
            const query = {}
            const tmpFlow = await this.mongoRequest('flow_pattern_tmp', query)
            return tmpFlow[0].flow
        } catch (err) {
            return err
        }
    }

    async updateTmpFlow(payload) {
        try {
            const query = {
                id: "tmp"
            }
            return await this.mongoUpdate('flow_pattern_tmp', query, {
                flow: payload.flow,
                workspaceId: payload.workspaceId
            })
        } catch (err) {
            console.error(err)
            return err
        }
    }
}

module.exports = new MongoModel()