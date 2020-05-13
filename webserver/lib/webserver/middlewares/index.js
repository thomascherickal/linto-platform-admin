const debug = require('debug')('linto-admin:middlewares')
const btoa = require('btoa')
const UsersModel = require(`${process.cwd()}/model/mongodb/models/users.js`)


function isProduction() {
    return process.env.NODE_ENV === 'production'
}

function logger(req, res, next) {
    debug(`[${Date.now()}] new user entry on ${req.url}`)
    next()
}

async function checkAuth(req, res, next) {
    //if (isProduction()) {
    // If not connected
    debug(req.session)
    if (!!req && !!req.session) {
        if (!!req.session.logged) {
            debug(req.session.logged)
            if (req.session.logged == 'on' && req.url == '/login') {
                req.session.save((err) => {
                    if (err && err != 'undefined') {
                        console.error('Err:', err)
                    }
                })
                res.redirect('/admin/fleet')
            } else if (req.session.logged == 'on' && req.url != '/login') {
                next()
            } else if (req.session.logged != 'on' && req.url != '/login') {
                res.redirect('/login')
            } else if (req.session.logged != 'on' && req.url == '/login') {
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
    } else {
        res.redirect('/login')
    }
}

// Get a Basic Auth token from user and password
function basicAuthToken(user, password) {
    var token = user + ":" + password;
    var hash = btoa(token);
    return "Basic " + hash;
}

function useSSL() {
    if (process.env.LINTO_STACK_USE_SSL === true) {
        return 'https://'
    } else {
        return 'http://'
    }
}

module.exports = {
    basicAuthToken,
    checkAuth,
    isProduction,
    logger,
    useSSL
}