/*
  Cinema 内嵌视频区的氛围背景（毛玻璃/氛围光效果）
  做法：把视频画面画到一个很小的 <canvas> 上，再用 CSS 拉伸铺满黑块，
  小图放大天然就是模糊的，所以不需要再叠加 CSS blur，开销很低。
  样式在 css_styles/style.css 的 .cinema-ambient 里统一管理。
*/
(function () {
  var section = document.querySelector('.cinema-section');
  var video = section && section.querySelector('video');
  if (!video) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'cinema-ambient';
  canvas.setAttribute('aria-hidden', 'true');
  section.insertBefore(canvas, section.firstChild);

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 电脑端 / 手机端分别适配：画布分辨率与刷新间隔（毫秒）
  var PROFILES = {
    desktop: { w: 64, h: 36, interval: 66 },  // ≈15 帧/秒
    mobile: { w: 32, h: 18, interval: 200 }   // ≈5 帧/秒，更省电
  };
  var mobileQuery = window.matchMedia('(max-width: 768px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var profile = null;

  function applyProfile() {
    profile = mobileQuery.matches ? PROFILES.mobile : PROFILES.desktop;
    canvas.width = profile.w;
    canvas.height = profile.h;
    drawOnce();
  }

  // 封面图：视频还没出画面时先用 poster 垫底
  var posterImg = null;
  if (video.poster) {
    posterImg = new Image();
    posterImg.onload = drawOnce;
    posterImg.src = video.poster;
  }

  function drawFrame() {
    if (video.readyState >= 2 && video.videoWidth) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else if (posterImg && posterImg.complete && posterImg.naturalWidth) {
      ctx.drawImage(posterImg, 0, 0, canvas.width, canvas.height);
    }
  }

  function drawOnce() {
    if (profile) drawFrame();
  }

  var rafId = 0;
  var lastDraw = 0;
  var inView = true;

  function loop(now) {
    rafId = 0;
    if (video.paused || video.ended || !inView || document.hidden) return;
    if (now - lastDraw >= profile.interval) {
      lastDraw = now;
      drawFrame();
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (reduceMotion.matches) return;
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  video.addEventListener('play', start);
  video.addEventListener('playing', start);
  video.addEventListener('pause', drawOnce);
  video.addEventListener('ended', drawOnce);
  video.addEventListener('seeked', drawOnce);
  video.addEventListener('loadeddata', drawOnce);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && !video.paused) start();
  });

  // 滑出屏幕时暂停刷新
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView && !video.paused) start();
    }).observe(section);
  }

  var onQueryChange = function () { applyProfile(); };
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', onQueryChange);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(onQueryChange);
  }

  applyProfile();
})();
