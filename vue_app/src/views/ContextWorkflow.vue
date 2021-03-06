<template>
  <div>
    <div class="flex col" v-if="loading">
      LOADING
    </div>
    <div class="flex col flex1" v-if="dataLoaded">
      <h1>Context : "{{ context.name }}" - Workflow editor</h1>
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
        <NodeRedIframe :contextFrame="'contextEdit'" :blsurl="blsUrl" :flowId="context.flowId" :contextId="contextId"></NodeRedIframe>
      </div>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
import NodeRedIframe from '@/components/NodeRedIframe.vue'
export default {
  data () {
    return {
      loading: true,
      contextLoaded: false,
      contextId: '',
      blsUp: false,
      blsUrl: '',
      noderedUser: process.env.VUE_APP_NODERED_USER,
      noderedPassword: process.env.VUE_APP_NODERED_PASSWORD
    }
  },
  beforeRouteEnter (to, form, next) {
    // Check if Business logic server is UP before enter route
    next(vm => vm.isBlsUp())
  },
  created () {
    this.contextId = this.$route.params.id
  },
  computed: {
    context () {
      return this.$store.getters.CONTEXT_BY_ID(this.contextId)
    },
    dataLoaded () {
      return (this.blsUp && this.contextLoaded)
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
        this.blsUrl = `${process.env.VUE_APP_NODERED}/#flow/${this.context.flowId}`
      }
    }
  },
  methods: {
    async isBlsUp () {
      try {
        const connectBls = await axios.get(process.env.VUE_APP_NODERED)
        if (connectBls.status === 200) {
          this.blsUp = true
          this.dispatchContext()
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect to Business logic server',
          timeout: false
        })
      }
    },
    async dispatchContext () {
      try {
        this.contextLoaded = await this.$options.filters.dispatchStore('getFleetContexts')
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    }
  },
  components: {
    NodeRedIframe
  }
}
</script>
