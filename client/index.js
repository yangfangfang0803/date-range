import Vue from 'vue'
import App from './App'

import './util/filter'

Vue.config.productionTip = false

new Vue({
  	el: '#app',
  	template: '<App/>',
  	components: { App }
})
