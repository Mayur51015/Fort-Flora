import { navigateTo } from '../router.js';
import { getCurrentUser, signOut } from '../lib/auth.js';

export function renderNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="nav-container">
      <a href="#/" class="nav-logo" aria-label="Fort-Flora Home">
        <span class="logo-icon">🏰</span>
        <span class="logo-text">Fort<span class="logo-accent">Flora</span></span>
      </a>
      <button class="nav-toggle" aria-label="Toggle navigation" id="navToggle">
        <span class="hamburger"></span>
      </button>
      <ul class="nav-menu" id="navMenu">
        <li><a class="nav-link" data-route="/" href="#/">Home</a></li>
        <li><a class="nav-link" data-route="/forts" href="#/forts">Forts</a></li>
        <li><a class="nav-link" data-route="/flora" href="#/flora">Flora</a></li>
        <li><a class="nav-link" data-route="/map" href="#/map">Map</a></li>
        <li><a class="nav-link" data-route="/dashboard" href="#/dashboard">Dashboard</a></li>
        <li><a class="nav-link" data-route="/adviser" href="#/adviser">AI Adviser</a></li>
        <li><a class="nav-link" data-route="/favorites" href="#/favorites">Favorites</a></li>
        <li><a class="nav-link" data-route="/admin" href="#/admin">Admin</a></li>
      </ul>
      <div class="nav-actions">
        <span class="nav-user-status" id="navUserStatus"></span>
        <button class="theme-btn" id="themeToggleNav" aria-label="Toggle theme">
          <span class="theme-icon">🌙</span>
        </button>
      </div>
    </div>
  `;

  // Mobile menu toggle
  const toggle = nav.querySelector('#navToggle');
  const menu = nav.querySelector('#navMenu');
  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    toggle.classList.toggle('open');
  });

  // Close menu on link click (mobile)
  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
    });
  });

  // Update user status indicator
  updateUserStatus(nav);

  return nav;
}

async function updateUserStatus(nav) {
  const statusEl = nav.querySelector('#navUserStatus');
  try {
    const user = await getCurrentUser();
    if (user) {
      statusEl.innerHTML = `<a href="#/auth" class="nav-user-link" title="${user.email}">👤</a>`;
    } else {
      statusEl.innerHTML = `<a href="#/auth" class="nav-user-link nav-login-link" title="Sign In">Sign In</a>`;
    }
  } catch {
    statusEl.innerHTML = '';
  }
}
