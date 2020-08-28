<template>
  <div id="vertical-nav" class="flex col" :class="extraClass">

    <!-- Static clients -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(staticClientsUrl) >= 0 ? 'active' : ''">
      <a  class="vertical-nav-item__link vertical-nav-item__link" :href="staticClientsUrl" >
        <span class="nav-link__icon nav-link__icon--static "></span>
        <span class="nav-link__label">Static clients</span>
      </a>
    </div>
    
    <!-- Applications -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(applicationsUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="applicationsUrl">
        <span class="nav-link__icon nav-link__icon--app "></span>
        <span class="nav-link__label">Applications</span>
      </a>
    </div>
    
    <div class="nav-divider"></div>

    <!-- Android users -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(androidUsersUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="androidUsersUrl">
        <span class="nav-link__icon nav-link__icon--android-users"></span>
        <span class="nav-link__label">Android users</span>
      </a>
    </div>
    
    <!-- webapp hosts -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(webAppHostsUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="webAppHostsUrl">
        <span class="nav-link__icon nav-link__icon--webapp"></span>
        <span class="nav-link__label">Webapp Hosts</span>
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
      staticClientsUrl: '/admin/clients/static',
      applicationsUrl:  '/admin/clients/application',
      workflowEditorUrl: '/admin/workflow-editor',
      nluUrl: '/admin/nlu',
      androidUsersUrl: '/admin/users/android',
      webAppHostsUrl:  '/admin/users/webapp',
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
