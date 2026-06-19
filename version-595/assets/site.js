const MovieSite = (() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  const initMenu = () => {
    const button = document.querySelector("[data-menu-button]");
    const nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", () => {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("is-menu-open", nav.classList.contains("is-open"));
    });
  };

  const initHero = () => {
    const root = document.querySelector("[data-hero]");
    if (!root) return;
    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) return;
    let index = 0;
    let timer = 0;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };
    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5200);
    };
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", play);
    show(0);
    play();
  };

  const initSearch = () => {
    document.querySelectorAll("[data-search-box]").forEach((box) => {
      const input = box.querySelector("[data-search-input]");
      const select = box.querySelector("[data-year-select]");
      const section = box.closest("section") || document;
      const cards = Array.from(section.querySelectorAll("[data-card]"));
      const apply = () => {
        const q = input ? input.value.trim().toLowerCase() : "";
        const year = select ? select.value : "";
        cards.forEach((card) => {
          const haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-type"),
            card.textContent
          ].join(" ").toLowerCase();
          const byText = !q || haystack.includes(q);
          const byYear = !year || card.getAttribute("data-year") === year;
          card.classList.toggle("is-hidden", !(byText && byYear));
        });
      };
      if (input) input.addEventListener("input", apply);
      if (select) select.addEventListener("change", apply);
      const params = new URLSearchParams(location.search);
      const query = params.get("q");
      if (query && input) {
        input.value = query;
        apply();
      }
    });
  };

  const initPlayer = (src) => {
    ready(() => {
      const video = document.getElementById("movie-player");
      const layer = document.getElementById("player-layer");
      const button = document.getElementById("player-button");
      if (!video || !src) return;
      let attached = false;
      const attach = () => {
        if (attached) return;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        attached = true;
      };
      const start = () => {
        attach();
        if (layer) layer.classList.add("is-hidden");
        video.controls = true;
        const run = video.play();
        if (run && typeof run.catch === "function") run.catch(() => {});
      };
      if (layer) layer.addEventListener("click", start);
      if (button) button.addEventListener("click", start);
      video.addEventListener("click", () => {
        if (!attached || video.paused) start();
      });
    });
  };

  ready(() => {
    initMenu();
    initHero();
    initSearch();
  });

  return { initPlayer };
})();
