// PWA Service Worker for FlyOver Teaching
self.addEventListener('install', async event => {
    console.log('Installing service worker...');
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    // You can add custom logic here for offline functionality
    return null;
});

self.addEventListener('activate', event => {
    console.log('Service worker activated');
    event.waitUntil(self.clients.claim());
});