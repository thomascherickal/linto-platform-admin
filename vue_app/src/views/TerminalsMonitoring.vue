<template>
  <div v-if="dataLoaded">
    <h1>Device - {{ sn }} - Monitoring</h1>
    <div class="flex col">

      <h2>Device informations</h2>
      <div class="flex row">
        <table class="table" v-if="staticClientLoaded">
          <tbody>
            <tr>
              <td>Serial number</td>
              <td><strong>{{ staticClient.sn }}</strong></td>
            </tr>
            <tr>
              <td>Connection status</td>
              <td>{{ staticClient.connexion }}</td>
            </tr>
            <tr>
              <td>Deployed workflow</td>
              <td>{{ staticClient.associated_workflow.name }}</td>
            </tr>
            <tr>
              <td>Services parameters</td>
              <td>Param</td>
            </tr>
            <tr>
              <td>Last up</td>
              <td>{{ staticClient.last_up }}</td>
            </tr>
            <tr>
              <td>Last down</td>
              <td>{{ staticClient.last_down }}</td>
            </tr>
            <tr>
              <td>Firmware version</td>
              <td>{{ !!staticClient.config.firmware ? staticClient.config.firmware : "-" }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 v-if="!!staticClient.config.network">Network Informations</h2>
      <div class="flex row" v-if="!!staticClient.config.network">
        <table class="table" v-if="staticClient.config.network.length > 0">
          <thead>
            <tr>
              <th>Name</th>
              <th>IP address</th>
              <th>MAC address</th>
              <th>Gateway IP</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="net in staticClient.config.network" :key="net.name">
              <td>{{ net.name }}</td>
              <td>{{ net.ip_address }}</td>
              <td>{{ net.mac_address }}</td>
              <td>{{ net.gateway_ip }}</td>
              <td>{{ net.type }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 v-if="!!staticClient.config.mqtt">MQTT settings</h2>
      <div class="flex row" v-if="!!staticClient.config.mqtt">
        <table class="table">
          <tbody>
            <tr>
              <td>Host</td>
              <td>{{ staticClient.config.mqtt.host }}</td>
            </tr>
            <tr>
              <td>Port</td>
              <td>{{ staticClient.config.mqtt.port }}</td>
            </tr>
            <tr>
              <td>Scope</td>
              <td>{{ staticClient.config.mqtt.scope }}</td>
            </tr>
            <tr>
              <td>Login</td>
              <td>{{ staticClient.config.mqtt.username }}</td>
            </tr>
            <tr>
              <td>Password</td>
              <td>{{ staticClient.config.mqtt.password }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
<script>
export default {
  data () {
    return {
      sn: null,
      staticClientLoaded: false
    }
  },
  async mounted () {
    this.sn = this.$route.params.sn
    await this.dispatchStore('getStaticClients')
  },
  computed: {
    dataLoaded () {
      return this.staticClientLoaded
    },
    staticClient () {
      return this.$store.getters.STATIC_CLIENT_BY_SN(this.sn)
    }
  },
  methods: {
    async dispatchStore (topic) {
      try {
        const dispatch = await this.$options.filters.dispatchStore(topic)
        const dispatchSuccess = dispatch.status == 'success' ? true : false
        if (dispatch.status === 'error') {
          throw dispatch.msg
        }
        switch(topic) {
          case 'getStaticClients':
            this.staticClientLoaded = dispatchSuccess
            break
          default:
            return
        }  
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      } 
    } 
  }
}
</script>