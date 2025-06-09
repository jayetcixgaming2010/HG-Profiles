import { getProfiles, saveProfiles } from './api.js';
import { showToast, isValidImageUrl, highlight, getQueryParam, increaseProfileView, renderSocialIcons, copyProfileLink, shareProfileFacebook } from './utils.js';
import { DEFAULT_AVATAR, pageSize } from './config.js';
import { t } from './i18n.js';

// Phân trang
export let currentPage = parseInt(localStorage.getItem('currentPage') || '1', 10);

// Lọc yêu thích
export let showFavsOnly = localStorage.getItem('showFavsOnly') === 'true';

// Sự kiện filter nâng cao
export let filterAvatarChecked = localStorage.getItem('filterAvatar') === 'true';
export let filterSocialChecked = localStorage.getItem('filterSocial') === 'true';
export let filterEmailChecked = localStorage.getItem('filterEmail') === 'true';
export let jobFilterValue = localStorage.getItem('jobFilter') || 'all';
export let azFilterValue = localStorage.getItem('azFilter') || 'all';
export let searchInputValue = localStorage.getItem('searchInput') || '';
export let viewMode = localStorage.getItem('viewMode') || 'grid';

export async function renderProfiles(filter = searchInputValue) {
  const profilesDiv = document.getElementById('profiles');
  const skeletonDiv = document.getElementById('skeleton');
  if (!profilesDiv) return;

  if (skeletonDiv) {
    skeletonDiv.innerHTML = Array(4).fill('<div class="skeleton-card"></div>').join('');
    skeletonDiv.style.display = 'flex';
  }
  profilesDiv.innerHTML = '';

  const profiles = await getProfiles();
  let filtered = profiles;

  // Apply search filter
  if (filter) {
    const f = filter.toLowerCase();
    filtered = profiles.filter(p =>
      p.name.toLowerCase().includes(f) ||
      p.job.toLowerCase().includes(f) ||
      p.bio.toLowerCase().includes(f)
    );
  }

  // Apply favorite filter
  if (showFavsOnly) {
    let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    filtered = filtered.filter((p, idx) => favs.includes(idx));
  }

  // Apply advanced filters
  if (filterAvatarChecked) {
    filtered = filtered.filter(p => isValidImageUrl(p.avatar));
  }
  if (filterSocialChecked) {
    filtered = filtered.filter(p => p.facebook || p.linkedin || p.instagram || p.tiktok || p.twitter || p.github || p.website);
  }
  if (filterEmailChecked) {
    filtered = filtered.filter(p => p.email);
  }

  // Apply job filter
  if (jobFilterValue !== 'all') {
    filtered = filtered.filter(p => p.job === jobFilterValue);
  }

  // Apply A-Z filter
  if (azFilterValue !== 'all') {
    filtered = filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (azFilterValue === 'az') return nameA.localeCompare(nameB);
      if (azFilterValue === 'za') return nameB.localeCompare(nameA);
      return 0;
    });
  }

  if (skeletonDiv) skeletonDiv.style.display = 'none';
  profilesDiv.innerHTML = '';

  if (filtered.length === 0) {
    profilesDiv.innerHTML = `<div class="text-center w-100 py-5 text-muted">${t('noProfile')}</div>`;
    renderProfileCount(0);
    if (typeof renderStats !== 'undefined') renderStats(); // Ensure renderStats exists
    if (typeof renderCharts !== 'undefined') renderCharts(); // Ensure renderCharts exists
    return;
  }

  profilesDiv.classList.add('fade-out'); // Add fade-out class
  await new Promise(resolve => setTimeout(resolve, 300)); // Wait for fade-out animation

  profilesDiv.innerHTML = ''; // Clear content after fade-out
  profilesDiv.classList.remove('fade-out'); // Remove fade-out class

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageProfiles = filtered.slice(start, end);

  profilesDiv.classList.toggle('list-view', viewMode === 'list');

  pageProfiles.forEach((profile, idx) => {
    const avatar = isValidImageUrl(profile.avatar) ? profile.avatar : DEFAULT_AVATAR;
    const globalIdx = profiles.indexOf(profile); // Get original index for views/favorites
    const card = document.createElement('div');
    card.className = 'col-md-6';
    card.innerHTML = `
      <div class="profile-card animate__animated animate__fadeInUp" style="animation-delay: ${idx * 0.1}s" data-idx="${globalIdx}">
        <img src="${avatar}" alt="${profile.name}" onerror="this.src='${DEFAULT_AVATAR}'">
        <div class="profile-info">
          <h2>${highlight(profile.name, filter)}</h2>
          <p><strong>${highlight(profile.job, filter)}</strong></p>
          <p>${highlight(profile.bio, filter)}</p>
          <div class="profile-actions">
            <a href="profile.html?id=${globalIdx}" class="btn btn-info ms-2" title="${t('view')}" data-bs-toggle="tooltip">${t('view')}</a>
            <button class="btn btn-outline-secondary btn-sm ms-2" onclick="copyProfileLink(${globalIdx})" title="${t('copy')}" data-bs-toggle="tooltip"><i class="bi bi-clipboard"></i></button>
            <button class="btn btn-outline-primary btn-sm ms-2" onclick="shareProfileFacebook(${globalIdx})" title="${t('share')} Facebook" data-bs-toggle="tooltip"><i class="bi bi-facebook"></i></button>
            <button onclick="toggleFavorite(${globalIdx})" class="btn btn-fav">${isFavorite(globalIdx) ? '❤️' : '🤍'}</button>
          </div>
        </div>
      </div>
    `;
    profilesDiv.appendChild(card);
  });

  if (window.bootstrap && window.bootstrap.Tooltip) {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
  }

  // Render nút phân trang
  const pagination = document.getElementById('pagination');
  if (pagination) {
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = 'btn btn-outline-secondary';
      if (i === currentPage) pageBtn.classList.add('active');
      pageBtn.textContent = i;
      pageBtn.onclick = () => {
        currentPage = i;
        localStorage.setItem('currentPage', currentPage);
        renderProfiles(filter);
      };
      pagination.appendChild(pageBtn);
    }
  }

  renderProfileCount(filtered.length);
  if (typeof renderStats !== 'undefined') renderStats();
  if (typeof renderCharts !== 'undefined') renderCharts();
}

export async function renderProfileDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get('id'), 10);
  const profileDetailDiv = document.getElementById('profileDetail');
  if (isNaN(id) || !profileDetailDiv) {
    profileDetailDiv.innerHTML = '<p>Profile không tồn tại.</p>';
    return;
  }

  const profiles = await getProfiles();
  const profile = profiles[id];

  if (!profile) {
    profileDetailDiv.innerHTML = '<p>Profile không tồn tại.</p>';
    return;
  }

  // Tăng lượt xem
  profile.views = increaseProfileView(id);

  // Cập nhật meta tags động
  document.title = `${profile.name} - ${profile.job}`;
  document.querySelector('meta[name="description"]').setAttribute('content', profile.bio);
  document.querySelector('meta[property="og:title"]').setAttribute('content', `${profile.name} - ${profile.job}`);
  document.querySelector('meta[property="og:description"]').setAttribute('content', profile.bio);
  document.querySelector('meta[property="og:image"]').setAttribute('content', profile.avatar || DEFAULT_AVATAR);
  document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
  document.querySelector('meta[name="twitter:title"]').setAttribute('content', `${profile.name} - ${profile.job}`);
  document.querySelector('meta[name="twitter:description"]').setAttribute('content', profile.bio);
  document.querySelector('meta[name="twitter:image"]').setAttribute('content', profile.avatar || DEFAULT_AVATAR);

  const avatar = isValidImageUrl(profile.avatar) ? profile.avatar : DEFAULT_AVATAR;
  profileDetailDiv.innerHTML = `
    <div class="profile-detail-card card shadow-lg p-4 animate__animated animate__fadeIn">
      <div class="row g-4">
        <div class="col-md-4 text-center">
          <img src="${avatar}" alt="${profile.name}" class="img-fluid rounded-circle mb-3 border border-3 border-primary" onerror="this.src='${DEFAULT_AVATAR}'">
          <h3>${profile.name}</h3>
          <p class="text-muted">${profile.job}</p>
          <div class="d-flex justify-content-center my-3">
            <button class="btn btn-fav btn-lg me-2" onclick="toggleFavorite(${id})" title="${t('favorite')}">${isFavorite(id) ? '❤️' : '🤍'}</button>
            <button class="btn btn-primary me-2" onclick="showQRProfile(${id})" title="Mã QR Profile"><i class="bi bi-qr-code"></i></button>
            <button class="btn btn-secondary me-2" onclick="downloadProfileAsImage()" title="Tải ảnh Profile"><i class="bi bi-download"></i></button>
          </div>
          <div class="d-flex justify-content-center my-3">
            ${renderSocialIcons(profile)}
          </div>
        </div>
        <div class="col-md-8">
          <h4>Giới thiệu</h4>
          <p>${profile.bio}</p>

          <h5 class="mt-4">Thông tin liên hệ <button class="btn btn-sm btn-outline-info" onclick="togglePrivateInfo()">Ẩn/Hiện</button></h5>
          <div class="private-info">
            <p><strong>Email:</strong> ${profile.email || 'N/A'}</p>
            <p><strong>Điện thoại:</strong> ${profile.phone || 'N/A'}</p>
          </div>

          <h5 class="mt-4">Lượt xem: ${profile.views}</h5>

          <h5 class="mt-4">Bình luận</h5>
          <div id="commentsList" class="mb-3" style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px; border-radius: 5px;"></div>
          <form id="commentForm" class="input-group mb-3">
            <input type="text" id="commentNameInput" class="form-control" placeholder="Tên của bạn...">
            <input type="text" id="commentInput" class="form-control" placeholder="Viết bình luận của bạn...">
            <button class="btn btn-outline-secondary" type="submit">Gửi</button>
          </form>
          
          <div class="d-flex justify-content-end mt-4">
            <button class="btn btn-warning me-2" id="editProfileBtn" data-action="edit">Chỉnh sửa</button>
            <button class="btn btn-danger" id="deleteProfileBtn" data-action="delete">Xóa</button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.bootstrap && window.bootstrap.Tooltip) {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
  }
  
  // Setup comment form
  const commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.onsubmit = function(e) {
      e.preventDefault();
      const nameInput = document.getElementById('commentNameInput');
      const commentInput = document.getElementById('commentInput');
      if (nameInput.value.trim() && commentInput.value.trim()) {
        addComment(id, nameInput.value.trim(), commentInput.value.trim());
        nameInput.value = '';
        commentInput.value = '';
        renderComments(id);
      }
    };
    renderComments(id);
  }
}

// Comments functions
export function addComment(profileId, userName, comment) {
  let comments = JSON.parse(localStorage.getItem('comments_' + profileId) || '[]');
  comments.push({ userName: userName, text: comment, time: Date.now() });
  localStorage.setItem('comments_' + profileId, JSON.stringify(comments));
}
export function getComments(profileId) {
  return JSON.parse(localStorage.getItem('comments_' + profileId) || '[]');
}
export function renderComments(profileId) {
  const list = document.getElementById('commentsList');
  if (!list) return;
  const comments = getComments(profileId);
  list.innerHTML = comments.map((c, index) => `
    <div class="comment-item mb-2 p-2 border rounded animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.05}s;">
      <div><strong>${c.userName || t('anonymous')}:</strong> ${c.text}</div>
      <div class="text-muted small">${new Date(c.time).toLocaleString()}</div>
      <div class="comment-actions mt-1">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editComment(${profileId}, ${index})">${t('edit')}</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteComment(${profileId}, ${index})">${t('delete')}</button>
      </div>
    </div>
  `).join('');
}

export function editComment(profileId, commentIndex) {
  let comments = getComments(profileId);
  if (commentIndex >= 0 && commentIndex < comments.length) {
    const newCommentText = prompt(t('editCommentPrompt'), comments[commentIndex].text);
    if (newCommentText !== null && newCommentText.trim() !== '') {
      comments[commentIndex].text = newCommentText.trim();
      comments[commentIndex].time = Date.now(); // Update timestamp on edit
      localStorage.setItem('comments_' + profileId, JSON.stringify(comments));
      renderComments(profileId);
      showToast(t('commentEditSuccess'), 'success');
    }
  } else {
    showToast(t('commentNotFound'), 'danger');
  }
}

export function deleteComment(profileId, commentIndex) {
  if (confirm(t('confirmDeleteComment'))) {
    let comments = getComments(profileId);
    if (commentIndex >= 0 && commentIndex < comments.length) {
      comments.splice(commentIndex, 1);
      localStorage.setItem('comments_' + profileId, JSON.stringify(comments));
      renderComments(profileId);
      showToast(t('commentDeleteSuccess'), 'success');
    } else {
      showToast(t('commentNotFound'), 'danger');
    }
  }
}

// Filter and sorting functions
export function renderJobFilter(profiles) {
  const jobFilterSelect = document.getElementById('jobFilter');
  if (!jobFilterSelect) return;

  const jobCounts = {};
  profiles.forEach(p => {
    if (p.job) jobCounts[p.job] = (jobCounts[p.job] || 0) + 1;
  });

  const uniqueJobs = Object.keys(jobCounts).sort();
  jobFilterSelect.innerHTML = `<option value="all">${t('allJobs')}</option>` + 
                              uniqueJobs.map(job => `<option value="${job}">${job} (${jobCounts[job]})</option>`).join('');
  jobFilterSelect.value = jobFilterValue; // Set saved value
  jobFilterSelect.onchange = () => {
    jobFilterValue = jobFilterSelect.value;
    localStorage.setItem('jobFilter', jobFilterValue);
    currentPage = 1;
    renderProfiles(document.getElementById('searchInput').value);
  };
}

export function renderAZFilter() {
  const azFilterSelect = document.getElementById('azFilter');
  if (!azFilterSelect) return;

  azFilterSelect.innerHTML = `
    <option value="all">${t('allAZ')}</option>
    <option value="az">A-Z</option>
    <option value="za">Z-A</option>
  `;
  azFilterSelect.value = azFilterValue; // Set saved value
  azFilterSelect.onchange = () => {
    azFilterValue = azFilterSelect.value;
    localStorage.setItem('azFilter', azFilterValue);
    currentPage = 1;
    renderProfiles(document.getElementById('searchInput').value);
  };
}

export function renderProfileCount(count) {
  const profileCountElement = document.getElementById('profileCount');
  if (profileCountElement) {
    profileCountElement.textContent = `${t('total')}: ${count}`;
  }
}

// View mode functions
export function setViewMode(mode) {
  viewMode = mode;
  localStorage.setItem('viewMode', mode);
  currentPage = 1; // Reset về trang 1 khi thay đổi view mode
  renderProfiles(document.getElementById('searchInput').value);
}
export function getViewMode() {
  return localStorage.getItem('viewMode') || 'grid';
}

// Favorites functions
export function toggleFavorite(id) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favs.includes(id)) favs = favs.filter(f => f !== id);
  else favs.push(id);
  localStorage.setItem('favorites', JSON.stringify(favs));
  renderProfiles(); // Re-render to update fav button
  if (window.location.pathname.includes('profile.html')) renderProfileDetail(); // For detail page
}

export function isFavorite(id) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  return favs.includes(id);
}

// Theme selector
export function setTheme(theme) {
  document.body.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-green');
  document.body.classList.add('theme-' + theme);
  localStorage.setItem('theme', theme);
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) themeSelect.value = theme;
}

// Get dynamic avatar (if no avatar link)
export function getDynamicAvatar(name) {
  // Simple dynamic avatar for demonstration. Can integrate with services like DiceBear.
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'Anonymous')}&chars=2`;
}
