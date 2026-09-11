import { createApp } from 'vue'
import App from './App.vue'
import router from './app/router'
import './styles.css'

createApp(App).use(router).mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    })
  })
}
