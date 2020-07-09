<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Delete static device - {{ sn }}</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
            Are you sure that you want to <strong>dissociate</strong> the static device with serial number "<strong>{{ sn }}</strong>" from the workflow "<strong>{{workflow.name }}</strong>" ?
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
          <button class="button button-icon-txt button--red" @click="dissociateStaticDevice(sn, workflow)">
            <span class="button__icon button__icon--delete"></span>
            <span class="button__label">Delete</span>
          </button>
        </div>
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
      modalVisible: false,
      sn: null,
      workflow: null
    }
  },
  mounted () {
    bus.$on('dissociate_static_device', (data) => {
      this.sn = data.sn
      this.workflow = data.workflow
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
    async dissociateStaticDevice (sn, workflow) {
      try {
        const payload = {
          sn
        }
        const dissociateStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/workflows/static/${workflow._id}`, {
          method: 'delete',
          data: { payload }
        })
        console.log(dissociateStaticDevice)
        // Todo : vérif de la route API et traitement de la réponse
      } catch (error) {
        
      }
    }
  }
}
</script>