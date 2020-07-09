<template>
  <div>
    <div class="flex col flex1">
      <h1>Workflow editor - {{ currentWorkflow.name }}</h1>
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
        <NodeRedIframe :contextFrame="'statciWorkflow'" :blsurl="blsUrl" :noderedFlowId="currentWorkflow.flowId" :workflowId="staticWorkflowId" v-if="dataLoaded"></NodeRedIframe>
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
      blsUp: false,
      blsUrl: '',
      noderedUser: process.env.VUE_APP_NODERED_USER,
      noderedPassword: process.env.VUE_APP_NODERED_PASSWORD,
      staticWorkflowsLoaded: false,
      staticWorkflowId: null
    }
  },
  beforeRouteEnter (to, form, next) {
    // Check if Business logic server is UP before enter route
    next(vm => vm.isBlsUp())
  },
  async mounted () {
    this.staticWorkflowId = this.$route.params.workflowId
    await this.dispatchStaticWorkflows()
  },
  computed: {
    dataLoaded () {
      return this.staticWorkflowsLoaded && this.blsUp
    },
    currentWorkflow () {
      return this.$store.getters.STATIC_WORKFLOW_BY_ID(this.staticWorkflowId)
    }
  },
  watch: {
    currentWorkflow (data) {
      if(!data.error) {
        this.blsUrl = `${process.env.VUE_APP_NODERED}/#flow/${this.currentWorkflow.flowId}`
      }
    }
  },
  methods: {
    async isBlsUp () {
      try {
        const connectBls = await axios.get(process.env.VUE_APP_NODERED)
        if (connectBls.status === 200) {
          this.blsUp = true
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect to Business logic server',
          timeout: false
        })
      }
    },
    async dispatchStaticWorkflows () {
      const dispatchStaticWorkflows = await this.dispatchStore('getStaticWorkflows')
      if (dispatchStaticWorkflows.status === 'success') {
        this.staticWorkflowsLoaded = true
      }
    },
    // Execute actions from store by topic
    async dispatchStore (topic) {
      try {
        return await this.$options.filters.dispatchStore(topic)
      } catch (error) {
        console.error(error)
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