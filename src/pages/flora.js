import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { createFloraCard } from '../components/floraCard.js';
import { flora } from '../data/seed.js';
import supabase from '../lib/supabase.js';

export async function renderFlora(app) {
    app.innerHTML = '';
    app.appendChild(renderNavbar());

    const main = document.createElement('main');
    main.className = 'page-content';
    main.innerHTML = `
    <section class="page-hero flora-hero">
      <h1 class="page-title">🌿 Flora of Maharashtra</h1>
      <p class="page-subtitle">Medicinal plants, ancient trees, and endemic species found near our historic forts</p>
    </section>
    <section class="section">
      <div class="container">
        <div class="filter-bar">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="floraSearch" class="search-input" placeholder="Search plants by name..." />
          </div>
        </div>
        <div class="card-grid flora-grid" id="floraGrid"></div>
      </div>
    </section>
  `;

    app.appendChild(main);

    let floraData = flora;
    if (supabase) {
        try {
            const { data, error } = await supabase.from('flora').select('*');
            if (!error && data && data.length > 0) {
                floraData = data;
            }
        } catch (e) {
            console.log('Using seed flora data (Supabase unavailable)');
        }
    }

    const grid = main.querySelector('#floraGrid');
    const searchInput = main.querySelector('#floraSearch');

    function renderCards() {
        const query = searchInput.value.toLowerCase();
        const filtered = floraData.filter(
            (p) =>
                p.name.toLowerCase().includes(query) ||
                p.scientific_name.toLowerCase().includes(query)
        );

        grid.innerHTML = '';
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-state"><p>No plants found. Try a different search.</p></div>';
            return;
        }
        filtered.forEach((plant) => grid.appendChild(createFloraCard(plant)));
    }

    searchInput.addEventListener('input', renderCards);
    renderCards();

    app.appendChild(renderFooter());
}
