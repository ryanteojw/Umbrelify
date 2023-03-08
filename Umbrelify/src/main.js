import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/style.scss'
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap.js";
import VueGoogleMaps from '@fawmi/vue-google-maps'
import Vue3Geolocation from "vue3-geolocation"

createApp(App).use(store).use(router).use(VueGoogleMaps, {
    load: {
        key: 'AIzaSyAkfyeLx1NBJBiwnnN55ES06fqIZHDKZO0'
    }
})
.use(Vue3Geolocation).mount('#app')
