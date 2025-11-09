const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `minutemind-v${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/charts.js',
  '/js/config.js',
  '/js/supabase.js',
  '/js/dateUtils.js',
  '/js/animations.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch((error) => {
        console.log('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first for HTML/JS/CSS, cache first for assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  const isHTMLJSCSS = url.pathname.endsWith('.html') || 
                       url.pathname.endsWith('.js') || 
                       url.pathname.endsWith('.css') ||
                       url.pathname === '/';

  if (isHTMLJSCSS) {
    // Network-first strategy for HTML, JS, CSS
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Check if valid response
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request).then((response) => {
            return response || caches.match('/index.html');
          });
        })
    );
  } else {
    // Cache-first strategy for images and other assets
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          });
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-study-data') {
    event.waitUntil(syncStudyData());
  }
});

async function syncStudyData() {
  // This would sync any offline data when connection is restored
  console.log('Syncing study data...');
}

// Push notification support
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time to log your study session!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'log',
        title: 'Log Now',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MinuteMind', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'log') {
    event.waitUntil(
      clients.openWindow('/?action=log')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
