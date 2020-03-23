<template>
  <div id="app">
    <div id="login-bg"></div>
    <div id="login-wrapper" class="flex col">
      <div class="flex1 flex col login-form-container">
        <!-- Logo -->
        <img src="/assets/img/admin-logo-light@2x.png" alt="administration interface" class="login-logo">
        <div class="setup-form-container">
          <AppInput :label="'Username'" :obj="user.name" :test="'testName'"></AppInput>
          <AppInput :label="'Email'" :obj="user.name" :test="'testEmail'"></AppInput>
          <AppInput :label="'Password'" :obj="user.name" :test="'testConfirmPassword'"></AppInput>
          <AppInput :label="'Password confirmation'" :obj="user.name" :test="'testName'"></AppInput>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'

import axios from 'axios'
export default {
  data () {
    return {
      user: {
        name: {
          value:'',
          error: null,
          valid: false
        },
        email: {
          value:'',
          error: null,
          valid: false
        },
        password: {
          value:'',
          error: null,
          valid: false
        },
        password_confirm: {
          value:'',
          error: null,
          valid: false
        }
      }
    }
  },
  computed: {
    formValid () {
      return (this.user.name.valid && this.user.password.valid && this.user.password_confirm.valid)
    }
  },
  methods: {
    handleForm () {
      
      this.testName(this.user.name)
      this.testEmail(this.user.email)
      this.testPassword(this.user.password)
      this.testConfirmPassword(this.user.password_confirm)

      if (this.formValid) {
        this.sendForm()
      }
    },
    testName () {
      this.$options.filters.testName(this.user.name)
    },
    testEmail () {
      this.$options.filters.testEmail(this.user.email)
    },
    testPassword () {
      this.$options.filters.testPassword(this.user.name)
    },
    testConfirmPassword () {
      
    },
    async sendForm () {
      console.log('SEND FORM!')
    }
  },
  components: {
    AppInput
  }
}
</script>
