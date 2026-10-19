const themeButton = document.querySelector('.theme-toggle');
const storedTheme = localStorage.getItem('portfolio-theme');
if (storedTheme === 'dark') document.body.classList.add('dark');

themeButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('portfolio-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const statElements = {
  leetcode: document.querySelector('#leetcode-solved'),
  github: document.querySelector('#github-commits'),
  status: document.querySelector('#live-status'),
};

const withPlus = (value) => `${new Intl.NumberFormat('en-IN').format(value)}<span>+</span>`;

function applyLiveStats(stats) {
  if (Number.isFinite(stats?.leetcode?.solved)) statElements.leetcode.innerHTML = withPlus(stats.leetcode.solved);
  if (Number.isFinite(stats?.github?.contributions)) statElements.github.innerHTML = withPlus(stats.github.contributions);
  if (stats?.updatedAt) {
    const updated = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(stats.updatedAt));
    statElements.status.innerHTML = `<i></i> Live coding stats · updated ${updated}`;
  }
}

async function loadLiveStats() {
  try {
    const response = await fetch('/api/live-stats', { cache: 'no-store' });
    if (!response.ok) throw new Error('Serverless stats unavailable');
    applyLiveStats(await response.json());
  } catch {
    statElements.status.innerHTML = '<i></i> Live stats unavailable — showing the last verified values';
  }
}

loadLiveStats();

const assetDatabase = 'portfolio-owner-assets';
const assetStore = 'assets';
const assetKeys = { photo: 'profile-photo', resume: 'resume-pdf' };
let assetDatabaseHandle;
let profileUrl;
let resumeUrl;

function openAssetDatabase() {
  if (assetDatabaseHandle) return Promise.resolve(assetDatabaseHandle);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(assetDatabase, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(assetStore);
    request.onsuccess = () => { assetDatabaseHandle = request.result; resolve(assetDatabaseHandle); };
    request.onerror = () => reject(request.error);
  });
}

async function readAsset(key) {
  const database = await openAssetDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(assetStore, 'readonly').objectStore(assetStore).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function writeAsset(key, file) {
  const database = await openAssetDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(assetStore, 'readwrite').objectStore(assetStore).put(file, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function clearAssets() {
  const database = await openAssetDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(assetStore, 'readwrite').objectStore(assetStore).clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function applyProfilePhoto(file) {
  if (!file) return;
  if (profileUrl) URL.revokeObjectURL(profileUrl);
  profileUrl = URL.createObjectURL(file);
  document.querySelector('#profile-image').src = profileUrl;
  document.querySelector('.hero').classList.add('has-photo');
}

function applyResume(file) {
  if (!file) return;
  if (resumeUrl) URL.revokeObjectURL(resumeUrl);
  resumeUrl = URL.createObjectURL(file);
  document.querySelectorAll('a[href$="Shubham_Kumar_Resume.pdf"]').forEach((link) => { link.href = resumeUrl; });
}

async function restoreOwnerAssets() {
  try {
    applyProfilePhoto(await readAsset(assetKeys.photo));
    applyResume(await readAsset(assetKeys.resume));
  } catch { /* Default portfolio assets remain available. */ }
}

const ownerTools = document.querySelector('#owner-tools');
const ownerMode = new URLSearchParams(window.location.search).has('edit');
if (ownerMode) {
  ownerTools.hidden = false;
  document.querySelector('#owner-tools-close').addEventListener('click', () => { ownerTools.hidden = true; });
  document.querySelector('#owner-save').addEventListener('click', async () => {
    const photo = document.querySelector('#profile-upload').files[0];
    const resume = document.querySelector('#resume-upload').files[0];
    const status = document.querySelector('#owner-status');
    if (!photo && !resume) { status.value = 'Choose a profile photo or resume PDF first.'; return; }
    status.value = 'Saving your updates...';
    try {
      if (photo) { await writeAsset(assetKeys.photo, photo); applyProfilePhoto(photo); }
      if (resume) { await writeAsset(assetKeys.resume, resume); applyResume(resume); }
      status.value = 'Saved in this browser. Refresh to confirm your recruiter view.';
    } catch { status.value = 'Unable to save these files in this browser.'; }
  });
  document.querySelector('#owner-reset').addEventListener('click', async () => {
    await clearAssets();
    window.location.reload();
  });
}

restoreOwnerAssets();
