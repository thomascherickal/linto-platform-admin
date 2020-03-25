<template>
  <div>
    <div v-if="loading">
      Loading
    </div>
    <div v-if="dataLoaded && linto === null">
      No LinTO found for this serial number : {{ sn }}
    </div>
    <div v-if="dataLoaded && linto !== null" class="flex col">
      <h1>Monitoring : LinTO - {{ sn }}</h1>

      <div class="block block--transparent">
        <h2>Global informations</h2>
        <div class="flex row">
          <table class="table table--full">
            <thead>
              <tr>
                <th class="status">Connexion</th>
                <th>Serial number</th>
                <th>Type</th>
                <th>Firmware</th>
                <th>Context</th>
                <th>Last seen up</th>
                <th>Last seen down</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="center status"><span
                  class="icon icon--status"
                  :class="linto.connexion"></span></td>
                <td class="important">{{ linto.sn }}</td>
                <td>{{ linto.type }}</td>
                <td>{{ linto.config.firmware }}</td>
                <td>{{ linto.associated_context }}</td>
                <td>{{ linto.last_up }}</td>
                <td>{{ linto.last_down }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="block block--transparent">
        <div class="flex row">

          <div v-if="linto.config.network.length > 0" class="flex1 linto-config-table">
            <h2>Network informations</h2>
            <div v-for="(network, index) in linto.config.network" :key="index">
              <table class="table table--full table--config">
                <tr v-for="(val, ind) in network" :key="ind">
                  <td class="td--label">{{ ind }}</td>
                  <td class="td--value">{{ val.length > 0 ? val : '-' }}</td>
                </tr>
              </table>
            </div>
          </div>

          <div v-if="!!linto.config.ftp" class="flex1 linto-config-table">
            <h2>FTP</h2>
            <table class="table table--full table--config">
              <tr v-for="(ftp, index) in linto.config.ftp" :key="index">
                <td class="td--label">{{index}}</td>
                <td class="td--value">{{ ftp.length > 0 ? ftp : '-' }}</td>
              </tr>
            </table>
          </div>

          <div v-if="!!linto.config.sound" class="flex1 linto-config-table">
            <h2>Sound</h2>
            <table class="table table--full table--config">
              <tr v-for="(sound, index) in linto.config.sound" :key="index">
                <td class="td--label">{{index}}</td>
                <td class="td--value">{{ sound.length > 0 ? sound : '-' }}</td>
              </tr>
            </table>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      sn: '',
      lintoLoaded: false,
      loading: true
    }
  },
  created () {
    this.sn = this.$router.currentRoute.params.sn
    this.dispatchLintos()
  },
  computed: {
    linto () {
      if (this.$store.getters.LINTO_FLEET_BY_SN(this.sn) !== null) {
        return this.$store.getters.LINTO_FLEET_BY_SN(this.sn)
      } else {
        return null
      }
    },
    dataLoaded () {
      return this.lintoLoaded
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    }
  },
  methods: {
    async dispatchLintos () {
      this.lintoLoaded = await this.$options.filters.dispatchStore('getLintoFleet')
    }
  }
}
</script>
