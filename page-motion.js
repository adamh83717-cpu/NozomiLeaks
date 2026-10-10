(function () {
  'use strict';
  if (window.nozomiPageMotionInstalled) return;
  window.nozomiPageMotionInstalled = true;
  var timer;
  function markSection() {
    var path = location.pathname.toLowerCase();
    document.body.dataset.nozomiSection = path === '/events' ? 'events' :
      /\/my\/(groups|groupadmin|creategroup)\.aspx|^\/groups\//.test(path) ? 'groups' :
      /\/my\/(avatar|character\.aspx)/.test(path) ? 'avatar' : '';
  }
  markSection();
  var replaying = false;
  document.addEventListener('click', function (event) {
    var groupLink = event.target.closest && event.target.closest('a[href]');
    if (groupLink && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey &&
        (!groupLink.target || groupLink.target === '_self')) {
      var groupUrl = new URL(groupLink.href, location.href);
      if (groupUrl.origin === location.origin && /^\/my\/groups\.aspx$/i.test(groupUrl.pathname) &&
          (replaying || window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        location.assign(groupUrl.href);
        return;
      }
    }
    if (replaying || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link || link.download || (link.target && link.target !== '_self')) return;
    var url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol) ||
        /\/downloads\/|\/auth\/|\/logout(?:\/|$)/i.test(url.pathname) ||
        url.pathname + url.search === location.pathname + location.search) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    document.body.classList.remove('nozomi-page-enter');
    document.body.classList.add('nozomi-page-leave');
    setTimeout(function () {
      replaying = true;
      try { link.click(); } finally { replaying = false; }
      clearTimeout(timer);
      timer = setTimeout(function () {
        document.body.classList.remove('nozomi-page-leave');
      }, 1500);
    }, 120);
  }, true);
  function prepareRender(image) {
    var src = image.getAttribute('src') || '';
    var render = /thumbnail|headshot|avatar|asset\.ashx|placeholder\.png|empty\.png/i.test(src) ||
      image.closest('[class*="card-"], [class*="imageWrap-"], [class*="previewAndScaling-"]');
    if (!render || /\.svg(?:\?|$)|\/halloween\/|logo|icon-thumbs/i.test(src)) return;
    if (image.dataset.nozomiRenderSource === src) return;
    image.dataset.nozomiRenderSource = src;
    image.classList.add('nozomi-render');
    image.classList.remove('nozomi-render-ready');
    if (image._nozomiRenderCleanup) image._nozomiRenderCleanup();
    if (/placeholder\.png|empty\.png/i.test(src)) return;
    var ready = function () {
      if (image.getAttribute('src') !== src) return;
      image.classList.add('nozomi-render-ready');
      cleanup();
    };
    var cleanup = function () {
      image.removeEventListener('load', ready);
      image.removeEventListener('error', ready);
      image._nozomiRenderCleanup = null;
    };
    image._nozomiRenderCleanup = cleanup;
    image.addEventListener('load', ready);
    image.addEventListener('error', ready);
    if (image.complete) requestAnimationFrame(ready);
  }
  function scanRenders(node) {
    if (node.nodeType !== 1) return;
    if (node.tagName === 'IMG') prepareRender(node);
    node.querySelectorAll('img').forEach(prepareRender);
  }
  var renderObserver = new MutationObserver(function (changes) {
    changes.forEach(function (change) {
      if (change.type === 'attributes') prepareRender(change.target);
      else change.addedNodes.forEach(scanRenders);
    });
  });
  scanRenders(document.documentElement);
  renderObserver.observe(document.documentElement, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['src']
  });
  function enter() {
    markSection();
    document.body.classList.remove('nozomi-page-leave');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.body.classList.remove('nozomi-page-enter');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add('nozomi-page-enter');
        clearTimeout(timer);
      });
    });
  }
  var attempts = 0;
  var lastPage = location.pathname + location.search;
  var observer = new MutationObserver(function () {
    var page = location.pathname + location.search;
    if (page === lastPage) return;
    lastPage = page;
    enter();
  });
  var root = document.getElementById('__next');
  if (root) observer.observe(root, { childList: true, subtree: true });
  window.addEventListener('pageshow', enter);
  function connect() {
    var router = window.next && window.next.router;
    if (router && router.events) {
      router.events.on('routeChangeComplete', enter);
      return;
    }
    if (++attempts < 40) setTimeout(connect, 250);
  }
  connect();
})();
