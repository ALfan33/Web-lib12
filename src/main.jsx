// src/main.jsx
// Application entry point — initialize seed data before rendering.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import App from './App.jsx';
import { initSeed } from './services/seedService.js';

// Initialize localStorage seed data on first load
initSeed().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
