import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

//Start React
const rootElement = document.getElementById('root')
const root = globalThis.__inspectReactRoot ?? createRoot(rootElement)
globalThis.__inspectReactRoot = root

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
