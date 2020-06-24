<template>
  <div id="top-notif" v-if="lmLoaded && show" v-html="stateMsg" class="flex col">
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      show: false,
      stateMsg: '',
      lmLoaded: false
    }
  },
  computed: {
    brokenLm () {
      return this.$store.getters.STT_LM_ERRORS
    }
  },
  watch: {
    brokenLm (data) {
      if (data.length > 0) {
        this.show = true
        this.updateInfo(data)
      }
    }
  },
  async created () {
    await this.dispatchLM()
  },
  methods: {
    close () {
      this.show = false
    },
    async dispatchLM () {
      this.lmLoaded = await this.$options.filters.dispatchStore('getSttLanguageModels')
    },
    updateInfo (data) {
      this.stateMsg = ''
      data.map (lm => {
      this.stateMsg += `
        <div class="state-item flex row">
          Language model error: "${lm.modelId}" > ${lm.updateStatus}
        </div>
        `
      })
    }
  }
}
</script>
