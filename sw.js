// Service Worker per WakeUpProof PWA
const CACHE_NAME = 'wakeup-proof-v1.0.0';
const STATIC_CACHE = 'wakeup-proof-static-v1.0.0';
const DYNAMIC_CACHE = 'wakeup-proof-dynamic-v1.0.0';

// Files da cachare
const STATIC_FILES = [
    '/',
    '/standalone.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(request)
                    .then(fetchResponse => {
                        // Cache dynamic content
                        if (fetchResponse.status === 200) {
                            const responseClone = fetchResponse.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => {
                                    cache.put(request, responseClone);
                                });
                        }
                        return fetchResponse;
                    })
                    .catch(() => {
                        // Fallback per offline
                        if (request.destination === 'document') {
                            return caches.match('/standalone.html');
                        }
                    });
            })
    );
});

// Background sync per allarmi
self.addEventListener('sync', event => {
    if (event.tag === 'alarm-sync') {
        console.log('Background sync for alarms');
        event.waitUntil(syncAlarms());
    }
});

// Push notifications
self.addEventListener('push', event => {
    console.log('Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'WAKEUPG - Sveglia attiva!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'wakeupg-alarm',
        requireInteraction: true,
        actions: [
            {
                action: 'complete-challenge',
                title: 'Completa Challenge',
                icon: '/icons/icon-72x72.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('WAKEUPG', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'complete-challenge') {
        event.waitUntil(
            clients.openWindow('/?challenge=active')
        );
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Funzioni helper
async function syncAlarms() {
    try {
        // Sincronizza allarmi con il server
        const response = await fetch('/api/alarms/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('Alarms synced successfully');
        }
    } catch (error) {
        console.error('Failed to sync alarms:', error);
    }
}

// Message handling
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
