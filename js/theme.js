/* Light / dark switch. The choice is kept in localStorage ('site-theme');
   without a choice the page follows the system setting. The early part runs inline in <head>. */
(function () {
  var root = document.documentElement, es = root.lang === 'es';
  var ul = document.querySelector('header nav ul');
  if (!ul) return;
  var li = document.createElement('li');
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'theme-t';
  b.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg>';
  function sync() {
    var dark = root.getAttribute('data-theme') === 'dark';
    b.setAttribute('aria-pressed', dark ? 'true' : 'false');
    var t = dark ? (es ? 'Modo claro' : 'Light mode') : (es ? 'Modo oscuro' : 'Dark mode');
    b.setAttribute('aria-label', t); b.title = t;
  }
  b.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') !== 'dark';
    root.classList.add('theme-anim');
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    try { localStorage.setItem('site-theme', dark ? 'dark' : 'light'); } catch (e) {}
    sync();
    setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
  });
  li.appendChild(b); ul.appendChild(li); sync();
})();

/* "Write to me" popup: email links and links to contact.html#escribeme open a small form over the page
   (background blurred). Messages are sent through FormSubmit to Iyán's inbox. */
(function () {
  var MAIL = 'hola@iyanrojo.com', es = document.documentElement.lang === 'es', box = null, prev = null;
  var T = es ? {h:'Escríbeme', n:'Nombre', e:'Tu email', m:'Mensaje', s:'Enviar', c:'Cerrar', or:'O escríbeme directamente a', cp:'Copiar', cpd:'Copiado',
               bad:'Rellena nombre, un email válido y el mensaje.', go:'Enviando…', ok:'Gracias, mensaje enviado. Te respondo pronto.', err:'No se ha podido enviar. Escríbeme a ' + MAIL + '.',
               size:'Hola Iyán, me interesa una copia en otro tamaño. ', work:'Hola Iyán, me gustaría hablar contigo sobre un proyecto. ', print:'Hola Iyán, me interesa una copia impresa. ', ref:'Hola Iyán, me interesa una copia de la fotografía ', ser:['Hola Iyán, me interesa una copia de la serie «','». '], subj:'Mensaje desde la web – '}
          : {h:'Write to me', n:'Name', e:'Your email', m:'Message', s:'Send', c:'Close', or:'Or write to me directly at', cp:'Copy', cpd:'Copied',
               bad:'Please fill in your name, a valid email and a message.', go:'Sending…', ok:'Thank you, your message has been sent. I will reply soon.', err:'It could not be sent. Please write to ' + MAIL + '.',
               size:'Hi Iyán, I am interested in a print in another size. ', work:'Hi Iyán, I would like to talk to you about a project. ', print:'Hi Iyán, I am interested in a print. ', ref:'Hi Iyán, I am interested in a print of photograph ', ser:['Hi Iyán, I am interested in a print from the series “','”. '], subj:'Message from the website – '};
  function build() {
    box = document.createElement('div'); box.className = 'wm'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'wm-h');
    box.innerHTML = '<div class="wm-card"><button type="button" class="wm-x" aria-label="' + T.c + '">' + T.c + '</button>' +
      '<h2 class="wm-h" id="wm-h">' + T.h + '</h2><form class="write-form" novalidate>' +
      '<label><span>' + T.n + '</span><input name="name" autocomplete="name" required></label>' +
      '<label><span>' + T.e + '</span><input name="email" type="email" autocomplete="email" required></label>' +
      '<label class="wide"><span>' + T.m + '</span><textarea name="message" rows="6" required></textarea></label>' +
      '<input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="write-foot wide"><button type="submit" class="write-btn">' + T.s + '</button><span class="write-status small" role="status"></span></div></form>' +
      '<p class="wm-alt small">' + T.or + ' <button type="button" class="wm-copy">' + MAIL + '</button></p></div>';
    document.body.appendChild(box);
    var f = box.querySelector('form'), st = box.querySelector('.write-status'), btn = f.querySelector('.write-btn');
    box.querySelector('.wm-x').addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('open')) close(); });
    box.querySelector('.wm-copy').addEventListener('click', function () { var b = this;
      try { navigator.clipboard.writeText(MAIL); } catch (x) {} b.setAttribute('data-done', T.cpd); setTimeout(function () { b.removeAttribute('data-done'); }, 1800); });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); if (f.elements._honey.value) return;
      var n = f.elements.name.value.trim(), m = f.elements.email.value.trim(), t = f.elements.message.value.trim();
      if (!n || !t || !/^\S+@\S+\.\S+$/.test(m)) { st.textContent = T.bad; return; }
      btn.disabled = true; st.textContent = T.go;
      fetch('https://formsubmit.co/ajax/' + MAIL, {method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({name:n, email:m, message:t, page:location.href.split('#')[0], _subject:T.subj + n, _replyto:m, _template:'table', _captcha:'false'})})
      .then(function (r) { if (!r.ok) throw 0; f.reset(); st.textContent = T.ok; setTimeout(close, 2600); })
      .catch(function () { st.textContent = T.err; })
      .then(function () { btn.disabled = false; });
    });
  }
  function open(q) {
    if (!box) build();
    var f = box.querySelector('form'), msg = f.elements.message; box.querySelector('.write-status').textContent = '';
    var start = q.get('ref') ? T.ref + q.get('ref') + '. ' : q.get('serie') ? T.ser[0] + q.get('serie') + T.ser[1] : q.get('tema') === 'size' ? T.size : q.get('tema') === 'work' ? T.work : q.get('tema') === 'print' ? T.print : '';
    if (start && (!msg.value || msg.value === box._start)) msg.value = start; box._start = start;
    prev = document.activeElement; box.classList.add('open'); document.documentElement.classList.add('wm-on');
    setTimeout(function () { (f.elements.name.value ? msg : f.elements.name).focus(); }, 60);
  }
  function close() { box.classList.remove('open'); document.documentElement.classList.remove('wm-on'); if (prev && prev.focus) prev.focus(); }
  window.openWrite = function (params) { open(new URLSearchParams(params || '')); };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href');
    if (/^mailto:(hola@iyanrojo\.com|iyanrojo@)/.test(h)) { e.preventDefault(); open(new URLSearchParams()); return; }
    if (/(^|\/)contact\.html\?[^#]*#escribeme$|(^|\/)contact\.html#escribeme$/.test(h)) { e.preventDefault(); open(new URLSearchParams((h.split('?')[1] || '').split('#')[0])); }
  });
  if (location.hash === '#escribeme') open(new URLSearchParams(location.search));
})();
