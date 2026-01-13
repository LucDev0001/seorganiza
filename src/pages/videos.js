import { startPremiumCheckout } from "../services/payment.service.js";

export function Videos() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100";

  element.innerHTML = `
        <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center gap-4">
                <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-white">Vídeos e Dicas</h1>
            </div>
            <div class="flex items-center gap-4">
                <button id="btn-premium" class="hidden sm:flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                    <i class="fas fa-crown"></i> Seja Premium
                </button>
                <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                    <i class="fas fa-adjust text-xl"></i>
                </button>
            </div>
        </header>

        <main class="flex-1 p-6 max-w-5xl mx-auto w-full overflow-y-auto">
            <div class="mb-6">
                <div class="relative">
                    <input type="text" id="video-search" placeholder="Buscar vídeos (ex: como investir, economizar)..." class="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all text-gray-800 dark:text-gray-200">
                    <i class="fas fa-search absolute left-3.5 top-3.5 text-gray-400"></i>
                    <button id="btn-search" class="absolute right-2 top-2 bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-indigo-700 transition-colors">Buscar</button>
                </div>
            </div>

            <div id="videos-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Videos injected here -->
                <div class="col-span-full text-center py-10 text-gray-500">
                    <i class="fab fa-youtube text-4xl mb-3 text-red-500"></i>
                    <p>Carregando dicas financeiras...</p>
                </div>
            </div>
        </main>

        <!-- Video Modal -->
        <div id="video-modal" class="fixed inset-0 bg-black/90 hidden items-center justify-center z-[60] backdrop-blur-sm p-4">
            <div class="w-full max-w-4xl relative">
                <button id="close-video-modal" class="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl p-2"><i class="fas fa-times"></i></button>
                <div class="relative pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl">
                    <iframe id="video-frame" class="absolute inset-0 w-full h-full" src="" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    `;

  const searchInput = element.querySelector("#video-search");
  const searchBtn = element.querySelector("#btn-search");
  const grid = element.querySelector("#videos-grid");
  const videoModal = element.querySelector("#video-modal");
  const videoFrame = element.querySelector("#video-frame");
  const closeVideoBtn = element.querySelector("#close-video-modal");
  const btnPremium = element.querySelector("#btn-premium");

  const closeVideo = () => {
    videoModal.classList.add("hidden");
    videoModal.classList.remove("flex");
    videoFrame.src = "";
  };
  closeVideoBtn.onclick = closeVideo;
  videoModal.onclick = (e) => {
    if (e.target === videoModal) closeVideo();
  };

  if (btnPremium) btnPremium.onclick = startPremiumCheckout;

  // ⚠️ SUBSTITUA PELA SUA CHAVE DE API DO YOUTUBE (Google Cloud Console)
  // Obtenha aqui: https://console.cloud.google.com/apis/credentials
  // Se deixar como está, usará dados de exemplo (Mock)
  const YOUTUBE_API_KEY = "AIzaSyAOqDL5yB5xVbYMXGWPGqvyyGacxmup304";

  const searchVideos = async (query) => {
    if (!query) return;

    // Skeleton Loading
    grid.innerHTML = Array(6)
      .fill(0)
      .map(
        () => `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
            <div class="aspect-video bg-gray-200 dark:bg-gray-700"></div>
            <div class="p-4 space-y-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
    `
      )
      .join("");

    try {
      // Fallback se não tiver chave configurada (Modo Demonstração)
      if (YOUTUBE_API_KEY === "SUA_CHAVE_API_AQUI") {
        setTimeout(() => renderMockVideos(), 500);
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(
          query
        )}&type=video&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      if (data.error) throw new Error(data.error.message);
      renderVideos(data.items);
    } catch (error) {
      console.error(error);
      grid.innerHTML = `<div class="col-span-full text-center text-red-500 py-10">Erro ao buscar vídeos. Verifique a API Key.</div>`;
    }
  };

  const renderVideos = (items) => {
    grid.innerHTML = "";
    items.forEach((item) => {
      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const thumb = item.snippet.thumbnails.medium.url;
      const channel = item.snippet.channelTitle;

      const card = document.createElement("div");
      card.className =
        "bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer border border-gray-100 dark:border-gray-700";
      card.innerHTML = `
                <div class="relative aspect-video overflow-hidden">
                    <img src="${thumb}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <i class="fas fa-play-circle text-white text-5xl opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-lg"></i>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-gray-800 dark:text-white line-clamp-2 text-sm mb-1 leading-snug" title="${title}">${title}</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><i class="fas fa-tv"></i> ${channel}</p>
                </div>
            `;
      card.onclick = () =>
        window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
      card.onclick = () => {
        videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        videoModal.classList.remove("hidden");
        videoModal.classList.add("flex");
      };
      grid.appendChild(card);
    });
  };

  const renderMockVideos = () => {
    const mocks = [
      {
        id: { videoId: "5Y-a8c_8qK0" },
        snippet: {
          title: "Como organizar suas finanças do zero",
          channelTitle: "Primo Rico",
          thumbnails: {
            medium: { url: "https://i.ytimg.com/vi/5Y-a8c_8qK0/mqdefault.jpg" },
          },
        },
      },
      {
        id: { videoId: "v3x2m6gM9wE" },
        snippet: {
          title: "5 Dicas para economizar dinheiro agora",
          channelTitle: "Me Poupe!",
          thumbnails: {
            medium: { url: "https://i.ytimg.com/vi/v3x2m6gM9wE/mqdefault.jpg" },
          },
        },
      },
      {
        id: { videoId: "fJ9rUzIMcZQ" },
        snippet: {
          title: "Investimentos para iniciantes: Por onde começar?",
          channelTitle: "Nath Finanças",
          thumbnails: {
            medium: { url: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg" },
          },
        },
      },
      {
        id: { videoId: "sample1" },
        snippet: {
          title: "Reserva de Emergência: O Guia Completo",
          channelTitle: "Economia Diária",
          thumbnails: {
            medium: { url: "https://i.ytimg.com/vi/UDd3pTE5q1c/mqdefault.jpg" },
          },
        },
      },
      {
        id: { videoId: "sample2" },
        snippet: {
          title: "Como sair das dívidas rapidamente",
          channelTitle: "Finanças Pessoais",
          thumbnails: {
            medium: { url: "https://i.ytimg.com/vi/hJv4I8q8d_E/mqdefault.jpg" },
          },
        },
      },
      {
        id: { videoId: "sample3" },
        snippet: {
          title: "Cartão de Crédito: Vilão ou Mocinho?",
          channelTitle: "Educação Financeira",
          thumbnails: {
            medium: { url: "https://i.ytimg.com/vi/7X8II6J-6mU/mqdefault.jpg" },
          },
        },
      },
    ];
    renderVideos(mocks);
  };

  searchBtn.onclick = () => searchVideos(searchInput.value);
  searchInput.onkeypress = (e) => {
    if (e.key === "Enter") searchVideos(searchInput.value);
  };

  // Initial search
  searchVideos("educação financeira");

  return element;
}
