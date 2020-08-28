<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Create a webapp host</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col" v-if="dataLoaded">
        <div class="modal-body__content flex col" >
          <div class="flex col">
            <AppInput :label="'Host'" :obj="webappHost" :test="'testUrl'"></AppInput>

            <div v-if="webappHost.valid" class="flex col">
              <span class="form__label">Request token :</span>
              <div class="flex row">
                <input class="form__input form__input--disabled" disabled :value="requestToken"/> 
                <button class="button button-icon-txt button--green" @click="generateRequestToken()" style="margin:5px;">
                  <span class="button__icon button__icon--reset"></span>
                  <span class="button__label">Regenerate</span>
                </button>
              </div>
            </div>
            <div class="divider small"></div>
            <AppSelect :label="'Max slots'" :obj="maxSlots" :type="'numberArray'" :min="1" :max="50" ></AppSelect>


            <span class="form__label">Select applications :</span>
            <ul class="checkbox-list">
              <li v-for="app in applicationWorkflows" :key="app._id">
                <input type="checkbox" name="app-wf" :value="app._id" @change="selectApp($event, app._id)"> 
                <span class="checkbox__label">{{ app.name }}</span>
              </li>
            </ul>
           <span class="form__error-field">{{ applications.error }}</span>
          </div>
        </div>
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="handleForm()">
            <span class="button__icon button__icon--apply"></span>
            <span class="button__label">Create webapp host</span>
          </button>
        </div>
      </div>
    <!-- End FOOTER -->
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import { bus } from '../main.js'
import axios from 'axios'
import randomstring from 'randomstring'
export default {
  data () {
    return {
      modalVisible: false,
      webappHost: {
        value:'',
        error: null,
        valid: false
      },
      requestToken: null,
      maxSlots: {
        value: 1,
        error: null,
        valid: true
      },
      applications: {
        value: []
      },
     webappHostsLoaded: false,
     applicationWorkflowsLoaded: false
    }
  },
  async mounted () {
    bus.$on('add_webapp_host', async (data) => {
      this.showModal()
      await this.dispatchStore('getWebappHosts')
      await this.dispatchStore('getApplicationWorkflows')
    })
  },
  watch: {
    'webappHost.valid' (data) {
      if (data) {
        this.generateRequestToken()
      } else {
        this.requestToken = null
      }
    }
  },
  computed: {
    dataLoaded () {
      return this.applicationWorkflowsLoaded && this.webappHostsLoaded
    },
    webappHosts () {
      return this.$store.state.webappHosts
    },
    applicationWorkflows () {
      return this.$store.state.applicationWorkflows
    },
    formValid () {
      return (this.webappHost.valid && this.maxSlots.valid && this.requestToken !== null)
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
      // Reset values
      this.webappHost = {
        value:'',
        error: null,
        valid: false
      }
      this.requestToken = null
      this. maxSlots = {
        value: 1,
        error: null,
        valid: true
      }
      this.applications = {
        value: []
      }
    },
    selectApp (event, appId) {
      if (event.srcElement.checked) {
        this.applications.value.push(appId)
      } else {
        this.applications.value.pop(appId)
      }
    },
    generateRequestToken () {
      const token = randomstring.generate(16)
      const tokenExist = this.webappHosts.filter(wh => wh.requestToken === token)  
      if(tokenExist.length > 0) {
        this.generateRequestToken()
      } else {
        this.requestToken = token
      }
      
    },
    async handleForm () {
      this.$options.filters.testUrl(this.webappHost)
      this.$options.filters.testInteger(this.maxSlots)

      if (this.formValid) {
        await this.createWebappHost()
      }
    },
    async createWebappHost () {
      try {
        const payload = {
          originUrl: this.webappHost.value,
          requestToken: this.requestToken,
          maxSlots: this.maxSlots.value,
          applications: this.applications.value
        }

        const createWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts`, { 
            method: 'post',
            data: { payload }
        })
        if (createWebappHost.data.status === 'success') {
          this.closeModal()
          bus.$emit('app_notif',{
            status: 'success',
            msg: createWebappHost.data.msg,
            timeout: 3000,
            redirect: false
          })
          bus.$emit('add_webapp_host_success', {})
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : 'Error on creating web-app host',
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
          case 'getWebappHosts':
            this.webappHostsLoaded = dispatchSuccess
            break
          case 'getApplicationWorkflows':
            this.applicationWorkflowsLoaded = dispatchSuccess
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
    AppSelect,
    AppInput
  }
}
</script>