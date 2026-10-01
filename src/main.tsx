import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
})

async function enableMocking() {
  const { worker } = await import(
    './mocks/browser'
  )

  await worker.start({
    onUnhandledFrame: 'bypass',
  })
}

enableMocking().then(() => {
  createRoot(
    document.getElementById('root')!
  ).render(
    <StrictMode>
      <QueryClientProvider
        client={queryClient}
      >
        <App />
      </QueryClientProvider>
    </StrictMode>
  )
})