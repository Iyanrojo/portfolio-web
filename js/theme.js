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
