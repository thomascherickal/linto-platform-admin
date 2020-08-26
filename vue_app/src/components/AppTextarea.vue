<template>
  <div class="flex col">
    <span class="form__label">{{ label }} :</span>
    <textarea
      class="form__textarea"
      v-model="obj.value"
      :class="[obj.error !== null ? 'form__textarea--error' : '']"
      @change="testContent(obj)"
    ></textarea>
    <span class="form__error-field">{{ obj.error }}</span>
  </div>
</template>
<script>
 export default {
   props: ['obj', 'label', 'test'],
   data () {
     return {
       
     }
   },
   methods: {
     testContent(obj) {
       this.$options.filters.testContent(obj)
     }
   }
 }
</script>