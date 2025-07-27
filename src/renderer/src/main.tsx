import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import { HashRouter } from 'react-router-dom'

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
