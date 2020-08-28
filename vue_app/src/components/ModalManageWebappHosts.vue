<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Manage Web-application hosts - "{{ appName }}"</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          
          <p v-if="registeredHosts.length > 0 && !showAddHostForm"> List of <strong>hosts</strong> registered in "<strong>{{ appName }}</strong>" android application.</p>

          <div class="flex row" v-if="registeredHosts.length > 0 && !showAddHostForm">
            <table class="table">
              <thead>
                <tr>
                  <th colspan="2">Host</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="host in registeredHosts" :key="host._id">
                  <td>{{ host.originUrl }}</td>
                  <td>
                    <button class="button button-icon button--red" @click="removeAppFromWebappHost(host, workflowId)">
                      <span class="button__icon button__icon--trash"></span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="flex col no-content" v-if="registeredHosts.length === 0 && !showAddHostForm">No web-application host was found for this application.</div>

          <div class="flex col android-users-form" v-if="showAddHostForm">
            <p>Select a web-application host to be <strong>added</strong> in "<strong>{{ appName }}</strong>" application, or <a class="button button-icon-txt button--bluemid" href="/admin/users/webapp">
                  <span class="button__icon button__icon--settings"></span>
                  <span class="button__label">Manage web-app hosts</span>
                </a></p>
            <div class="flex col">
              <AppSelect :label="'Select a host'" :obj="webappHostId" :list="notRegisteredHosts" :params="{key:'_id', value:'_id', optLabel: 'originUrl'}" :disabled="notRegisteredHosts.length === 0" :disabledTxt="'No web-app host was found'"></AppSelect>
              <div class="flex row">
                <button class="button button-icon-txt button--green" @click="updateWebappHosts()">
                  <span class="button__icon button__icon--apply"></span>
                  <span class="button__label">Apply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="showWebappHostsForm()" v-if="!showAddHostForm">
            <span class="button__icon button__icon--add"></span>
            <span class="button__label">Add a web-app host</span>
          </button>
          <button class="button button-icon-txt button--orange" @click="hideWebappHostsForm()" v-else>
            <span class="button__icon button__icon--back"></span>
            <span class="button__label">Back to list</span>
          </button>
        </div>
      </div>
    <!-- End FOOTER -->
    </div>
  </div>
</template>
<script>
import AppSelect from '@/components/AppSelect.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      workflowId: null,
      appName: null,
      webappHostId: {
        value: '',
        error: null,
        valid: false
      },
      showAddHostForm: false,
      webappHostsLoaded: false
    }
  },
  async mounted () {
    bus.$on('manage_webapp_hosts', async (data) => {
      this.showModal()
      this.workflowId = data.workflowId
      this.appName = data.appName
      await this.dispatchStore('getWebappHosts')

    })
  },
  computed: {
    notRegisteredHosts () {
      return this.$store.state.webappHosts.filter(host => host.applications.indexOf(this.workflowId) < 0)
    },
    registeredHosts () {
      return this.$store.getters.WEB_APP_HOST_BY_APP_ID(this.workflowId)
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
      this.hideWebappHostsForm()
    },
    closeModal () {
      this.modalVisible = false
      this.hideWebappHostsForm()
    },
    showWebappHostsForm () {
      this.showAddHostForm = true
    },
    hideWebappHostsForm () {
      this.showAddHostForm = false
    },
    async updateWebappHosts () {
      try {
       this.$options.filters.testSelectField(this.webappHostId)

        if (this.webappHostId.valid) {
          const payload = {
            applications: [this.workflowId]
          }
          const updateWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${this.webappHostId.value}/applications`, {
            method: 'put',
            data: { payload }
          })
          console.log('>', updateWebappHost)
          if(updateWebappHost.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateWebappHost.data.msg,
              timeout: false,
              redirect: false
            })
            this.hideWebappHostsForm()
            await this.dispatchStore('getWebappHosts')
          }
        }
      } catch (error) {
        console.error(error)
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async removeAppFromWebappHost (host, appId) {
      try {
        const removeAppFromWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${host._id}/applications/${appId}/remove`, {
          method: 'patch'
        })
        if (removeAppFromWebappHost.data.status === 'success'){
          bus.$emit('app_notif', {
            status: 'success',
            msg: removeAppFromWebappHost.data.msg,
            timeout: 3000,
            redirect: false
          })
          await this.dispatchStore('getWebappHosts')
          await this.dispatchStore('getApplicationWorkflows')
        } else {
          throw removeAppFromWebappHost.data.msg
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
    AppSelect
  }
}
</script>