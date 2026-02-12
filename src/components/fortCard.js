export function createFortCard(fort) {
    const card = document.createElement('div');
    card.className = 'fort-card';
    card.innerHTML = `
    <div class="card-image-wrapper">
      <img src="${fort.image_url}" alt="${fort.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'" />
      <span class="card-badge">${fort.district}</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${fort.name}</h3>
      <div class="card-meta">
        ${fort.height > 0 ? `<span class="meta-item">⛰️ ${fort.height}m</span>` : `<span class="meta-item">🌊 Sea Fort</span>`}
        <span class="meta-item">📅 ${fort.best_time}</span>
      </div>
      <p class="card-text">${fort.history.length > 120 ? fort.history.slice(0, 120) + '…' : fort.history}</p>
    </div>
  `;
    return card;
}
