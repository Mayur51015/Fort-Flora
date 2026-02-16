import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { forts, flora, getDistricts } from '../data/seed.js';
import supabase from '../lib/supabase.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export async function renderDashboard(app) {
    app.innerHTML = '';
    app.appendChild(renderNavbar());

    const main = document.createElement('main');
    main.className = 'page-content dashboard-page';
    main.innerHTML = `
    <section class="page-hero dashboard-hero">
      <h1 class="page-title">📊 Biodiversity Analytics</h1>
      <p class="page-subtitle">Live statistics on Maharashtra's forts and their surrounding flora</p>
    </section>
    <section class="section">
      <div class="container">
        <div class="dashboard-stats" id="dashStats"></div>
        <div class="dashboard-charts">
          <div class="chart-card">
            <h3 class="chart-title">🏰 District-wise Fort Distribution</h3>
            <div class="chart-wrapper">
              <canvas id="fortBarChart"></canvas>
            </div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">🌿 Flora per Fort</h3>
            <div class="chart-wrapper">
              <canvas id="floraPieChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

    app.appendChild(main);
    app.appendChild(renderFooter());

    // Fetch live data
    let fortData = forts;
    let floraData = flora;

    if (supabase) {
        try {
            const [fortRes, floraRes] = await Promise.all([
                supabase.from('forts').select('*'),
                supabase.from('flora').select('*'),
            ]);
            if (!fortRes.error && fortRes.data?.length > 0) fortData = fortRes.data;
            if (!floraRes.error && floraRes.data?.length > 0) floraData = floraRes.data;
        } catch (e) {
            console.log('Using seed data for dashboard');
        }
    }

    const districts = [...new Set(fortData.map((f) => f.district))].sort();
    const totalForts = fortData.length;
    const totalFlora = floraData.length;
    const totalDistricts = districts.length;

    // Render stat cards
    const statsEl = main.querySelector('#dashStats');
    statsEl.innerHTML = `
    <div class="dash-stat-card">
      <span class="dash-stat-icon">🏰</span>
      <span class="dash-stat-number" data-target="${totalForts}">0</span>
      <span class="dash-stat-label">Total Forts</span>
    </div>
    <div class="dash-stat-card">
      <span class="dash-stat-icon">🌿</span>
      <span class="dash-stat-number" data-target="${totalFlora}">0</span>
      <span class="dash-stat-label">Flora Species</span>
    </div>
    <div class="dash-stat-card">
      <span class="dash-stat-icon">📍</span>
      <span class="dash-stat-number" data-target="${totalDistricts}">0</span>
      <span class="dash-stat-label">Districts Covered</span>
    </div>
    <div class="dash-stat-card">
      <span class="dash-stat-icon">📈</span>
      <span class="dash-stat-number" data-target="${Math.round(totalFlora / totalForts * 100) / 100}">0</span>
      <span class="dash-stat-label">Avg Flora/Fort</span>
    </div>
  `;

    // Animate stat counters
    animateCounters(statsEl);

    // CSS variable colors for charts
    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue('--accent').trim() || '#d4a843';
    const green = style.getPropertyValue('--green-primary').trim() || '#2d8659';
    const greenLight = style.getPropertyValue('--green-light').trim() || '#3aa76d';
    const textSecondary = style.getPropertyValue('--text-secondary').trim() || '#9bb5a8';

    // ===== Bar Chart: District-wise fort count =====
    const districtCounts = districts.map((d) => fortData.filter((f) => f.district === d).length);
    const barColors = districts.map((_, i) => {
        const hue = 140 + (i * 25) % 120;
        return `hsla(${hue}, 50%, 45%, 0.8)`;
    });

    new Chart(main.querySelector('#fortBarChart'), {
        type: 'bar',
        data: {
            labels: districts,
            datasets: [{
                label: 'Number of Forts',
                data: districtCounts,
                backgroundColor: barColors,
                borderColor: barColors.map((c) => c.replace('0.8', '1')),
                borderWidth: 1,
                borderRadius: 6,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart',
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { family: 'Inter' },
                    bodyFont: { family: 'Inter' },
                    padding: 12,
                    cornerRadius: 8,
                },
            },
            scales: {
                x: {
                    ticks: { color: textSecondary, font: { family: 'Inter', size: 11 } },
                    grid: { display: false },
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textSecondary,
                        font: { family: 'Inter', size: 11 },
                        stepSize: 1,
                    },
                    grid: { color: 'rgba(155,181,168,0.08)' },
                },
            },
        },
    });

    // ===== Pie Chart: Flora count per fort =====
    const floraPerFort = {};
    floraData.forEach((f) => {
        const fortName = fortData.find((ft) => ft.id === f.fort_id)?.name || 'Unknown';
        floraPerFort[fortName] = (floraPerFort[fortName] || 0) + 1;
    });

    const pieLabels = Object.keys(floraPerFort);
    const pieCounts = Object.values(floraPerFort);
    const pieColors = pieLabels.map((_, i) => {
        const hue = 30 + (i * 35) % 300;
        return `hsla(${hue}, 55%, 50%, 0.8)`;
    });

    new Chart(main.querySelector('#floraPieChart'), {
        type: 'doughnut',
        data: {
            labels: pieLabels,
            datasets: [{
                data: pieCounts,
                backgroundColor: pieColors,
                borderColor: 'rgba(0,0,0,0.1)',
                borderWidth: 2,
                hoverOffset: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart',
                animateRotate: true,
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textSecondary,
                        font: { family: 'Inter', size: 11 },
                        padding: 16,
                        usePointStyle: true,
                        pointStyleWidth: 10,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { family: 'Inter' },
                    bodyFont: { family: 'Inter' },
                    padding: 12,
                    cornerRadius: 8,
                },
            },
        },
    });
}

function animateCounters(container) {
    const counters = container.querySelectorAll('.dash-stat-number');
    counters.forEach((el) => {
        const target = parseFloat(el.dataset.target);
        const isFloat = target % 1 !== 0;
        const duration = 1200;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            el.textContent = isFloat ? current.toFixed(2) : Math.round(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    });
}
