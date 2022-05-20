import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import forceOrientation from './mixins/utils/forceOrientation'

forceOrientation('landscape')
createApp(App)
  .use(createPinia())
  .mount('#app')
