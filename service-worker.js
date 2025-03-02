// خدمة العامل (Service Worker) لتفعيل خاصية التصفح بدون إنترنت

const CACHE_NAME = 'pwa-cache-' + new Date().getTime(); // إنشاء كاش جديد لكل إصدار
const urlsToCache = [
  './',
  './index.html',
  './manifest.json?v=' + new Date().getTime(), // تحديث manifest تلقائيًا
  './page-icon.png'
];

// التثبيت: إضافة الملفات إلى الكاش
self.addEventListener('install', (event) => {
  console.log('📥 تثبيت Service Worker جديد...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ تم فتح الكاش وإضافة الملفات:', CACHE_NAME);
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // فرض التحديث الفوري
});

// التفعيل: حذف الكاش القديم إذا لزم الأمر
self.addEventListener('activate', (event) => {
  console.log('🔄 تفعيل Service Worker الجديد...');
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
  self.clients.claim(); // جعل التحديث فوريًا دون انتظار إعادة التشغيل
});

// جلب الملفات من الكاش أولًا، ثم الشبكة
self.addEventListener('fetch', (event) => {
  console.log('🔍 جلب:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      return new Response('⚠️ لا يوجد اتصال بالإنترنت والملف غير متاح في الكاش.', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});

// الاستماع إلى حدث التحديث (إجبار التحديث عند توفر إصدار جديد)
self.addEventListener('message', (event) => {
  if (event.data === 'update-sw') {
    self.skipWaiting();
  }
});
