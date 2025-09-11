const VERSION = '3.0.0';
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

// 🚀 즉시 활성화 - 자동 업데이트
self.addEventListener('install', event => {
  console.log('SW: Emergency update installing');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(() => {
        console.log('SW: Skip waiting for emergency update');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  console.log(`SW: Activating version ${VERSION} - 전체 캐시 정리 모드`);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        // 모든 캐시 강제 삭제
        const deletePromises = cacheNames.map(cacheName => {
          console.log(`SW: 캐시 삭제: ${cacheName}`);
          return caches.delete(cacheName);
        });
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('SW: 모든 캐시 삭제 완료');
        return self.clients.claim();
      })
      .then(() => {
        return self.clients.matchAll();
      })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({ 
            type: 'CACHE_UPDATED', 
            version: VERSION,
            message: '캐시 완전 정리 완료'
          });
        });
      })
  );
});

// 📡 강화된 네트워크 전략: HTML 파일은 항상 네트워크 우선
self.addEventListener('fetch', event => {
  // 🚫 외부 API는 캐시하지 않음
  if (event.request.url.includes('supabase.co') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('script.google.com')) {
    return; // 그냥 네트워크 요청
  }

  // HTML 파일은 항상 네트워크 우선 (캐시 손상 방지)
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 새로운 캐시에 저장
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
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
      timestamp: Date.now()
    });
  }
});

console.log(`✅ SW: Service Worker ${VERSION} loaded`);
