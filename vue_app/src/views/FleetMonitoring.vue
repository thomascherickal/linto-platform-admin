<template>
  <div>
    <div v-if="loading">
      Loading
    </div>
    <div v-if="dataLoaded && linto === null">
      No LinTO found for this serial number : {{ sn }}
    </div>
    <div v-if="dataLoaded && linto !== null" class="flex col">
      <h1>Monitoring : LinTO - {{ sn }}</h1>

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
<!--
          <div v-if="linto.config.network.length > 0" class="flex1 linto-config-table">
            <h2>Network informations</h2>
            <div v-for="(network, index) in linto.config.network" :key="index" class="network-item">
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

          
            <div v-if="!!linto.config.sound && !!linto.config.sound.volume" class="flex1 linto-config-table">
            <h2>Sound</h2>
            <table class="table table--full table--config">
              <tr v-for="(sound, index) in linto.config.sound" :key="index">
                <td class="td--label">{{index}}</td>
                <td class="td--value">{{ sound }}</td>
              </tr>
            </table>
          </div>-->

        </div>
      </div>
      <div class="block block--transparent">
        <h2>Settings</h2>
          <div class="flex row">
            <div class="linto-settings-item">
              <div class="flex col">
                
                <button 
                  @click="ping()"
                  class="button button-icon-txt button__blue"
                  :class="pingStatus.status"
                > 
                  <span class="button--icon button--icon__ping"></span>
                  <span class="button--label">Ping</span>
                </button>
                <span class="ping-status" :class="pingStatus.status">{{ pingStatus.msg }}</span>
            </div>
          </div>
          
          <div class="linto-settings-item">
            <div class="flex row">
              <span>Volume : </span>
              <button 
                class="button button-icon button__grey" 
                :class="isMuted ? 'button--icon button--icon__unmute ' :  'button--img__mute'"
                @click="isMuted ? unmute() : mute() "
              >
                <span class="button--icon" :class="isMuted ? 'button--icon__unmute' : 'button--icon__mute'"
                ></span>
              </button>
              <input
                type="range"
                min="0"
                max="100"
                :value="volume"
                id="range-volume"
                @input="setVolume($event)"
                @change="setVolumeEnd($event)"
              > 
              <span class="volume-status">{{ volume }}</span>
            </div>
          </div>
        </div>
        <div class="flex row">
          <div class="linto-settings-item">
            <div class="flex row">
              <AppInput :label="'Make me talk...'" :obj="say" :test="'testSentence'"></AppInput>
              <button @click="lintoSay()" class="button button-icon-txt button__blue"> 
                <span class="button--icon button--icon__talk"></span>
                <span class="button--label">Make me talk</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import AppInput from '@/components/AppInput.vue'
export default {
  data () {
    return {
      sn: '',
      lintoLoaded: false,
      loading: true,
      socket: null,
      pingStart: null,
      pingEnd: null,
      pingStatus: {
        status: '',
        msg: ''
      },
      volume: 0,
      volumeInit: false,
      tmpVolume: 0,
      say: {
        value: '',
        valid: false,
        error: null
      }
    }
  },
  created () {
    this.sn = this.$router.currentRoute.params.sn
    
  },
  async mounted () {
    await this.dispatchLintos()
    this.socket = io(process.env.VUE_APP_URL)

    // On "linto_status" update
    // Only "fleet" types are handled for now
    this.socket.on('linto_status', (data) => {
      if (data.sn === this.sn) {
        this.$store.commit('UPDATE_LINTO_FLEET', data)
      }
    })

  },

computed: {
    linto () {
      if (this.$store.getters.LINTO_FLEET_BY_SN(this.sn) !== null) {
        let linto = this.$store.getters.LINTO_FLEET_BY_SN(this.sn)
        if (!!linto.config.sound.volume) {
          linto.config.sound.volume = 70
        }
        return linto
      } else {
        return null
      }
    },
    dataLoaded () {
      return this.lintoLoaded
    },

    isMuted () {
      return parseInt(this.volume) === 0
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        if (!this.volumeInit) {
          if (!!this.linto.config.sound && !!this.linto.config.sound.volume) {
            this.volume = this.linto.config.sound.volume
            this.volumeInit = true
          } else {
            this.volume = 50
            this.volumeInit = true

          }
        }
        this.loading = false
      }
    }
  },
  methods: {
    ping() {
      this.pingStart = moment()
      this.socket.emit('linto_ping', {sn: this.sn})
      this.pingStatus = {
        status: 'loading', 
        msg: 'Waiting for pong'
      }

      this.socket.on('linto_pong', (data) => {
        this.pingEnd = moment()
        const diff = (this.pingEnd.diff(this.pingStart)) / 1000
        this.pingStatus = {
          status: 'success',
          msg: `Pong received in ${diff} sec`
        }
      })
      setTimeout(()=>{
        if (this.pingEnd === null) {
          this.pingStatus = {
            status: 'error', 
            msg: 'No response received after 5sec'
          }
        }
      }, 5000)
    },
    async mute () {
      if (!this.isMuted) {
        this.tmpVolume = this.volume // save current volume
        this.volume = 0
        this.socket.emit('linto_mute', {sn: this.sn}) // Emit socket MUTE
        let currentLinto = this.linto 
        currentLinto.config.sound.volume = 0
        this.$store.commit('UPDATE_LINTO_FLEET', currentLinto) // Update store variable
        await this.dispatchLintos()
      }
    },
    async unmute () {
      if (this.isMuted) {
        this.socket.emit('linto_unmute', { sn: this.sn }) // Emit socket UNMUTE
        let currentLinto = this.linto
        this.volume = this.tmpVolume !== 0 ? this.tmpVolume : 70
        currentLinto.config.sound.volume = this.volume
        this.$store.commit('UPDATE_LINTO_FLEET', currentLinto) // Update store variable
        await this.dispatchLintos()
      }
    },
    lintoSay () {
      this.$options.filters.testSentence(this.say)
      if (this.say.valid) {
        this.socket.emit('linto_say', {sn: this.sn, content: this.say.value})
      }
    },
    async setVolume (e) {
      const volumeValue = e.target.value
      this.volume = volumeValue
      this.socket.emit('linto_volume', {
        value: this.volume,
        sn: this.sn
      })
      let currentLinto = this.linto
      currentLinto.config.sound.volume = this.volume
      this.$store.commit('UPDATE_LINTO_FLEET', currentLinto) // Update store variable

      await this.dispatchLintos()
    },

    async setVolumeEnd (e) {
      const volumeValue = e.target.value
      this.volume = volumeValue
      this.socket.emit('linto_volume_end', {
        value: this.volume,
        sn: this.sn
      })
      await this.dispatchLintos()
      let currentLinto = this.linto
      currentLinto.config.sound.volume = this.volume
      this.$store.commit('UPDATE_LINTO_FLEET', currentLinto) // Update store variable



    },

    async dispatchLintos () {
      this.lintoLoaded = await this.$options.filters.dispatchStore('getLintoFleet')
    }
  },
  components: {
    AppInput
  }
}
</script>
