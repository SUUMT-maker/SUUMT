// 🚀 완전 자동 업데이트 Service Worker
const APP_VERSION = '1.0.2';
const CACHE_NAME = 'breath-trainer-v' + APP_VERSION + '-' + Date.now();
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/components.css',
  '/css/screens.css',
  '/css/mobile.css',
  '/js/utils.js',
  '/js/app.js',
  '/js/stats.js',
  '/js/exercise.js',
  '/js/quiz.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-32x32.png',
  '/icons/icon-16x16.png'
];

// 🔄 자동 설치 및 즉시 활성화
self.addEventListener('install', function(event) {
  console.log('🔄 새 버전 자동 설치 중...', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ 새 캐시 생성 완료:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('📦 모든 리소스 캐싱 완료');
        return self.skipWaiting(); // 즉시 활성화
      })
      .catch(function(error) {
        console.error('❌ 캐시 생성 실패:', error);
      })
  );
});

// ⚡ 자동 활성화 및 이전 캐시 정리
self.addEventListener('activate', function(event) {
  console.log('⚡ 새 버전 자동 활성화 중...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // 이전 버전의 캐시들을 모두 삭제
          if (cacheName.startsWith('breath-trainer-v') && cacheName !== CACHE_NAME) {
            console.log('🗑️ 이전 캐시 자동 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('✅ 새 버전 자동 활성화 완료');
      return self.clients.claim(); // 모든 클라이언트 제어권 즉시 획득
    })
  );
});

// 🌐 네트워크 우선 전략 (항상 최신 파일 확인)
self.addEventListener('fetch', function(event) {
  const request = event.request;
  
  // 외부 API는 캐싱하지 않음
  if (request.url.includes('script.google.com') || 
      request.url.includes('googleapis.com') ||
      request.url.includes('googletagmanager.com')) {
    return;
  }

  // HTML 파일은 네트워크 우선, 실패 시 캐시
  if (request.destination === 'document' || request.url.includes('.html')) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          // 성공하면 캐시에 저장
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(function() {
          // 네트워크 실패 시 캐시에서 반환
          return caches.match(request);
        })
    );
    return;
  }

  // 정적 리소스는 캐시 우선, 실패 시 네트워크
  event.respondWith(
    caches.match(request)
      .then(function(response) {
        if (response) {
          // 캐시에 있으면 반환하되, 백그라운드에서 업데이트
          fetch(request).then(function(fetchResponse) {
            if (fetchResponse.status === 200) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME).then(function(cache) {
                cache.put(request, responseToCache);
              });
            }
          }).catch(function() {
            // 백그라운드 업데이트 실패는 무시
          });
          return response;
        }

        // 캐시에 없으면 네트워크에서 가져옴
        return fetch(request).then(function(response) {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
      .catch(function(error) {
        console.log('🌐 네트워크 오류:', error);
        // 오프라인일 때 기본 페이지 반환
        if (request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// 🔄 백그라운드 동기화
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('🔄 백그라운드 동기화 시작');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return new Promise(function(resolve) {
    console.log('✅ 백그라운드 동기화 완료');
    resolve();
  });
}

// 🔔 푸시 알림
self.addEventListener('push', function(event) {
  const options = {
    body: '호흡운동 시간입니다! 💨',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'start-exercise',
        title: '운동 시작',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('숨 트레이너', options)
  );
});

// 👆 알림 클릭 처리
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'start-exercise') {
    event.waitUntil(
      clients.openWindow('/?action=start')
    );
  } else if (event.action === 'close') {
    // 알림만 닫기
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 📊 성능 모니터링
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: APP_VERSION,
      cacheName: CACHE_NAME
    });
  }
});
