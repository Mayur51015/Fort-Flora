import { getCurrentUser, addBookmark, removeBookmark, isBookmarked } from '../lib/auth.js';

export function createFortCard(fort, showRemoveBtn = false) {
  const card = document.createElement('div');
  card.className = 'fort-card';
  card.innerHTML = `
    <div class="card-image-wrapper">
      <img src="${fort.image_url}" alt="${fort.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'" />
      <span class="card-badge">${fort.district}</span>
      <button class="bookmark-btn" data-fort-id="${fort.id}" title="${showRemoveBtn ? 'Remove from favorites' : 'Bookmark this fort'}">
        ${showRemoveBtn ? '❌' : '🤍'}
      </button>
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

  // Bookmark toggle (only for non-remove mode)
  if (!showRemoveBtn) {
    const bookmarkBtn = card.querySelector('.bookmark-btn');
    initBookmarkBtn(bookmarkBtn, fort.id);
  }

  return card;
}

async function initBookmarkBtn(btn, fortId) {
  const user = await getCurrentUser();

  if (!user) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('Sign in to bookmark forts', 'error');
    });
    return;
  }

  // Check if already bookmarked
  const bookmarked = await isBookmarked(user.id, fortId);
  if (bookmarked) {
    btn.textContent = '❤️';
    btn.classList.add('bookmarked');
  }

  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    btn.disabled = true;

    if (btn.classList.contains('bookmarked')) {
      await removeBookmark(user.id, fortId);
      btn.textContent = '🤍';
      btn.classList.remove('bookmarked');
      showToast('Removed from favorites');
    } else {
      await addBookmark(user.id, fortId);
      btn.textContent = '❤️';
      btn.classList.add('bookmarked');
      showToast('Added to favorites!');
    }

    btn.disabled = false;
  });
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
