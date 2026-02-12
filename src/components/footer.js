export function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
    <div class="footer-container">
      <div class="footer-brand">
        <span class="logo-icon">🏰</span>
        <span class="logo-text">Fort<span class="logo-accent">Flora</span></span>
        <p class="footer-tagline">Discover Maharashtra's Heritage & Biodiversity</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Explore</h4>
          <a href="#/forts">Forts</a>
          <a href="#/flora">Flora</a>
          <a href="#/adviser">AI Adviser</a>
        </div>
        <div class="footer-col">
          <h4>About</h4>
          <a href="#/">Home</a>
          <a href="#/admin">Admin Panel</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Fort-Flora. Built with ❤️ for Maharashtra's heritage.</p>
      </div>
    </div>
  `;
    return footer;
}
