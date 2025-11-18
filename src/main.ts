import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import { TroisJSVuePlugin } from 'troisjs';

const app = createApp(App)

app.use(router)
// app.use(TroisJSVuePlugin);
app.mount('#app')
