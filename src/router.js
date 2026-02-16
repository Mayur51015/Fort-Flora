// Simple hash-based SPA router
import { renderHome } from './pages/home.js';
import { renderForts } from './pages/forts.js';
import { renderFlora } from './pages/flora.js';
import { renderAdviser } from './pages/adviser.js';
import { renderAdmin } from './pages/admin.js';
import { renderMap } from './pages/map.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderAuthPage } from './pages/auth-page.js';
import { renderFavorites } from './pages/favorites.js';

const routes = {
    '/': renderHome,
    '/forts': renderForts,
    '/flora': renderFlora,
    '/adviser': renderAdviser,
    '/admin': renderAdmin,
    '/map': renderMap,
    '/dashboard': renderDashboard,
    '/auth': renderAuthPage,
    '/favorites': renderFavorites,
};

function getPath() {
    const hash = window.location.hash || '#/';
    return hash.slice(1) || '/';
}

export function navigateTo(path) {
    window.location.hash = '#' + path;
}

export function initRouter() {
    const render = async () => {
        const path = getPath();
        const app = document.getElementById('app');
        const renderPage = routes[path] || routes['/'];
        await renderPage(app);
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach((link) => {
            const href = link.getAttribute('data-route');
            link.classList.toggle('active', href === path);
        });
        // Scroll to top
        window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', render);
    render();
}
