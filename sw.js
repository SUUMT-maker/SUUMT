const VERSION = '1.0.8';
const CACHE_NAME = `breath-trainer-v${VERSION}`;
const STATIC_CACHE = `static-${VERSION}`;

// 캐시할 핵심 리소스
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/components.css', 
  '/css/screens.css',
  '/css/mobile.css',
  '/js/utils.js',
  '/js/supabase-client.js',
  '/js/app.js',
  '/js/stats.js',
  '/js/exercise.js',
  '/js/quiz.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 🔒 개발 모드: 자동 업데이트 비활성화
self.addEventListener('install', event => {
  console.log(`🚀 SW: Installing version ${VERSION} (DEV MODE)`);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('✅ SW: Cache updated');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('⏸️ SW: Waiting for manual activation (DEV MODE)');
        // skipWaiting() 제거 - 수동 활성화 대기
      })
  );
});

// 🔒 수동 제어권 획득 (자동 업데이트 방지)
self.addEventListener('activate', event => {
  console.log(`🔄 SW: Activating version ${VERSION} (DEV MODE)`);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const deletePromises = cacheNames
          .filter(cacheName => !cacheName.includes(VERSION))
          .map(cacheName => {
            console.log(`🗑️ SW: Deleting old cache ${cacheName}`);
            return caches.delete(cacheName);
          });
        
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('✨ SW: Manual control only (DEV MODE)');
        // clients.claim() 제거 - 자동 제어권 획득 방지
      })
  );
});

// 📡 네트워크 전략: 네트워크 우선, 캐시 백업
self.addEventListener('fetch', event => {
  // 🚫 외부 API는 캐시하지 않음
  if (event.request.url.includes('supabase.co') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('script.google.com')) {
    return; // 그냥 네트워크 요청
  }

  // HTML 페이지는 항상 네트워크 우선
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 네트워크 성공 시 캐시 업데이트
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서
          return caches.match('/');
        })
    );
    return;
  }
  
  // 기타 리소스: 캐시 우선, 네트워크 백업
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
  );
});

// 🔔 메시지 처리
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ 
      version: VERSION,
      timestamp: Date.now(),
      mode: 'DEV'
    });
  }
});

console.log(`✅ SW: Service Worker ${VERSION} loaded (DEV MODE - Auto-update disabled)`);
