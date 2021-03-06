<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible' : 'hidden'">
    <div class="modal flex col">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1 flex row">Load a flow from existing pattern</span>
        <button @click="closeModal()" class="button button-icon button--red"><span class="button__icon button__icon--close"></span></button>
      </div>
      <div class="modal-body flex1 flex col" v-if="loading">
        lOADING
      </div>
      <div class="modal-body flex1 flex col" v-if="dataLoaded">
        <span class="modal-body__content">
          Select the workflow pattern you want to use:
        </span>
        <div class="modal-body__form">
          <AppSelect :label="'Select a workflow pattern'" :obj="selectedPattern" :list="flowPatterns" :params="{key:'_id', value:'_id', optLabel: 'name'}"></AppSelect>
        </div>
      </div>
      <div class="modal-footer flex row">
        <button class="button button-txt button--grey" @click="closeModal()"><span class="button__label">Cancel</span></button>
        <button class="button button-txt button--green" @click="handleForm()"><span class="button__label">Submit</span></button>
      </div>
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
      loading: true,
      patternsLoaded: false,
      tmpPatternsLoaded: false,
      selectedPattern: {
        value: '',
        error: null,
        valid: false
      },
      workspaceId: '',
      workflow: '',
      showModal: false
    }
  },
  mounted () {
    bus.$on('load_from_pattern', async (data) => {
      await this.dispatchStore('getFlowPatterns')
      await this.dispatchStore('getTmpPattern')
      this.showModal = true
    })
  },
  computed: {
    flowPatterns () {
      return this.$store.state.flowPatterns
    },
    formValid () {
      return this.selectedPattern.valid
    },
    tmpPattern () {
      return this.$store.state.flowPatternTmp
    },
    dataLoaded () {
      return (this.patternsLoaded && this.tmpPatternsLoaded)
    }
  },
  watch: {
    tmpPattern: function (data) {
      const obj = data.filter(d => d.type === 'tab')
      this.workspaceId = obj[0].id
      
    },
    dataLoaded (data)  {
      if (data) {
        this.loading = false
      }
    }
  },
  methods: {
    closeModal () {
      this.showModal = false
    },
    handleForm () {
      this.testSelectField(this.selectedPattern)

      if (this.formValid) {
        this.sendForm()
      }
    },
    async sendForm () {
      try {
        const sendForm = await axios(`${process.env.VUE_APP_URL}/api/flow/loadpattern`, {
          method: 'put',
          data: {
            workspaceId: this.workspaceId,
            patternId: this.selectedPattern.value
          }
        })
        if(sendForm.data.status === 'success') {
          this.showModal = false
          bus.$emit('iframe_reload', {})
        } else {
          throw sendForm.data.msg
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
    testSelectField (obj) {
      this.$options.filters.testSelectField(obj)
    },
    async dispatchStore (topic) {
      try {
        const resp = await this.$options.filters.dispatchStore(topic)
        switch(topic) {
          case 'getFlowPatterns':
            this.patternsLoaded = resp
            break;
          case 'getTmpPattern':
            this.tmpPatternsLoaded = resp
            break;
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
