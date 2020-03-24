<template>
  <div id="app">
    <div id="login-bg"></div>
    <div id="login-wrapper" class="flex col">
      <div class="flex1 flex col login-form-container">
        <!-- Logo -->
        <img src="/assets/img/admin-logo-light@2x.png" alt="administration interface" class="login-logo">
        <div class="setup-form-container">
          <AppInput :label="'Username'" :obj="user.name" :test="'testName'"></AppInput>
          <AppInput :label="'Email'" :obj="user.email" :test="'testEmail'"></AppInput>

          <div>
            password can contain: 
            <ul>
              <li>At least 6 characters</li>
              <li>Alpha-numeric characters</li>
              <li>Special characters : "!","@","#","$","%","-","_"</li>
            </ul>
          </div>

          <AppInput :label="'Password'" :obj="user.password" :test="'testPassword'"></AppInput>
          <AppInput :label="'Password confirmation'" :obj="user.password_confirm" :test="'null'"></AppInput>

            <!-- Submit -->
          <button
            class="button button--full button--login-submit"
            :class="formValid ? 'button--login-enabled' : 'button--login-disabled'"
            @click="handleForm()"
          >Setup</button>
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
      this.testConfirmPassword()

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
      this.$options.filters.testPassword(this.user.password)
    },
    testConfirmPassword () {
      this.user.password_confirm.valid = false
      this.user.password_confirm.error = null
      if(this.user.password.value !== this.user.password_confirm.value) {
        this.user.password_confirm.error = 'Confirmation password different from password'
      } else {
        this.user.password_confirm.valid = true
      }
    },
    async sendForm () {
      const payload = {
        name: this.user.name.value,
        email: this.user.email.value,
        password: this.user.password.value
      }
      const createUser = await axios(`${process.env.VUE_APP_URL}/setup/createuser`, {
        method: 'post',
        data: payload
      })
      console.log('createuser', createUser)
    }
  },
  components: {
    AppInput
  }
}
</script>
