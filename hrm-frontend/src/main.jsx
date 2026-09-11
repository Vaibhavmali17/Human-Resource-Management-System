import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './theme.css'
import './index.css'
import App from './App.jsx'

// Apply theme attribute before render to prevent flash of wrong theme
const initialTheme = localStorage.getItem('hrm-theme') || 'dark';
document.documentElement.setAttribute('data-theme', initialTheme);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
