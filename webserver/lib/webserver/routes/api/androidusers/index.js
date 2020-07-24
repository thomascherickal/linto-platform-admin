const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const moment = require('moment')
const applicationWorkflowsModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)
const androidUsersModel = require(`${process.cwd()}/model/mongodb/models/android-users.js`)
module.exports = (webServer) => {
    return [{
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const createUser = await androidUsersModel.createAndroidUsers(payload)

                    if (createUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The Android user "${payload.email}" has been created".`
                        })
                    } else {
                        throw `Error on creating android user "${payload.email}"`
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Update user applications
            path: '/:userId/applications/update',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const userId = req.params.userId
                    const applications = payload.applications

                    const getAndroidUser = await androidUsersModel.getUserById(userId)

                    let user = getAndroidUser[0]

                    user.applications.push(...applications)

                    const updateUser = await androidUsersModel.updateAndroidUser(user)

                    if (updateUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `New android applications have been attached to user "${user.email}"`
                        })
                    } else {
                        throw 'Error on updating user'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Dissociate an android user from an andoird application
            path: '/:userId/application/:applicationId/remove',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const applicationId = req.params.applicationId
                    const userId = req.params.userId
                        // get user
                    const user = await androidUsersModel.getUserById(userId)
                        // get application
                    const applicationWorkflow = await applicationWorkflowsModel.getApplicationWorkflowById(applicationId)


                    let applications = user[0].applications
                    applications.pop(applicationId)

                    // update user
                    const updateUser = await androidUsersModel.updateAndroidUser({
                        _id: userId,
                        applications
                    })

                    if (updateUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The user "${user[0].email}" has been dissociated from android application "${applicationWorkflow[0].name}"`
                        })
                    } else {
                        throw 'Error on updating android application user'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Dissociate an android user from an andoird application
            path: '/:userId',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const userId = req.params.userId
                    const payload = req.body.payload
                    const removeUser = await androidUsersModel.deleteAndroidUser(userId)

                    if (removeUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `Android user ${payload.email} has been removed`
                        })
                    } else {
                        throw `Error on removing android user ${payload.email}`
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        }
    ]
}