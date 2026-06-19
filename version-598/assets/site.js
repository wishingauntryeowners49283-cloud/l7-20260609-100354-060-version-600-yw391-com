(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let current = 0;
    let timer = null;

    const setSlide = (index) => {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => setSlide(current + 1), 5000);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        setSlide(index);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', () => {
        setSlide(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', () => {
        setSlide(current - 1);
        start();
      });
    }

    setSlide(0);
    start();
  }

  const queryInput = document.querySelector('[data-filter-input]');
  const typeSelect = document.querySelector('[data-filter-type]');
  const cards = Array.from(document.querySelectorAll('[data-search]'));
  const empty = document.querySelector('[data-empty-result]');

  const filterCards = () => {
    if (!cards.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (queryInput && !queryInput.dataset.ready) {
      const initial = params.get('q') || '';
      queryInput.value = initial;
      queryInput.dataset.ready = 'true';
    }

    const keyword = queryInput ? queryInput.value.trim().toLowerCase() : '';
    const selectedType = typeSelect ? typeSelect.value : '';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = (card.dataset.search || '').toLowerCase();
      const type = card.dataset.type || '';
      const matchedKeyword = !keyword || haystack.includes(keyword);
      const matchedType = !selectedType || type === selectedType;
      const show = matchedKeyword && matchedType;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  };

  if (queryInput) {
    queryInput.addEventListener('input', filterCards);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', filterCards);
  }

  filterCards();
})();

function initMoviePlayer(url) {
  const video = document.getElementById('moviePlayer');
  const overlay = document.querySelector('[data-player-overlay]');
  const button = document.querySelector('[data-player-button]');

  if (!video || !url) {
    return;
  }

  let attached = false;

  const attach = () => {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }

    video.src = url;
  };

  const play = () => {
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });
}
