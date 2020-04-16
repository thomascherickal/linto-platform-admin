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
    contexts () {
      return this.$store.state.contextFleet
    },
  },
  methods: {
    testEmail (obj) {
      this.$options.filters.testEmail(obj)
    },
    testPassword (obj) {
      this.$options.filters.testPassword(obj)
    },
    testName (obj) {
      this.$options.filters.testName(obj)
    },
    testContextName (obj) {
      this.$options.filters.dispatchStore('getFleetContexts')
      this.$options.filters.testName(obj)
      this.$options.filters.testContextName(obj)
    },
    testPatternName (obj) {
      this.$options.filters.dispatchStore('getFlowPatterns')
      this.$options.filters.testName(obj)
      this.$options.filters.testContextName(obj)
    },
    testSerialNumber (obj) {
      this.$options.filters.dispatchStore('getLintoFleet')
      this.$options.filters.testName(obj)
      this.$options.filters.testSerialNumber(obj)
    },
    testSentence (obj) {
      this.$options.filters.testSentence(obj)
    },

    exec (functionName) {
      switch(functionName) {
        case 'testName':
          this.testName(this.obj)
          break
        case 'testSn':
          this.testSerialNumber(this.obj)
          break
        case 'testEmail':
          this.testEmail(this.obj)
          break
        case 'testPassword':
          this.testPassword(this.obj)
          break
        case 'testConfirmPassword':
          this.testConfirmPassword(this.obj)
          break
        case 'testPatternName':
          this.testPatternName(this.obj)
          break
        case 'testContextName':
          this.testContextName(this.obj)
          break
          case 'testSentence':
            this.testSentence(this.obj)
        default:
          return
      }
    }
  }
}
</script>
