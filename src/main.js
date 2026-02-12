import './style.css';
import { initRouter } from './router.js';
import { initThemeToggle } from './components/themeToggle.js';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initRouter();
});
