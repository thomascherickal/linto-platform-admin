<template>
  <div class="healtcheck-overview">
    <h1>Services healthcheck</h1>
    <table class="healthcheck-table">
      <thead>
        <th>Service name</th>
        <th>Connected</th>
      </thead>
      <tbody>
        <tr v-for="item in services" :key="item.name">
          <td>{{ item.service }}</td>
          <td class="status"><span :class="item.connected ? 'connected' : 'disconnected'">{{ item.connected ? 'OK' : 'KO' }}</span></td>
        </tr>
      </tbody>
    </table>

    <a href="/admin/fleet"> Back to homepage</a>
  </div>
</template>
<script>
const axios = require('axios')
import { bus } from '../main.js'
export default {
  data () {
    return {
      services : [],
      sttServiceLoaded: false,
      sttLModelsLoaded: false
    }
  },
  async mounted () {
    await this.checkMongo()
    await this.checkRedis()
    await this.sttServices()

  },
  methods: {
    async checkMongo () {
      const mongo = await axios.get(`${process.env.VUE_APP_URL}/healthcheck/mongo`)
      this.services.push(mongo.data)
    },
    async checkRedis () {
      const redis = await axios.get(`${process.env.VUE_APP_URL}/healthcheck/redis`)
      this.services.push(redis.data)
    },
    async sttServices () {
      this.sttServiceLoaded = await this.$options.filters.dispatchStore('getSttServices')
      this.sttLModelsLoaded = await this.$options.filters.dispatchStore('getSttLanguageModels')
      // TODO > Afficher l'état des services STT, TOCK, etc ...
      console.log(this.sttServiceLoaded, this.sttLModelsLoaded)
    }
  }
}
</script>
