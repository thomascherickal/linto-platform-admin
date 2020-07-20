<template>
  <div id="app" class="flex col">
    <AppNotifTop></AppNotifTop>
    <!-- <AppNotifTopErrors></AppNotifTopErrors> -->
    <AppHeader :extraClass="fullScreenFrame ? 'fullscreen-child' : ''"></AppHeader>
    <div id="page-view" class="flex1 flex row">
      <AppVerticalNav :extraClass="fullScreenFrame ? 'fullscreen-child' : ''"></AppVerticalNav>
      <div id="view" class="flex1" :class="fullScreenFrame ? 'fullscreen-child' : ''">
        <router-view id="view-render" class="flex col"></router-view>
      </div>
    </div>
    <AppNotif></AppNotif>
    <!-- <LoadPatternModal></LoadPatternModal>
    <SavePatternModal></SavePatternModal> -->
    <ModalDeleteClientStatic v-if="path.indexOf('/clients/static') >= 0"></ModalDeleteClientStatic>
    <ModalUpdateClientStatic v-if="path.indexOf('/clients/static') >= 0"></ModalUpdateClientStatic>
    <ModalUpdateWorkflowServices v-if="path.indexOf('/clients/static') >= 0"></ModalUpdateWorkflowServices>
    <ModalDissociateStaticDevice v-if="path.indexOf('/clients/static') >= 0"></ModalDissociateStaticDevice>

    <!-- Worflows templates -->
    <ModalSaveAsWorkflowTemplate v-if="path.indexOf('/admin/workflows') >= 0 || path.indexOf('/clients/static/workflow') "></ModalSaveAsWorkflowTemplate>
  
  </div>
</template>
<script>
  // Navigation
  import AppHeader from '@/components/AppHeader.vue'
  import AppVerticalNav from '@/components/AppVerticalNav.vue'
  // App notify
  import AppNotif from '@/components/AppNotif.vue'
  // Modals
  import AppNotifTop from '@/components/AppNotifTop.vue'
  import ModalDeleteClientStatic from '@/components/ModalDeleteClientStatic.vue'
  import ModalUpdateClientStatic from '@/components/ModalUpdateClientStatic.vue'
  import ModalUpdateWorkflowServices from '@/components/ModalUpdateWorkflowServices.vue'
  import ModalDissociateStaticDevice from '@/components/ModalDissociateStaticDevice.vue'
  import ModalSaveAsWorkflowTemplate from '@/components/ModalSaveAsWorkflowTemplate.vue'
  
  import { bus } from './main.js'
  export default {
    data () {
      return {
        fullScreenFrame: false,
        path: ''
      }
    },
    created () {
      this.path = this.$route.fullPath
    },
    components: {
      AppHeader,
      AppNotif,
      AppNotifTop,
      AppVerticalNav,
      ModalDeleteClientStatic,
      ModalUpdateClientStatic,
      ModalUpdateWorkflowServices,
      ModalDissociateStaticDevice,
      ModalSaveAsWorkflowTemplate
    },
    mounted () {
      bus.$on('iframe-set-fullscreen', () => {
        this.fullScreenFrame = true
      })
      bus.$on('iframe-unset-fullscreen', () => {
        this.fullScreenFrame = false
      })
    }
  }
</script>
