const CACHE_NAME = 'breath-trainer-v1.0.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Service Worker 설치
self.addEventListener('install', function(event) {
  console.log('Service Worker: 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: 캐시 생성 완료');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('Service Worker: 캐시 생성 실패', error);
      })
  );
  self.skipWaiting();
});

// Service Worker 활성화
self.addEventListener('activate', function(event) {
  console.log('Service Worker: 활성화됨');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 이전 캐시 삭제', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', function(event) {
  // 구글 Apps Script URL은 캐싱하지 않음
  if (event.request.url.includes('script.google.com') || 
      event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 캐시에 있으면 캐시된 버전 반환
        if (response) {
          return response;
        }

        // 캐시에 없으면 네트워크에서 가져옴
        return fetch(event.request).then(function(response) {
          // 유효한 응답인지 확인
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 응답 복사해서 캐시에 저장
          var responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(function(error) {
        console.log('Service Worker: 네트워크 오류', error);
        // 오프라인일 때 기본 페이지 반환
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// 백그라운드 동기화
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: 백그라운드 동기화 시작');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return new Promise(function(resolve) {
    console.log('백그라운드 동기화 완료');
    resolve();
  });
}

// 푸시 알림 (선택사항)
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

// 알림 클릭 처리
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
