<template>
  <div>
    <h1>Tock interface</h1>
    <details open class="description">
      <summary>Infos</summary>
      <span>The Natural Language Understanding is managed by an embedded application called “Tock”. You will have to log in to the Tock application to be able to manage or edit NLU rules. <br/>You can access the Tock application directly on <a :href="tockUrl" target="_blank">{{ tockUrl }}</a>.<br/>
      <strong>Please log in with the following credentials :</strong>
      <ul>
        <li>Login : <strong>{{ tockUser }}</strong> </li>
        <li>Password : <strong>{{ tockPassword }}</strong></li>
      </ul>
      For more informations about node-red workflows, please read the <a href="https://doc.linto.ai/" target="_blank">documentation</a>.
      </span>
    </details>
    <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
      <TockIframe></TockIframe>
    </div>

  </div>
</template>
<script>
import axios from 'axios'
import TockIframe from '@/components/TockIframe.vue'
export default {
  data () {
    return {
      tockUrl: process.env.VUE_APP_TOCK_URL,
      tockUser: process.env.VUE_APP_TOCK_USER,
      tockPassword: process.env.VUE_APP_TOCK_PASSWORD
    }
  },
  components: {
    TockIframe
  }
}
</script>
