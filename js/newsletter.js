/* Newsletter sign-up, shown just above the footer of every page.
   Each subscription arrives as an email in Iyán's inbox (hola@iyanrojo.com, via FormSubmit);
   he keeps the addresses and writes to them himself when there is news. */
(function () {
  var ENDPOINT = 'https://formsubmit.co/ajax/hola@iyanrojo.com';
  // Iyán's Apps Script (saves the subscriber to his sheet and sends the welcome email). Empty = only the email notice.
  var APP = '';
  var es = document.documentElement.lang === 'es';
  var T = es ? {
    h: 'Newsletter', p: 'Nuevas series, copias y proyectos, de vez en cuando. Sin spam.',
    ph: 'Tu email', b: 'Suscribirme', ok: 'Gracias. Te escribiré cuando haya novedades.', ok2: 'Gracias. Te acabo de enviar un email de bienvenida con un regalo.', err: 'No se ha podido enviar. Inténtalo de nuevo o escríbeme a hola@iyanrojo.com.',
    bad: 'Escribe un email válido.', legal: 'Puedes darte de baja cuando quieras. <a href="cookies.html#newsletter">Privacidad</a>'
  } : {
    h: 'Newsletter', p: 'New series, prints and projects, now and then. No spam.',
    ph: 'Your email', b: 'Subscribe', ok: 'Thank you. I will write to you when there is news.', ok2: 'Thank you. I have just sent you a welcome email with a gift.', err: 'It could not be sent. Please try again or write to hola@iyanrojo.com.',
    bad: 'Please enter a valid email.', legal: 'Unsubscribe at any time. <a href="cookies.html#newsletter">Privacy</a>'
  };
  function build() {
    var foot = document.querySelector('footer'); if (!foot || document.getElementById('nl')) return;
    var s = document.createElement('section'); s.className = 'nl'; s.id = 'nl';
    s.innerHTML = '<div class="wrap nl-in">' +
      '<div class="nl-t"><h2 class="nl-h">' + T.h + '</h2><p>' + T.p + '</p></div>' +
      '<form class="nl-f" novalidate>' +
        '<input type="email" name="email" required autocomplete="email" placeholder="' + T.ph + '" aria-label="' + T.ph + '">' +
        '<input type="text" name="_honey" value="" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button type="submit">' + T.b + '</button>' +
        '<p class="nl-s small" role="status"></p><p class="nl-l small">' + T.legal + '</p>' +
      '</form></div>';
    foot.parentNode.insertBefore(s, foot);
    var f = s.querySelector('form'), st = s.querySelector('.nl-s'), em = f.elements.email, btn = f.querySelector('button');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = em.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(v)) { st.textContent = T.bad; em.focus(); return; }
      if (f.elements._honey.value) return;
      btn.disabled = true;
      if (/^https:\/\/script\.google\.com\/macros\/s\//.test(APP)) {
        // text/plain avoids a CORS preflight; the reply cannot be read, so success is assumed once the request leaves.
        fetch(APP, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ email: v, lang: es ? 'es' : 'en', page: location.href.split('#')[0], _honey: '' }) })
          .then(function () { f.classList.add('done'); st.textContent = T.ok2; em.value = '';
            if (window.irTrack) irTrack('sign_up', { method: 'newsletter', source: location.pathname }); })
          .catch(function () { st.textContent = T.err; })
          .then(function () { btn.disabled = false; });
        return;
      }
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ _subject: 'Nueva suscripción a la newsletter: ' + v, Email: v, Idioma: es ? 'Español' : 'Inglés',
          'Se suscribió en': location.href.split('#')[0], Fecha: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
          _replyto: v, _template: 'table', _captcha: 'false' }) })
        .then(function (r) { if (!r.ok) throw 0; f.classList.add('done'); st.textContent = T.ok; em.value = '';
          if (window.irTrack) irTrack('sign_up', { method: 'newsletter', source: location.pathname }); })
        .catch(function () { st.textContent = T.err; })
        .then(function () { btn.disabled = false; });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
