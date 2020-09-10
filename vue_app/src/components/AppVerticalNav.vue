<template>
  <div id="vertical-nav" class="flex col" :class="extraClass">

    <!-- Static clients -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(staticClientsUrl) >= 0 ? 'active' : ''">
      <a  class="vertical-nav-item__link vertical-nav-item__link" :href="staticClientsUrl" >
        <span class="nav-link__icon nav-link__icon--single-user "></span>
        <span class="nav-link__label">Single-device applications</span>
      </a>
    </div>
    
    <!-- Applications -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(applicationsUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="applicationsUrl">
        <span class="nav-link__icon nav-link__icon--multi-user "></span>
        <span class="nav-link__label">Mutli-user applications</span>
      </a>
    </div>
    
    <div class="nav-divider"></div>
      
    <!-- Terminals -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(terminalsUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="terminalsUrl">
        <span class="nav-link__icon nav-link__icon--terminal"></span>
        <span class="nav-link__label">Devices</span>
      </a>
    </div>

    <!-- Android users -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(androidUsersUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="androidUsersUrl">
        <span class="nav-link__icon nav-link__icon--users"></span>
        <span class="nav-link__label">Users</span>
      </a>
    </div>
    
    <!-- webapp hosts -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(webAppHostsUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="webAppHostsUrl">
        <span class="nav-link__icon nav-link__icon--webapp"></span>
        <span class="nav-link__label">Domains</span>
      </a>
    </div>
    
    <div class="nav-divider"></div>

    <!-- Workflow editor -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(workflowEditorUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="workflowEditorUrl">
        <span class="nav-link__icon nav-link__icon--workflow "></span>
        <span class="nav-link__label">Workflow templates</span>
      </a>
    </div>
    
    <div class="nav-divider"></div>
    
    <!-- NLU interface -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(nluUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="nluUrl">
        <span class="nav-link__icon nav-link__icon--nlu "></span>
        <span class="nav-link__label">Tock interface</span>
      </a>
    </div>

  </div>
</template>
<script>
export default {
  props: ['extraClass'],
  data () {
    return {
      clientsUrl: '/admin/clients',
      staticClientsUrl: '/admin/applications/mono',
      applicationsUrl:  '/admin/applications/multi',
      workflowEditorUrl: '/admin/workflow-editor',
      nluUrl: '/admin/nlu',
      androidUsersUrl: '/admin/users',
      webAppHostsUrl:  '/admin/domains',
      terminalsUrl: '/admin/devices',
      routePath: ''
    }
  },
  created () {
    this.routePath = this.$route.fullPath
  },
  methods: {
    toggleChildren (e, id) {
      e.preventDefault()
      const parent = e.target
      const childContainer = document.getElementById(id)
      const childs = childContainer.childNodes
      const nbItems = childs.length
      let childContainerHeight = 0
      for (let i = 0; i < nbItems; i++) {
        childContainerHeight += childs[i].offsetHeight
      }
      if (childContainer.classList.contains('hidden')) {
        // show children
        parent.classList.remove('closed')
        parent.classList.add('opened')
        childContainer.classList.remove('hidden')
        childContainer.classList.add('visible')
        childContainer.setAttribute('style', 'height: ' + childContainerHeight + 'px;')
      } else if (childContainer.classList.contains('visible')) {
        // hide children
        parent.classList.remove('opened')
        parent.classList.add('closed')
        childContainer.classList.remove('visible')
        childContainer.classList.add('hidden')
        childContainer.setAttribute('style','height: 0px;')
      }
    }
  }
}
</script>
