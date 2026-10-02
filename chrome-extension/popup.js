// Aparaitech Work Portal Chrome Extension - Popup Logic
const PORTAL_URL = 'https://aparaitechhratt.vercel.app/';

function openAsDesktopWindow(customPath = '') {
  const targetUrl = customPath ? `${PORTAL_URL}#${customPath}` : PORTAL_URL;
  chrome.windows.create({
    url: targetUrl,
    type: 'popup',
    width: 1280,
    height: 820,
    focused: true
  });
}

function openInTab(customPath = '') {
  const targetUrl = customPath ? `${PORTAL_URL}#${customPath}` : PORTAL_URL;
  chrome.tabs.create({ url: targetUrl });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('launchAppBtn')?.addEventListener('click', () => {
    openAsDesktopWindow();
  });

  document.getElementById('openTabBtn')?.addEventListener('click', () => {
    openInTab();
  });

  document.getElementById('actAttendance')?.addEventListener('click', () => {
    openAsDesktopWindow('attendance');
  });

  document.getElementById('actDailyReport')?.addEventListener('click', () => {
    openAsDesktopWindow('dailyReport');
  });

  document.getElementById('actConversions')?.addEventListener('click', () => {
    openAsDesktopWindow('conversions');
  });

  document.getElementById('actPipeline')?.addEventListener('click', () => {
    openAsDesktopWindow('pipeline');
  });

  document.getElementById('footerLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    openInTab();
  });
});
