import { getFortName } from '../data/seed.js';

export function createFloraCard(plant) {
    const fortName = getFortName(plant.fort_id);
    const card = document.createElement('div');
    card.className = 'flora-card';
    card.innerHTML = `
    <div class="card-image-wrapper">
      <img src="${plant.image_url}" alt="${plant.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80'" />
      <span class="card-badge flora-badge">🌿 ${fortName}</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">${plant.name}</h3>
      <p class="card-scientific"><em>${plant.scientific_name}</em></p>
      <p class="card-text">${plant.description}</p>
      <div class="medicinal-tag">
        <span class="tag-icon">💊</span>
        <span class="tag-text">${plant.medicinal_use}</span>
      </div>
    </div>
  `;
    return card;
}
