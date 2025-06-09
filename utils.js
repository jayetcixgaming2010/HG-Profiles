import { DEFAULT_AVATAR, CLOUD_NAME, UPLOAD_PRESET } from './config.js';
import { t } from './i18n.js';

// Hiển thị toast (nâng cấp)
export function showToast(msg, type = 'success') { // type có thể là 'success', 'danger', 'info', 'warning'
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (toast && toastMsg) {
    toastMsg.textContent = msg;
    toast.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-info', 'text-bg-warning', 'animate__fadeOutUp');
    let toastClass = 'text-bg-success';
    switch(type) {
      case 'danger':
        toastClass = 'text-bg-danger';
        break;
      case 'info':
        toastClass = 'text-bg-info';
        break;
      case 'warning':
        toastClass = 'text-bg-warning';
        break;
      default:
        toastClass = 'text-bg-success';
    }
    toast.classList.add(toastClass, 'animate__fadeInDown');
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    setTimeout(() => {
      toast.classList.remove('animate__fadeInDown');
      toast.classList.add('animate__fadeOutUp');
    }, 2500);
  }
}

// Kiểm tra link ảnh hợp lệ
export function isValidImageUrl(url) {
  return (url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i));
}

// Loading overlay
export function showLoading(show) {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `<div class="loading-spinner"></div><p class="loading-message">${t('loading')}</p>`;
    document.body.appendChild(overlay);
  }
  if (show) {
    overlay.classList.add('active');
  } else {
    overlay.classList.remove('active');
  }
}

// Sinh mã bảo vệ khi tạo profile
export function generateProtectCode() {
  return Math.random().toString(36).slice(-6).toUpperCase();
}

// Hàm upload ảnh lên Cloudinary
export async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  try {
    showLoading(true);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.secure_url) {
      showToast(t('uploadSuccess'), 'success');
      return data.secure_url;
    } else {
      showToast(t('uploadFail'), 'danger');
      console.error('Cloudinary upload error:', data.error.message);
      return DEFAULT_AVATAR;
    }
  } catch (error) {
    showToast(t('cloudinaryConnectError'), 'danger');
    console.error('Cloudinary fetch error:', error);
    return DEFAULT_AVATAR;
  } finally {
    showLoading(false);
  }
}

// Hàm hiển thị preview ảnh
export function displayImagePreview(inputElement, imgElement) {
  if (inputElement.files && inputElement.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imgElement.src = e.target.result;
      imgElement.style.display = 'block';
    };
    reader.readAsDataURL(inputElement.files[0]);
  } else {
    imgElement.src = '';
    imgElement.style.display = 'none';
  }
}

// Copy link profile
export function copyProfileLink(idx) {
  const url = `${window.location.origin}/profile.html?id=${idx}`;
  navigator.clipboard.writeText(url);
  showToast(t('copyProfileLinkSuccess'), 'info');
}

// Share profile on Facebook
export function shareProfileFacebook(idx) {
  const url = `${window.location.origin}/profile.html?id=${idx}`;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,'_blank');
}

// Share profile on Zalo
export function shareProfileZalo(idx) {
  const url = `${window.location.origin}/profile.html?id=${idx}`;
  window.open(`https://zalo.me/share/url?url=${encodeURIComponent(url)}`,'_blank');
}

// Share profile on Twitter
export function shareProfileTwitter(idx) {
  const url = `${window.location.origin}/profile.html?id=${idx}`;
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,'_blank');
}

// Share profile on Email
export function shareProfileEmail(idx) {
  const url = `${window.location.origin}/profile.html?id=${idx}`;
  window.open(`mailto:?subject=Profile&body=${encodeURIComponent(url)}`);
}

// QR code chia sẻ profile
export function showQRProfile(idx) {
  const url = `${window.location.origin}/profile.html?id=${idx}`;
  const qrDiv = document.getElementById('qrCodeContent');
  qrDiv.innerHTML = '';
  const img = document.createElement('img');
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  img.alt = 'QR code';
  qrDiv.appendChild(img);
  const modal = new bootstrap.Modal(document.getElementById('qrModal'));
  modal.show();
}

// Share Telegram/LinkedIn
export function shareProfileTelegram(idx) {
  const url = `${window.location.origin}/profile.html?id=${idx}`;
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}`,'_blank');
}

export function shareProfileLinkedIn(idx) {
  const url = `${window.location.origin}/profile.html?id=${idx}`;
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,'_blank');
}

// QR code danh sách
export function showQRProfiles() {
  const url = window.location.href;
  const qrDiv = document.getElementById('qrCodeContentList');
  qrDiv.innerHTML = '';
  const img = document.createElement('img');
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  img.alt = 'QR code';
  qrDiv.appendChild(img);
  const modal = new bootstrap.Modal(document.getElementById('qrModalList'));
  modal.show();
}

export function shareWebsite(platform) {
  const url = window.location.href;
  let shareUrl = '';
  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
      break;
    case 'whatsapp':
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      break;
    case 'reddit':
      shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}`;
      break;
    case 'telegram':
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}`;
      break;
    default:
      return;
  }
  window.open(shareUrl, '_blank');
}

export function copyWebsiteLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  showToast(t('copyLinkSuccess'), 'info');
}

export function showQRWebsite() {
  const url = window.location.href;
  const qrDiv = document.getElementById('qrCodeWebsiteContent');
  qrDiv.innerHTML = '';
  const img = document.createElement('img');
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  img.alt = 'QR code';
  qrDiv.appendChild(img);
}

export function highlight(text, keyword) {
  if (!keyword) return text;
  const re = new RegExp(`(${keyword})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

export function copyProtectCode(code) {
  navigator.clipboard.writeText(code);
  const toastMsg = document.getElementById('toastMsg');
  if (toastMsg) toastMsg.textContent = t('createProfileSuccess');
}

export function renderSocialIcons(profile) {
  let html = '';
  if (profile.facebook) html += `<a href="${profile.facebook}" target="_blank" class="ms-1"><i class="bi bi-facebook"></i></a>`;
  if (profile.linkedin) html += `<a href="${profile.linkedin}" target="_blank" class="ms-1"><i class="bi bi-linkedin"></i></a>`;
  if (profile.email) html += `<a href="mailto:${profile.email}" class="ms-1"><i class="bi bi-envelope"></i></a>`;
  if (profile.instagram) html += `<a href="${profile.instagram}" target="_blank" class="ms-1"><i class="bi bi-instagram"></i></a>`;
  if (profile.tiktok) html += `<a href="${profile.tiktok}" target="_blank" class="ms-1"><i class="bi bi-tiktok"></i></a>`;
  if (profile.twitter) html += `<a href="${profile.twitter}" target="_blank" class="ms-1"><i class="bi bi-twitter"></i></a>`;
  if (profile.github) html += `<a href="${profile.github}" target="_blank" class="ms-1"><i class="bi bi-github"></i></a>`;
  if (profile.website) html += `<a href="${profile.website}" target="_blank" class="ms-1"><i class="bi bi-globe"></i></a>`;
  return html;
}

export function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export function increaseProfileView(id) {
  const key = 'profile_view_' + id;
  let count = parseInt(localStorage.getItem(key) || '0', 10);
  count++;
  localStorage.setItem(key, count);
  return count;
}

export function togglePrivateInfo() {
  document.querySelectorAll('.private-info').forEach(el => {
    el.classList.toggle('d-none');
  });
}

export function downloadProfileAsImage() {
  const node = document.querySelector('.profile-card');
  html2canvas(node).then(canvas => {
    const link = document.createElement('a');
    link.download = 'profile.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

export function setupSettingsModal() {
  const defaultThemeSelect = document.getElementById('defaultThemeSelect');
  const defaultLangSelect = document.getElementById('defaultLangSelect');
  const clearLocalStorageBtn = document.getElementById('clearLocalStorageBtn');

  if (defaultThemeSelect) {
    defaultThemeSelect.value = localStorage.getItem('theme') || 'light';
    defaultThemeSelect.addEventListener('change', function() {
      localStorage.setItem('theme', this.value);
      setTheme(this.value); // Apply theme immediately
      showToast(t('themeSaved'), 'success');
    });
  }

  if (defaultLangSelect) {
    defaultLangSelect.value = localStorage.getItem('lang') || 'vi';
    defaultLangSelect.addEventListener('change', function() {
      localStorage.setItem('lang', this.value);
      setLang(this.value); // Apply language immediately
      showToast(t('languageSaved'), 'success');
      // Re-render relevant parts of the page for language changes
      if (document.body.id === 'homePage') {
        location.reload(); // Simplest way to re-render for i18n changes on homepage
      } else if (document.body.id === 'profilesPage') {
        location.reload(); // Or re-render specific elements more efficiently
      } else if (document.body.id === 'profileDetailPage') {
        location.reload();
      }
    });
  }

  if (clearLocalStorageBtn) {
    clearLocalStorageBtn.addEventListener('click', function() {
      if (confirm(t('confirmClearData'))) {
        clearAllLocalStorage();
        showToast(t('dataCleared'), 'success');
        location.reload();
      }
    });
  }
}

export function clearAllLocalStorage() {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key !== 'lang' && key !== 'theme') {
      localStorage.removeItem(key);
    }
  }
}

export function handleContactFormSubmit() {
  const contactForm = document.querySelector('#contactModal form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();
      if (name && email && message) {
        // This is frontend logic only, no actual email sending
        showToast(t('contactFormSubmitSuccess'), 'success');
        contactForm.reset();
        // Close the modal after submission
        const contactModal = bootstrap.Modal.getInstance(document.getElementById('contactModal'));
        if (contactModal) contactModal.hide();
      } else {
        showToast(t('contactFormValidationWarning'), 'warning');
      }
    });
  }
} 