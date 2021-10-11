import { createVNode, render } from 'vue'
import Loading from './Loading.vue'

interface LoadingOptions {
  size?: string
}

const loading = {
  create (options?: LoadingOptions) {
    let wrapper = document.querySelector('body>div[type=loading]')
    if (!wrapper) {
      wrapper = document.createElement('div')
      wrapper.setAttribute('type', 'loading')
      document.body.appendChild(wrapper)
    }
    const vm = createVNode(Loading, {
      ...options
    })
    render(vm, wrapper)
    return vm
  }
}

const install = function (app: any, options: LoadingOptions) {
  const instance = loading.create(options)
  instance.appContext = app._context
  const { proxy } = instance.component as any
  const service = {
    show (tips: string) {
      proxy.show(tips)
    },
    hide () {
      proxy.hide()
    }
  }
  app.config.globalProperties.$loading = service
  app.provide('$loading', service)
}

export default {
  install
}
