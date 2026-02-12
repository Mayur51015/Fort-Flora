export function initThemeToggle() {
    const savedTheme = localStorage.getItem('fort-flora-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Listen for theme toggle clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('#themeToggleNav')) {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('fort-flora-theme', next);
            updateThemeIcon(next);
        }
    });
}

function updateThemeIcon(theme) {
    const icons = document.querySelectorAll('.theme-icon');
    icons.forEach((icon) => {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
}
