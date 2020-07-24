<template>
  <div id="vertical-nav" class="flex col" :class="extraClass">
    <!-- Clients -->
    <div class="vertical-nav-item flex col">
      <a
        class="vertical-nav-item__link vertical-nav-item__link--parent flex1"
        :class="routePath.indexOf(clientsUrl) >= 0 ? 'opened' : 'closed'"
        @click="toggleChildren($event, 'clients-links')"
        href="javascript:;"
      >Clients</a>
      <div
        class="vertical-nav-item--children flex col"
        :class="routePath.indexOf(clientsUrl) >= 0 ? 'visible' : 'hidden'"
        id="clients-links"
      >
        <a
          class="vertical-nav-item__link vertical-nav-item__link--children flex1"
          href="/admin/clients/static"
          :class="routePath.indexOf('/admin/clients/static') >= 0 ? 'active' : ''"
        >
          Static devices
        </a>
        <a
          class="vertical-nav-item__link vertical-nav-item__link--children flex1"
          href="/admin/clients/application"
          :class="routePath.indexOf('admin/clients/application') >= 0 ? 'active' : ''">
            Applications
        </a>
      </div>
    </div>
    
    <!-- Android users -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(androidUsersUrl) >= 0 ? 'active' : ''">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        :href="androidUsersUrl"
      >Android users</a>
    </div>

    <!-- Workflow editor -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(workflowEditorUrl) >= 0 ? 'active' : ''">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        :href="workflowEditorUrl"
      >Workflow templates</a>
    </div>
    
    <!-- NLU interface -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(nluUrl) >= 0 ? 'active' : ''">
      <a
        class="vertical-nav-item__link vertical-nav-item__link"
        :href="nluUrl"
      >Tock interface</a>
    </div>
  </div>
</template>
<script>
export default {
  props: ['extraClass'],
  data () {
    return {
      clientsUrl: '/admin/clients',
      workflowEditorUrl: '/admin/workflow-editor',
      nluUrl: '/admin/nlu',
      androidUsersUrl: '/admin/users/android',
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
