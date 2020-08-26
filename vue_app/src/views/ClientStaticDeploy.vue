<template>
  <div v-if="dataLoaded">
    <h1>Static devices - {{ sn }} - Deployment</h1>
    <div class="flex col">
      <!-- Workflow name -->
      <AppInput :label="'Workflow name'" :obj="workflowName" :test="'testWorkflowName'"></AppInput>

      <!-- Workflow description -->
      <AppTextarea :obj="workflowDescription" :label="'Workflow description'" ></AppTextarea>

      <!-- Workflow tempalte -->
      <AppSelect :label="'Workflow template'" :obj="workflowTemplate" :list="workflowTemplates" :params="{key:'_id', value:'name' , optLabel: 'name'}"></AppSelect>

      <!-- LinSTT language -->
      <AppSelect :label="'Select a language'" :obj="sttServiceLanguage" :list="sttAvailableLanguages" :params="{key:'value', value:'value', optLabel: 'value'}" :disabled="noSttService" :disabledTxt="'Create a LinSTT service'"></AppSelect>

      <!-- LinSTT services -->
      <AppSelect :label="'Select a LinSTT service'" :obj="sttService" :list="sttServiceByLanguage" :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" :disabled="sttServiceLanguage.value === ''" :disabledTxt="'Please select a language'"></AppSelect>
      
      <!-- TOCK application -->
      <AppSelect :label="'Select Tock application'" :obj="tockApplicationName" :list="tockApplications" :params="{key:'name', value:'name', optLabel: 'name'}" :options="{value:'new', label:'Create a new tock application'}"></AppSelect>

      <!-- Submit -->
      <div class="flex row">
        <a href="/admin/clients/static" class="button button-icon-txt button--grey">
          <span class="button__icon button__icon--cancel"></span>
          <span class="button__label">Cancel</span>
        </a>
        <button class="button button-icon-txt button--green" @click="handleForm()">
          <span class="button__icon" :class="submitting ? 'button__icon--loading' : 'button__icon--deploy'"></span>
          <span class="button__label">{{ deployLabel }}</span>
        </button>
      </div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppTextarea from '@/components/AppTextarea.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      sn: null,
      workflowName: {
        value: '',
        error: null,
        valid: false
      },
      workflowDescription: {
        value:'',
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
      workflowTemplate : {
        value: '', 
        error: null,
        valid: false
      },
      flowId: null,
      // Services loading status
      sttLanguageModelsLoaded:false,
      sttServicesLoaded: false,
      tockApplicationsLoaded: false,
      workflowTemplatesLoaded: false,
      // Workflow creation steps
      submitting: false,
      blsFlowUpdate: false,
      blsFlowStatus: 'Posting workflow on Business logic Server',
      workflowUpdate: false,
      workflowStatus: 'Registering the new workflow',
      staticDeviceUpdate: false,
      staticDeviceStatus: 'Attaching static device to created workflow',
      nluLexSeedUpdate: false,
      nluLexSeedStatus: 'Updating natural language understanding dictionnaries',
      sttLexSeedUpdate: false,
      sttLexSeedStatus: 'Updating STT service dictionnaries'
    }
  },
  computed: {
    dataLoaded () {
      return (this.sttLanguageModelsLoaded && this.sttServicesLoaded && this.tockApplicationsLoaded && this.workflowTemplatesLoaded)
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
    workflowTemplates () {
      return this.$store.getters.WORKFLOW_TEMPLATES_BY_TYPE('static')
    },
    formValid () {
      return (this.workflowName.valid && this.workflowTemplate.valid && this.sttServiceLanguage.valid && this.sttService.valid && this.tockApplicationName.valid)
    },
    deployLabel () {
      if (this.submitting) {
        return 'Deploying...'
      } else {
        return 'Deploy'
      }
    }
  },
  async mounted () {
    this.sn = this.$route.params.sn
    await this.dispatchStore('getWorkflowsTemplates')
    await this.dispatchStore('getSttServices')
    await this.dispatchStore('getSttLanguageModels')
    await this.dispatchStore('getTockApplications')
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async handleForm () {
      /* Workflow Name */ 
      this.$options.filters.testStaticWorkflowName(this.workflowName) // Test if workflow name is not used
      if (this.workflowName.error === null) {
        this.$options.filters.testName(this.workflowName) // Test if workflow name is valid
      }

      /* Workflow description */
      this.$options.filters.testContent(this.workflowDescription)

      /* Workflow Template */ 
      this.$options.filters.testSelectField(this.workflowTemplate)

      /* STT language */ 
      this.$options.filters.testSelectField(this.sttServiceLanguage)

      /* STT service */ 
      this.$options.filters.testSelectField(this.sttService)
    
      /* Tock application */ 
      this.$options.filters.testSelectField(this.tockApplicationName)

      if (this.formValid) {
        await this.deployStaticDevice()
      }
    },
    async deployStaticDevice (sn) {
      try { 
        let payload = {
          sn: this.sn,
          workflowName: this.workflowName.value,
          workflowDescription: this.workflowDescription.value.replace(/\n/g,' '),
          workflowTemplate: this.workflowTemplate.value,
          sttServiceLanguage: this.sttServiceLanguage.value,
          sttService: this.sttService.value,
          tockApplicationName: this.tockApplicationName.value
        }
        this.submitting = true

        // STEP 1 : Post workflow template on BLS
        const postBls = await this.postFlowOnBLS(payload)
        if(postBls === 'success') {
          if (this.flowId !== null) {
            payload.flowId = this.flowId
            // STEP 2 : Post workflow on Database
            const postWorkflow = await this.postWorkflow(payload)
            if (postWorkflow === 'success') {
              // STEP 3 : Update static device
              const updateStaticDevice = await this.updateStaticDevice(payload)
              if (updateStaticDevice === 'success' ) {
                // STEP 4 : NLU lexical seeding
                const nluLexicalSeeding = await this.nluLexicalSeeding(payload)
                if (nluLexicalSeeding === 'success') {
                  // STEP 5 : STT lexical seeding
                  const sttLexicalSeeding = await this.sttLexicalSeeding(payload)
                  if (sttLexicalSeeding === 'success') {
                    this.submitting = false
                    bus.$emit('app_notif', {
                      status: 'success',
                      msg: `Static client ${this.sn} has been deployed`,
                      timeout: 3000,
                      redirect: 'http://localhost:9000/admin/clients/static'
                    })
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        this.submitting = false
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async postFlowOnBLS (payload) {
      try {
        const postBls = await axios(`${process.env.VUE_APP_URL}/api/flow/postbls/static`, {
          method: 'post', 
          data: { payload }
        })
        if(postBls.data.status === 'success' && !!postBls.data.flowId) {
          this.blsFlowUpdate = true
           this.blsFlowStatus = 'The workflow template has been posted on Business Logic Server' 
          this.flowId = postBls.data.flowId
          return 'success'
        } else if (postBls.data.status === 'error'){
          this.blsFlowUpdate = false
          this.blsFlowStatus = postBls.data.msg
          throw postBls.data.msg
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async postWorkflow (payload) {
      try {
        const postWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/static`, {
          method: 'post', 
          data: { payload }
        })
        if (postWorkflow.data.status === 'success') {
          this.workflowUpdate = true
          this.workflowStatus = `The workflow "${payload.workflowName}" has been registered`
          return 'success'
        } else if (postWorkflow.data.status === 'error') {
          this.workflowUpdate = false
          this.workflowStatus = postWorkflow.data.msg
          throw postWorkflow.data.msg
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async updateStaticDevice (payload) {
      try {
        const getWorkflowByName = await axios(`${process.env.VUE_APP_URL}/api/workflows/static/name/${payload.workflowName}`, {
          method: 'get'
        })
        if (!!getWorkflowByName.data._id && !!getWorkflowByName.data.name) {
          const clientPayload = {
            associated_workflow: {
              _id: getWorkflowByName.data._id,
              name: getWorkflowByName.data.name
            }
          }
          const updateStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/${payload.sn}`, {
            method: 'patch', 
            data: { payload: clientPayload }
          })
          if(updateStaticDevice.data.status === 'success') {
            this.staticDeviceUpdate = true
            this.staticDeviceStatus = `The static device "${this.sn}" has been attached to "${payload.workflowName}" workflow`
            return 'success'
          } else if (updateStaticDevice.data.status === 'error') {
            this.staticDeviceUpdate = false
            this.staticDeviceStatus = updateStaticDevice.data.msg
            throw updateStaticDevice.data.msg
          }
        }
      } catch (error) {
         bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async nluLexicalSeeding (payload) {
      try {
        const nluLexSeed = await axios(`${process.env.VUE_APP_URL}/api/tock/lexicalseeding`, {
          method: 'post', 
          data: { payload }
        })
        if(nluLexSeed.data.status === 'success') {
          this.nluLexSeedUpdate = true
          this.nluLexSeedStatus = 'Natural language understanding dictionnaries have been updated'
          return 'success'
        } else if(nluLexSeed.data.status === 'error') {
          this.nluLexSeedUpdate = false
          this.nluLexSeedStatus = nluLexSeed.data.msg
          throw nluLexSeed.data
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
          timeout: false,
          redirect: false
        })
      }
    },
    async sttLexicalSeeding (data) {
      try {
        const payload = { 
            flowId: data.flowId,
            service_name: data.sttService
          }
        const sttLexSeed = await axios(`${process.env.VUE_APP_URL}/api/stt/lexicalseeding`, {
          method: 'post', 
          data: { payload }
        })
        if(sttLexSeed.data.status === 'success') {
          this.sttLexSeedUpdate = true
          this.sttLexSeedStatus = 'STT service dictionnaries have been updated'
          return 'success'
        } else if(sttLexSeed.data.status === 'error') {
          this.sttLexSeedUpdate = false
          this.sttLexSeedStatus = sttLexSeed.data.msg
          throw sttLexSeed.data
        }
      } catch (error) {
        this.sttLexSeedStatus = error.msg
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
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
          case 'getWorkflowsTemplates':
            this.workflowTemplatesLoaded = dispatchSuccess
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
    AppSelect,
    AppTextarea
  }
}
</script>