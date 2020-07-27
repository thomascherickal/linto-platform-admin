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
    <ModalDeleteClientStatic v-if="path.indexOf('/clients/static') >= 0"></ModalDeleteClientStatic>
    <ModalUpdateClientStatic v-if="path.indexOf('/clients/static') >= 0"></ModalUpdateClientStatic>
    <ModalUpdateWorkflowServices v-if="path.indexOf('/clients/static') >= 0"></ModalUpdateWorkflowServices>
    <ModalDissociateStaticDevice v-if="path.indexOf('/clients/static') >= 0"></ModalDissociateStaticDevice>
    <ModalAddStaticDevice v-if="path.indexOf('/clients/static') >= 0"></ModalAddStaticDevice>

    <!-- Android users -->
    <ModalManageAndroidUsers v-if="path.indexOf('/clients/application') >= 0"></ModalManageAndroidUsers>
    <ModalAddAndroidUsers v-if="path.indexOf('/users/android')"></ModalAddAndroidUsers
    >
    <ModalEditAndroidUser v-if="path.indexOf('/users/android')"></ModalEditAndroidUser>
    <ModalDeleteAndroidUser v-if="path.indexOf('/users/android')"></ModalDeleteAndroidUser>
      
      
    <ModalDeleteApplication v-if="path.indexOf('admin/clients/application')"></ModalDeleteApplication>
    
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
  import ModalAddStaticDevice from '@/components/ModalAddStaticDevice.vue'
  import ModalManageAndroidUsers from '@/components/ModalManageAndroidUsers.vue'
  import ModalAddAndroidUsers from '@/components/ModalAddAndroidUsers.vue'
  import ModalEditAndroidUser from '@/components/ModalEditAndroidUser.vue'
  import ModalDeleteAndroidUser from '@/components/ModalDeleteAndroidUser.vue'
  import ModalDeleteApplication from '@/components/ModalDeleteApplication.vue'
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
      ModalAddStaticDevice,
      ModalDeleteClientStatic,
      ModalUpdateClientStatic,
      ModalUpdateWorkflowServices,
      ModalDissociateStaticDevice,
      ModalSaveAsWorkflowTemplate,
      // Applications
      ModalDeleteApplication,
      // Android users Modal
      ModalAddAndroidUsers,
      ModalManageAndroidUsers,
      ModalEditAndroidUser,
      ModalDeleteAndroidUser
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
