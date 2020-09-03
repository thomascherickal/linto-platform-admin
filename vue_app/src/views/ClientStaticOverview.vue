<template>
  <div v-if="dataLoaded">
    <h1>Clients - Static devices</h1>
    <div class="flex col" >
      <!-- Associated devices --> 
      <h2>Associated devices</h2>
      <details open class="description">
        <summary>Infos</summary>
        <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam laoreet nulla lacus, vel pellentesque augue ullamcorper sed. Curabitur scelerisque suscipit gravida. Morbi risus libero, viverra ac ipsum ornare, molestie aliquam leo. Donec quis arcu risus. Nam sit amet orci id sapien varius condimentum vitae non dolor.</span>
      </details>
      <div class="flex row">
        <table class="table" v-if="associatedStaticClients.length > 0">
          <thead>
            <tr>
              <th>Status</th>
              <th>Serial number</th>
              <th>Description</th>
              <th>Deployed workflow</th>
              <th>Services parameters</th>
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
                <a class="client-status__link" :href="`/admin/clients/static/${client.sn}/monitoring`"> more...</a>
              </td>
              <td class="center">
                <strong class="button__label">{{ client.sn }}</strong>
                
                <button class="button button-icon button--bluemid button--with-desc bottom" data-desc="Use an other serial number" @click="updateEnrolledStaticDevice(client.sn, client.associated_workflow)">
                  <span class="button__icon button__icon--settings"></span>
                </button>
              </td>
              <td class="table--desc">{{ !!workflowByClients[client._id].description && workflowByClients[client._id].description.length > 0 ? workflowByClients[client._id].description : 'No description.'}}</td>
              <td>
                <a :href="`/admin/clients/static/workflow/${client.associated_workflow._id}`" class="button button-icon-txt button--bluemid button--with-desc bottom" data-desc="Edit on Node-red interface">
                  <span class="button__icon button__icon--workflow"></span>
                  <span class="button__label">{{ client.associated_workflow.name }}</span>
                </a>
              </td>
              <td class="center">
                <button class="button button-icon-txt button--blue button--with-desc bottom" data-desc="Edit services settings" @click="updateWorkflowServicesSettings(client.sn, client.associated_workflow)">
                  <span class="button__icon button__icon--settings"></span>
                  <span class="button__label">Edit</span>
                </button>
              </td>
              <td class="center">
                <button class="button button-icon button--red button--with-desc bottom" data-desc="Unassociate device and delete workflow" @click="dissociateStaticDevice(client.sn, client.associated_workflow)">
                  <span class="button__icon button__icon--close"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="no-content" v-else>No associated static device were found.</div>
      </div>
      <div class="divider"></div>
      <!-- Provisionning --> 
      <h2>Provisionning</h2>
      <details open class="description">
        <summary>Infos</summary>
        <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam laoreet nulla lacus, vel pellentesque augue ullamcorper sed. Curabitur scelerisque suscipit gravida. Morbi risus libero, viverra ac ipsum ornare, molestie aliquam leo. Donec quis arcu risus. Nam sit amet orci id sapien varius condimentum vitae non dolor.</span>
      </details>
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
                <a :href="`/admin/clients/static/${client.sn}/deploy`" class="button button-icon-txt button--green" @click="deployDevice(client.sn)">
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
        <div class="no-content" v-else>No unassociated static device were found.</div>
      </div>
      <div class="divider"></div>
      <div class="flex row">
        <button class="button button-icon-txt button--green" @click="addStaticDevice()">
          <span class="button__icon button__icon--add"></span>
          <span class="button__label">Add a static device</span>
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
    // Update serial number static device associated to a workflow
    updateEnrolledStaticDevice (sn, workflow) {
      bus.$emit('update_enrolled_static_device', {sn, workflow})
    },
    // Deploy an unassociated device
    deployDevice (sn) {
      bus.$emit('deploy_static_device', {sn})
    },
    // Updat a static workflow settings (mqtt, stt, nlu...)
    updateWorkflowServicesSettings (sn, workflow) {
      bus.$emit('update_workflow_services', {sn, workflow, type: 'static'})
    },
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