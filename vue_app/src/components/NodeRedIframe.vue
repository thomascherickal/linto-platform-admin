<template>
  <div
    id="iframe-container"
    :class="fullScreen ? 'iframe--fullscreen' : 'iframe--default'"
    class="flex1 flex col"
  >
    <div class="iframe__controls flex row">
      <div class="flex1 flex row iframe__controls-left">
        <button
          class="button button-icon button--with-desc  button--blue"
          :class="fullScreen ? 'enabled' : 'disabled'"
          @click="toggleFullScreen()"
          :data-desc="fullScreen ? 'Leave full screen' : 'Full screen'"
        ><span class="button__icon" :class="fullScreen ? 'button__icon--leave-fullscreen' : 'button__icon--fullscreen'"></span></button>
      </div>
      <div class="flex1 flex row iframe__controls-right">
        <button
          class="button button-icon-txt button--bluemid"
          @click="OpenSavePatternModal()"
        >
          <span class="button__icon button__icon--save"></span>
          <span class="button__label">Save as new flow pattern</span></button>
        <button
          class="button button-icon-txt button--bluemid"
          @click="OpenLoadFromPatternModal()"
        >
          <span class="button__icon button__icon--load"></span>
          <span class="button__label">Load from flow pattern</span>
        </button>
        <button
          class="button button-icon-txt button--valid"
          @click="saveAndPublish()"
          v-if="contextFrame !== 'sandbox'"
        >
          <span class="button__icon button__icon--publish"></span>
          <span class="button__label">Save and publish</span>
        </button>
      </div>
    </div>
    <iframe
      :src="iframeUrl"
      id="nodered-iframe"
      class="iframe flex1"
      sandbox="allow-same-origin allow-forms allow-scripts"
    ></iframe>
  </div>
</template>
<script>
import axios from 'axios'
import { bus } from '../main.js'
export default {
  props: ['contextFrame','blsurl','noderedFlowId','workflowId'],
  data () {
    return {
      iframeUrl: '',
      fullScreen: false
    }
  },
  mounted () {
    if (this.blsurl !== null && typeof(this.blsurl) !== 'undefined') {
      this.iframeUrl = this.blsurl
          } else {
      console.error('Passe par else BLS URL')
      this.iframeUrl = process.env.VUE_APP_NODERED
    }

    bus.$on('iframe_reload', () => {
      setTimeout(() => {
        const url = this.iframeUrl
        this.iframeUrl = ""
          setTimeout(() => {
            this.iframeUrl = url
          },100)
        },100)
    })
  },
  methods: {
    toggleFullScreen () {
      this.fullScreen = !this.fullScreen
      if (this.fullScreen) {
        bus.$emit('iframe-set-fullscreen', {})
      } else {
        bus.$emit('iframe-unset-fullscreen', {})
      }
    },
    OpenSavePatternModal () {
      bus.$emit('save_new_pattern', {})
    },
    OpenLoadFromPatternModal () {
      bus.$emit('load_from_pattern', {})
    },
    async saveAndPublish () {
      const save = await axios(`${process.env.VUE_APP_URL}/api/flow/publish`, {
        method: 'post',
        data: {
          flowId: this.noderedFlowId,
          contextId: this.contextId
        }
      })
      if (save.data.status === 'success') {
        location.reload()
      }
    }
  }
}
</script>
