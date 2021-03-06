<template>
  <div class="flex col">
    <div v-if="loading">
      LOADING
    </div>
    <div v-if="dataLoaded">
      <h1>Contexts overview</h1>
      <details open class="description">
        <summary>Infos</summary>
        <span class="description">LinTO admin enables you to manage application contexts created and registered in your information system. You can create a new context or manage existing context workflows.<br/>
        For more informations please read the <a href="https://doc.linto.ai/" target="_blank">documentation</a>.</span>
      </details>
      
      <div class="block block--transparent" v-if="fleetContexts.length > 0">
        <h2>Fleet contexts</h2>
        <div class="flex row">
          <table class="table table--full">
            <thead>
              <tr>
                <th>Context name</th>
                <th>Type</th>
                <th>Associated LinTO</th>
                <th>Last update</th>
                <th>Worfklow</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="context in fleetContexts" :key="context._id">
                <td class="important">{{ context.name }}</td>
                <td>{{ context.type }}</td>
                <td>{{ context.associated_linto }}</td>
                <td>{{ context.updated_date }}</td>
                <td>
                  <a
                    class="button button-icon-txt button--bluemid"
                    :href="'/admin/context/workflow/' + context._id"
                  >
                    <span class="button__icon button__icon--workflow"></span>
                    <span class="button__label">Workflow</span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="block block--transparent">
          <a class="button button-txt button--green" href="/admin/context/create">
            <span class="button__label">Create a new context</span>
          </a>
        </div>
      </div>
      <div v-else>
        There is no context created...
      </div>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  data () {
    return {
      loading: true,
      contextLoaded: false,
    }
  },
  created () {
    this.dispatchFleetContext()
  },
  computed: {
    fleetContexts () {
      return this.$store.state.contextFleet
    },
    dataLoaded () {
      return this.contextLoaded
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    }
  },
  methods: {
    async dispatchFleetContext () {
      try {
        this.contextLoaded = await this.$options.filters.dispatchStore('getFleetContexts')
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
