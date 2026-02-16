import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { forts, flora, getDistricts, getFortName } from '../data/seed.js';
import supabase from '../lib/supabase.js';
import { getCurrentUser, signIn, signUp, signOut, isAdmin } from '../lib/auth.js';

export async function renderAdmin(app) {
  app.innerHTML = '';
  app.appendChild(renderNavbar());

  const main = document.createElement('main');
  main.className = 'page-content admin-page';

  // Check auth state
  const user = await getCurrentUser();

  if (!user) {
    renderLoginForm(main, app);
  } else {
    // Check admin role
    const adminAccess = await isAdmin(user.id);
    if (!adminAccess) {
      renderAccessDenied(main, app, user);
    } else {
      renderAdminPanel(main, app, user);
    }
  }

  app.appendChild(main);
  app.appendChild(renderFooter());
}

// ===================== ACCESS DENIED =====================
function renderAccessDenied(main, app, user) {
  main.innerHTML = `
    <section class="page-hero admin-hero">
      <h1 class="page-title">🚫 Access Denied</h1>
      <p class="page-subtitle">You don't have admin privileges to access this page.</p>
      <div class="admin-user-bar">
        <span class="user-email">👤 ${user.email}</span>
        <button class="btn btn-outline btn-sm" id="signOutBtn">Sign Out</button>
      </div>
    </section>
    <section class="section">
      <div class="container" style="text-align:center;">
        <div class="access-denied-card">
          <span style="font-size:3rem;display:block;margin-bottom:16px;">🔒</span>
          <h3 style="margin-bottom:12px;">Admin Access Required</h3>
          <p style="color:var(--text-secondary);margin-bottom:24px;">Only users with admin role can manage forts and flora data. Contact the administrator for access.</p>
          <a href="#/" class="btn btn-primary">Go to Home</a>
        </div>
      </div>
    </section>
  `;

  main.querySelector('#signOutBtn').addEventListener('click', async () => {
    await signOut();
    renderAdmin(app);
  });
}

// ===================== LOGIN / SIGNUP FORM =====================
function renderLoginForm(main, app) {
  main.innerHTML = `
    <section class="page-hero admin-hero">
      <h1 class="page-title">🔐 Admin Login</h1>
      <p class="page-subtitle">Sign in to manage forts and flora data</p>
    </section>
    <section class="section">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-tabs">
            <button class="auth-tab active" data-tab="login">Sign In</button>
            <button class="auth-tab" data-tab="signup">Sign Up</button>
          </div>

          <!-- Login Form -->
          <form id="loginForm" class="auth-form active">
            <div class="form-group">
              <label for="loginEmail">Email</label>
              <input type="email" id="loginEmail" required placeholder="admin@example.com" autocomplete="email" />
            </div>
            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" required placeholder="Your password" autocomplete="current-password" />
            </div>
            <div class="auth-error" id="loginError"></div>
            <button type="submit" class="btn btn-primary auth-btn" id="loginBtn">
              <span class="btn-text">Sign In</span>
              <span class="btn-loading" style="display:none;">Signing in...</span>
            </button>
          </form>

          <!-- Signup Form -->
          <form id="signupForm" class="auth-form">
            <div class="form-group">
              <label for="signupEmail">Email</label>
              <input type="email" id="signupEmail" required placeholder="admin@example.com" autocomplete="email" />
            </div>
            <div class="form-group">
              <label for="signupPassword">Password</label>
              <input type="password" id="signupPassword" required placeholder="Min 6 characters" minlength="6" autocomplete="new-password" />
            </div>
            <div class="form-group">
              <label for="signupConfirm">Confirm Password</label>
              <input type="password" id="signupConfirm" required placeholder="Confirm password" autocomplete="new-password" />
            </div>
            <div class="auth-error" id="signupError"></div>
            <button type="submit" class="btn btn-primary auth-btn" id="signupBtn">
              <span class="btn-text">Create Account</span>
              <span class="btn-loading" style="display:none;">Creating...</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>🔒 Admin access is restricted to authorized users only.</p>
          </div>
        </div>
      </div>
    </section>
  `;

  // Tab switching
  const tabs = main.querySelectorAll('.auth-tab');
  const loginForm = main.querySelector('#loginForm');
  const signupForm = main.querySelector('#signupForm');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
      } else {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
      }
    });
  });

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = main.querySelector('#loginEmail').value;
    const password = main.querySelector('#loginPassword').value;
    const errorEl = main.querySelector('#loginError');
    const btn = main.querySelector('#loginBtn');

    errorEl.textContent = '';
    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.btn-loading').style.display = 'inline';
    btn.disabled = true;

    const { error } = await signIn(email, password);

    if (error) {
      errorEl.textContent = error.message;
      btn.querySelector('.btn-text').style.display = 'inline';
      btn.querySelector('.btn-loading').style.display = 'none';
      btn.disabled = false;
    } else {
      // Re-render admin page as authenticated
      renderAdmin(app);
    }
  });

  // Signup handler
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = main.querySelector('#signupEmail').value;
    const password = main.querySelector('#signupPassword').value;
    const confirm = main.querySelector('#signupConfirm').value;
    const errorEl = main.querySelector('#signupError');
    const btn = main.querySelector('#signupBtn');

    errorEl.textContent = '';

    if (password !== confirm) {
      errorEl.textContent = 'Passwords do not match.';
      return;
    }

    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.btn-loading').style.display = 'inline';
    btn.disabled = true;

    const { error } = await signUp(email, password);

    if (error) {
      errorEl.textContent = error.message;
    } else {
      errorEl.textContent = '';
      showToast('Account created! Check your email for confirmation, then sign in.');
      // Switch to login tab
      tabs[0].click();
    }

    btn.querySelector('.btn-text').style.display = 'inline';
    btn.querySelector('.btn-loading').style.display = 'none';
    btn.disabled = false;
  });
}

// ===================== ADMIN PANEL (authenticated + admin role) =====================
async function renderAdminPanel(main, app, user) {
  const districts = getDistricts();

  // Fetch live data from Supabase
  let fortData = [...forts];
  let floraData = [...flora];

  if (supabase) {
    try {
      const [fortRes, floraRes] = await Promise.all([
        supabase.from('forts').select('*'),
        supabase.from('flora').select('*'),
      ]);
      if (!fortRes.error && fortRes.data?.length > 0) fortData = fortRes.data;
      if (!floraRes.error && floraRes.data?.length > 0) floraData = floraRes.data;
    } catch (e) {
      console.log('Using seed data for admin');
    }
  }

  main.innerHTML = `
    <section class="page-hero admin-hero">
      <h1 class="page-title">⚙️ Admin Panel</h1>
      <p class="page-subtitle">Manage forts and flora data${!supabase ? ' (Supabase not configured — showing seed data)' : ''}</p>
      <div class="admin-user-bar">
        <span class="user-email">👤 ${user.email}</span>
        <span class="admin-badge">🛡️ Admin</span>
        <button class="btn btn-outline btn-sm" id="signOutBtn">Sign Out</button>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="admin-tabs">
          <button class="tab-btn active" data-tab="forts">🏰 Forts (${fortData.length})</button>
          <button class="tab-btn" data-tab="flora">🌿 Flora (${floraData.length})</button>
        </div>

        <!-- Forts Tab -->
        <div class="tab-content active" id="tab-forts">
          <div class="admin-form-card">
            <h3 id="fortFormTitle">Add New Fort</h3>
            <form id="addFortForm" class="admin-form">
              <input type="hidden" id="editFortId" value="" />
              <div class="form-row">
                <div class="form-group">
                  <label for="fortName">Fort Name</label>
                  <input type="text" id="fortName" required placeholder="e.g. Raigad Fort" />
                </div>
                <div class="form-group">
                  <label for="fortDistrict">District</label>
                  <select id="fortDistrict" required>
                    <option value="">Select district</option>
                    ${districts.map((d) => `<option value="${d}">${d}</option>`).join('')}
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="fortHeight">Height (m)</label>
                  <input type="number" id="fortHeight" placeholder="0 for sea forts" />
                </div>
                <div class="form-group">
                  <label for="fortBestTime">Best Time to Visit</label>
                  <input type="text" id="fortBestTime" placeholder="e.g. October – February" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="fortLat">Latitude</label>
                  <input type="number" step="any" id="fortLat" placeholder="e.g. 18.2348" />
                </div>
                <div class="form-group">
                  <label for="fortLng">Longitude</label>
                  <input type="number" step="any" id="fortLng" placeholder="e.g. 73.4473" />
                </div>
              </div>
              <div class="form-group">
                <label for="fortHistory">History</label>
                <textarea id="fortHistory" rows="3" placeholder="Brief history of the fort..."></textarea>
              </div>
              <div class="form-group">
                <label for="fortImage">Image URL</label>
                <input type="url" id="fortImage" placeholder="https://..." />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" id="fortSubmitBtn">Add Fort</button>
                <button type="button" class="btn btn-outline" id="cancelEditFort" style="display:none;">Cancel Edit</button>
              </div>
            </form>
          </div>
          <div class="admin-list" id="fortsList"></div>
        </div>

        <!-- Flora Tab -->
        <div class="tab-content" id="tab-flora">
          <div class="admin-form-card">
            <h3>Add New Flora</h3>
            <form id="addFloraForm" class="admin-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="floraName">Plant Name</label>
                  <input type="text" id="floraName" required placeholder="e.g. Indian Rosewood" />
                </div>
                <div class="form-group">
                  <label for="floraScientific">Scientific Name</label>
                  <input type="text" id="floraScientific" placeholder="e.g. Dalbergia latifolia" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="floraFort">Associated Fort</label>
                  <select id="floraFort">
                    <option value="">Select fort</option>
                    ${fortData.map((f) => `<option value="${f.id}">${f.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label for="floraImage">Image URL</label>
                  <input type="url" id="floraImage" placeholder="https://..." />
                </div>
              </div>
              <div class="form-group">
                <label for="floraMedicinal">Medicinal Use</label>
                <textarea id="floraMedicinal" rows="2" placeholder="Medicinal properties..."></textarea>
              </div>
              <div class="form-group">
                <label for="floraDesc">Description</label>
                <textarea id="floraDesc" rows="2" placeholder="Description of the plant..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Add Flora</button>
            </form>
          </div>
          <div class="admin-list" id="floraList"></div>
        </div>
      </div>
    </section>
  `;

  // Sign out button
  main.querySelector('#signOutBtn').addEventListener('click', async () => {
    await signOut();
    renderAdmin(app);
  });

  // Tab switching
  const tabBtns = main.querySelectorAll('.tab-btn');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      main.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
      main.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // ===== Fort List =====
  const fortsList = main.querySelector('#fortsList');
  function renderFortList() {
    fortsList.innerHTML = `<h3 class="list-title">Existing Forts (${fortData.length})</h3>`;
    fortData.forEach((fort) => {
      const item = document.createElement('div');
      item.className = 'admin-list-item';
      item.innerHTML = `
        <div class="list-item-info">
          <strong>${fort.name}</strong>
          <span class="list-meta">${fort.district} · ${fort.height > 0 ? fort.height + 'm' : 'Sea Fort'}</span>
        </div>
        <div class="list-item-actions">
          <button class="btn-edit" data-id="${fort.id}" title="Edit fort">✏️</button>
          <button class="btn-delete" data-id="${fort.id}" data-type="fort" title="Delete fort">✕</button>
        </div>
      `;
      fortsList.appendChild(item);
    });
  }

  // ===== Flora List =====
  const floraList = main.querySelector('#floraList');
  function renderFloraList() {
    floraList.innerHTML = `<h3 class="list-title">Existing Flora (${floraData.length})</h3>`;
    floraData.forEach((plant) => {
      const fortName = fortData.find((f) => f.id === plant.fort_id)?.name || getFortName(plant.fort_id);
      const item = document.createElement('div');
      item.className = 'admin-list-item';
      item.innerHTML = `
        <div class="list-item-info">
          <strong>${plant.name}</strong>
          <span class="list-meta"><em>${plant.scientific_name}</em> · ${fortName}</span>
        </div>
        <button class="btn-delete" data-id="${plant.id}" data-type="flora" title="Delete flora">✕</button>
      `;
      floraList.appendChild(item);
    });
  }

  renderFortList();
  renderFloraList();

  // ===== Edit Fort =====
  const addFortForm = main.querySelector('#addFortForm');
  const editFortId = main.querySelector('#editFortId');
  const fortFormTitle = main.querySelector('#fortFormTitle');
  const fortSubmitBtn = main.querySelector('#fortSubmitBtn');
  const cancelEditBtn = main.querySelector('#cancelEditFort');

  fortsList.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    if (!editBtn) return;

    const id = parseInt(editBtn.dataset.id);
    const fort = fortData.find((f) => f.id === id);
    if (!fort) return;

    // Populate form
    editFortId.value = fort.id;
    main.querySelector('#fortName').value = fort.name;
    main.querySelector('#fortDistrict').value = fort.district;
    main.querySelector('#fortHeight').value = fort.height || '';
    main.querySelector('#fortBestTime').value = fort.best_time || '';
    main.querySelector('#fortLat').value = fort.latitude || '';
    main.querySelector('#fortLng').value = fort.longitude || '';
    main.querySelector('#fortHistory').value = fort.history || '';
    main.querySelector('#fortImage').value = fort.image_url || '';

    fortFormTitle.textContent = `Edit Fort: ${fort.name}`;
    fortSubmitBtn.textContent = 'Update Fort';
    cancelEditBtn.style.display = 'inline-flex';

    // Scroll to form
    addFortForm.scrollIntoView({ behavior: 'smooth' });
  });

  cancelEditBtn.addEventListener('click', () => {
    resetFortForm();
  });

  function resetFortForm() {
    addFortForm.reset();
    editFortId.value = '';
    fortFormTitle.textContent = 'Add New Fort';
    fortSubmitBtn.textContent = 'Add Fort';
    cancelEditBtn.style.display = 'none';
  }

  // Add/Edit Fort form
  addFortForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const isEditing = !!editFortId.value;
    const fortPayload = {
      name: main.querySelector('#fortName').value,
      district: main.querySelector('#fortDistrict').value,
      height: parseInt(main.querySelector('#fortHeight').value) || 0,
      best_time: main.querySelector('#fortBestTime').value,
      latitude: parseFloat(main.querySelector('#fortLat').value) || null,
      longitude: parseFloat(main.querySelector('#fortLng').value) || null,
      history: main.querySelector('#fortHistory').value,
      image_url: main.querySelector('#fortImage').value || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    };

    if (supabase) {
      try {
        if (isEditing) {
          const { error } = await supabase.from('forts').update(fortPayload).eq('id', editFortId.value);
          if (error) throw error;
          showToast('Fort updated successfully!');
        } else {
          const { error } = await supabase.from('forts').insert(fortPayload);
          if (error) throw error;
          showToast('Fort added successfully!');
        }
        // Refresh data
        const { data } = await supabase.from('forts').select('*');
        if (data) fortData = data;
        renderFortList();
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    } else {
      showToast('Fort saved locally (Supabase not configured)');
    }

    resetFortForm();
  });

  // Add Flora form
  const addFloraForm = main.querySelector('#addFloraForm');
  addFloraForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newFlora = {
      name: main.querySelector('#floraName').value,
      scientific_name: main.querySelector('#floraScientific').value,
      fort_id: parseInt(main.querySelector('#floraFort').value) || null,
      medicinal_use: main.querySelector('#floraMedicinal').value,
      description: main.querySelector('#floraDesc').value,
      image_url: main.querySelector('#floraImage').value || 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80',
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('flora').insert(newFlora);
        if (error) throw error;
        showToast('Flora added successfully!');
        // Refresh data
        const { data } = await supabase.from('flora').select('*');
        if (data) floraData = data;
        renderFloraList();
      } catch (err) {
        showToast('Error adding flora: ' + err.message, 'error');
      }
    } else {
      showToast('Flora saved locally (Supabase not configured)');
    }

    addFloraForm.reset();
  });

  // Delete handler
  main.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.btn-delete');
    if (!deleteBtn) return;

    const id = deleteBtn.dataset.id;
    const type = deleteBtn.dataset.type;

    if (!confirm(`Delete this ${type}?`)) return;

    if (supabase) {
      try {
        const { error } = await supabase.from(type === 'fort' ? 'forts' : 'flora').delete().eq('id', id);
        if (error) throw error;
        showToast(`${type} deleted successfully!`);
        // Refresh lists
        if (type === 'fort') {
          const { data } = await supabase.from('forts').select('*');
          if (data) fortData = data;
          renderFortList();
        } else {
          const { data } = await supabase.from('flora').select('*');
          if (data) floraData = data;
          renderFloraList();
        }
      } catch (err) {
        showToast('Error deleting: ' + err.message, 'error');
      }
    } else {
      showToast('Cannot delete without Supabase connection', 'error');
    }
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
