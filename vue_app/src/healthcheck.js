import Vue from 'vue'
import Healthcheck from './views/Healthcheck.vue'
import router from './router/router-healthcheck.js'
import store from './store.js'

new Vue({
    router,
    store,
    render: h => h(Healthcheck)
}).$mount('#app')