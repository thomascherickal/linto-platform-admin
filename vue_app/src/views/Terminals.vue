<template>
  <div v-if="dataLoaded">
    <h1>Devices</h1>
    <div class="flex col" >
      <!-- Associated devices --> 
      <h2>Associated devices</h2>
      <div class="flex row">
        <table class="table" v-if="associatedStaticClients.length > 0">
          <thead>
            <tr>
              <th>Status</th>
              <th>Serial number</th>
              <th>Deployed workflow</th>
              <th>Dissociate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in associatedStaticClients" :key="client._id">
              <td class="center status">
                <span 
                  class="icon icon--status"
                  :class="client.connexion"
                  :data-label="client.connexion === 'online' ? 'up since ' + client.last_up : 'down since ' + client.last_down"
                ></span>
                <a class="client-status__link" :href="`/admin/applications/mono/${client.sn}/monitoring`"> more...</a>
              </td>
              <td>
                <strong class="button__label">{{ client.sn }}</strong>
              </td>
              <td>
                <a :href="`/admin/applications/mono/workflow/${client.associated_workflow._id}`" class="button button-icon-txt button--bluemid button--with-desc bottom" data-desc="Edit on Node-red interface">
                  <span class="button__icon button__icon--workflow"></span>
                  <span class="button__label">{{ client.associated_workflow.name }}</span>
                </a>
              </td>
              <td class="center">
                <button class="button button-icon button--red button--with-desc bottom" data-desc="Dissociate device and delete workflow" @click="dissociateStaticDevice(client.sn, client.associated_workflow)">
                  <span class="button__icon button__icon--close"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="no-content" v-else>No associated device was found.</div>
      </div>
      <div class="divider"></div>
      <!-- Provisionning --> 
      <h2>Provisionning</h2>
      <div class="flex row">
        <table class="table table" v-if="provisionning.length > 0">
          <thead>
            <tr>
              <th>Serial number</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in provisionning" :key="client._id">
              <td><strong>{{ client.sn }}</strong></td>
              <td>
                <a :href="`/admin/applications/mono/deploy/${client.sn}`" class="button button-icon-txt button--green">
                  <span class="button__icon button__icon--deploy"></span>
                  <span class="button__label">Deploy</span>
                </a>
              </td>
              <td>
                <button class="button button-icon button--red" @click="deleteStaticDevice(client.sn)">
                  <span class="button__icon button__icon--delete"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="no-content" v-else>No available device was found.</div>
      </div>
      <div class="divider"></div>
      <div class="flex row">
        <button class="button button-icon-txt button--green" @click="addStaticDevice()">
          <span class="button__icon button__icon--add"></span>
          <span class="button__label">Add a device</span>
        </button>
      </div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      staticClientsLoaded: false,
      staticWorkflowsLoaded: false
    }
  },
  async created () {
    // Request store
    await this.refreshStore()
  },
  async mounted () {
    // Events
    bus.$on('delete_static_device_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('update_enrolled_static_device_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('update_workflow_services_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('dissociate_static_device_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('add_static_device_success', async (data) => {
      await this.refreshStore()
    })

    setTimeout(() => {
      console.log('>', this.staticClients)
    }, 1000);
  },
  computed: {
    staticClients () {
      return this.$store.state.staticClients
    },
    associatedStaticClients () {
      return this.staticClients.filter(sc => sc.associated_workflow !== null)
    },
    provisionning () {
      return this.staticClients.filter(sc => sc.associated_workflow === null)
    },
    workflowByClients () {
      return this.$store.getters.STATIC_WORKFLOWS_BY_CLIENTS
    },
    dataLoaded () {
      return this.staticClientsLoaded && this.staticWorkflowsLoaded
    }
  },
  methods: {
    // Delete a device in provisionning list 
    deleteStaticDevice (sn) {
      bus.$emit('delete_static_device', {sn})
    },
    // Dissociate device from a workflow and remove workflow
    dissociateStaticDevice (sn, workflow){
      bus.$emit('dissociate_static_device', {sn , workflow})
    },
    // Add a static device
    addStaticDevice () {
      bus.$emit('add_static_device', {})
    },
    async refreshStore () {
      try {
        await this.dispatchStore('getStaticClients')
        await this.dispatchStore('getStaticWorkflows')
      } catch (error) {
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
          case 'getStaticClients':
            this.staticClientsLoaded = dispatchSuccess
            break
          case 'getStaticWorkflows':
            this.staticWorkflowsLoaded = dispatchSuccess
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