import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import vuetify from './plugins/vuetify';
import createStoreConfig from './store'
import VueSocketIO from 'vue-socket.io'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [{
      path: '/:session',
      component: App
    }]
})

Vue.config.productionTip = false

const storeConfig = createStoreConfig()
const store = new Vuex.Store(storeConfig)

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost.com:8000',
  vuex: {
      store,
      actionPrefix: 'socket_',
      mutationPrefix: 'socket_'
  },
  options: { path: "/my-app/" } //Optional options
}, 
),
)

new Vue({
  vuetify,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
