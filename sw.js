const CACHE_NAME = "se-organiza-v3"; // INCREMENTE ESTA VERSÃO PARA FORÇAR ATUALIZAÇÃO

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./public/manifest.json",
  "./public/icons/icon-192x192.png",
  "./public/icons/icon-512x512.png",
  // Adicione aqui seus arquivos CSS/JS principais se não usar bundler
  // Ex: './src/main.js', './assets/style.css'
];

// Instalação: Cache dos arquivos estáticos essenciais (App Shell)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Força o SW a esperar até que a atualização seja confirmada pelo usuário (skipWaiting via mensagem)
});

// Ativação: Limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Interceptação de Requisições
self.addEventListener("fetch", (event) => {
  // 1. Ignora requisições que não são GET (POST, PUT, DELETE, etc.)
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // 2. Ignora requisições para a API (não queremos cachear respostas da API)
  if (url.pathname.startsWith("/api/")) return;

  // 3. Ignora requisições de outros domínios que NÃO sejam CDNs essenciais
  if (
    !url.origin.startsWith(self.location.origin) &&
    !url.href.includes("cdn") &&
    !url.href.includes("gstatic") &&
    !url.href.includes("googleapis")
  )
    return;

  // Estratégia para Navegação (HTML): Network First, fallback to Cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("./index.html");
      })
    );
    return;
  }

  // Estratégia para Assets (JS, CSS, Imagens): Stale-While-Revalidate
  // Retorna o cache rápido, mas atualiza em segundo plano para a próxima vez
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Verifica se a resposta é válida antes de cachear
          // Aceitamos 'basic' (mesma origem) e 'cors' (CDNs)
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === "basic" ||
              networkResponse.type === "cors")
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Se falhar o fetch e não tiver cache, retorna nada (ou imagem placeholder)
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Escuta mensagem para forçar atualização imediata
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
