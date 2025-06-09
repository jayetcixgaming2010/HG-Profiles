import { getProfiles } from './api.js';
import { t } from './i18n.js';

let jobChart, viewChart;

export function renderStats() {
  const profiles = getProfiles();
  const total = profiles.length;
  let totalViews = 0;
  for (let i = 0; i < total; i++) {
    totalViews += parseInt(localStorage.getItem('profile_view_' + i) || '0', 10);
  }
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  const statsElement = document.getElementById('stats');
  if (statsElement) {
    statsElement.innerHTML = `${t('total')}: ${total} | ${t('totalViews')}: ${totalViews} | ${t('favorites')}: ${favs.length}`;
  }
}

export async function renderCharts() {
  const profiles = await getProfiles();

  // Thống kê nghề nghiệp
  const jobCounts = {};
  profiles.forEach(p => {
    if (!p.job) return;
    jobCounts[p.job] = (jobCounts[p.job] || 0) + 1;
  });

  const jobLabels = Object.keys(jobCounts);
  const jobData = Object.values(jobCounts);

  const jobCtx = document.getElementById('jobDistributionChart')?.getContext('2d');
  if (jobCtx) {
    if (jobChart) jobChart.destroy();
    jobChart = new Chart(jobCtx, {
      type: 'doughnut',
      data: {
        labels: jobLabels,
        datasets: [{
          data: jobData,
          backgroundColor: ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: t('jobDistribution') || 'Phân bố nghề nghiệp',
            color: document.body.classList.contains('theme-dark') ? '#fff' : '#333'
          },
          legend: {
            labels: {
              color: document.body.classList.contains('theme-dark') ? '#eee' : '#555'
            }
          }
        }
      }
    });
  }

  // Thống kê lượt xem
  const viewCounts = profiles.map((p, idx) => parseInt(localStorage.getItem('profile_view_' + idx) || '0', 10));
  const viewLabels = profiles.map(p => p.name);

  const viewCtx = document.getElementById('profileViewsChart')?.getContext('2d');
  if (viewCtx) {
    if (viewChart) viewChart.destroy();
    viewChart = new Chart(viewCtx, {
      type: 'bar',
      data: {
        labels: viewLabels,
        datasets: [{
          label: t('profileViews') || 'Lượt xem Profile',
          data: viewCounts,
          backgroundColor: 'rgba(13, 110, 253, 0.5)',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: t('profileViewsChart') || 'Biểu đồ Lượt xem Profile',
            color: document.body.classList.contains('theme-dark') ? '#fff' : '#333'
          },
          legend: {
            labels: {
              color: document.body.classList.contains('theme-dark') ? '#eee' : '#555'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: document.body.classList.contains('theme-dark') ? '#eee' : '#555'
            }
          },
          x: {
            ticks: {
              color: document.body.classList.contains('theme-dark') ? '#eee' : '#555'
            }
          }
        }
      }
    });
  }
} 