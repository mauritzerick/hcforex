import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TestThankYouPage } from './TestThankYouPage.tsx'

const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
const RootComponent = pathname === '/test' ? TestThankYouPage : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
