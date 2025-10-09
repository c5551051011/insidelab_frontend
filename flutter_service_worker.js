'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter.js": "f393d3c16b631f36852323de8e583132",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"manifest.json": "7060e445c4e59baaa983d365ee4d7e76",
"index.html": "c382b489b70ca71a176cf620ad915222",
"/": "c382b489b70ca71a176cf620ad915222",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin.json": "2659e66acd554cfda527b295a5f48953",
"assets/assets/icons/google_logo.png": "78ce2d5287c757c3a94a19766202a414",
"assets/assets/images/interview_image.png": "a0095270e9ffcd29b7b6ad820984b7bd",
"assets/assets/images/review_image.png": "9d73f8531975bec0aace7ad8694cce92",
"assets/assets/images/hero_background.png": "90bde8323c433e61fd73aacd98549cd5",
"assets/assets/images/resume_image.png": "7998976b5892fad955ac1f9f1b9433f1",
"assets/assets/fonts/Inter_28pt-ExtraLight.ttf": "97f88391f7a4de7986e436bdeeb86d8c",
"assets/assets/fonts/Inter-Regular.ttf": "fc20e0880f7747bb39b85f2a0722b371",
"assets/assets/fonts/Inter_24pt-SemiBold.ttf": "c77560a8441d664af3e65dd57026dff9",
"assets/assets/fonts/Inter_28pt-ThinItalic.ttf": "3a4d750a496f2c6e20eef12f2f28443c",
"assets/assets/fonts/Inter_18pt-ExtraBold.ttf": "a6ed481bff60bc9270904d214947ab13",
"assets/assets/fonts/Inter_28pt-BoldItalic.ttf": "91e7c1ba5da0203505e739112a2a5679",
"assets/assets/fonts/Inter_18pt-Regular.ttf": "37dcabff629c3690303739be2e0b3524",
"assets/assets/fonts/Inter_24pt-Black.ttf": "2392341284c30f5fffb9fe0ab0cd983e",
"assets/assets/fonts/Inter_18pt-Black.ttf": "b797a429ef21b9b7d44b96038cdb10f2",
"assets/assets/fonts/Inter_18pt-Light.ttf": "dfaec8b8820224135d07f1b409ceb214",
"assets/assets/fonts/Inter_18pt-BoldItalic.ttf": "da935c5b19ddded26aab2c880d835a8e",
"assets/assets/fonts/Inter-Bold.ttf": "14080569c713459a85b1693cf7354cc0",
"assets/assets/fonts/Inter_28pt-Regular.ttf": "fc20e0880f7747bb39b85f2a0722b371",
"assets/assets/fonts/Inter_28pt-LightItalic.ttf": "53fd3364ffe65ab2ff79f7fe024c83ce",
"assets/assets/fonts/Inter_24pt-ExtraBold.ttf": "995fb5ac38b90303c0cc1a0b21e2c9fe",
"assets/assets/fonts/Inter_18pt-Medium.ttf": "8540f35bf8acd509b9ce356f1111e983",
"assets/assets/fonts/Inter_18pt-ExtraBoldItalic.ttf": "b03bfa9ceab3df1f81834d0523331c30",
"assets/assets/fonts/Inter_28pt-Light.ttf": "3ea4007efbbb2f30c2c73275eef5c2b0",
"assets/assets/fonts/Inter_28pt-Medium.ttf": "4bf75147230e93108702b004fdee55df",
"assets/assets/fonts/Inter-ExtraBold.ttf": "7c8dddeead3a39ebb25d4be0e0c4b876",
"assets/assets/fonts/Inter_24pt-Thin.ttf": "1e9e30c74648950a240427636b6c1992",
"assets/assets/fonts/Inter_18pt-ThinItalic.ttf": "95d83862ccec5b0d0487f243e34fcc61",
"assets/assets/fonts/Inter_24pt-SemiBoldItalic.ttf": "9685a9dcf0c26640b3828dd34b953bcd",
"assets/assets/fonts/Inter_18pt-BlackItalic.ttf": "6a6d7edd78447c5edcb33570ce97efe8",
"assets/assets/fonts/Inter_28pt-Italic.ttf": "457934416e3b66a693b814d64446076e",
"assets/assets/fonts/Inter_24pt-ExtraLight.ttf": "8da347e947a38e1262841f21fe7c893e",
"assets/assets/fonts/Inter-SemiBold.ttf": "70c03908b3ab82969b38ba14745f3a54",
"assets/assets/fonts/Inter_28pt-Black.ttf": "298c6ce1b2641dfe1647544180b67fd1",
"assets/assets/fonts/Inter_18pt-MediumItalic.ttf": "c64a8c393f4d6ffd87f80723727b7f2c",
"assets/assets/fonts/Inter-Medium.ttf": "4bf75147230e93108702b004fdee55df",
"assets/assets/fonts/Inter_28pt-SemiBoldItalic.ttf": "f6a4fc371cbdc516f1b3aa53e570e25e",
"assets/assets/fonts/Inter_24pt-Italic.ttf": "0b52c6d11ac407c2ef591475f2b4ed11",
"assets/assets/fonts/Inter_24pt-ThinItalic.ttf": "27a3a82e0df426a69c7a7562a2293bda",
"assets/assets/fonts/Inter_28pt-MediumItalic.ttf": "ecec8d44b9cfb67aafab4573295b3c29",
"assets/assets/fonts/Inter_28pt-BlackItalic.ttf": "ff93e5c0c4542fe58a56430a3be67cce",
"assets/assets/fonts/Inter_28pt-Thin.ttf": "f045084a42b5d5a11297b0c058ecf884",
"assets/assets/fonts/Inter_24pt-Medium.ttf": "4591e900425d177e6ba268d165bf12e8",
"assets/assets/fonts/Inter_28pt-ExtraLightItalic.ttf": "44168090bcf11276f500c0f02b154ff4",
"assets/assets/fonts/Inter_18pt-ExtraLight.ttf": "2c6c78d98816958b53fea58451f921d3",
"assets/assets/fonts/Inter_24pt-LightItalic.ttf": "a401ba0ab41163ff9ec6247c023b1c68",
"assets/assets/fonts/Inter_28pt-Bold.ttf": "ac37d4dadca27dd30e188aa580757645",
"assets/assets/fonts/Inter_18pt-Thin.ttf": "6f2d2f41f504aee66da88684f15d7e1d",
"assets/assets/fonts/Inter_28pt-ExtraBold.ttf": "7c8dddeead3a39ebb25d4be0e0c4b876",
"assets/assets/fonts/Inter_24pt-ExtraLightItalic.ttf": "c37c2ef7e42dc86b284a5cbaf8a8efae",
"assets/assets/fonts/Inter_24pt-BlackItalic.ttf": "1fa0b44e2ca8a6ce911e0fc8cc3b7255",
"assets/assets/fonts/Inter_24pt-ExtraBoldItalic.ttf": "054fe10e7073eb84bf31447dfd79e522",
"assets/assets/fonts/Inter_24pt-Bold.ttf": "a041f18d0d0c67b376bec0343f7c0cf0",
"assets/assets/fonts/Inter_24pt-Light.ttf": "65ec965bd90e1a297cdb3be407420abc",
"assets/assets/fonts/Inter_18pt-ExtraLightItalic.ttf": "24df6449633144fa3f4258c775dd67c5",
"assets/assets/fonts/Inter_18pt-Bold.ttf": "f77ce9588dccbc52fdbf0b79f0d63714",
"assets/assets/fonts/Inter_24pt-BoldItalic.ttf": "79bdd17736cfe1b6ca071a6e298691ed",
"assets/assets/fonts/Inter_18pt-Italic.ttf": "ab4004692577ac82604c777fa83da556",
"assets/assets/fonts/Inter_24pt-MediumItalic.ttf": "5ed286000cb7a0e7b015ec71e190a767",
"assets/assets/fonts/Inter_28pt-ExtraBoldItalic.ttf": "0a060bf48937936c4aa7d9952dfe1ae8",
"assets/assets/fonts/Inter_18pt-SemiBoldItalic.ttf": "0f93bef7d8e8ea0612ba37a71efcccff",
"assets/assets/fonts/Inter_18pt-SemiBold.ttf": "e5532d993e2de30fa92422df0a8849dd",
"assets/assets/fonts/Inter_18pt-LightItalic.ttf": "6eb3a2d2c6f095080ac034867886d0bf",
"assets/assets/fonts/Inter_24pt-Regular.ttf": "e48c1217adab2a0e44f8df400d33c325",
"assets/assets/fonts/Inter_28pt-SemiBold.ttf": "70c03908b3ab82969b38ba14745f3a54",
"assets/fonts/MaterialIcons-Regular.otf": "66c9f563962ded4f6450ad9e867b3c22",
"assets/NOTICES": "fa93511d433779193fde6d29cb6ce0b9",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "e986ebe42ef785b27164c36a9abc7818",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "15d54d142da2f2d6f2e90ed1d55121af",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "262525e2081311609d1fdab966c82bfc",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "269f971cec0d5dc864fe9ae080b19e23",
"assets/FontManifest.json": "13b28aab01cc48667d18682c8c4dfbe0",
"assets/AssetManifest.bin": "20b423e63c92f88d8b27864b5df18af3",
"assets/AssetManifest.json": "e9d06ede7979e989d167de97cdf4c606",
"canvaskit/chromium/canvaskit.wasm": "b1ac05b29c127d86df4bcfbf50dd902a",
"canvaskit/chromium/canvaskit.js": "671c6b4f8fcc199dcc551c7bb125f239",
"canvaskit/chromium/canvaskit.js.symbols": "a012ed99ccba193cf96bb2643003f6fc",
"canvaskit/skwasm.worker.js": "89990e8c92bcb123999aa81f7e203b1c",
"canvaskit/skwasm.js": "694fda5704053957c2594de355805228",
"canvaskit/canvaskit.wasm": "1f237a213d7370cf95f443d896176460",
"canvaskit/canvaskit.js": "66177750aff65a66cb07bb44b8c6422b",
"canvaskit/skwasm.wasm": "9f0c0c02b82a910d12ce0543ec130e60",
"canvaskit/canvaskit.js.symbols": "48c83a2ce573d9692e8d970e288d75f7",
"canvaskit/skwasm.js.symbols": "262f4827a1317abb59d71d6c587a93e2",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"CNAME": "eac243177ebbc54b7abf06067174ab0d",
"404.html": "5cd7d08f8672882aa60b2030b4b29d43",
"flutter_bootstrap.js": "e8610939df653a8830b8f94ef5d3436f",
"version.json": "54140ec5237bca28e40b658f700695ae",
"main.dart.js": "8848577019757f9b72bc0de9e3a98904"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
