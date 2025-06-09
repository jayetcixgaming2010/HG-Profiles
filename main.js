import { setupAddProfileForm, setupEditProfileForm, exportProfiles, importProfiles } from './profile_management.js';
import { renderProfiles, renderProfileDetail, currentPage, showFavsOnly, filterAvatarChecked, filterSocialChecked, filterEmailChecked, jobFilterValue, azFilterValue, searchInputValue, viewMode, setTheme, setViewMode, toggleFavorite, isFavorite, addComment, getComments, renderComments, renderJobFilter, renderAZFilter } from './profile_display.js';
import { renderStats, renderCharts } from './charts.js';
import { getQueryParam, showQRProfile, showQRProfiles, copyProfileLink, shareProfileFacebook, shareProfileTelegram, shareProfileLinkedIn, shareProfileEmail, togglePrivateInfo, downloadProfileAsImage, handleContactFormSubmit, shareWebsite, copyWebsiteLink, showQRWebsite } from './utils.js';
import { setLang, t } from './i18n.js';

// Gán các hàm cần thiết ra global scope để có thể gọi từ HTML (onchange, onclick)
window.renderProfiles = renderProfiles;
window.toggleFavorite = toggleFavorite;
window.isFavorite = isFavorite;
window.addComment = addComment;
window.getComments = getComments;
window.renderComments = renderComments;
window.showQRProfile = showQRProfile;
window.showQRProfiles = showQRProfiles;
window.copyProfileLink = copyProfileLink;
window.shareProfileFacebook = shareProfileFacebook;
window.shareProfileTelegram = shareProfileTelegram;
window.shareProfileLinkedIn = shareProfileLinkedIn;
window.shareProfileEmail = shareProfileEmail;
window.togglePrivateInfo = togglePrivateInfo;
window.downloadProfileAsImage = downloadProfileAsImage;
window.setTheme = setTheme;
window.setViewMode = setViewMode;
window.setLang = setLang;
window.shareWebsite = shareWebsite;
window.copyWebsiteLink = copyWebsiteLink;
window.showQRWebsite = showQRWebsite;

document.addEventListener('DOMContentLoaded', () => {
  // Tự động nhận diện ngôn ngữ trình duyệt lần đầu
  if (!localStorage.getItem('lang')) {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.startsWith('en')) setLang('en');
    else setLang('vi');
  }

  // Setup theme selection
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      setTheme(this.value);
    });
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }

  // Handle page-specific initializations
  if (document.body.id === 'profilesPage') {
    const favFilterBtn = document.getElementById('favFilterBtn');
    if (favFilterBtn) {
      favFilterBtn.classList.toggle('active', showFavsOnly);
      favFilterBtn.onclick = function() {
        showFavsOnly = !showFavsOnly;
        localStorage.setItem('showFavsOnly', showFavsOnly);
        this.classList.toggle('active', showFavsOnly);
        currentPage = 1;
        renderProfiles(searchInputValue);
      };
    }

    const filterAvatar = document.getElementById('filterAvatar');
    const filterSocial = document.getElementById('filterSocial');
    const filterEmail = document.getElementById('filterEmail');

    if (filterAvatar) {
      filterAvatar.checked = filterAvatarChecked;
      filterAvatar.onchange = () => {
        filterAvatarChecked = filterAvatar.checked;
        localStorage.setItem('filterAvatar', filterAvatarChecked);
        currentPage = 1;
        renderProfiles(searchInputValue);
      };
    }
    if (filterSocial) {
      filterSocial.checked = filterSocialChecked;
      filterSocial.onchange = () => {
        filterSocialChecked = filterSocial.checked;
        localStorage.setItem('filterSocial', filterSocialChecked);
        currentPage = 1;
        renderProfiles(searchInputValue);
      };
    }
    if (filterEmail) {
      filterEmail.checked = filterEmailChecked;
      filterEmail.onchange = () => {
        filterEmailChecked = filterEmail.checked;
        localStorage.setItem('filterEmail', filterEmailChecked);
        currentPage = 1;
        renderProfiles(searchInputValue);
      };
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = searchInputValue;
        searchInput.oninput = () => {
            searchInputValue = searchInput.value;
            localStorage.setItem('searchInput', searchInputValue);
            currentPage = 1;
            renderProfiles(searchInputValue);
        };
    }

    // Event listeners for view mode buttons
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    if (gridViewBtn) {
      gridViewBtn.classList.toggle('active', viewMode === 'grid');
      gridViewBtn.onclick = () => setViewMode('grid');
    }
    if (listViewBtn) {
      listViewBtn.classList.toggle('active', viewMode === 'list');
      listViewBtn.onclick = () => setViewMode('list');
    }

    setupAddProfileForm();
    renderProfiles();
    renderStats();
    renderCharts();

    const exportBtn = document.getElementById('exportJsonBtn');
    if (exportBtn) {
      exportBtn.onclick = exportProfiles;
    }

    const importInput = document.getElementById('importJsonInput');
    if (importInput) {
      importInput.onchange = (e) => importProfiles(e.target.files[0]);
    }
    const importBtn = document.getElementById('importJsonBtn');
    if (importBtn) {
        importBtn.onclick = () => importInput.click();
    }

    // Populate job and A-Z filters
    getProfiles().then(profiles => {
      renderJobFilter(profiles);
      renderAZFilter();
    });

  } else if (document.body.id === 'profileDetailPage') {
    const id = getQueryParam('id');
    if (id) {
      renderProfileDetail(); // Function will use getQueryParam internally
    } else {
      document.getElementById('profileDetail').innerHTML = '<p>Không tìm thấy profile.</p>';
      // Optionally, set default meta tags here if profile is not found
    }
    setupEditProfileForm();
  } else if (document.body.id === 'homePage') {
    // No specific JS for homepage yet, but good to have the structure
  }

  // Initialize contact form handling for all pages with contactModal
  handleContactFormSubmit();
  setupSettingsModal();
}); 