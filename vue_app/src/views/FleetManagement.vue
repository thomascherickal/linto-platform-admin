<template>
  <div class="flex col">
    <div class="flex col" v-if="loading">
      Loading
    </div>
    <div class="flex col" v-if="dataLoaded">
      <h1>LinTO fleet management</h1>
      <details open class="description">
        <summary>Infos</summary>
        <span>LinTO admin enables you to manage LinTO devices that are registered in the information system. You can add new LinTOs to your system by registering a serial number, or access the monitoring interface for enrolled LinTO devices. <br/>
        For more informations please read the <a href="https://doc.linto.ai/" target="_blank">documentation</a>.</span>
      </details>
      
      <!-- IN USE -->
      <div class="block block--transparent">
        <h2>Enrolled devices</h2>
        <details class="description">
        <summary>Infos</summary>
        <span>A list of LinTO devices that are enrolled towards an application context</span>
      </details>
        
        <div class="flex row" v-if="associated_lintos.length > 0">
          <table class="table table--full">
            <thead>
              <tr>
                <th class="status">Connexion</th>
                <th>Serial number</th>
                <th>Firmware</th>
                <th>Context</th>
                <th>Last seen up</th>
                <th>Last seen down</th>
                <th>IP</th>
                <th>Monitoring</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="linto in associated_lintos"
                :key="linto._id"
              >
                <td class="center status"><span
                  class="icon icon--status"
                  :class="linto.connexion"></span></td>
                <td class="important">{{ linto.sn }}</td>
                <td>{{ linto.config.firmware }}</td>
                <td>{{ linto.associated_context }}</td>
                <td>{{ linto.last_up }}</td>
                <td>{{ linto.last_down }}</td>
                <td>0.0.0.1</td>
                <td>
                  <a
                    class="button button-icon-txt button--bluemid"
                    :href="'/admin/fleet/monitoring/'+linto.sn"
                  >
                    <span class="button__icon button__icon--monitoring"></span>
                    <span class="button__label">Monitoring</span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          There is no LinTO enrolled...
        </div>
      </div>
      <!-- Provisionning -->
      <div class="block block--transparent">
        <h2>Provisionning</h2>
        <details class="description">
          <summary>Infos</summary>
          <span>A list of registered LinTO devices that are not enrolled towards an application context</span>
        </details>
        <div class="flex row" v-if="not_associated_lintos.length > 0">
          <table class="table table--shadow">
            <thead>
              <tr>
                <th>Serial number</th>
                <th>Firmware</th>
                <th>Monitoring</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="linto in not_associated_lintos"
                :key="linto._id"
              >
                <td class="important">{{ linto.sn }}</td>
                <td>{{ linto.config.firmware }}</td>
                <td>
                  <a
                    class="button button-icon-txt button--bluemid"
                    :href="'/admin/fleet/monitoring/'+linto.sn"
                  >
                    <span class="button__icon button__icon--monitoring"></span>
                    <span class="button__label">Monitoring</span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          There is no LinTO registered...
        </div>
      </div>
      <div class="block block--transparent">
        <button class="button button--valid" @click="addLintoModal()">
          <span class="button__label">Add a LinTO device</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  data () {
    return {
      loading: true,
      lintoLoaded: false
    }
  },
  async created () {
    const test = await this.dispatchLintos()
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    }
  },
  computed: {
    lintos () {
      return this.$store.state.lintoFleet
    },
    not_associated_lintos () {
      return this.$store.getters.NOT_ASSOCIATED_LINTO_FLEET
    },
    associated_lintos () {
      return this.$store.getters.ASSOCIATED_LINTO_FLEET
    },
    dataLoaded () {
      return (this.lintoLoaded.status === 'success')
    }
  },
  mounted () {
    const socket = io(process.env.VUE_APP_URL)
    // On "linto_status" update
    // Only "fleet" types are handled for now
    socket.on('linto_status', (data) => {
      this.$store.commit('UPDATE_LINTO_FLEET', data)
    })
  },
  methods: {
    addLintoModal () {
      bus.$emit('add_linto_modal', {})
    },
    async dispatchLintos () {
      try {
        this.lintoLoaded = await this.$options.filters.dispatchStore('getLintoFleet')
        if (this.lintoLoaded.status === 'error') {
          throw 'Error on getting lintos'
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
