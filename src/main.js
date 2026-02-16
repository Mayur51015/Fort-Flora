import './style.css';
import { initRouter } from './router.js';
import { initThemeToggle } from './components/themeToggle.js';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initRouter();
  registerServiceWorker();
});

// PWA Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.log('SW registration failed:', err));
  }
}
