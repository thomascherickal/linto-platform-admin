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
    <ModalDeleteClientStatic v-if="path.indexOf('/clients/static')"></ModalDeleteClientStatic>
    <ModalUpdateClientStatic v-if="path.indexOf('/clients/static')"></ModalUpdateClientStatic>
    <ModalUpdateWorkflowServices v-if="path.indexOf('/clients/static')"></ModalUpdateWorkflowServices>
    <ModalDissociateStaticDevice v-if="path.indexOf('/clients/static')"></ModalDissociateStaticDevice>

    <!-- Worflows templates 
      <ModalSaveWorkflowTemplate v-if="path.indexOf('/workflows')"></ModalSaveWorkflowTemplate>
    <ModalLoadWorkflowTemplate v-if="path.indexOf('/workflows')"></ModalLoadWorkflowTemplate>
    --> 
  
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
      ModalDissociateStaticDevice
  //    ModalSaveWorkflowTemplate,
    //  ModalLoadWorkflowTemplate

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
