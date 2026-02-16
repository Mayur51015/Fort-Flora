import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { forts } from '../data/seed.js';
import supabase from '../lib/supabase.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons (webpack/vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom fort marker icon
const fortIcon = L.divIcon({
    className: 'fort-marker-icon',
    html: '<div class="fort-marker">🏰</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

export async function renderMap(app) {
    app.innerHTML = '';
    app.appendChild(renderNavbar());

    const main = document.createElement('main');
    main.className = 'page-content map-page';
    main.innerHTML = `
    <section class="page-hero map-hero">
      <h1 class="page-title">🗺️ Interactive Fort Map</h1>
      <p class="page-subtitle">Explore Maharashtra's forts on an interactive map — click any marker for details</p>
    </section>
    <section class="map-section">
      <div class="map-container" id="fortMap"></div>
      <div class="map-legend">
        <span class="legend-item"><span class="legend-icon">🏰</span> Hill Fort</span>
        <span class="legend-item"><span class="legend-icon">🌊</span> Sea Fort</span>
      </div>
    </section>
  `;

    app.appendChild(main);
    app.appendChild(renderFooter());

    // Fetch fort data
    let fortData = forts;
    if (supabase) {
        try {
            const { data, error } = await supabase.from('forts').select('*');
            if (!error && data && data.length > 0) {
                fortData = data;
            }
        } catch (e) {
            console.log('Using seed data for map');
        }
    }

    // Initialize Leaflet map centered on Maharashtra
    const map = L.map('fortMap', {
        scrollWheelZoom: true,
        zoomControl: true,
    }).setView([19.0, 74.5], 7);

    // Add tile layer (dark-themed)
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
    }).addTo(map);

    // Plot markers for each fort
    fortData.forEach((fort) => {
        if (!fort.latitude || !fort.longitude) return;

        const marker = L.marker([fort.latitude, fort.longitude], { icon: fortIcon }).addTo(map);

        const heightDisplay = fort.height > 0
            ? `<span class="popup-meta">⛰️ ${fort.height}m</span>`
            : `<span class="popup-meta">🌊 Sea Fort</span>`;

        const popupContent = `
      <div class="fort-popup">
        <h3 class="popup-title">${fort.name}</h3>
        <div class="popup-info">
          <span class="popup-meta">📍 ${fort.district}</span>
          ${heightDisplay}
        </div>
        <p class="popup-history">${fort.history.length > 150 ? fort.history.slice(0, 150) + '…' : fort.history}</p>
        <a href="#/forts" class="popup-btn">View All Forts →</a>
      </div>
    `;

        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'fort-popup-wrapper',
        });
    });

    // Fix map rendering when container becomes visible
    setTimeout(() => map.invalidateSize(), 200);
}
