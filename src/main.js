import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import vuetify from './plugins/vuetify';
import createStoreConfig from './store'

Vue.config.productionTip = false

const storeConfig = createStoreConfig()
const store = new Vuex.Store(storeConfig)

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
