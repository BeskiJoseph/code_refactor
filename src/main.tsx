import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Configure Monaco Editor environment to prevent worker errors
if (typeof window !== 'undefined') {
  (window as any).MonacoEnvironment = {
    getWorker: function () {
      // Return a dummy worker to prevent errors
      return {
        postMessage: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        terminate: function () {},
      };
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
