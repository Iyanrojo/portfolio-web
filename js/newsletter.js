/* Newsletter sign-up.
   1) A block just above the footer of every page.
   2) A pop-up for visitors who have spent a while on the site (once; never again if closed or subscribed).
   Each subscription arrives as an email in Iyán's inbox (hola@iyanrojo.com, via FormSubmit). When APP is set,
   it goes instead to Iyán's Apps Script, which saves it to his sheet and sends the welcome email. */
(function () {
  var ENDPOINT = 'https://formsubmit.co/ajax/hola@iyanrojo.com';
  var APP = '';                                   // https://script.google.com/macros/s/…/exec
  var WAIT = 60;                                  // seconds of active browsing (across pages) before the pop-up
  var PHOTO = 'photos/78.jpg';
  var es = document.documentElement.lang === 'es', R = window.ROOT || '';
  var hasApp = /^https:\/\/script\.google\.com\/macros\/s\//.test(APP);
  var T = es ? {
    h: 'Newsletter', p: 'Novedades, nuevas series, publicaciones y exposiciones, de vez en cuando. Sin spam.',
    ph: 'Tu email', b: 'Suscribirme', ok: 'Gracias. Te escribiré cuando haya novedades.', ok2: 'Gracias. Te acabo de enviar un email de bienvenida con un regalo.',
    err: 'No se ha podido enviar. Inténtalo de nuevo o escríbeme a hola@iyanrojo.com.', bad: 'Escribe un email válido.',
    legal: 'Puedes darte de baja cuando quieras. <a href="cookies.html#newsletter">Privacidad</a>',
    pt: '¿Te escribo de vez en cuando?', pp: 'Novedades, nuevas series, publicaciones y exposiciones. Pocas veces y sin spam.',
    gift: 'Al suscribirte, un <b>15 % de descuento</b> en tu primera copia fine art.', close: 'Cerrar', no: 'Ahora no'
  } : {
    h: 'Newsletter', p: 'News, new series, publications and exhibitions, now and then. No spam.',
    ph: 'Your email', b: 'Subscribe', ok: 'Thank you. I will write to you when there is news.', ok2: 'Thank you. I have just sent you a welcome email with a gift.',
    err: 'It could not be sent. Please try again or write to hola@iyanrojo.com.', bad: 'Please enter a valid email.',
    legal: 'Unsubscribe at any time. <a href="cookies.html#newsletter">Privacy</a>',
    pt: 'Shall I write to you now and then?', pp: 'News, new series, publications and exhibitions. Rarely, and no spam.',
    gift: 'Subscribe and get <b>15% off</b> your first fine art print.', close: 'Close', no: 'Not now'
  };
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  function formHTML() {
    return '<input type="email" name="email" required autocomplete="email" placeholder="' + T.ph + '" aria-label="' + T.ph + '">' +
      '<input type="text" name="_honey" value="" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button type="submit">' + T.b + '</button>' +
      '<p class="nl-s small" role="status"></p><p class="nl-l small">' + T.legal + '</p>';
  }
  // Shared submit for the footer block and the pop-up.
  function wire(f, where, after) {
    var st = f.querySelector('.nl-s'), em = f.elements.email, btn = f.querySelector('button');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = em.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(v)) { st.textContent = T.bad; em.focus(); return; }
      if (f.elements._honey.value) return;
      btn.disabled = true;
      var page = location.href.split('#')[0] + (where === 'popup' ? ' (pop-up)' : '');
      var req = hasApp
        // text/plain avoids a CORS preflight; the reply cannot be read, so success is assumed once the request leaves.
        ? fetch(APP, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ email: v, lang: es ? 'es' : 'en', page: page, _honey: '' }) })
        : fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ _subject: 'Nueva suscripción a la newsletter: ' + v, Email: v, Idioma: es ? 'Español' : 'Inglés',
              'Se suscribió en': page, Fecha: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
              _replyto: v, _template: 'table', _captcha: 'false' }) })
            .then(function (r) { if (!r.ok) throw 0; });
      req.then(function () {
        f.classList.add('done'); st.textContent = hasApp ? T.ok2 : T.ok; em.value = ''; ls('ir-nl', 'yes');
        if (window.irTrack) irTrack('sign_up', { method: 'newsletter', source: where });
        if (after) after();
      }).catch(function () { st.textContent = T.err; }).then(function () { btn.disabled = false; });
    });
  }

  function block() {
    var foot = document.querySelector('footer'); if (!foot || document.getElementById('nl')) return;
    var s = document.createElement('section'); s.className = 'nl'; s.id = 'nl';
    s.innerHTML = '<div class="wrap nl-in"><div class="nl-t"><h2 class="nl-h">' + T.h + '</h2><p>' + T.p + '</p></div>' +
      '<form class="nl-f" novalidate>' + formHTML() + '</form></div>';
    foot.parentNode.insertBefore(s, foot);
    wire(s.querySelector('form'), 'pie');
  }

  // Pop-up: after WAIT seconds of visible time on the site during this visit; shown once per visitor.
  function popupAllowed() {
    if (ls('ir-nl') || ls('ir-owner')) return false;
    return !/stats\.html|cookies\.html/.test(location.pathname);
  }
  function busy() {
    // Never on top of something else: an enlarged photo, the print sheet, the contact form or the cookie notice.
    return !!document.querySelector('.lb.open, .shop-panel.open, .wm.open, .ck.on, .thanks.on') ||
      document.documentElement.style.overflow === 'hidden';
  }
  var box = null;
  function showPopup() {
    if (box || !popupAllowed()) return;
    ls('ir-nl', 'seen');                          // shown once; closing it means "not again"
    if (window.irTrack) irTrack('newsletter_popup', { action: 'shown' });
    box = document.createElement('div'); box.className = 'nlp'; box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'nlp-h');
    box.innerHTML = '<div class="nlp-card"><button type="button" class="nlp-x" aria-label="' + T.close + '">' + T.close + '</button>' +
      '<div class="nlp-img"><img src="' + R + PHOTO + '" alt=""></div>' +
      '<div class="nlp-body"><h2 class="nlp-h" id="nlp-h">' + T.pt + '</h2><p class="nlp-p">' + T.pp + '</p>' +
      (hasApp ? '<p class="nlp-gift">' + T.gift + '</p>' : '') +
      '<form class="nl-f" novalidate>' + formHTML() + '</form>' +
      '<button type="button" class="nlp-no">' + T.no + '</button></div></div>';
    document.body.appendChild(box);
    function close() {
      if (!box) return; var b = box; box = null;
      b.classList.remove('open'); document.documentElement.classList.remove('nlp-on'); setTimeout(function () { b.remove(); }, 300);
    }
    box.querySelector('.nlp-x').onclick = box.querySelector('.nlp-no').onclick = function () {
      if (window.irTrack) irTrack('newsletter_popup', { action: 'closed' }); close();
    };
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box) close(); });
    wire(box.querySelector('form'), 'popup', function () { var n = box && box.querySelector('.nlp-no'); if (n) n.hidden = true; setTimeout(close, 3500); });
    requestAnimationFrame(function () { if (box) { box.classList.add('open'); document.documentElement.classList.add('nlp-on'); } });
  }
  function timer() {
    if (!popupAllowed()) return;
    var t = 0; try { t = +sessionStorage.getItem('ir-nl-t') || 0; } catch (e) {}
    var iv = setInterval(function () {
      if (document.hidden) return;
      t++; try { sessionStorage.setItem('ir-nl-t', t); } catch (e) {}
      if (t >= WAIT && !busy()) { clearInterval(iv); showPopup(); }
    }, 1000);
  }
  window.nlPopupTest = function () { try { localStorage.removeItem('ir-nl'); } catch (e) {} showPopup(); };

  function start() { block(); timer(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
