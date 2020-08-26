const debug = require('debug')('linto-admin:middlewares')
const btoa = require('btoa')
const atob = require('atob')
const sha1 = require('sha1')
const UsersModel = require(`${process.cwd()}/model/mongodb/models/users.js`)


function isProduction() {
    return process.env.NODE_ENV === 'production'
}

function logger(req, res, next) {
    debug(`[${Date.now()}] new user entry on ${req.url}`)
    next()
}

function decodeBasicAuth(req, res, next) {
    try {
        if (!!req.headers.authorization) {
            const auth = req.headers.authorization
            const splitAuth = auth.split(' ')
            const authToken = splitAuth[1]
            const decodedToken = atob(authToken)
            const splitDecodeToken = decodedToken.split(':')
            const login = splitDecodeToken[0]
            const password = splitDecodeToken[1]
            return {
                login,
                password
            }
        } else  {
            return null
        }
    } catch (error) {
        console.error(error)
    }

}

async function checkBasicAuthLogin(login, password) {
    try {
        const getUser = await UsersModel.getUserByName(login)
        if (getUser.length > 0) {
            if (getUser[0].role === 'administrator') {
                const userPswdHash = getUser[0].pswdHash
                const salt = getUser[0].salt

                // Compare password with database
                if (sha1(password + salt) == userPswdHash) {
                    return true
                } else {
                    throw 'Invalid credentials'
                }
            } else {
                throw `Not auhtorized`
            }
        } else {
            throw 'User not found'
        }
    } catch (error) {
        console.error(error)
        return false
    }

}

async function checkAuth(req, res, next) {
    debug(req.url, req.session)
    try {
        // Basic Auth
        if (!!req.headers.authorization) {
            const auth = decodeBasicAuth(req, res, next)
            if (auth !== null) {
                const authValid = await checkBasicAuthLogin(auth.login, auth.password)
                if (authValid) {
                    next()
                } else {
                    throw 'Invalid credentials'
                }
            }
        }
        // Session
        else if (!!req.session) {
            if (!!req.session.logged) {
                if (req.session.logged === 'on' && req.url === '/login') {
                    req.session.save((err) => {
                        if (err && err !== 'undefined') {
                            console.error('Err:', err)
                        }
                    })
                    res.redirect('/admin/clients/static')
                } else if (req.session.logged === 'on' && req.url !== '/login') {
                    next()
                } else if (req.session.logged !== 'on' && req.url !== '/login') {
                    res.redirect('/login')
                } else if (req.session.logged !== 'on' && req.url === '/login') {
                    next()
                }
            } else {
                const users = await UsersModel.getUsers()
                if (users.length === 0) {
                    res.redirect('/setup')
                } else if (req.url != '/login') {
                    res.redirect('/login')
                } else {
                    next()
                }
            }
        } else { // session not foun
            res.redirect('/login')
        }
    } catch (error) {
        console.error(error)
        res.json({ error })
    }

}

// Get a Basic Auth token from user and password
function basicAuthToken(user, password) {
    var token = user + ":" + password;
    var hash = btoa(token);
    return "Basic " + hash;
}

function useSSL() {

    if (process.env.NODE_ENV === 'local') {
        return ''
    } else {
        if (process.env.LINTO_STACK_USE_SSL === true) {
            return 'https://'
        } else {
            return 'http://'
        }
    }

}

module.exports = {
    basicAuthToken,
    checkAuth,
    isProduction,
    logger,
    useSSL
}