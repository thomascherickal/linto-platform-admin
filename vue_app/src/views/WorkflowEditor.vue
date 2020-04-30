<template>
  <div>
    <h1>Workflow editor</h1>
    <details open class="description">
      <summary>Infos</summary>
      <span>The workflow editor uses an embedded application called node-red. You will have to log in to the node-red application to be able to edit workflows.<br/>
      <strong>Please log in with the following credentials :</strong>
      <ul>
        <li>Login : <strong>{{ noderedUser }}</strong> </li>
        <li>Password : <strong>{{ noderedPassword }}</strong></li>
      </ul>
      For more informations about node-red workflows, please read the <a href="https://doc.linto.ai/" target="_blank">documentation</a>.
      </span>
    </details>
    <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
      <NodeRedIframe :contextFrame="'manager'" v-if="sandBoxFound" :blsurl="sandBoxUrl"></NodeRedIframe>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import { bus } from '../main.js'
import NodeRedIframe from '@/components/NodeRedIframe.vue'
export default {
  data () {
    return {
      sandBoxId: null,
      sandBoxUrl: null,
      sandBoxFound: false,
      blsUp: false,
      noderedUser: process.env.VUE_APP_NODERED_USER,
      noderedPassword: process.env.VUE_APP_NODERED_PASSWORD
    }
  },
  components: {
    NodeRedIframe
  },
  mounted () {
    setTimeout(async () => {
      await this.isBlsUp()
    }, 500)
  },
  methods: {
    async isBlsUp () {
      try {
        const connectBls = await axios.get(process.env.VUE_APP_NODERED)
        if (connectBls.status === 200) {
          this.blsUp = true
          this.getSandBoxId()
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect to Business logic server',
          timeout: false
        })
      }
    },
    async getSandBoxId () {
      const getSandBoxId = await axios(`${process.env.VUE_APP_URL}/api/flow/sandbox`, {
        method: 'get'
      })
      if (getSandBoxId.data.sandBoxId !== null) {
        this.sandBoxId = getSandBoxId.data.sandBoxId
        this.sandBoxUrl = process.env.VUE_APP_NODERED + '/#flow/' + this.sandBoxId
        this.sandBoxFound = true
      }
    }
  }
}
</script>
