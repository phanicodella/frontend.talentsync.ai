import { createApp } from 'vue'
import App from './App.vue'
import './css/styles.css'

// Import services
import './js/services/api'
import './js/services/videoService'
import './js/services/resultsService'

// Import components
import InterviewDashboard from './js/components/InterviewDashboard'
import Login from './js/components/auth/Login'
import VideoInterface from './js/components/VideoInterface'

const app = createApp(App)

// Register components
app.component('interview-dashboard', InterviewDashboard)
app.component('login-form', Login)
app.component('video-interface', VideoInterface)

app.mount('#app')
