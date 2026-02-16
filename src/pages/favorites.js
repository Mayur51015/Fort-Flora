import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { createFortCard } from '../components/fortCard.js';
import { forts } from '../data/seed.js';
import supabase from '../lib/supabase.js';
import { getCurrentUser, getBookmarks, removeBookmark } from '../lib/auth.js';
import { navigateTo } from '../router.js';

export async function renderFavorites(app) {
    app.innerHTML = '';
    app.appendChild(renderNavbar());

    // Check auth
    const user = await getCurrentUser();
    if (!user) {
        const main = document.createElement('main');
        main.className = 'page-content';
        main.innerHTML = `
      <section class="page-hero">
        <h1 class="page-title">❤️ My Favorites</h1>
        <p class="page-subtitle">Sign in to save and view your favorite forts</p>
      </section>
      <section class="section">
        <div class="container" style="text-align:center;">
          <p style="color:var(--text-secondary);margin-bottom:24px;">You need to be logged in to view your favorites.</p>
          <a href="#/auth" class="btn btn-primary">Sign In / Sign Up</a>
        </div>
      </section>
    `;
        app.appendChild(main);
        app.appendChild(renderFooter());
        return;
    }

    const main = document.createElement('main');
    main.className = 'page-content favorites-page';
    main.innerHTML = `
    <section class="page-hero">
      <h1 class="page-title">❤️ My Favorite Forts</h1>
      <p class="page-subtitle">Your personally curated collection of Maharashtra's forts</p>
    </section>
    <section class="section">
      <div class="container">
        <div class="favorites-loading" id="favLoading">
          <div class="typing-dots"><span></span><span></span><span></span></div>
          <p>Loading your favorites...</p>
        </div>
        <div class="card-grid" id="favGrid" style="display:none;"></div>
        <div class="empty-state" id="favEmpty" style="display:none;">
          <p>You haven't bookmarked any forts yet!</p>
          <a href="#/forts" class="btn btn-primary" style="margin-top:16px;">Explore Forts</a>
        </div>
      </div>
    </section>
  `;

    app.appendChild(main);
    app.appendChild(renderFooter());

    const grid = main.querySelector('#favGrid');
    const loading = main.querySelector('#favLoading');
    const empty = main.querySelector('#favEmpty');

    try {
        // Get bookmarked fort IDs
        const bookmarks = await getBookmarks(user.id);

        // Get full fort data
        let fortData = forts;
        if (supabase) {
            try {
                const { data, error } = await supabase.from('forts').select('*');
                if (!error && data?.length > 0) fortData = data;
            } catch (e) { /* use seed */ }
        }

        loading.style.display = 'none';

        if (bookmarks.length === 0) {
            empty.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        const bookmarkedFortIds = bookmarks.map((b) => b.fort_id);
        const favoriteForts = fortData.filter((f) => bookmarkedFortIds.includes(f.id));

        favoriteForts.forEach((fort) => {
            const card = createFortCard(fort, true); // true = show remove button
            const removeBtn = card.querySelector('.bookmark-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await removeBookmark(user.id, fort.id);
                    card.remove();
                    if (grid.children.length === 0) {
                        grid.style.display = 'none';
                        empty.style.display = 'block';
                    }
                    showToast('Removed from favorites');
                });
            }
            grid.appendChild(card);
        });
    } catch (err) {
        loading.style.display = 'none';
        empty.innerHTML = '<p>Could not load favorites. Please try again.</p>';
        empty.style.display = 'block';
    }
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
