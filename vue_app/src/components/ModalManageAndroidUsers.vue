<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Manage Android users - "{{ appName }}"</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          
          <p v-if="androidRegisteredUsers.length > 0 && !showAddUserForm"> List of <strong>users</strong> registered in "<strong>{{ appName }}</strong>" android application.</p>

          <div class="flex row" v-if="androidRegisteredUsers.length > 0 && !showAddUserForm">
            <table class="table">
              <thead>
                <tr>
                  <th colspan="2">User</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in androidRegisteredUsers" :key="user._id">
                  <td>{{ user.email }}</td>
                  <td>
                    <button class="button button-icon button--red" @click="removeUserFromApp(user, workflowId)">
                      <span class="button__icon button__icon--trash"></span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="flex col no-content" v-if="androidRegisteredUsers.length === 0 && !showAddUserForm">No android user was found for application.</div>

          <div class="flex col android-users-form" v-if="showAddUserForm">
            <p>Select an user to be added in "{{ appName }}" application, or <a class="button button-icon-txt button--bluemid" href="/admin/users/android">
                  <span class="button__icon button__icon--settings"></span>
                  <span class="button__label">Manage android users</span>
                </a></p>
            <div class="flex col">
              <AppSelect :label="'Select an user'" :obj="userId" :list="androidNotRegisteredUsers" :params="{key:'_id', value:'_id', optLabel: 'email'}" :disabled="androidNotRegisteredUsers.length === 0" :disabledTxt="'No android user was found'"></AppSelect>
              <div class="flex row">
                <button class="button button-icon-txt button--green" @click="updateAndroidUser()">
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
        <div class="flex flex1 modal-footer-left">
          <button class="button button-icon-txt button--grey" @click="closeModal()">
            <span class="button__icon button__icon--cancel"></span>
            <span class="button__label">Cancel</span>
          </button>
        </div>
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="showAndroidUsersForm()" v-if="!showAddUserForm">
            <span class="button__icon button__icon--add"></span>
            <span class="button__label">Add an user</span>
          </button>
          <button class="button button-icon-txt button--green" @click="hideAndroidUsersForm()" v-else>
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
      userId: {
        value: '',
        error: null,
        valid: false
      },
     showAddUserForm: false,
     androidUsersLoaded: false
    }
  },
  async mounted () {
    bus.$on('manage_android_users', (data) => {
      this.showModal()
      this.workflowId = data.workflowId
      this.appName = data.appName
    })
    await this.dispatchStore('getAndroidUsers')    
  },
  computed: {
    androidNotRegisteredUsers () {
      return this.$store.state.androidUsers.filter(user => user.applications.indexOf(this.workflowId) < 0)
    },
    androidRegisteredUsers () {
      return this.$store.getters.ANDROID_USERS_BY_APP_ID(this.workflowId)
    },
    
  },
  methods: {
    showModal () {
      this.modalVisible = true
      this.hideAndroidUsersForm()
    },
    closeModal () {
      this.modalVisible = false
      this.hideAndroidUsersForm()
    },
    showAndroidUsersForm () {
      this.showAddUserForm = true
    },
    hideAndroidUsersForm () {
      this.showAddUserForm = false
    },
    async updateAndroidUser () {
      this.$options.filters.testSelectField(this.userId)
      
      try {
        if (this.userId.valid) {
          const payload = {
            applications: [this.workflowId]
          }
          const updateUser = await axios(`${process.env.VUE_APP_URL}/api/androidusers/${this.userId.value}/applications`, {
            method: 'put',
            data: { payload }
          })
          if(updateUser.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateUser.data.msg,
              timeout: false,
              redirect: false
            })
            this.hideAndroidUsersForm()
            await this.dispatchStore('getAndroidUsers')
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
    AppSelect
  }
}
</script>