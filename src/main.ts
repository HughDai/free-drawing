import { createApp } from 'vue'
import App from './App.vue'
import store from '@/store'
import loading from './components/loading'
import 'element-plus/dist/index.css'

createApp(App)
  .use(loading, { size: 'medium' })
  .use(store)
  .mount('#app')
