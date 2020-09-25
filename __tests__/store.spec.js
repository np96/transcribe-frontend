import Vuex from 'vuex'
import { createLocalVue } from '@vue/test-utils'
import '@/store/index.js'
const localVue = createLocalVue()
localVue.use(Vuex)

describe('true', () => {
  it('true', () => {
    expect(true).toBe(true)
  })
})