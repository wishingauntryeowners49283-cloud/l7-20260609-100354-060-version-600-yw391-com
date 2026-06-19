(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));

  panels.forEach(function (panel) {
    var list = panel.parentElement.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var searchInput = panel.querySelector('.site-search');
    var filters = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
    var count = panel.querySelector('[data-filter-count]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && searchInput) {
      searchInput.value = q;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function refresh() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var matched = true;
        var text = normalize(card.getAttribute('data-text'));

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        filters.forEach(function (filter) {
          var key = filter.getAttribute('data-filter');
          var value = normalize(filter.value);
          var actual = normalize(card.getAttribute('data-' + key));

          if (value && actual.indexOf(value) === -1) {
            matched = false;
          }
        });

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible ? '匹配影片：' + visible : '暂无匹配';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', refresh);
    }

    filters.forEach(function (filter) {
      filter.addEventListener('change', refresh);
    });

    refresh();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.stream-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var stream = player.getAttribute('data-stream');

    if (!video || !button || !stream) {
      return;
    }

    function prepareVideo() {
      if (video.getAttribute('data-ready') === 'true') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsController = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }

      video.controls = true;
      video.setAttribute('data-ready', 'true');
    }

    function playVideo() {
      prepareVideo();
      button.classList.add('is-hidden');

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
          video.controls = true;
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  });
})();
