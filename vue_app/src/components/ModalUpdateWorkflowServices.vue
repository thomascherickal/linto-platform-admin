<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Workflow "{{workflow.name}}" services settings</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
          Services settings : 
          <AppInput :label="'Workflow name'" :obj="workflowName" :test="'testName'"></AppInput>
          
          <!-- STT language -->
          <AppSelect :label="'Select a language'" :obj="sttServiceLanguage" :list="sttAvailableLanguages" :params="{key:'value', value:'value', optLabel: 'value'}" :disabled="noSttService" :disabledTxt="'Create a STT service'"></AppSelect>

      <!-- STT services -->
      <AppSelect :label="'Select a STT service'" :obj="sttService" :list="sttServiceByLanguage" :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" :disabled="sttServiceLanguage.value === ''" :disabledTxt="'Please select a language'"></AppSelect>
      
      <!-- TOCK application -->
      <AppSelect :label="'Select Tock application'" :obj="tockApplicationName" :list="tockApplications" :params="{key:'name', value:'name', optLabel: 'name'}" :options="{value:'new', label:'Create a new tock application'}"></AppSelect>
      

          
        </div>
      </div>
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-left">
          <button class="button button-icon-txt button--grey" @click="closeModal()">
            <span class="button__icon button__icon--cancel"></span>
            <span class="button__label">Cancel</span>
          </button>
        </div>
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="handleForm()">
            <span class="button__icon button__icon--apply"></span>
            <span class="button__label">Apply</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      sn: null,
      workflow: null,
      workflowType: null,
      workflowInit: false,
      workflowName: {
        value: '',
        error: null,
        valid: false
      },
      sttServiceLanguage: {
        value: '',
        error: null,
        valid: false
      },
      sttService: {
        value: '',
        error: null,
        valid: false
      },
      tockApplicationName: {
        value: '',
        error: null,
        valid: false
      },
      staticWorkflowsLoaded: false,
      staticClientsLoaded: false,
      sttServicesLoaded: false,
      tockApplicationsLoaded: false,
      sttLanguageModelsLoaded: false,
      applicationWorkflowsLoaded: false
          }
  },
  
  async mounted () {
    bus.$on('update_workflow_services', async (data) => {
      if (!!data.sn && data.type === 'static') {
        this.sn = data.sn
      }
      this.workflow = data.workflow
      this.workflowType = data.type
      this.workflowName = {
        value: this.workflow.name,
        error: null,
        valid: true
      }

      await this.dispatchStore('getStaticWorkflows')
      await this.dispatchStore('getApplicationWorkflows')
      await this.dispatchStore('getStaticClients')
      await this.dispatchStore('getSttServices')
      await this.dispatchStore('getSttLanguageModels')
      await this.dispatchStore('getTockApplications')
      this.showModal()
    })
  },
  computed: {
    dataLoaded () {
      return (this.staticClientsLoaded && this.staticWorkflowsLoaded && this.sttServicesLoaded && this.applicationWorkflowsLoaded && this.tockApplicationsLoaded && this.sttLanguageModelsLoaded)
    },
    currentWorkflow () {
      if (this.workflowType === 'static') {
        return this.$store.getters.STATIC_WORKFLOW_BY_ID(this.workflow._id) 
      } else if (this.workflowType === 'application') {
        return this.$store.getters.APP_WORKFLOW_BY_ID(this.workflow._id) 
      } else {
        return null
      }
    },
    sttServices () {
      return this.$store.getters.STT_SERVICES_AVAILABLE
    },
    sttAvailableLanguages () {
      if (this.sttServicesLoaded) {
        let sttLang = []
        if (this.sttServices.length > 0) {
          this.sttServices.map(service => {
            if (!sttLang[service.lang]) {
              sttLang.push({ value: service.lang })
            }
          })
        }
        return sttLang
      } else {
        return ''
      }
    },
    sttServiceByLanguage () {
      if (this.sttServiceLanguage.value !== '') {
        return this.sttServices.filter(service => service.lang === this.sttServiceLanguage.value)
      } else {
        return []
      }
    },
    noSttService () {
      return !this.sttServicesLoaded || this.sttServices.length === 0
    },
    tockApplications () {
      return this.$store.state.tockApplications
    },
    formValid () {
      return (this.workflowName.valid && this.sttServiceLanguage.valid && this.sttService.valid && this.tockApplicationName.valid)
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        if (!this.workflowInit && this.currentWorkflow !== null && !this.currentWorkflow.error) {
          // get worlflow name
          this.workflowName.value = this.currentWorkflow.name
          this.workflowName.valid = true 

          // get worlflow language
          const nodeConfig = this.currentWorkflow.flow.nodes.filter(node => node.type === 'linto-config')
          if (nodeConfig.length > 0) {
            this.sttServiceLanguage.value = nodeConfig[0].language
            this.sttServiceLanguage.valid = true
          }
          
          // get STT service 
          const nodeSttConfig = this.currentWorkflow.flow.configs.filter(node => node.type === 'linto-config-transcribe')
          if (nodeSttConfig.length > 0) {
            const host = nodeSttConfig[0].host
            const splitHost = host.split('/')
            this.sttService.value = splitHost[splitHost.length - 1]
            this.sttService.valid = true
          }
          
          // get Tock application
          const nodeNluConfig = this.currentWorkflow.flow.configs.filter(node => node.type === 'linto-config-evaluate')
          if (nodeNluConfig.length > 0) {
            this.tockApplicationName.value = nodeNluConfig[0].appname
            this.tockApplicationName.valid = true
          }

          this.workflowInit = true
        }
      }
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async handleForm () {
      // Test workflow name
      this.$options.filters.testName(this.workflowName) // Test if workflow name is valid
      
      // Test STT language
      this.$options.filters.testSelectField(this.sttServiceLanguage)

      // Test STT service 
      this.$options.filters.testSelectField(this.sttService)
    
      // Test Tock application name 
      this.$options.filters.testSelectField(this.tockApplicationName)

      if (this.formValid) {
        await this.updateWorkflowSettings()
      }
    },
    async updateWorkflowSettings () {
      const payload = {
        workflowName: this.workflowName.value,
        sttServiceLanguage: this.sttServiceLanguage.value,
        sttService: this.sttService.value,
        tockApplicationName: this.tockApplicationName.value,
        type: this.workflowType
      }
      try {
        const updateWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/static/${this.workflow._id}/services`, {
          method: 'patch',
          data: { payload }
        })
        if (updateWorkflow.data.status === 'success') {
            this.closeModal()
            bus.$emit('update_workflow_services_success', {})
             bus.$emit('app_notif', {
              status: 'success',
              msg: updateWorkflow.data.msg,
              timeout: 3000,
              redirect: false
            })
        } else {
          throw updateWorkflow
        }
      } catch (error) {
        console.error(error)
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Error on updating workflow',
          timeout: false,
          redirect: false
        })
      }
    },
    async dispatchStore (topic) {
      try {
        const dispatch = await this.$options.filters.dispatchStore(topic)
        const dispatchSuccess = dispatch.status == 'success' ? true : false
        if (dispatch.status === 'error') {
          throw dispatch.msg
        }
        switch(topic) {
          case 'getStaticWorkflows':
            this.staticWorkflowsLoaded = dispatchSuccess
            break
          case 'getApplicationWorkflows': 
            this.applicationWorkflowsLoaded = dispatchSuccess
            break
          case 'getStaticClients':
            this.staticClientsLoaded = dispatchSuccess
            break
          case 'getSttServices':
              this.sttServicesLoaded = dispatchSuccess
              break
          case 'getTockApplications': 
            this.tockApplicationsLoaded = dispatchSuccess
            break
          case 'getSttLanguageModels':
              this.sttLanguageModelsLoaded = dispatchSuccess
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
  },
  components: {
    AppInput,
    AppSelect
  }
}
</script>