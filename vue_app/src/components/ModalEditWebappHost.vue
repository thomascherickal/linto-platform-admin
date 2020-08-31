<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded && webappHost !== null">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Edit Web-application host</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          <span class="subtitle" v-if="!addAppFormVisible">Host informations</span>

          <div class="flex row" v-if="!addAppFormVisible">
            <AppInput :label="'Origin URL'" :obj="originUrl" :test="'testUrl'" :class="'flex1'"></AppInput>
            <div class="flex1 row">
              <button class="button button-icon-txt button--green" style="margin: 23px 0 0 10px" @click="updateHostUrl()">
                <span class="button__icon button__icon--save"></span>
                <span class="button__label">Save</span>
              </button>
            </div>
          </div>
          
          <div class="flex row" v-if="!addAppFormVisible">
            <div class="flex col">
              <span class="form__label">Request token :</span>
              <input class="form__input form__input--disabled" disabled :value="requestToken"/>
              <span class="form__error-field"></span>
            </div>
            <div class="flex1 row">
              <button class="button button-icon-txt button--bluemid" @click="generateRequestToken()" style="margin:5px;">
                <span class="button__icon button__icon--reset"></span>
                <span class="button__label">Regenerate</span>
              </button>
              <button class="button button-icon-txt button--green" style="margin: 23px 0 0 10px" @click="updateRequestToken()">
                <span class="button__icon button__icon--save"></span>
                <span class="button__label">Save</span>
              </button>
            </div>
          </div>

          <div class="flex row" v-if="!addAppFormVisible">
             <AppSelect :label="'Max slots'" :obj="maxSlots" :type="'numberArray'" :min="1" :max="50" :class="'flex1'"></AppSelect>
            <div class="flex1 row">
              <button class="button button-icon-txt button--green" style="margin: 23px 0 0 10px" @click="updateHostMaxSlots()">
                <span class="button__icon button__icon--save"></span>
                <span class="button__label">Save</span>
              </button>
            </div>
          </div>


          <div class="flex row" v-if="addAppFormVisible">
            <button class="button button-icon-txt button--orange" @click="hideAddAppForm()">
              <span class="button__icon button__icon--back"></span>
              <span class="button__label">Back to host infos</span>
            </button>
          </div>
          <div class="flex col" v-if="!addAppFormVisible">
            <span class="subtitle" v-if="webappHost.applications.length > 0">Applications</span>
            <div class="flex row"  v-if="webappHost.applications.length > 0">
              <table class="table">
                <thead>
                  <tr>
                    <th>Application name</th>
                    <th>Dissociate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="app in webappHost.applications" :key="app">
                    <td>{{ workflowByName[app] }}</td>
                    <td class="center">
                      <button class="button button-icon button--red" @click="removeAppFromWebappHost(webappHost, app)">
                        <span class="button__icon button__icon--trash"></span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="no-content" v-else>No application associated</div>
            <div class="divider small"></div>
            <div class="flex row" v-if="filteredApplicationWorkflows.length > 0">
              <button class="button button-icon-txt button--green" @click="showAddAppForm()">
                <span class="button__icon button__icon--add"></span>
                <span class="button__label">Associate to other applications</span>
              </button>
            </div>
          </div>
          <div class="flex col" v-else>
            <p>Please select applications to <strong>associate</strong> with web-application host "<strong>{{ webappHost.originUrl }}</strong>"</p>
            <div class="flex col">
              <ul class="checkbox-list">
                <li v-for="wf in filteredApplicationWorkflows" :key="wf._id">
                  <input type="checkbox" :value="wf._id" name="app-workflow" @change="updateSelectedApps($event, wf._id)">
                  <span class="checkbox__label">{{ wf.name }}</span>
                </li>
              </ul>
              
            </div>
            <div class="divider small"></div>
            <div class="flex row">
              <button class="button button-icon-txt button--green" @click="addAppToWebappHost()">
                <span class="button__icon button__icon--apply"></span>
                <span class="button__label">Associate applications</span>
              </button>
            </div>
          </div>
        </div>
        
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
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
      webappHostId: null,
      selectedApps: [],
      addAppFormVisible: false,
      applicationWorkflowsLoaded: false,
      webappHostsLoaded: false,
      originUrl: {
        value: '',
        error: null,
        valid: false
      },
      requestToken: null,
      maxSlots: {
        value: '',
        error: null,
        valid: false
      }
    }
  },
  async mounted () {
    bus.$on('edit_webapp_host', async (data) => {
      this.showModal()
      await this.refreshStore()

      this.webappHostId = data.webappHost._id
      
      this.originUrl.value = data.webappHost.originUrl
      this.originUrl.valid = true

      this.maxSlots.value = data.webappHost.maxSlots
      this.maxSlots.valid = true

      this.requestToken = data.webappHost.requestToken
    })
  },
  computed: {
    dataLoaded () {
      return this.applicationWorkflowsLoaded && this.webappHostsLoaded
    },
    workflowByName () {
      return this.$store.getters.APP_WORKFLOWS_NAME_BY_ID
    },
    applicationWorkflows () {
      return this.$store.state.applicationWorkflows
    },
    filteredApplicationWorkflows () {
      const applications = this.webappHost.applications
      if (applications.length > 0) {
        return this.applicationWorkflows.filter(wf => applications.indexOf(wf._id) < 0)
      } else {
        return this.applicationWorkflows
      }
    },
    webappHosts () {
      return this.$store.state.webappHosts
    },
    webappHost () {
      if(this.webappHostId !== null) {
        return this.$store.getters.WEB_APP_HOST_BY_ID(this.webappHostId)
      } else {
        return null
      }
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
      this.hideAddAppForm()
    },
    closeModal () {
      this.modalVisible = false
    },
    showAddAppForm () {
      this.addAppFormVisible = true
    },
    hideAddAppForm () {
      this.addAppFormVisible = false
      this.selectedApps = []
    },
    updateSelectedApps (event, workflowId) {
      if (event.srcElement.checked) {
        this.selectedApps.push(workflowId)
      } else {
        this.selectedApps.pop(workflowId)
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
    async addAppToWebappHost () {
      try {
        if (this.selectedApps.length > 0) {
          const payload = {
            applications: this.selectedApps
          }
          const updateWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${this.webappHost._id}/applications`, {
            method: 'put',
            data: { payload }
          })
          if (updateWebappHost.data.status === 'success') {
            this.hideAddAppForm()
            await this.refreshStore()
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateWebappHost.data.msg,
              timeout: 3000,
              redirect: false
            })
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
    async removeAppFromWebappHost (webappHost, appId) {
      try {
        const removeApp = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${webappHost._id}/applications/${appId}/remove`, {
          method: 'patch'
        })
        if (removeApp.data.status === 'success'){
          bus.$emit('app_notif', {
            status: 'success',
            msg: removeApp.data.msg,
            timeout: 3000,
            redirect: false
          })
          await this.refreshStore()
        } else {
          throw removeApp.data.msg
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
    async updateHostUrl () {
      try {
        this.$options.filters.testUrl(this.originUrl)
        if (this.originUrl.valid) {
          const payload = {
            _id: this.webappHost._id,
            originUrl: this.originUrl.value
          }
          await this.updateWebappHost(payload)
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
    async updateHostMaxSlots () {
      try {
        this.$options.filters.testInteger(this.maxSlots)
        if (this.maxSlots.valid) {
          const payload = {
            _id: this.webappHost._id,
            maxSlots: this.maxSlots.value,
            originUrl: this.originUrl.value
          }
        await this.updateWebappHost(payload)
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
    async updateRequestToken () {
      try {
        const payload = {
          _id: this.webappHost._id,
          requestToken: this.requestToken,
          originUrl: this.originUrl.value
        }
        await this.updateWebappHost(payload)
      } catch (error) {
         bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async updateWebappHost (payload) {
      try {
        const updateWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${payload._id}`, {
            method: 'put',
            data: { payload }
          })
          
          if (updateWebappHost.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateWebappHost.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.refreshStore()
          } else {
              throw updateWebappHost.data.msg
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
    async refreshStore () {
      try {
        await this.dispatchStore('getWebappHosts')
        await this.dispatchStore('getApplicationWorkflows')
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
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
          case 'getApplicationWorkflows':
            this.applicationWorkflowsLoaded = dispatchSuccess
            break
          case 'getWebappHosts':
            this.webappHostsLoaded = dispatchSuccess
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