/* Visitor statistics (Google Analytics 4), only with the visitor's consent.
   - Nothing is loaded until the visitor accepts the cookie notice.
   - Iyán's own devices are left out: open any page once with ?yo (?yo=0 to undo).
   - window.irTrack(name, params) records an event; pages call it for photos opened,
     the shop, purchases, films, the contact form and the exhibition view. */
(function () {
  var GA_ID = 'G-XXXXXXXXXX';                       // Measurement ID of the GA4 property
  var es = document.documentElement.lang === 'es', KEY = 'ir-consent', q = [];

  var owner = false;
  try {
    var qs = new URLSearchParams(location.search);
    if (qs.has('yo')) { if (qs.get('yo') === '0') localStorage.removeItem('ir-owner'); else localStorage.setItem('ir-owner', '1'); }
    owner = !!localStorage.getItem('ir-owner');
    if (qs.has('yo') && !/prints/.test(location.pathname)) history.replaceState(null, '', location.pathname + location.hash);
  } catch (e) {}
  var live = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== 'G-XXXXXXXXXX' && !owner && !navigator.webdriver && !/^(localhost|127\.)/.test(location.hostname);

  function consent() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  var loaded = false;
  function load() {
    if (loaded || !live) return; loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true, page_title: document.title, content_group: section() });
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(s);
    q.forEach(function (a) { gtag('event', a[0], a[1]); }); q = [];
  }
  // Which part of the site a page belongs to, so reports can group pages.
  function section() {
    var p = location.pathname.replace(/^\/es\//, '/').replace(/\/$/, '/index.html');
    if (/prints/.test(p)) return 'Copias';
    if (/gallery|dos-amigos|tierra-de-nadie|calima|exhibition/.test(p)) return 'Fotografía';
    if (/films|tierra\.html/.test(p)) return 'Films';
    if (/work|bienvenido|nueva-vida|eurosocial|free-tour/.test(p)) return 'Encargos';
    if (/contact/.test(p)) return 'Contacto';
    return 'Inicio';
  }
  window.irTrack = function (name, params) {
    params = params || {}; params.lang = es ? 'es' : 'en';
    if (!live || consent() !== 'yes') return;
    if (loaded) gtag('event', name, params); else q.push([name, params]);
  };

  // Cookie notice
  var bar = null;
  function ask() {
    if (!live) return;
    if (bar) { bar.classList.add('on'); return; }
    bar = document.createElement('div'); bar.className = 'ck'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', 'Cookies');
    bar.innerHTML = '<p>' + (es ? 'Uso cookies de análisis (Google Analytics) para saber qué fotografías y trabajos interesan más. ¿Me dejas? <a href="cookies.html">Más información</a>'
                                : 'I use analytics cookies (Google Analytics) to learn which photographs and work interest people most. Is that all right? <a href="cookies.html">More information</a>') + '</p>' +
      '<div class="ck-b"><button type="button" data-v="no">' + (es ? 'Rechazar' : 'Decline') + '</button><button type="button" data-v="yes" class="ck-ok">' + (es ? 'Aceptar' : 'Accept') + '</button></div>';
    document.body.appendChild(bar);
    bar.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-v'); if (!v) return;
      try { localStorage.setItem(KEY, v); } catch (x) {}
      bar.classList.remove('on');
      if (v === 'yes') load();
      else if (loaded) { try { document.cookie.split(';').forEach(function (c) { var n = c.split('=')[0].trim(); if (/^_ga/.test(n)) document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + location.hostname.replace(/^www\./, ''); }); } catch (x) {} }
    });
    requestAnimationFrame(function () { bar.classList.add('on'); });
  }
  window.cookieSettings = function () { ask(); };

  function start() {
    // "Cookies" link in every footer, to change the choice later.
    var f = document.querySelector('footer .wrap span');
    if (f && live && !document.getElementById('ck-link')) { var a = document.createElement('a'); a.id = 'ck-link'; a.href = 'cookies.html'; a.textContent = 'Cookies'; a.style.marginLeft = '.6em'; f.appendChild(document.createTextNode(' ·')); f.appendChild(a); }
    var c = consent();
    if (c === 'yes') load(); else if (c !== 'no') setTimeout(ask, 900);
    // Clicks recorded across the whole site: films, links out, Instagram, phone, menu.
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var h = a.getAttribute('href') || '';
      if (a.classList.contains('player') || /vimeo\.com|youtube\.com|youtu\.be/.test(h)) {
        irTrack('film_play', { film: (a.getAttribute('aria-label') || a.textContent || h).replace(/^(Play|Reproducir)\s+/, '').replace(/\s+on (Vimeo|YouTube)$/, '').trim().slice(0, 90), url: h });
      } else if (/instagram\.com/.test(h)) irTrack('instagram_click', { url: h });
      else if (/^tel:/.test(h)) irTrack('phone_click', {});
      else if (/^https?:/.test(h) && h.indexOf(location.host) < 0) irTrack('link_out', { url: h.slice(0, 100) });
      else if (a.closest('header, nav')) irTrack('menu_click', { item: (a.textContent || '').trim().slice(0, 40) });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
