import { InjectionKey } from 'vue'
import Timemachine from '../shared/timemachine'
import { STAGE_CONFIG } from '@/shared/constants'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

const timemachine = new Timemachine()
timemachine.makeHistory()

export interface State {
  stageConfig: any
  timemachine: any
}

export enum Mutations {
  SET_STAGE_CONFIG = 'SET_STAGE_CONFIG'
  // SET_TIMEMACHINE = 'SET_TIMEMACHINE'
}

export enum Actions {}

export const key: InjectionKey<Store<State>> = Symbol('key')

export const store = createStore({
  state: {
    timemachine,
    stageConfig: STAGE_CONFIG
  },
  mutations: {
    [Mutations.SET_STAGE_CONFIG] (state, payload) {
      state.stageConfig = payload
    }
    // [Mutations.SET_TIMEMACHINE] (state, payload) {
    //   state.timemachine = payload
    // }
  },
  actions: {
  },
  modules: {
  }
})

export function useStore () {
  return baseUseStore(key)
}
