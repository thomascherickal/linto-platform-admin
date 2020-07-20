<template>
  <div class="flex col">
    <span class="form__label">{{ label }} :</span>
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
  props: ['label', 'obj', 'test', 'lintos', 'patterns', 'type'],
  data () {
    return {}
  },
  computed: {
    staticWorkflow () {
      return this.$store.state.staticWorkflows
    }
  },
  methods: {
    testWorkflowName (obj) {
      this.$options.filters.dispatchStore('getStaticWorkflows')
      // Test if workflow name is not used
      this.$options.filters.testStaticWorkflowName(obj)
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
    exec (functionName) {
      switch(functionName) {
        case 'testName':
          this.testName(this.obj)
          break
        case 'testWorkflowName':
          this.testWorkflowName(this.obj)
          break
        case 'testWorkflowTemplateName':
          this.testWorkflowTemplateName(this.obj)
          break
        default:
          return
      }
    }
  }
}
</script>
