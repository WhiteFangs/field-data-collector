var log = console.log.bind(console);
var version = "1.2.0";
var cacheName = "fdc-sw";
var cacheVersion = cacheName + "-" + version;
var filesToCache = [
'./manifest.json',
'./js/vue.js',
'./js/fieldDataCollector.js',
'./css/style.css',
'./index.html',
'./',
];

self.addEventListener("install", function(event) {
    log('[ServiceWorker] Installing....');
    event.waitUntil(caches
        .open(cacheVersion)
        .then(function(cache) {
            log('[ServiceWorker] Caching files');
            cache.addAll(filesToCache);
        })
        ); 
});


self.addEventListener("fetch", function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            if(response) {
                log("Fulfilling "+event.request.url+" from cache.");
                return response;
            } else {
                log(event.request.url+" not found in cache fetching from network.");
                return fetch(event.request);
            }
        })
        );
});

self.addEventListener('activate', function(event) {
  log('[ServiceWorker] Activate');
  event.waitUntil(
        caches.keys()
        .then(function(keyList) {
                Promise.all(keyList.map(function(key) {
                    if (key !== cacheVersion) {
                        log('[ServiceWorker] Removing old cache ', key);
                            return caches.delete(key);
                        }
                    })
                );
            })
        );
});