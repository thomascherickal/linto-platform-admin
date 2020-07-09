<template>
  <div class="flex col">
    <div class="flex col" v-if="loading">
      Loading
    </div>
    <div class="flex col" v-if="dataLoaded">
      <h1>Clients - Static devices</h1>

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
              <th>Deployed workflow</th>
              <th>Services parameters</th>
              <th></th>
              
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
                <a class="client-status__link" href="#"> more...</a>
              </td>
              <td class="center">
                <strong class="button__label">{{ client.sn }}</strong>
                <button class="button button-icon button--bluemid button--with-desc bottom" data-desc="Use an other serial number" @click="updateEnrolledStaticDevice(client.sn, client.associated_workflow)">
                  <span class="button__icon button__icon--settings"></span>
                </button>
              </td>
              <td>
                <a :href="`/admin/clients/static/workflow/${client.associated_workflow._id}`" class="button button-icon-txt button--bluemid button--with-desc bottom" data-desc="Edit on Node-red interface">
                  <span class="button__icon button__icon--workflow"></span>
                  <span class="button__label">{{ client.associated_workflow.name }}</span>
                </a>
              </td>
              <td class="center">
                <button class="button button-icon-txt button--green button--with-desc bottom" data-desc="Edit services settings" @click="updateWorkflowSericesSettings(client.sn, client.associated_workflow)">
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
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      staticClientsLoaded: false 
    }
  },
  async mounted () {
    await this.dispatchStaticClients()

    bus.$on('delete_static_device_success', async (data) => {
        await this.dispatchStaticClients()
    })
    bus.$on('update_enrolled_static_device_success', async (data) => {
        await this.dispatchStaticClients()
    })

    bus.$on('update_workflow_services_success', async (data) => {
      await this.dispatchStaticClients()
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
    dataLoaded () {
      return this.staticClientsLoaded === true
    },
    loading () {
      return this.dataLoaded === false
    }
  },
  methods: {
    async updateEnrolledStaticDevice (sn, workflow) {
      bus.$emit('update_enrolled_static_device', {sn, workflow})
    },
    // Deploy an unassociated device
    async deployDevice (sn) {
      bus.$emit('deploy_static_device', {sn})
    },
    async updateWorkflowSericesSettings (sn, workflow) {
      bus.$emit('update_workflow_services', {sn, workflow})
    },
    // Delete a device in provisionning list 
    async deleteStaticDevice (sn) {
      bus.$emit('delete_static_device', {sn})
    },
    // Dissociate device from a workflow and remove workflow
    async dissociateStaticDevice (sn, workflow){
      bus.$emit('dissociate_static_device', {sn , workflow})
      
    },
    // Get static clients from store
    async dispatchStaticClients () {
      const dispatchStaticClients = await this.dispatchStore('getStaticClients')
      if (dispatchStaticClients.status === 'success') {
        this.staticClientsLoaded = true
      }
    },
    // Execute actions from store by topic
    async dispatchStore (topic) {
      try {
        return await this.$options.filters.dispatchStore(topic)
      } catch (error) {
        console.error(error)
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