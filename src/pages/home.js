import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { createFortCard } from '../components/fortCard.js';
import { forts } from '../data/seed.js';

export function renderHome(app) {
    const featured = forts.slice(0, 6);

    app.innerHTML = '';
    app.appendChild(renderNavbar());

    const main = document.createElement('main');
    main.innerHTML = `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-title-line">Discover Maharashtra's</span>
          <span class="hero-title-accent">Heritage & Biodiversity</span>
        </h1>
        <p class="hero-subtitle">
          Explore majestic forts, ancient history, and the rich flora of the Western Ghats — all in one place.
        </p>
        <div class="hero-cta">
          <a href="#/forts" class="btn btn-primary">
            <span>🏰</span> Explore Forts
          </a>
          <a href="#/flora" class="btn btn-secondary">
            <span>🌿</span> Discover Flora
          </a>
        </div>
      </div>
      <div class="hero-scroll-indicator">
        <span>Scroll Down</span>
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">${forts.length}+</span>
            <span class="stat-label">Historic Forts</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">9</span>
            <span class="stat-label">Districts Covered</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">12+</span>
            <span class="stat-label">Flora Species</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">AI</span>
            <span class="stat-label">Powered Adviser</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Forts -->
    <section class="section featured-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Featured Forts</h2>
          <p class="section-subtitle">Iconic fortifications that shaped Maharashtra's history</p>
        </div>
        <div class="card-grid" id="featuredGrid"></div>
        <div class="section-cta">
          <a href="#/forts" class="btn btn-outline">View All Forts →</a>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="section about-section">
      <div class="container">
        <div class="about-grid">
          <div class="about-content">
            <h2 class="section-title">Maharashtra's Living Heritage</h2>
            <p>Maharashtra is home to over <strong>350 forts</strong> built across centuries by the Maratha Empire, Mughals, British, Portuguese, and other dynasties. These forts are not just stone structures — they are living testimonies to the valour, strategy, and vision of their builders.</p>
            <p>The Western Ghats — a UNESCO World Heritage biodiversity hotspot — surround many of these forts with lush forests, rare medicinal plants, and endemic species. Fort-Flora brings these two domains together.</p>
            <div class="about-features">
              <div class="about-feature">
                <span class="feature-icon">🏰</span>
                <span>Detailed fort histories</span>
              </div>
              <div class="about-feature">
                <span class="feature-icon">🌿</span>
                <span>Flora & medicinal plants</span>
              </div>
              <div class="about-feature">
                <span class="feature-icon">🤖</span>
                <span>AI-powered advice</span>
              </div>
              <div class="about-feature">
                <span class="feature-icon">🌓</span>
                <span>Dark & light mode</span>
              </div>
            </div>
          </div>
          <div class="about-image">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80" alt="Maharashtra Fort" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  `;

    app.appendChild(main);

    // Render featured fort cards
    const grid = main.querySelector('#featuredGrid');
    featured.forEach((fort) => grid.appendChild(createFortCard(fort)));

    app.appendChild(renderFooter());
}
