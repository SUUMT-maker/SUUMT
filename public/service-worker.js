// SUUMT v2 Service Worker

const CACHE_NAME = 'suumt-v2-cache-v1';
const urlsToCache = [
  '/src/index.html',
  '/src/css/style.css',
  '/src/js/app.js',
  '/src/js/auth.js',
  '/src/js/supabase.js',
  '/src/js/home.js',
  '/src/js/records.js',
  '/src/js/utils.js',
  '/public/manifest.json',
  'https://unpkg.com/@supabase/supabase-js@2'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ 캐시 열기 완료');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ 모든 리소스 캐시 완료');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ 캐시 설치 실패:', error);
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker 활성화...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker 활성화 완료');
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Supabase API 요청은 네트워크 우선
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          console.log('🌐 네트워크 실패, 캐시에서 응답');
          return caches.match(request);
        })
    );
    return;
  }
  
  // 정적 리소스는 캐시 우선
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('📦 캐시에서 응답:', request.url);
            return response;
          }
          
          console.log('🌐 네트워크에서 요청:', request.url);
          return fetch(request)
            .then((response) => {
              // 성공적인 응답만 캐시
              if (response && response.status === 200 && response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                  });
              }
              return response;
            });
        })
        .catch(() => {
          // 오프라인 시 기본 페이지 반환
          if (request.destination === 'document') {
            return caches.match('/src/index.html');
          }
        })
    );
  }
});

// 백그라운드 동기화 (필요시)
self.addEventListener('sync', (event) => {
  console.log('🔄 백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 백그라운드 동기화 함수
async function doBackgroundSync() {
  try {
    console.log('🔄 백그라운드 동기화 실행...');
    // TODO: 오프라인 데이터 동기화 로직
  } catch (error) {
    console.error('❌ 백그라운드 동기화 실패:', error);
  }
}

// 푸시 알림 처리 (필요시)
self.addEventListener('push', (event) => {
  console.log('🔔 푸시 알림 수신');
  
  const options = {
    body: event.data ? event.data.text() : 'SUUMT에서 새로운 알림이 있습니다!',
    icon: '/public/assets/icon-192x192.png',
    badge: '/public/assets/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/public/assets/icon-72x72.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/public/assets/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SUUMT', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('👆 알림 클릭:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/src/index.html')
    );
  }
});

console.log('✅ Service Worker 로드 완료');
