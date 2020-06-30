<template>
  <div class="modal-wrapper flex col" :class="showModal ? 'visible' : 'hidden'">
    <div v-if="loading">Loading</div>
    <div class="modal flex col" v-if="dataLoaded">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1 flex row">Add a LinTO device</span>
        <button @click="closeModal()" class="button button__icon button--red"><span class="button__icon button__icon--close"></span></button>

      </div>
      <div class="modal-body flex1 flex col">
        <span class="modal-body__content">
          Add a new LinTO device by registering its serial number:
        </span>
        <div class="modal-body__form">
          <AppInput :label="'Serial number'" :obj="serialNumber" :test="'testSn'" :lintos="lintos"></AppInput>
        </div>
      </div>
      <div class="modal-footer flex row">
        <button class="button button--grey" @click="closeModal()"><span class="button__label">Cancel</span></button>
        <button class="button button--green" @click="handleForm()"><span class="button__label">Submit</span></button>
      </div>
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      loading: true,
      lintosLoaded: false,
      serialNumber: {
        value: '',
        error: null,
        valid: false
      },
      showModal: false
    }
  },
  computed: {
    lintos () {
      return this.$store.state.lintoFleet
    },
    formValid () {
      return this.serialNumber.valid
    },
    dataLoaded () {
      return this.lintosLoaded
    }
  },
  watch: {
    dataLoaded (data) {
      if (data) {
        this.loading = false
      }
    }
  },
  mounted () {
    bus.$on('add_linto_modal', async (data) => {
      await this.dispatchLintos()
      this.showModal = true
    })
  },
  methods: {
    closeModal () {
      this.showModal = false
    },
    handleForm () {
      this.testSerialNumber()
      if (this.formValid) {
        this.sendForm()
      }
    },
    async testSerialNumber () {
      await this.dispatchLintos()
      this.$options.filters.testName(this.serialNumber)
      this.$options.filters.testSerialNumber(this.serialNumber)
    },
    async sendForm () {
      try {
        const addLinto = await axios(`
        ${process.env.VUE_APP_URL}/api/lintos/fleet`, {
          method: 'post',
          data: { sn: this.serialNumber.value }
        })
        if (addLinto.data.status === 'success') {
          await this.dispatchLintos()
          this.closeModal()
            bus.$emit('app_notif', {
            status: addLinto.data.status,
            msg: addLinto.data.msg,
            timeout: 4000
          })
        } else {
          throw addLinto.data.msg
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
    async dispatchLintos () {
      try {
        this.lintosLoaded = await this.$options.filters.dispatchStore('getLintoFleet')
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
    AppInput
  }
}
</script>
