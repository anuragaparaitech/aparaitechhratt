// Aparaitech Work Portal - Chrome Extension Background Service Worker
const PORTAL_URL = 'https://aparaitechhratt.vercel.app/';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Aparaitech Work Portal extension installed successfully.');
});

// Helper function to launch portal as dedicated standalone app window
function openPortalWindow() {
  chrome.windows.create({
    url: PORTAL_URL,
    type: 'popup',
    width: 1300,
    height: 840,
    focused: true
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'launchAppWindow') {
    openPortalWindow();
    sendResponse({ success: true });
  }
});
