/* "Ask about a print": copies the email address and shows how to ask.
   Mail links are blocked in some viewers, so the address is copied instead. */
(function(){
  var EMAIL='iyanrojo@gmail.com';
  var toast=document.createElement('div'); toast.className='toast'; toast.setAttribute('role','status'); document.body.appendChild(toast);
  var t=null;
  function show(msg){ toast.textContent=msg; toast.classList.add('on'); clearTimeout(t); t=setTimeout(function(){ toast.classList.remove('on'); }, 5200); }
  function es(){ return document.documentElement.lang==='es'; }
  document.addEventListener('click', function(e){
    var b=e.target.closest('[data-copy]'); if(!b) return;
    e.stopPropagation();
    var kind=b.getAttribute('data-copy'), n=window.currentPhoto||'';
    var msg;
    if(kind==='photo') msg = es() ? 'Email copiado: '+EMAIL+'. Escríbeme indicando la referencia '+n+'.' : 'Email copied: '+EMAIL+'. Write to me mentioning reference '+n+'.';
    else if(kind==='series') msg = es() ? 'Email copiado: '+EMAIL+'. Escríbeme indicando qué foto de la serie te interesa.' : 'Email copied: '+EMAIL+'. Write to me mentioning which photo from the series you like.';
    else msg = es() ? 'Email copiado: '+EMAIL+'. Escríbeme indicando la referencia de la foto (aparece al abrirla).' : 'Email copied: '+EMAIL+'. Write to me with the photo's reference (shown when you open it).';
    try { navigator.clipboard.writeText(EMAIL).then(function(){ show(msg); }, function(){ show(es() ? 'Escríbeme a '+EMAIL : 'Write to me at '+EMAIL); }); }
    catch(err){ show(es() ? 'Escríbeme a '+EMAIL : 'Write to me at '+EMAIL); }
  });
})();
