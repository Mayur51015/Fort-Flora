import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { getCurrentUser, signIn, signUp } from '../lib/auth.js';
import { navigateTo } from '../router.js';

export async function renderAuthPage(app) {
    // If already logged in, redirect to home
    const user = await getCurrentUser();
    if (user) {
        navigateTo('/');
        return;
    }

    app.innerHTML = '';
    app.appendChild(renderNavbar());

    const main = document.createElement('main');
    main.className = 'page-content auth-standalone-page';
    main.innerHTML = `
    <section class="page-hero auth-hero">
      <h1 class="page-title">🔐 Welcome to Fort-Flora</h1>
      <p class="page-subtitle">Sign in to bookmark your favorite forts and access personalized features</p>
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
              <input type="email" id="loginEmail" required placeholder="your@email.com" autocomplete="email" />
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
              <input type="email" id="signupEmail" required placeholder="your@email.com" autocomplete="email" />
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
            <p>🌿 Join Fort-Flora to explore Maharashtra's heritage</p>
          </div>
        </div>
      </div>
    </section>
  `;

    app.appendChild(main);
    app.appendChild(renderFooter());

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
            navigateTo('/');
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
            tabs[0].click();
        }

        btn.querySelector('.btn-text').style.display = 'inline';
        btn.querySelector('.btn-loading').style.display = 'none';
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
