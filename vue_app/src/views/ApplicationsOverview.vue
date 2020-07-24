<template>
  <div class="flex col">
    <h1>Clients - Applications</h1>
    <h2>Deployed applications</h2>
    <details open class="description">
      <summary>Infos</summary>
      <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam laoreet nulla lacus, vel pellentesque augue ullamcorper sed. Curabitur scelerisque suscipit gravida. Morbi risus libero, viverra ac ipsum ornare, molestie aliquam leo. Donec quis arcu risus. Nam sit amet orci id sapien varius condimentum vitae non dolor.</span>
    </details>
    <div class="flex row">
      <table class="table" v-if="applicationWorkflows.length > 0">
        <thead>
          <tr>
            <th>Application Name</th>
            <th>Android app</th>
            <th>Web app</th>
            <th>Deployed workflow</th>
            <th>Services Parameters</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applicationWorkflows" :key="app._id">
            <td>{{ app.name }}</td>
            <td>
              <button class="button button-icon-txt button--bluemid" @click="manageAndroidUsers(app._id,  app.name)">
                <span class="button__icon button__icon--android"></span>
                <span class="button__label">Users ({{ !!usersByApps[app._id] ? usersByApps[app._id].length : 0 }})</span>
              </button>
            </td>
            <td>todo</td>
            <td>
              <a :href="`/admin/clients/application/workflow/${app.flowId}`" class="button button-icon-txt button--bluemid button--with-desc bottom" data-desc="Edit on Node-red interface">
                <span class="button__icon button__icon--workflow"></span>
                <span class="button__label">{{ app.name }}</span>
              </a>
            </td>
            <td class="center">
              <button class="button button-icon-txt button--green button--with-desc bottom" data-desc="Edit services settings">
                <span class="button__icon button__icon--settings"></span>
                <span class="button__label">Edit</span>
              </button>
            </td>
            <td class="center">
                <button class="button button-icon button--red button--with-desc bottom" data-desc="Unassociate device and delete workflow" >
                  <span class="button__icon button__icon--close"></span>
                </button>
              </td>
          </tr>
        </tbody>
      </table>
      <div class="no-content" v-else>No application workflow was found.</div>
    </div>
    <div class="divider"></div>
    <div class="flex row">
      <a href="/admin/workflows/application/create" class="button button-icon-txt button--green">
        <span class="button__icon button__icon--add"></span>
        <span class="button__label">Create an application</span>
      </a>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      applicationWorkflowsLoaded: false,
      androidUsersLoaded: false
    }
  },
  async mounted () {
    await this.dispatchStore('getApplicationWorkflows')
    await this.dispatchStore('getAndroidUsers')

    bus.$on('manage_android_users_success', async (data) => {
      await this.dispatchStore('getAndroidUsers')
    })
  },
  computed: {
    dataLoaded () {
      return this.applicationWorkflowsLoaded && this.androidUsersLoaded
    },
    applicationWorkflows () {
      return this.$store.state.applicationWorkflows
    },
    androidUsers () {
      return this.$store.state.androidUsers
    },
    usersByApps () {
      return this.$store.getters.ANDROID_USERS_BY_APPS
    }
  },
  methods: {
    async manageAndroidUsers (workflowId, appName) {
      bus.$emit('manage_android_users', { workflowId, appName })
      
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
  }
}
</script>