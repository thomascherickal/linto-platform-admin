import Vue from 'vue'
import Healthcheck from './views/Healthcheck.vue'
import router from './router/router-healthcheck.js'

new Vue({
    router,
    render: h => h(Healthcheck)
}).$mount('#app')