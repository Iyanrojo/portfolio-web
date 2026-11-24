/* Newsletter sign-up, shown just above the footer of every page.
   Subscriptions go to Iyán's Brevo list (double opt-in: Brevo sends a confirmation email first).
   The block stays hidden until FORM_URL holds the address of the Brevo form. */
(function () {
  var FORM_URL = '';                                  // e.g. https://xxxx.sibforms.com/serve/MUIFA...
  if (!/^https:\/\/[a-z0-9-]+\.sibforms\.com\/serve\//i.test(FORM_URL)) return;
  var es = document.documentElement.lang === 'es';
  var T = es ? {
    h: 'Newsletter', p: 'Nuevas series, copias y proyectos, de vez en cuando. Sin spam.',
    ph: 'Tu email', b: 'Suscribirme', ok: 'Casi está: revisa tu correo y confirma la suscripción.',
    bad: 'Escribe un email válido.', legal: 'Puedes darte de baja cuando quieras. <a href="cookies.html#newsletter">Privacidad</a>'
  } : {
    h: 'Newsletter', p: 'New series, prints and projects, now and then. No spam.',
    ph: 'Your email', b: 'Subscribe', ok: 'Almost there: check your inbox and confirm your subscription.',
    bad: 'Please enter a valid email.', legal: 'Unsubscribe at any time. <a href="cookies.html#newsletter">Privacy</a>'
  };
  function build() {
    var foot = document.querySelector('footer'); if (!foot || document.getElementById('nl')) return;
    var s = document.createElement('section'); s.className = 'nl'; s.id = 'nl';
    s.innerHTML = '<div class="wrap nl-in">' +
      '<div class="nl-t"><h2 class="nl-h">' + T.h + '</h2><p>' + T.p + '</p></div>' +
      '<form class="nl-f" method="POST" action="' + FORM_URL + '" target="nl-sink" novalidate>' +
        '<input type="email" name="EMAIL" required autocomplete="email" placeholder="' + T.ph + '" aria-label="' + T.ph + '">' +
        '<input type="text" name="email_address_check" value="" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<input type="hidden" name="locale" value="' + (es ? 'es' : 'en') + '"><input type="hidden" name="html_type" value="simple">' +
        '<button type="submit">' + T.b + '</button>' +
        '<p class="nl-s small" role="status"></p><p class="nl-l small">' + T.legal + '</p>' +
      '</form><iframe name="nl-sink" title="" hidden></iframe></div>';
    foot.parentNode.insertBefore(s, foot);
    var f = s.querySelector('form'), st = s.querySelector('.nl-s'), em = f.elements.EMAIL;
    f.addEventListener('submit', function (e) {
      if (!/^\S+@\S+\.\S+$/.test(em.value.trim())) { e.preventDefault(); st.textContent = T.bad; em.focus(); return; }
      if (f.elements.email_address_check.value) { e.preventDefault(); return; }
      // The form posts into a hidden frame, so the visitor stays on the page.
      setTimeout(function () { f.classList.add('done'); st.textContent = T.ok; em.value = ''; }, 300);
      if (window.irTrack) irTrack('sign_up', { method: 'newsletter', source: location.pathname });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
