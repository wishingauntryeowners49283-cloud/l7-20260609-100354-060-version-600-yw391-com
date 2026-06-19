(function () {
  var playerNodes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  playerNodes.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var hlsInstance = null;

    if (!video || !button) {
      return;
    }

    function prepareVideo() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      var streamUrl = video.getAttribute('data-stream');

      if (!streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          lowLatencyMode: true,
          enableWorker: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              destroyPlayer();
            }
          }
        });
      } else {
        video.src = streamUrl;
      }

      video.setAttribute('data-ready', '1');
    }

    function destroyPlayer() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    }

    function startPlayback() {
      prepareVideo();
      button.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
    window.addEventListener('pagehide', destroyPlayer);
  });
})();
