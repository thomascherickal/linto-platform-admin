<template>
  <div class="flex col">
    <span class="form__label">{{ label }} <strong v-if="required">*</strong> :</span>
    
    <input
      :type="type || 'text'"
      class="form__input"
      v-model="obj.value"
      :class="[obj.error !== null ? 'form__input--error' : '', obj.valid ? 'form__input--valid' : '']"
      @blur="exec(test)"
    />
    <span class="form__error-field">{{ obj.error }}</span>
  </div>
</template>
<script>
export default {
  props: ['label', 'obj', 'test', 'type', 'compare', 'required'],
  data () {
    return {}
  },
  computed: {
    staticWorkflow () {
      return this.$store.state.staticWorkflows
    }
  },
  methods: {
    testStaticWorkflowName (obj) {
      // Test if workflow name is not used
      this.$options.filters.testStaticWorkflowName(obj)
      if (obj.error === null) {
        // Test if workflow name is valid
        this.$options.filters.testName(obj)
      }
    },
    testApplicationWorkflowName (obj) {
      // Test if workflow name is not used
      this.$options.filters.testApplicationWorkflowName(obj)
      if (obj.error === null) {
        // Test if workflow name is valid
        this.$options.filters.testName(obj)
      }
    },
    testName (obj) {
      this.$options.filters.testName(obj)
    },
    testWorkflowTemplateName (obj) {
      this.$options.filters.testWorkflowTemplateName(obj)
      if (obj.error === null) {
        this.$options.filters.testName(obj)
      }
    },
    testStaticClientsSN (obj) {
      this.$options.filters.testStaticClientsSN(obj)
      if (obj.error === null) {
        this.$options.filters.testName(obj)
      }
    },
    testEmail (obj) {
      this.$options.filters.testEmail(obj)
    },
    testAndroidUserEmail (obj) {
      this.$options.filters.testAndroidUserEmail(obj)
    },
    testPassword (obj) {
      this.$options.filters.testPassword(obj)
    },
    testPasswordConfirm (obj) {
      if (!!this.compare) {
        this.$options.filters.testPasswordConfirm(obj, this.compare)
      }
    },
    testUrl (obj) {
      this.$options.filters.testUrl(obj)
    },
    testContentSay(obj) {
       this.$options.filters.testContentSay(obj)
    },
    exec (functionName) {
      switch(functionName) {
        case 'testName':
          this.testName(this.obj)
          break
        case 'testStaticWorkflowName':
          this.testStaticWorkflowName(this.obj)
          break
        case 'testApplicationWorkflowName':
          this.testApplicationWorkflowName(this.obj)
          break
        case 'testWorkflowTemplateName':
          this.testWorkflowTemplateName(this.obj)
          break
        case 'testStaticClientsSN': 
          this.testStaticClientsSN(this.obj)
          break
        case 'testEmail':
          this.testEmail(this.obj)
          break
        case 'testAndroidUserEmail':
          this.testAndroidUserEmail(this.obj)
          break
        case 'testPassword': 
          this.testPassword(this.obj)
          break
        case 'testPasswordConfirm':
          this.testPasswordConfirm(this.obj)
          break
        case 'testUrl':
          this.testUrl(this.obj)
          break
        case 'testContentSay':
          this.testContentSay(this.obj)
          break
        default:
          return
      }
    }
  }
}
</script>
