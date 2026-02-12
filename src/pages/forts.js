import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { createFortCard } from '../components/fortCard.js';
import { forts, getDistricts } from '../data/seed.js';
import supabase from '../lib/supabase.js';

export async function renderForts(app) {
    app.innerHTML = '';
    app.appendChild(renderNavbar());

    const districts = getDistricts();

    const main = document.createElement('main');
    main.className = 'page-content';
    main.innerHTML = `
    <section class="page-hero">
      <h1 class="page-title">🏰 Maharashtra Forts</h1>
      <p class="page-subtitle">Explore the majestic forts that guard the Western Ghats and Konkan coast</p>
    </section>
    <section class="section">
      <div class="container">
        <div class="filter-bar">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="fortSearch" class="search-input" placeholder="Search forts by name..." />
          </div>
          <select id="districtFilter" class="filter-select">
            <option value="">All Districts</option>
            ${districts.map((d) => `<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>
        <div class="results-info" id="resultsInfo"></div>
        <div class="card-grid" id="fortsGrid"></div>
      </div>
    </section>
  `;

    app.appendChild(main);

    // Try fetching from Supabase, fallback to seed
    let fortData = forts;
    if (supabase) {
        try {
            const { data, error } = await supabase.from('forts').select('*');
            if (!error && data && data.length > 0) {
                fortData = data;
            }
        } catch (e) {
            console.log('Using seed data (Supabase unavailable)');
        }
    }

    const grid = main.querySelector('#fortsGrid');
    const searchInput = main.querySelector('#fortSearch');
    const districtFilter = main.querySelector('#districtFilter');
    const resultsInfo = main.querySelector('#resultsInfo');

    function renderCards() {
        const query = searchInput.value.toLowerCase();
        const district = districtFilter.value;

        const filtered = fortData.filter((f) => {
            const matchName = f.name.toLowerCase().includes(query);
            const matchDistrict = !district || f.district === district;
            return matchName && matchDistrict;
        });

        grid.innerHTML = '';
        resultsInfo.textContent = `Showing ${filtered.length} of ${fortData.length} forts`;

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="empty-state"><p>No forts found. Try a different search.</p></div>';
            return;
        }

        filtered.forEach((fort) => {
            grid.appendChild(createFortCard(fort));
        });
    }

    searchInput.addEventListener('input', renderCards);
    districtFilter.addEventListener('change', renderCards);
    renderCards();

    app.appendChild(renderFooter());
}
