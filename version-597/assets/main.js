(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 360) {
                backTop.classList.add('is-visible');
            } else {
                backTop.classList.remove('is-visible');
            }
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var start = function () {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot'));
                showSlide(index);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    var normalize = function (value) {
        return String(value || '').toLowerCase().trim();
    };

    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-search-list]'));

    lists.forEach(function (list) {
        var input = list.querySelector('[data-local-search]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var noResults = list.querySelector('[data-no-results]');
        var count = list.querySelector('[data-result-count]');
        var clearButtons = Array.prototype.slice.call(list.querySelectorAll('[data-clear-search]'));
        var selects = Array.prototype.slice.call(list.querySelectorAll('[data-filter-select]'));
        var yearButtons = Array.prototype.slice.call(list.querySelectorAll('[data-filter-year]'));
        var activeYear = 'all';

        var params = new URLSearchParams(window.location.search);
        var queryParam = params.get('q');

        if (input && queryParam) {
            input.value = queryParam;
        }

        var applyFilters = function () {
            var query = normalize(input ? input.value : '');
            var visible = 0;
            var selectValues = {};

            selects.forEach(function (select) {
                selectValues[select.getAttribute('data-filter-select')] = select.value;
            });

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-category')
                ].join(' '));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesYearButton = activeYear === 'all' || card.getAttribute('data-year') === activeYear;
                var matchesSelects = true;

                Object.keys(selectValues).forEach(function (key) {
                    var value = selectValues[key];

                    if (value !== 'all') {
                        var attributeName = 'data-' + key;
                        matchesSelects = matchesSelects && card.getAttribute(attributeName) === value;
                    }
                });

                var show = matchesQuery && matchesYearButton && matchesSelects;
                card.style.display = show ? '' : 'none';

                if (show) {
                    visible += 1;
                }
            });

            if (noResults) {
                noResults.classList.toggle('is-visible', visible === 0);
            }

            if (count) {
                count.textContent = String(visible);
            }
        };

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });

        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeYear = button.getAttribute('data-filter-year') || 'all';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyFilters();
            });
        });

        clearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }

                selects.forEach(function (select) {
                    select.value = 'all';
                });

                activeYear = 'all';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item.getAttribute('data-filter-year') === 'all');
                });

                applyFilters();
            });
        });

        applyFilters();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var src = player.getAttribute('data-src');
        var hls = null;
        var loaded = false;

        var attachSource = function () {
            if (!video || !src || loaded) {
                return;
            }

            loaded = true;
            player.classList.add('is-loading');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        };

        var play = function () {
            attachSource();
            player.classList.add('is-playing');

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-loading');
                    player.classList.remove('is-playing');
                });
            }
        };

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    play();
                }
            });

            video.addEventListener('loadeddata', function () {
                player.classList.remove('is-loading');
            });

            video.addEventListener('canplay', function () {
                player.classList.remove('is-loading');
            });

            video.addEventListener('error', function () {
                player.classList.remove('is-loading');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
}());
