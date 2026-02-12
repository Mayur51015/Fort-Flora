import { navigateTo } from '../router.js';

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
        <li><a class="nav-link" data-route="/adviser" href="#/adviser">AI Adviser</a></li>
        <li><a class="nav-link" data-route="/admin" href="#/admin">Admin</a></li>
      </ul>
      <button class="theme-btn" id="themeToggleNav" aria-label="Toggle theme">
        <span class="theme-icon">🌙</span>
      </button>
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

    return nav;
}
