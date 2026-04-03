import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@richaadgigi/stylexui/css/xui.min.css'; // Core CSS
import { apply } from '@richaadgigi/stylexui';

apply();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
