<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded && user !== null">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Edit android user - {{ user.email }}</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          <div class="flex row" v-if="addAppFormVisible">
            <button class="button button-icon-txt button--orange" @click="hideAddAppForm()">
              <span class="button__icon button__icon--back"></span>
              <span class="button__label">Back to user infos</span>
            </button>
          </div>
          <div class="flex col" v-if="!addAppFormVisible">
            <span class="subtitle" v-if="user.applications.length > 0">Applications</span>
            <div class="flex row"  v-if="user.applications.length > 0">
              <table class="table">
                <thead>
                  <tr>
                    <th>Application name</th>
                    <th>Dissociate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="app in user.applications" :key="app">
                    <td>{{ workflowByName[app] }}</td>
                    <td class="center"><button class="button button-icon button--red" @click="removeUserFromApp(user, app)">
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
            <p>Please select android applications to <strong>associate</strong> with user "<strong>{{ user.email }}</strong>"</p>
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
              <button class="button button-icon-txt button--green" @click="addAppToUser()">
                <span class="button__icon button__icon--apply"></span>
                <span class="button__label">Associate applications</span>
              </button>
            </div>
          </div>
        </div>
        
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-left">
          <button class="button button-icon-txt button--grey" @click="closeModal()">
            <span class="button__icon button__icon--cancel"></span>
            <span class="button__label">Cancel</span>
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
export default {
  data () {
    return {
      modalVisible: false,
      userId: null,
      selectedApps: [],
      addAppFormVisible: false,
      applicationWorkflowsLoaded: false,
      androidUsersLoaded: false
    }
  },
  async mounted () {
    bus.$on('edit_android_user', async (data) => {
      this.showModal()
      await this.dispatchStore('getAndroidUsers')
      await this.dispatchStore('getApplicationWorkflows')
      this.userId = data.user._id
    })
  },
  computed: {
    dataLoaded () {
      return this.applicationWorkflowsLoaded && this.androidUsersLoaded
    },
    workflowByName () {
      return this.$store.getters.APP_WORKFLOWS_NAME_BY_ID
    },
    applicationWorkflows () {
      return this.$store.state.applicationWorkflows
    },
    filteredApplicationWorkflows () {
      const userWorkflows = this.user.applications
      if (userWorkflows.length > 0) {
        return this.applicationWorkflows.filter(wf => userWorkflows.indexOf(wf._id) < 0)
      } else {
        return this.applicationWorkflows
      }
    },
    user () {
      if(this.userId !== null) {
        return this.$store.getters.ANDROID_USER_BY_ID(this.userId)
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
    async addAppToUser () {
      try {
        if (this.selectedApps.length > 0) {
          const payload = {
            applications: this.selectedApps
          }
          const updateUser = await axios(`${process.env.VUE_APP_URL}/api/androidusers/${this.user._id}/applications`, {
            method: 'put',
            data: { payload }
          })
          if (updateUser.data.status === 'success') {
            this.hideAddAppForm()
            await this.dispatchStore('getAndroidUsers')
            await this.dispatchStore('getApplicationWorkflows')
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateUser.data.msg,
              timeout: 3000,
              redirect: false
            })
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
    async removeUserFromApp (user, appId) {
      try {
        const removeUserFromApp = await axios(`${process.env.VUE_APP_URL}/api/androidusers/${user._id}/applications/${appId}/remove`, {
          method: 'patch'
        })
        if (removeUserFromApp.data.status === 'success'){
          bus.$emit('app_notif', {
            status: 'success',
            msg: removeUserFromApp.data.msg,
            timeout: 3000,
            redirect: false
          })
          await this.dispatchStore('getAndroidUsers')
          await this.dispatchStore('getApplicationWorkflows')
        } else {
          throw removeUserFromApp.data.msg
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
          case 'getApplicationWorkflows':
            this.applicationWorkflowsLoaded = dispatchSuccess
            break
          case 'getAndroidUsers':
            this.androidUsersLoaded = dispatchSuccess
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