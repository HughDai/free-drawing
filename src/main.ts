import { createApp } from 'vue'
import App from './App.vue'
import { key, store } from '@/store'
import mitt from 'mitt'
import loading from '@/components/loading'
import 'element-plus/dist/index.css'

const mitter = mitt()

const app = createApp(App)
app.config.globalProperties.eventBus = mitter

app.use(loading, { size: 'medium' })
app.use(store, key)
app.mount('#app')
