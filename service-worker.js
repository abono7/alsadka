// خدمة العامل (Service Worker) لتفعيل خاصية التصفح بدون إنترنت

const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './page-icon.png'
];

// التثبيت: إضافة الملفات إلى الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ تم فتح الكاش وإضافة الملفات');
      return cache.addAll(urlsToCache);
    })
  );
});

// التفعيل: تحديث الكاش إذا لزم الأمر
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// جلب الملفات من الكاش أو الشبكة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
