const version = 2;
const offlineObjects = ["./index.html", "./js/script.js", "./style/style.css"];
self.addEventListener("install", function installer(event) {
  event.waitUntil(
    caches.open(version).then(cache => {
      return cache.addAll(offlineObjects);
    })
  );
});
self.addEventListener("activate", function activate(event) {
  event.waitUntil(
    caches.keys().then(keys => {
      keys.filter(key => key != version).map(key => caches.delete(key));
    })
  );
});
var request;
self.addEventListener("fetch", function fetcher(event) {
request = event.request;
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }
  event.respondWith(caches.match(request).then(queriedCache));
});
function queriedCache(cached) {
  var networked = fetch(request)
    .then(fetchedFromNetwork, unableToResolve)
    .catch(unableToResolve);
  return cached || networked;
}
function fetchedFromNetwork(response) {
  var clonedResponse = response.clone();
  caches.open(version).then(function add(cache) {
    cache.put(request, clonedResponse);
  });
  return response;
}
function unableToResolve() {
  var url = new URL(request.url);
  if (url.origin === location.origin) {
    return caches.match("./index.html");
  }
  return offlineResponse();
}
