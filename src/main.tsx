import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'
import './styles/animations.css'
import { ToastProvider } from './components/ui/toast'
import { Analytics } from '@vercel/analytics/react';
import { SettingsProvider } from './lib/settings-context'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <SettingsProvider>
        <ToastProvider>
          <RouterProvider router={router} />
          <Analytics />
        </ToastProvider>
      </SettingsProvider>
    </StrictMode>,
  )
}