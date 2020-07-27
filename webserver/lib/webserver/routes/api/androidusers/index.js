const applicationWorkflowsModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)
const androidUsersModel = require(`${process.cwd()}/model/mongodb/models/android-users.js`)
module.exports = (webServer) => {
    return [{
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getAndroidUsers = await androidUsersModel.getAllAndroidUsers()
                    res.json(getAndroidUsers)
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        }, {
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
            // Remove an application for all android users
            path: '/applications',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const updateAndroidUsers = await androidUsersModel.removeApplicationFromAndroidUsers(payload._id)
                    if (updateAndroidUsers === 'success') {
                        res.json({
                            status: 'success',
                            msg: `All android users have been removed from application ${payload.name}`
                        })
                    } else {
                        throw updateAndroidUsers.msg
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
            // Add an application to an android user
            /* 
            payload = {
              applications: Array
            }
            */
            path: '/:userId/applications',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const userId = req.params.userId
                    const applicationsToAdd = payload.applications

                    const getAndroidUser = await androidUsersModel.getUserById(userId)

                    let user = getAndroidUser[0]

                    user.applications.push(...applicationsToAdd)

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
            // Dissociate an android user from an android application
            path: '/:userId/applications/:applicationId/remove',
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
            // Get an android user by its id
            path: '/:userId',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const userId = req.params.userId
                    const getAndroidUser = await androidUsersModel.getUserById(userId)
                    res.json(getAndroidUser[0])
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