/* "Ask about a print": opens the visitor's email with the subject already written
   (photo reference or series name). The address is also copied, in case
   no mail app is set up on the device. */
(function(){
  var EMAIL='iyanrojo@gmail.com';
  var toast=document.createElement('div'); toast.className='toast'; toast.setAttribute('role','status'); document.body.appendChild(toast);
  var t=null;
  function show(msg){ toast.textContent=msg; toast.classList.add('on'); clearTimeout(t); t=setTimeout(function(){ toast.classList.remove('on'); }, 5200); }
  function es(){ return document.documentElement.lang==='es'; }
  function seriesName(){ var h=document.querySelector('.proj-title'); return h ? h.textContent.trim() : ''; }
  document.addEventListener('click', function(e){
    var b=e.target.closest('[data-copy]'); if(!b) return;
    e.stopPropagation();
    var kind=b.getAttribute('data-copy'), n=window.currentPhoto||'';
    var subject, body;
    if(kind==='photo' && n){
      subject = es() ? 'Copia impresa – '+n : 'Print enquiry – '+n;
      body = es() ? 'Hola Iyán,\n\nMe interesa una copia impresa de la fotografía '+n+'.\n\n' : 'Hi Iyán,\n\nI am interested in a print of photo '+n+'.\n\n';
    } else if(kind==='series'){
      var s=seriesName();
      subject = es() ? 'Copia impresa – '+s : 'Print enquiry – '+s;
      body = es() ? 'Hola Iyán,\n\nMe interesa una copia impresa de la serie «'+s+'».\n\n' : 'Hi Iyán,\n\nI am interested in a print from the series “'+s+'”.\n\n';
    } else {
      subject = es() ? 'Copia impresa' : 'Print enquiry';
      body = '';
    }
    try { navigator.clipboard.writeText(EMAIL); } catch(err){}
    show(es() ? 'Abriendo tu correo… Si no se abre, escríbeme a '+EMAIL+' (ya copiado).' : 'Opening your email… If it doesn’t open, write to '+EMAIL+' (already copied).');
    window.location.href='mailto:'+EMAIL+'?subject='+encodeURIComponent(subject)+(body?'&body='+encodeURIComponent(body):'');
  });
})();
