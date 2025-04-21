import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { CurrentCityProvider } from './contexts/CurrentCityContext.jsx'
import { TemperatureUnitProvider } from './contexts/TemperatureContext.jsx'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TemperatureUnitProvider>
      <CurrentCityProvider>
        <App />
      </CurrentCityProvider>
      </TemperatureUnitProvider>
    </AuthProvider>
  </StrictMode>,
)
