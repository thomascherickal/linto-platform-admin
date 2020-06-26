<template>
  <div
    id="iframe-container"
    :class="fullScreen ? 'iframe--fullscreen' : 'iframe--default'"
    class="flex1 flex col"
  >
    <div class="iframe__controls flex row">
      <div class="flex1 flex row iframe__controls-left">
        <button
          class="button button-icon button__with-desc  button__blue"
          :class="fullScreen ? 'enabled' : 'disabled'"
          @click="toggleFullScreen()"
          :data-desc="fullScreen ? 'Leave full screen' : 'Full screen'"
        ><span class="button--icon" :class="fullScreen ? 'button--icon__leave-fullscreen' : 'button--icon__fullscreen'"></span></button>
      </div>
      <div class="flex1 flex row iframe__controls-right">
        <button
          class="button button-icon-txt button__bluemid"
          @click="OpenSavePatternModal()"
        >
          <span class="button--icon button--icon__save"></span>
          <span class="button--label">Save as new flow pattern</span></button>
        <button
          class="button button-icon-txt button__bluemid"
          @click="OpenLoadFromPatternModal()"
        >
          <span class="button--icon button--icon__load"></span>
          <span class="button--label">Load from flow pattern</span>
        </button>
        <button
          class="button button-icon-txt button__valid"
          @click="saveAndPublish()"
          v-if="contextFrame !== 'manager'"
        >
          <span class="button--icon button--icon__publish"></span>
          <span class="button--label">Save and publish</span>
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
  props: ['contextFrame', 'blsurl','flowId','contextId'],
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
          flowId: this.flowId,
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
