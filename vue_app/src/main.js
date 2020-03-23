import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
export const bus = new Vue()

import './filters/index.js'

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')