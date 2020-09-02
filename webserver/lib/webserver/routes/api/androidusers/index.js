const applicationWorkflowsModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)
const androidUsersModel = require(`${process.cwd()}/model/mongodb/models/android-users.js`)
module.exports = (webServer) => {
    return [{
            // Get all android users
            // link: /api-docs/#/android_users/getAllAndroidUsers
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Request
                    const getAndroidUsers = await androidUsersModel.getAllAndroidUsers()

                    // Response
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
            // Create a new android user
            /*
            payload = {
              email: String (android user email)
              pswd: String (android user password)
              applications: Array (Array of workflow_id)
            }
            */
            // link: /api-docs/#/android_users/addAndroidUsers

            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload

                    // Request
                    const createUser = await androidUsersModel.createAndroidUsers(payload)

                    // Response
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
            /* 
            paylaod = {
              _id: String (application workflow_id),
              name: String (application worfklow name),
            }
            */
            // Link: /api-docs/#/android_users/removeApplicationFromAndroidUsers
            path: '/applications',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values 
                    const payload = req.body.payload

                    // Request
                    const updateAndroidUsers = await androidUsersModel.removeApplicationFromAndroidUsers(payload._id)

                    // Response
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
              applications: Array (Array of application workflow_id)
            }
            */
            // Link : /api-docs/#/android_users/AddApplicationToAndroidUser
            path: '/:userId/applications',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload
                    const userId = req.params.userId
                    const applicationsToAdd = payload.applications

                    // Get android user data
                    const getAndroidUser = await androidUsersModel.getUserById(userId)

                    // Format data for update
                    let user = getAndroidUser
                    user.applications.push(...applicationsToAdd)

                    // Request
                    const updateUser = await androidUsersModel.updateAndroidUser(user)

                    // Response
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
            // Link: /api-docs/#/android_users/RemoveApplicationFromAndroidUser
            path: '/:userId/applications/:applicationId/remove',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const applicationId = req.params.applicationId
                    const userId = req.params.userId

                    // get android user data
                    const user = await androidUsersModel.getUserById(userId)

                    // get application workflow data
                    const applicationWorkflow = await applicationWorkflowsModel.getApplicationWorkflowById(applicationId)

                    // Format data for update
                    let applications = user.applications
                    applications.pop(applicationId)

                    // Request
                    const updateUser = await androidUsersModel.updateAndroidUser({
                        _id: userId,
                        applications
                    })

                    // Response
                    if (updateUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The user "${user.email}" has been dissociated from android application "${applicationWorkflow.name}"`
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
            // Link: /api-docs/#/android_users/GetAndroidUserById
            path: '/:userId',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const userId = req.params.userId

                    // Request
                    const getAndroidUser = await androidUsersModel.getUserById(userId)

                    // Response
                    res.json(getAndroidUser)
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
            // Update an android user
            path: '/:userId',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload

                    // Request
                    const updateAndroidUser = await androidUsersModel.updateAndroidUser(payload)

                    if (updateAndroidUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `Android user ${payload.email} has been updated`
                        })
                    }

                    // Response
                    res.json(getAndroidUser)
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
            // Update an android user
            path: '/:userId/pswd',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload

                    if (payload.newPswd === payload.newPswdConfirmation) {
                        const userPayload = {
                            _id: payload._id,
                            pswd: payload.newPswd
                        }
                        const updateUserPswd = await androidUsersModel.upadeAndroidUserPassword(userPayload)

                        if (updateUserPswd === 'success') {
                            res.json({
                                status: 'success',
                                msg: `Android user ${payload.email} has been updated`
                            })
                        } else {
                            throw `Error on updating android user ${payload.email}`
                        }
                    } else {
                        throw 'Password and confirmation password don\'t match'
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
            // Delete an android user
            /*
            payload = {
              email : String (android user email)
            }
            */
            // Link: /api-docs/#/android_users/deleteAndroidUser
            path: '/:userId',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const userId = req.params.userId
                    const payload = req.body.payload

                    // Request
                    const removeUser = await androidUsersModel.deleteAndroidUser(userId)

                    // Response
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