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
git clone git@github.com:linto-ai/linto-platform-admin.git
cd linto-platform-admin
```

#### Setup packages/depencies
```
cd /webserver
npm install
cd ../vue_app
npm install
```

## Front-end settings
You will need to set some environment variables to connect services like "Business Logic Server", "NLU/Tock"

### Set front-end variables
Go to the **/vue_app** folder and edit the following files: `.env.devlopment`, `.env.production`

- `.env.devlopment` : if you want to set custom port or url, replace **VUE_APP_URL** and **VUE_APP_NLU_URL** values
```
(example)
VUE_APP_URL=http://localhost:9000
VUE_APP_NLU_URL=http://my-nlu-service.local
```
- `.env.production` : set your "application url" and "Tock interface url" for production mode 
```
(example)
VUE_APP_URL=http://my-linto-platform-admin.com
VUE_APP_NLU_URL=http://my-nlu-service.com
```

## Back-end and services settings

### Set global and webserver variables
Go to the **/webserver** folder, you'll see a `.env_default` file.
Rename this file as `.env` and edit the environment variables.

```
cd YOUR/PROJECT/PATH/linto-platform-admin/webserver
cp .env_default .env
```

#### Server settings
*Edit **/webserver/.env***


| Env variable| Description | example |
|:---|:---|:---|
| TZ | Time-zone value | Europe/Paris |
| LINTO_STACK_REDIS_SESSION_SERVICE | Address of the STT service manager | localhost, http://my-stt-service.com|
