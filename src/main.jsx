import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Dashboard from './pages/Dashboard.jsx';

// Two static routes, hand-rolled - not worth a router dependency for this.
const page = window.location.pathname === '/dashboard' ? <Dashboard /> : <App />;

createRoot(document.getElementById('root')).render(
  <StrictMode>{page}</StrictMode>
);
