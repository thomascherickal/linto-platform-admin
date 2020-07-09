<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Load a workflow from template</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
      
          <AppSelect :label="'Select a workflow template type'" :obj="workflowTemplateType" :list="workflowAvailbleTypes" :params="{key:'index', value:'type', optLabel: 'type'}"></AppSelect>

          <AppSelect :label="'Select a workflow template'" :obj="workflowTemplateName" :list="filteredWorkflowTemplates" :params="{key:'_id', value:'name', optLabel: 'name'}" :disabled="noTypeSelected" :disabledTxt="'You must select a workflow type'"></AppSelect>
          
        </div>
      </div>
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-left">
          <button class="button button-icon-txt button--grey" @click="closeModal()">
            <span class="button__icon button__icon--cancel"></span>
            <span class="button__label">Cancel</span>
          </button>
        </div>
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="loadFromTemplate()">
            <span class="button__icon button__icon--apply"></span>
            <span class="button__label">Apply</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AppSelect from '@/components/AppSelect.vue'
import AppInput from '@/components/AppInput.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      noderedFlowId: null,
      workflowId: null,
      workflowTemplatesLoaded: false,
      workflowTemplateType: {
        value: '',
        error: null,
        valid: false
      },
      workflowTemplateName: {
        value: '',
        error: null,
        valid: false
      }
    }
  },
  computed: {
    dataLoaded () {
      return this.workflowTemplatesLoaded
    },
    allTemplates () {
      return this.$store.state.workflowsTemplates
    },
    workflowAvailbleTypes () {
      let types = []
      let rawTypes = []
      let index = 0
      if (this.allTemplates.length > 0) {
        this.allTemplates.map(template => {
          if (rawTypes.indexOf(template.type) < 0) {
            rawTypes.push(template.type)
            types.push({
              index,
              type: template.type
            })
            index++
          }
        })
      }
      return types
    },
    noTypeSelected () {
      return this.workflowTemplateType.value === ''
    },
    filteredWorkflowTemplates () {
      if (!this.noTypeSelected) {
        return this.allTemplates.filter(t => t.type === this.workflowTemplateType.value)
      }
    },
    formValid () {
      return this.workflowTemplateType.valid && this.workflowTemplateName.valid
    }
  },
  async mounted () {
    bus.$on('load_from_workflow_template', async (data) => {
      console.log(data)
      this.workflowId = data.payload.workflowId
      this.noderedFlowId = data.payload.noderedFlowId
      await this.dispatchWorkflowTempaltes()
      this.showModal()
    })
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async loadFromTemplate () {
      try {
        this.$options.filters.testSelectField(this.workflowTemplateName)
        this.$options.filters.testSelectField(this.workflowTemplateType)

        if (this.formValid) {
          const payload = {
            workflowId: this.workflowId,
            noderedFlowId: this.noderedFlowId,
            workflowTemplateName: this.workflowTemplateName.value
          }
          const loadTemplate = await axios(`${process.env.VUE_APP_URL}/api/workflows/static/${this.workflowId}/loadtemplate`, {
            method: 'put',
            data: {payload}
          })
          console.log(loadTemplate)
        }
        
      } catch (error) {
          this.closeModal()
          bus.$emit('app_notif', {
            status: 'error',
            msg: 'Error on loading workflow template',
            timeout: false,
            redirect: false
          })
      }
    },
    async dispatchWorkflowTempaltes () {
      const dispatchWorkflowTempaltes = await this.$options.filters.dispatchStore('getWorkflowsTemplates')
      if (dispatchWorkflowTempaltes.status === 'success') {
        this.workflowTemplatesLoaded = true
      } 
    }
  },
  components: {
    AppInput,
    AppSelect
  }
}
</script>