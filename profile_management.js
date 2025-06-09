import { getProfiles, saveProfiles } from './api.js';
import { showToast, uploadImageToCloudinary, displayImagePreview, generateProtectCode, showLoading } from './utils.js';
import { DEFAULT_AVATAR } from './config.js';

// Logic cho form thêm profile
export async function setupAddProfileForm() {
  const addForm = document.getElementById('addProfileForm');
  const avatarInput = document.getElementById('avatar');
  const avatarPreview = document.getElementById('avatarPreview');

  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', () => displayImagePreview(avatarInput, avatarPreview));
  }

  if (addForm) {
    addForm.onsubmit = async function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const job = document.getElementById('job').value.trim();
      const bio = document.getElementById('bio').value.trim();
      let avatar = DEFAULT_AVATAR;

      if (avatarInput && avatarInput.files && avatarInput.files[0]) {
        avatar = await uploadImageToCloudinary(avatarInput.files[0]);
      } else if (avatarPreview && avatarPreview.src && avatarPreview.src !== window.location.href) {
          avatar = DEFAULT_AVATAR; // Always use default if no new file and not existing profile edit
      } else {
          avatar = DEFAULT_AVATAR;
      }

      const facebook = document.getElementById('facebook')?.value.trim();
      const linkedin = document.getElementById('linkedin')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const instagram = document.getElementById('instagram')?.value.trim();
      const tiktok = document.getElementById('tiktok')?.value.trim();
      const twitter = document.getElementById('twitter')?.value.trim();
      const github = document.getElementById('github')?.value.trim();
      const website = document.getElementById('website')?.value.trim();
      const protectCode = generateProtectCode();

      const newProfile = { name, job, bio, avatar, facebook, linkedin, email, instagram, tiktok, twitter, github, website, protectCode, views: 0, comments: [] };

      const profiles = await getProfiles();
      profiles.push(newProfile);
      await saveProfiles(profiles);

      showToast('Thêm profile thành công! Mã bảo vệ của bạn là: ' + protectCode, 'success');
      alert('Vui lòng lưu mã bảo vệ này lại để chỉnh sửa hoặc xóa profile sau này: ' + protectCode); // Alert here
      addForm.reset();
      if (avatarPreview) avatarPreview.src = '';
      if (typeof renderProfiles !== 'undefined') renderProfiles();
    };
  }
}

// Logic cho form chỉnh sửa profile
export async function setupEditProfileForm() {
  const editForm = document.getElementById('editProfileForm');
  const editAvatarInput = document.getElementById('editAvatar');
  const editAvatarPreview = document.getElementById('editAvatarPreview');
  const protectCodeInput = document.getElementById('protectCodeInput');
  const verifyProtectCodeBtn = document.getElementById('verifyProtectCodeBtn');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const deleteProfileBtn = document.getElementById('deleteProfileBtn');
  const protectCodeModalEl = document.getElementById('protectCodeModal');
  const protectCodeModal = new bootstrap.Modal(protectCodeModalEl);
  const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
  const deleteConfirmModal = new bootstrap.Modal(deleteConfirmModalEl);
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  let currentProfileIndex = -1;
  let currentActionType = '';

  if (editAvatarInput && editAvatarPreview) {
    editAvatarInput.addEventListener('change', () => displayImagePreview(editAvatarInput, editAvatarPreview));
  }

  // Handle Edit/Delete button clicks (from profile.html)
  if (editProfileBtn) {
    editProfileBtn.onclick = async function() {
      const urlParams = new URLSearchParams(window.location.search);
      currentProfileIndex = parseInt(urlParams.get('id'));
      if (isNaN(currentProfileIndex)) return;
      currentActionType = 'edit'; // Set the action type
      document.getElementById('inputProtectCode').value = ''; // Clear previous input
      document.getElementById('protectCodeError').textContent = ''; // Clear previous error
      protectCodeModal.show();
    };
  }

  if (deleteProfileBtn) {
    deleteProfileBtn.onclick = async function() {
      const urlParams = new URLSearchParams(window.location.search);
      currentProfileIndex = parseInt(urlParams.get('id'));
      if (isNaN(currentProfileIndex)) return;
      currentActionType = 'delete'; // Set the action type
      document.getElementById('inputProtectCode').value = ''; // Clear previous input
      document.getElementById('protectCodeError').textContent = ''; // Clear previous error
      protectCodeModal.show();
    };
  }

  if (verifyProtectCodeBtn) {
    verifyProtectCodeBtn.onclick = async function() {
      const enteredCode = protectCodeInput.value.trim();
      const profiles = await getProfiles();
      const profileToActOn = profiles[currentProfileIndex];
      const protectCodeError = document.getElementById('protectCodeError');

      if (!profileToActOn || !profileToActOn.protectCode) {
        protectCodeError.textContent = 'Profile không có mã bảo vệ!';
        showToast('Profile không có mã bảo vệ!', 'danger');
        return;
      }

      if (enteredCode !== profileToActOn.protectCode) {
        protectCodeError.textContent = 'Sai mã bảo vệ!';
        showToast('Sai mã bảo vệ!', 'danger');
        return;
      }

      showToast('Mã bảo vệ đúng!', 'success');
      protectCodeModal.hide();

      if (currentActionType === 'edit') {
        // Populate edit form and show edit modal
        document.getElementById('editName').value = profileToActOn.name;
        document.getElementById('editJob').value = profileToActOn.job;
        document.getElementById('editBio').value = profileToActOn.bio;
        editAvatarPreview.src = profileToActOn.avatar || DEFAULT_AVATAR;
        editAvatarPreview.style.display = 'block';
        document.getElementById('editFacebook').value = profileToActOn.facebook || '';
        document.getElementById('editLinkedin').value = profileToActOn.linkedin || '';
        document.getElementById('editEmail').value = profileToActOn.email || '';
        document.getElementById('editInstagram').value = profileToActOn.instagram || '';
        document.getElementById('editTiktok').value = profileToActOn.tiktok || '';
        document.getElementById('editTwitter').value = profileToActOn.twitter || '';
        document.getElementById('editGithub').value = profileToActOn.github || '';
        document.getElementById('editWebsite').value = profileToActOn.website || '';
        document.getElementById('editProtectCode').value = profileToActOn.protectCode;

        const editModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
        editModal.show();
      } else if (currentActionType === 'delete') {
        // Show the new delete confirmation modal
        deleteConfirmModal.show();
      }
      protectCodeInput.value = ''; // Clear input
    };
  }

  // Handle delete confirmation
  if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = async function() {
      const profiles = await getProfiles();
      profiles.splice(currentProfileIndex, 1);
      await saveProfiles(profiles);
      showToast('Xóa profile thành công!', 'success');
      deleteConfirmModal.hide();
      window.location.href = 'profiles.html'; // Redirect to profiles list
    };
  }

  if (editForm) {
    editForm.onsubmit = async function(e) {
      e.preventDefault();
      const name = document.getElementById('editName').value.trim();
      const job = document.getElementById('editJob').value.trim();
      const bio = document.getElementById('editBio').value.trim();
      let avatar = editAvatarPreview.src; // Keep current if not changed

      if (editAvatarInput && editAvatarInput.files && editAvatarInput.files[0]) {
        avatar = await uploadImageToCloudinary(editAvatarInput.files[0]);
      }

      const facebook = document.getElementById('editFacebook')?.value.trim();
      const linkedin = document.getElementById('editLinkedin')?.value.trim();
      const email = document.getElementById('editEmail')?.value.trim();
      const instagram = document.getElementById('editInstagram')?.value.trim();
      const tiktok = document.getElementById('editTiktok')?.value.trim();
      const twitter = document.getElementById('editTwitter')?.value.trim();
      const github = document.getElementById('editGithub')?.value.trim();
      const website = document.getElementById('editWebsite')?.value.trim();

      const profiles = await getProfiles();
      const profileToUpdate = profiles[currentProfileIndex];
      if (profileToUpdate) {
        profileToUpdate.name = name;
        profileToUpdate.job = job;
        profileToUpdate.bio = bio;
        profileToUpdate.avatar = avatar;
        profileToUpdate.facebook = facebook;
        profileToUpdate.linkedin = linkedin;
        profileToUpdate.email = email;
        profileToUpdate.instagram = instagram;
        profileToUpdate.tiktok = tiktok;
        profileToUpdate.twitter = twitter;
        profileToUpdate.github = github;
        profileToUpdate.website = website;

        await saveProfiles(profiles);
        showToast('Cập nhật profile thành công!', 'success');
        new bootstrap.Modal(document.getElementById('editProfileModal')).hide();
        if (typeof renderProfileDetail !== 'undefined') renderProfileDetail(); // Re-render profile detail page
      } else {
        showToast('Lỗi: Không tìm thấy profile để cập nhật.', 'danger');
      }
    };
  }
}

// Xuất dữ liệu profile ra JSON
export async function exportProfiles() {
  const profiles = await getProfiles();
  const dataStr = JSON.stringify(profiles, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'profiles.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Đã xuất dữ liệu profile thành công!', 'success');
}

// Nhập dữ liệu profile từ JSON
export async function importProfiles(file) {
  if (!file) {
    showToast('Vui lòng chọn một file JSON.', 'warning');
    return;
  }
  try {
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const importedProfiles = JSON.parse(e.target.result);
        if (Array.isArray(importedProfiles)) {
          // Lấy profiles hiện có và thêm vào hoặc ghi đè (tùy vào cách mong muốn)
          let existingProfiles = await getProfiles(); // getProfiles already handles loading
          // Ví dụ: ghi đè hoàn toàn
          await saveProfiles(importedProfiles); // saveProfiles already handles loading
          showToast('Nhập dữ liệu profile thành công!', 'success');
          if (typeof renderProfiles !== 'undefined') renderProfiles();
        } else {
          showToast('File JSON không hợp lệ. Vui lòng chọn file chứa mảng profiles.', 'danger');
        }
      } catch (parseError) {
        showToast('Lỗi khi đọc file JSON. Đảm bảo file đúng định dạng.', 'danger');
        console.error('JSON parse error:', parseError);
      }
    };
    reader.readAsText(file);
  } catch (error) {
    showToast('Lỗi khi nhập dữ liệu profile.', 'danger');
    console.error('Import error:', error);
  }
} 