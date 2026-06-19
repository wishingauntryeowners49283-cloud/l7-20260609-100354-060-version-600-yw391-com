(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      button.textContent = expanded ? '☰' : '×';
    });
  }

  function setupHero() {
    var root = document.querySelector('.hero-carousel');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('.hero-prev');
    var next = root.querySelector('.hero-next');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-go')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupFiltering() {
    var input = document.querySelector('.filter-input');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    var empty = document.querySelector('.empty-state');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));

    if (!input || !cards.length) {
      return;
    }

    function apply(value) {
      var term = String(value || '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = !term || haystack.indexOf(term) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener('input', function () {
      chips.forEach(function (chip) {
        chip.classList.remove('active');
      });
      apply(input.value);
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        input.value = chip.getAttribute('data-filter-chip') || '';
        apply(input.value);
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function setupSearch() {
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var empty = document.getElementById('search-empty');
    var data = window.SITE_SEARCH_DATA || [];
    var words = Array.prototype.slice.call(document.querySelectorAll('[data-search-word]'));

    if (!input || !results) {
      return;
    }

    function card(item) {
      return '<a class="movie-card" href="' + escapeHtml(item.url) + '">' +
        '<span class="poster-wrap"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-shade"><span class="play-badge">▶</span></span><span class="card-badge">' + escapeHtml(item.category) + '</span></span>' +
        '<span class="card-content"><strong>' + escapeHtml(item.title) + '</strong>' +
        '<span class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></span>' +
        '<span class="card-desc">' + escapeHtml(item.oneLine) + '</span></span></a>';
    }

    function render(value) {
      var term = String(value || '').trim().toLowerCase();
      var matches = [];
      if (term) {
        matches = data.filter(function (item) {
          return [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' '), item.oneLine, item.category].join(' ').toLowerCase().indexOf(term) !== -1;
        }).slice(0, 80);
      } else {
        matches = data.slice(0, 40);
      }
      results.innerHTML = matches.map(card).join('');
      if (empty) {
        empty.hidden = matches.length !== 0;
      }
    }

    input.value = getQuery();
    render(input.value);

    input.addEventListener('input', function () {
      render(input.value);
    });

    words.forEach(function (word) {
      word.addEventListener('click', function () {
        input.value = word.getAttribute('data-search-word') || '';
        render(input.value);
        input.focus();
      });
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.hls-player'));
    if (!players.length) {
      return;
    }

    players.forEach(function (video) {
      var src = video.getAttribute('data-stream');
      var shell = video.closest('.video-shell');
      var button = shell ? shell.querySelector('.player-center-button') : null;

      function bind() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
          window.addEventListener('pagehide', function () {
            hls.destroy();
          }, { once: true });
        } else {
          video.src = src;
        }
      }

      if (src) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          bind();
        } else {
          loadHls(bind);
        }
      }

      if (button) {
        button.addEventListener('click', function () {
          video.play();
        });
        video.addEventListener('play', function () {
          button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
          button.classList.remove('is-hidden');
        });
        video.addEventListener('ended', function () {
          button.classList.remove('is-hidden');
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFiltering();
    setupSearch();
    setupPlayers();
  });
})();
