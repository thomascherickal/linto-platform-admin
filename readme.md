# linto-platform-admin

## Description
"LinTO platform Admin" is a web interface used for monitoring a fleet of LinTO's devices, deployed on a technical scope.
Once you're connected to the interface, you have an access to the following services or fonctionalities :
- Create a "meeting room" on wich you can associate a LinTO device
- Create, edit or delete a LinTO device workflow (with node-red interface)
- Install or uninstall LinTO skills
- Monitring of LinTO devices (set a LinTO language, send messages or instructions... )
- Edit/train a NLU model (natural language understanding) via "Tock" interface

## Prerequisites
To lauch the application, you'll have to launch associated services :
- redis-server : [Installation guide](https://www.npmjs.com/package/redis-server)
- mongodb [installation guide](https://www.npmjs.com/package/mongodb)
- linto-platform-business-logic-server : [Documentation](https://github.com/linto-ai/linto-platform-business-logic-server)
- linto-platform-logic-mqtt-server : [LINK]
- linto-platform-nlu : [LINK]
- linto-platform-overwatch : [LINK]

## Download and setup

#### Download git repository
```
cd YOUR/PROJECT/PATH/
git clone ssh://git@ci.linagora.com:7999/linagora/lgs/labs/Linto-Device/Linto-Backend/linto-admin.git
```

#### Setup packages/depencies
```
cd YOUR/PROJECT/PATH/linto-admin/webserver
npm install
cd ../linto-admin/vue_app
npm install
```

## Front-end settings
You will need to set some environment variables to connect services like "Business Logic Server", "NLU/Tock", "Logic MQTT server" and "Overwatch"

### Set front-end variables
Go to the **/vue_app** folder and edit the following files: `.env.devlopment`, `.env.production`

- `.env.devlopment` : if you want to set custom port or url, replace **VUE_APP_URL** and **VUE_APP_NLU_URL** values
```
VUE_APP_URL=http://localhost:9000
VUE_APP_NLU_URL=VUE_APP_NLU_URL
```
- `.env.production` : set your "application url" and "Tock interface url" for production mode
```
VUE_APP_URL=VUE_APP_URL
VUE_APP_NLU_URL=VUE_APP_NLU_URL
```

## Back-end and services settings

### Set global and webserver variables
Go to the **/webserver** folder, you'll see a `.env_default` file.
Rename this file as `.env` and edit the environment variables.

```
cd YOUR/PROJECT/PATH/linto-admin/webserver
cp .env_default .env
```
#### Server settings
*Edit **/webserver/.env***
```
# Server settings
NODE_ENV=production
LINTO_STACK_ADMIN_HTTP_PORT=9000
DEFAULT_CITY=Paris
DEFAULT_LANGUE=fr-FR
APP_URL=http://localhost:9000
```
- **NODE_ENV**: webserver running mode = ['production', 'development']
- **LINTO_STACK_ADMIN_HTTP_PORT**: webserver running port
- **APP_URL**: URL of your project. If you want to run the project locally, be careful to set the same port as *LINTO_STACK_ADMIN_HTTP_PORT* variable

#### Redis settings
*Edit **/webserver/.env***
```
...
# Redis settings
LINTO_STACK_REDIS_SESSION_SERVICE_PORT=6379
LINTO_STACK_REDIS_SESSION_SERVICE=localhost
```
- **LINTO_STACK_REDIS_SESSION_SERVICE_PORT**: redis-server service running port
- **LINTO_STACK_REDIS_SESSION_SERVICE**: redis-server service host

#### MongoDB settings
*Edit **/webserver/.env***
```
...
# Mongodb settings
BDD_TYPE=mongodb
LINTO_STACK_MONGODB_SERVICE=127.0.0.1
LINTO_STACK_MONGODB_PORT=27017
LINTO_STACK_MONGODB_DBNAME=lintoAdmin
LINTO_STACK_MONGODB_USE_LOGIN=true
LINTO_STACK_MONGODB_USER=root
LINTO_STACK_MONGODB_PASSWORD=example
```
- **LINTO_STACK_MONGODB_SERVICE**: mongodb running host
- **LINTO_STACK_MONGODB_PORT**: mongodb running port
- **LINTO_STACK_MONGODB_DBNAME**: mongodb database name
- **LINTO_STACK_MONGODB_USE_LOGIN**: Enable or disable mongoDb authentication = [‘true’, ‘false’]
- **LINTO_STACK_MONGODB_USER**: Login for mongoDb authentication (default = "root")
- **LINTO_STACK_MONGODB_PASSWORD**: Password for mongoDb authentication (default = "example")

If you want to modify `LINTO_STACK_MONGODB_USER` and `MONGODB_PSWD`, please read the following instructions :
- 1/ edit the current **.env** with the values you want :
```
(example)
LINTO_STACK_MONGODB_USER=myUserName
LINTO_STACK_MONGODB_PASSWORD=myPassword
```
- 2/ Once it's done, you'll have to edit the initialisation file of mongodb that set a user and password. Edit the following file :`mongodb/seed/user.js`
```
db.createUser({
  user: "myUserName",
  pwd: "myPassword",
  roles: [{
    role: "readWrite",
    db: "lintoAdmin"
  }]
})
```

#### Business Locig Server (NodeRed) settings
*Edit **/webserver/.env***
```
...
# Business Logic Server
LINTO_STACK_BLS_REDUI=LINTO_STACK_BLS_REDUI
LINTO_STACK_BLS_USE_LOGIN=true
# Default login settings
LINTO_STACK_BLS_USER=admin
LINTO_STACK_BLS_PASSWORD=password
```
- **LINTO_STACK_BLS_REDUI**: Url of you business logic server
- **LINTO_STACK_BLS_USE_LOGIN**: Enable or disable Business Logic Server authentication = ['true', 'false']
- **LINTO_STACK_BLS_USER**: Login for BLS authentication (default = "admin")
- **LINTO_STACK_BLS_PASSWORD**: Password for BLS authentication (default = "password")

If you want to modify `LINTO_STACK_BLS_USER` and `LINTO_STACK_BLS_PASSWORD`, please read the following instructions : [Lien vers les explications]

#### Logic MQTT server settings
*Edit **/webserver/.env***
```
...
#Logic MQTT server
LINTO_STACK_MQTT_HOST=localhost
LINTO_STACK_MQTT_PORT=1883
LINTO_STACK_MQTT_USER=LINTO_STACK_MQTT_USER
LINTO_STACK_MQTT_PASSWORD=LINTO_STACK_MQTT_PASSWORD
LINTO_STACK_MQTT_USE_LOGIN=true
LOGIC_CLIENT_CODE=blk
```
- **LINTO_STACK_MQTT_HOST**: Logic MQTT address
- **LINTO_STACK_MQTT_PORT**: Logic MQTT running port
- **LINTO_STACK_MQTT_USER**: Logic MQTT authentication user
- **LINTO_STACK_MQTT_PASSWORD**: Logic MQTT authentication password
- **LINTO_STACK_MQTT_USE_LOGIN**: Enable or disable Logic MQTT Server authentication = ['true', 'false']
- **LOGIC_CLIENT_CODE**: Logic MQTT topic client code

If you want to modify `LINTO_STACK_MQTT_USER` and `LINTO_STACK_MQTT_PASSWORD`, please read the following instructions : [Lien vers les explications]

#### NLU / Tock interface settings
*Edit **/webserver/.env***
```
...
# NLU settings
IS_POPULATE=false
TOCK_PASSWORD=password
TOCK_USER=admin@app.com
TOCK_API=TOCK_API
LM_API=LM_API
```
- **IS_POPULATE**: Enable/disable skills populate = [true, false]
- **TOCK_USER**: Login for Tock authentication (default = "admin@app.com")
- **TOCK_PASSWORD**: Password for BLS authentication (default = "password")
- **TOCK_API**: Tock api url
- **LM_API**: Language model api url
