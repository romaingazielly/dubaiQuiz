const version = "1";
const CACHE_NAME = 'DubaiQuizv2';
var filesToCache = [
  'https://fonts.googleapis.com/css?family=Roboto:100:300,400,500,700,900|Material+Icons',
  '/**/*.{js,html,css}',
  '/index.html',
  '/manifest.json'
];

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/ServiceWorker.js').then(function(registration) {
      console.log('ServiceWorker registration success', registration.scope);
      //registration.update()
      //installWorkers()
      test()
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

function test(){
  self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(filesToCache);
      })
    );
  });

  self.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
      // caches.match() always resolves
      // but in case of success response will have value
      if (response !== undefined) {
        return response;
      } else {
        return fetch(event.request).then(function (response) {
          // response may be used only once
          // we need to save clone to put one copy in cache
          // and serve second one
          let responseClone = response.clone();
          
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        }).catch(function () {
          return caches.match('/favicon.png');
        });
      }
    }));
  });

}


function installWorkers(){
  console.log('install is called')
  self.addEventListener('install', function(event) {
    console.log('WORKER: install event in progress.');
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(filesToCache).then(function() {
          console.log('WORKER: install completed');
        })
      })
    );
  })


  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseToCache);
            });

            return response;
          }
        );
      })
    );
  });


  self.addEventListener('activate', function(event) {

    var cacheWhitelist = ['DubaiQuizv2'];

    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });

}