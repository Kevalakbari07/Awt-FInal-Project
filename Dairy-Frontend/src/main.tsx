import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/global.css'
import './styles/login.css'
import './styles/pages.css'

console.log("🔧 main.tsx loaded - rendering App...")

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log("✅ App rendered successfully")
} catch (error) {
  console.error("❌ Error rendering App:", error)
  document.body.innerHTML = `<div style="padding: 20px;"><h1>Error Loading App</h1><p>${error}</p></div>`
}