import { InjectionKey } from 'vue'
import { STAGE_CONFIG } from '../shared/constants'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

export interface State {
  stageConfig: any
}

export enum Mutations {
  SET_STAGE_CONFIG = 'SET_STAGE_CONFIG'
}

export enum Actions {}

export const key: InjectionKey<Store<State>> = Symbol('key')

export const store = createStore({
  state: {
    stageConfig: STAGE_CONFIG
  },
  mutations: {
    [Mutations.SET_STAGE_CONFIG] (state, config) {
      state.stageConfig = config
    }
  },
  actions: {
  },
  modules: {
  }
})

export function useStore () {
  return baseUseStore(key)
}
