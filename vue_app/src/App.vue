<template>
  <div id="app" class="flex col">
    <AppHeader :extraClass="fullScreenFrame ? 'fullscreen-child' : ''"></AppHeader>
    <div id="page-view" class="flex1 flex row">
      <AppVerticalNav :extraClass="fullScreenFrame ? 'fullscreen-child' : ''"></AppVerticalNav>
      <div id="view" class="flex1" :class="fullScreenFrame ? 'fullscreen-child' : ''">
        <router-view id="view-render" class="flex col"></router-view>
      </div>
    </div>
    <AppNotif></AppNotif>

    <!-- Mono user applications -->
    <ModalReplaceTerminal v-if="path.indexOf('/admin/applications/device') >= 0"></ModalReplaceTerminal>
    <ModalDissociateTerminal v-if="path.indexOf('/admin/applications/device') >= 0 || path.indexOf('/admin/devices') >= 0"></ModalDissociateTerminal>

    <!-- Multi user applications --> 
    <ModalDeleteMultiUserApp v-if="path.indexOf('/admin/applications/multi') >= 0"></ModalDeleteMultiUserApp>
    
    <ModalUpdateWorkflowServices v-if="path.indexOf('/admin/applications/device') >= 0 || path.indexOf('/admin/applications/multi') >= 0"></ModalUpdateWorkflowServices>
    
    <!-- Terminals -->
    <ModalAddTerminal v-if="path.indexOf('/admin/devices') >= 0"></ModalAddTerminal>
    <ModalDeleteTerminal v-if="path.indexOf('/admin/devices') >= 0"></ModalDeleteTerminal>

    <!-- Users -->
    <ModalManageUsers v-if="path.indexOf('/admin/applications/multi') >= 0"></ModalManageUsers>
    <ModalAddUsers v-if="path.indexOf('/admin/users') >= 0"></ModalAddUsers>
    <ModalEditUser v-if="path.indexOf('/admin/users') >= 0"></ModalEditUser>
    <ModalDeleteUser v-if="path.indexOf('/admin/users') >= 0"></ModalDeleteUser>

    <!-- Domains -->
    <ModalAddDomain v-if="path.indexOf('/admin/domains') >= 0"></ModalAddDomain>
    <ModalDeleteDomain v-if="path.indexOf('/admin/domains') >= 0"></ModalDeleteDomain>
    <ModalEditDomain v-if="path.indexOf('/admin/domains') >= 0"></ModalEditDomain>
    <ModalManageDomains v-if="path.indexOf('/admin/applications/multi') >= 0"></ModalManageDomains>

    <!-- Worflows templates -->
    <ModalSaveAsWorkflowTemplate v-if="path.indexOf('admin/workflow-editor') >= 0 || path.indexOf('/admin/applications/') >= 0"></ModalSaveAsWorkflowTemplate>
    <ModalManageWorkflowTemplates v-if="path.indexOf('admin/workflow-editor') >= 0"></ModalManageWorkflowTemplates>
    
  </div>
</template>
<script>
  // Navigation
  import AppHeader from '@/components/AppHeader.vue'
  import AppVerticalNav from '@/components/AppVerticalNav.vue'
  // App notify
  import AppNotif from '@/components/AppNotif.vue'
  // Modals
  import ModalDeleteTerminal from '@/components/ModalDeleteTerminal.vue'
  import ModalReplaceTerminal from '@/components/ModalReplaceTerminal.vue'
  import ModalUpdateWorkflowServices from '@/components/ModalUpdateWorkflowServices.vue'
  import ModalDissociateTerminal from '@/components/ModalDissociateTerminal.vue'
  import ModalSaveAsWorkflowTemplate from '@/components/ModalSaveAsWorkflowTemplate.vue'
  import ModalAddTerminal from '@/components/ModalAddTerminal.vue'
  import ModalManageUsers from '@/components/ModalManageUsers.vue'
  import ModalAddUsers from '@/components/ModalAddUsers.vue'
  import ModalEditUser from '@/components/ModalEditUser.vue'
  import ModalDeleteUser from '@/components/ModalDeleteUser.vue'
  import ModalDeleteMultiUserApp from '@/components/ModalDeleteMultiUserApp.vue'
  import ModalManageWorkflowTemplates from '@/components/ModalManageWorkflowTemplates.vue'
  import ModalAddDomain from '@/components/ModalAddDomain.vue'
  import ModalDeleteDomain from '@/components/ModalDeleteDomain.vue'
  import ModalEditDomain from '@/components/ModalEditDomain.vue'
  import ModalManageDomains from '@/components/ModalManageDomains.vue'
  import { bus } from './main.js'
  export default {
    data () {
      return {
        fullScreenFrame: false,
        path: ''
      }
    },
    created () {
      setTimeout(() => {
        this.path = this.$route.fullPath
      }, 500)
    },
    components: {
      AppHeader,
      AppNotif,
      AppVerticalNav,
      // Static clients
      ModalAddTerminal,
      ModalDeleteTerminal,
      ModalReplaceTerminal,
      ModalUpdateWorkflowServices,
      ModalDissociateTerminal,
      // Workflow editor
      ModalSaveAsWorkflowTemplate,
      ModalManageWorkflowTemplates,
      // Applications
      ModalDeleteMultiUserApp,
      // Android users Modal
      ModalAddUsers,
      ModalManageUsers,
      ModalEditUser,
      ModalDeleteUser,
      // Webapp hosts
      ModalAddDomain,
      ModalDeleteDomain,
      ModalEditDomain,
      ModalManageDomains
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
