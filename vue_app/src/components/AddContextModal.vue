<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible' : 'hidden'">
    <div class="modal flex col" >
      <div class="modal-header flex row" v-if="dataLoaded">
        <span class="modal-header__tilte flex1 flex row">Creating a new context</span>
        <button @click="closeModal()" class="button button__icon button--red"><span class="button__icon button__icon--close"></span></button>
      </div>
      <div class="modal-body flex1 flex col">
        <ul class="deploy-status">
            <li
              class="deploy-status--item"
              :class="[
                linto.updating ? 'deploy-status--item__updating' : '',
                linto.updated ? 'deploy-status--item__valid' : '',
                linto.error ? 'deploy-status--item__error' : '',
              ]"
            >
              <span class="icon"></span>
              <span class="label">Linto : {{ linto.msg }}</span>
            </li>
            <li
              class="deploy-status--item"
              :class="[
                workflow.updating ? 'deploy-status--item__updating' : '',
                workflow.updated ? 'deploy-status--item__valid' : '',
                workflow.error ? 'deploy-status--item__error' : '',
              ]"
            >
              <span class="icon"></span>
              <span class="label">Workflow :{{ workflow.msg }}</span>
            </li>
            <li
              class="deploy-status--item"
              :class="[
                context.updating ? 'deploy-status--item__updating' : '',
                context.updated ? 'deploy-status--item__valid' : '',
                context.error ? 'deploy-status--item__error' : '',
              ]"
            >
              <span class="icon"></span>
              <span class="label">Context : {{ context.msg }}</span>
            </li>
            <li
              class="deploy-status--item"
              :class="[
                nlu.updating ? 'deploy-status--item__updating' : '',
                nlu.updated ? 'deploy-status--item__valid' : '',
                nlu.error ? 'deploy-status--item__error' : '',
              ]"
              v-if="contextPayload.nlu.service_name === 'tock'"
            >
              <span class="icon"></span>
              <span class="label">NLU : {{ nlu.msg }}</span>
          </li>
          <li
              class="deploy-status--item"
              :class="[
                stt.updating ? 'deploy-status--item__updating' : '',
                stt.updated ? 'deploy-status--item__valid' : '',
                stt.error ? 'deploy-status--item__error' : '',
              ]"
            >
              <span class="icon"></span>
              <span class="label">stt : {{ stt.msg }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      loading: true,
      showModal: false,
      contextPayload: {
        context_name: null,
        type: null,
        workflowPattern: null,
        mqtt: null,
        stt: {
          service_name: null,
        },
        nlu: {
          service_name: null,
          configs: {
            host: null,
            namespace: 'app'
          }
        },
        linto: null,
        language: null
      },
      linto : {
        updating: false,
        updated: false,
        done: false,
        error: false,
        msg: 'Updating associated linto...'
      },
      workflow: {
        updating: false,
        updated: false,
        done: false,
        error: false,
        msg: 'Updating context worfklow...'
      },
      context: {
        updating: false,
        updated: false,
        done: false,
        error: false,
        msg: 'Creating context...'
      },
      nlu: {
        updating: false,
        updated: false,
        done: false,
        error: false,
        msg: 'Sending informations to NLU service...'
      },
      stt: {
        updating: false,
        updated: false,
        done: false,
        error: false,
        msg: 'Sending informations to STT service...'
      },
      flowId: null,
      dataLoaded: false
    }
  },
  computed: {
    createContextSuccess () {
      return (this.linto.done && this.workflow.done && this.context.done && this.nlu.done && this.stt.done)
    }
  },
  mounted () {
    bus.$on('add_context_modal', async (data) => {
      this.showModal = true
      this.contextPayload = data.payload
      this.dataLoaded = true
      this.createContext()
    })
  },
  watch: {
    createContextSuccess (data) {
      if (data) {
        this.closeModal()
        bus.$emit('create_context_success', { context: this.context })
      }
    }
  },
  methods: {
    closeModal () {
      this.showModal = false
    },
    async createContext () {
      // updateLinto
      const updateLinto = await this.updateLinto()
      if (updateLinto) {
        // post BLS
        setTimeout(async () => {
          const postbls = await this.postFlowOnBLS()
          if (postbls && this.flowId !== null) {
           // post context
           setTimeout(async () => {
            const postContext = await this.postContext()
            if (postContext) {
              setTimeout(async () => {
                // Nlu lexical seeding
                if (this.contextPayload.nlu.service_name === 'tock') {
                  const nluLexicalSeeding = await this.nluLexicalSeeding()
                }
                // Stt lexical seeding
                const sttLexicalSeeding = await this.sttLexicalSeeding()
              }, 1500)
            }
           }, 1500)
          }
        }, 1500)
      }
    },
    async updateLinto () {
      try {
        this.linto.updating = true
        const updateLinto = await axios(`${process.env.VUE_APP_URL}/api/lintos/fleet/${this.contextPayload.linto}`, {
          method: 'put',
          data: {payload: this.contextPayload}
        })
        this.linto.msg = updateLinto.data.msg
        if (updateLinto.data.status === 'success') {
          this.linto.updating = false
          this.linto.updated = true
          this.linto.done = true
          return true
        } else {
          throw 'error on udpating LinTO'
        }  
      } catch (error) {
        console.error(error)
        this.linto.updating = false
        this.linto.updated = false
        this.linto.done = false
        this.linto.error = true
        return false
      }
    },
    async postFlowOnBLS () {
      try {
        this.workflow.updating = true
        const postbls =  await axios(`${process.env.VUE_APP_URL}/api/flow/postbls`, {
          method: 'post',
          data: {payload: this.contextPayload}
        })
        this.workflow.msg = postbls.data.msg
        if (postbls.data.status === 'success') {
        this.workflow.updating = false
          this.workflow.updated = true
          this.workflow.done = true
          this.flowId = postbls.data.flowId
          return true
        } else {
          throw 'error on posting workflow on business logic server'
        }  
      } catch (error) {
        console.error(error)
        this.workflow.updating = false
        this.workflow.updated = false
        this.workflow.done = false
        this.workflow.error = true
        return false
      }
    },
    async postContext () {
      try {
        this.context.updating = true
        const postContext =  await axios(`${process.env.VUE_APP_URL}/api/context`, {
          method: 'post',
          data: {
            payload: this.contextPayload,
            flowId: this.flowId
          }
        })
        this.context.msg = postContext.data.msg
        if(postContext.data.status === 'success') {
        this.context.updating = false
          this.context.updated = true
          this.context.done = true
          return true
        } else {
          throw 'error on posting new context'
        }  
      } catch (error) {
        console.error(error)
        this.context.updating = false
        this.context.updated = false
        this.context.done = false
        this.context.error = true
        return false
      }
    },
    async nluLexicalSeeding() {
      try {
        this.nlu.updating = true
        const nluSeeding =  await axios(`${process.env.VUE_APP_URL}/api/tock/lexicalseeding`, {
          method: 'post',
          data: {
            flowId: this.flowId
          }
        })

        this.nlu.msg = nluSeeding.data.msg
        if(nluSeeding.data.status === 'success') {
        this.nlu.updating = false
          this.nlu.updated = true
          this.nlu.done = true
          return true
        } else {
          throw 'error on NLU lexical seeding'
        }  
      } catch (error) {
        console.error(error)
        this.nlu.updating = false
        this.nlu.updated = false
        this.nlu.done = false
        this.nlu.error = true
        return false
      }
    },
    async sttLexicalSeeding () {

      try {
        this.stt.updating = true
        const sttSeeding = await axios(`${process.env.VUE_APP_URL}/api/stt/lexicalseeding`, {
          method: 'post',
          data: {
            flowId: this.flowId,
            service_name: this.contextPayload.stt.service_name
          }
        })
        this.stt.msg = sttSeeding.data.msg
        if(sttSeeding.data.status === 'success') {
        this.stt.updating = false
          this.stt.updated = true
          this.stt.done = true
          return true
        } else {
          throw 'error on STT lexical seeding'
        }
      } catch (error) {
        console.error(error)
        this.stt.updating = false
        this.stt.updated = false
        this.stt.done = false
        this.stt.error = true
        return false
      }
    }
  }
}
</script>
