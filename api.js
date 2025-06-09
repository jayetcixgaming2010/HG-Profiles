import { BIN_ID, API_KEY, API_URL, CLOUD_NAME, UPLOAD_PRESET, DEFAULT_AVATAR } from './config.js';
import { showLoading } from './utils.js'; // Import showLoading

// Lấy profiles từ JSONBin.io
export async function getProfiles() {
  showLoading(true); // Show loading
  try {
    const res = await fetch(API_URL, {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await res.json();
    return data.record || [];
  } finally {
    showLoading(false); // Hide loading
  }
}

// Lưu profiles lên JSONBin.io
export async function saveProfiles(profiles) {
  showLoading(true); // Show loading
  try {
    await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(profiles)
    });
  } finally {
    showLoading(false); // Hide loading
  }
} 