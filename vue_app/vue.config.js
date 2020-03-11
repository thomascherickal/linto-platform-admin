const path = require('path')

module.exports = {
    configureWebpack: config => {
        config.devtool = false,
            config.optimization = {
                splitChunks: false
            }
    },
    outputDir: path.resolve(__dirname, '../webserver/dist'),
    publicPath: path.resolve(__dirname, '/assets'),
    pages: {
        login: {
            entry: 'src/login.js',
            template: 'public/default.html',
            filename: 'login.html',
            title: 'LOGIN'

        },
        admin: {
            entry: 'src/main.js',
            template: 'public/index.html',
            filename: 'index.html',
            title: 'ADMIN'
        },
        page404: {
            entry: 'src/page404.js',
            template: 'public/404.html',
            filename: '404.html',
            title: '404'
        }

    },
    pluginOptions: {
        'style-resources-loader': {
            preProcessor: 'scss',
            patterns: [path.resolve(__dirname, './public/styles/sass/styles.scss')]
        }
    }
}