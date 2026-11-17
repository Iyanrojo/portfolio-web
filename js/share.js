/* Share a photograph: Instagram Story image (1080×1920 with the photo and the link), WhatsApp, email, copy link.
   Used by gallery.html (viewer) and prints.html (print panel).
   SHARE.open(button, {img, ref, url, line}) shows the menu next to the button. */
(function () {
  var es = document.documentElement.lang === 'es';
  var T = es ? {
    story: 'Story para Instagram', wa: 'WhatsApp', mail: 'Email', copy: 'Copiar enlace', more: 'Más opciones…',
    copied: 'Enlace copiado', storyMob: 'Elige Instagram → Historia. El enlace ya está copiado: pégalo con el sticker «Enlace».',
    storyDesk: 'Story descargada y enlace copiado. Súbela a Instagram desde el móvil y pega el enlace con el sticker «Enlace».',
    subj: 'Una fotografía de Iyán Rojo',
    waMob: 'Elige WhatsApp: se envía la imagen con el enlace.',
    waDesk: 'Imagen descargada. Adjúntala en WhatsApp junto al mensaje con el enlace.'
  } : {
    story: 'Instagram Story', wa: 'WhatsApp', mail: 'Email', copy: 'Copy link', more: 'More options…',
    copied: 'Link copied', storyMob: 'Choose Instagram → Story. The link is already copied: paste it with the “Link” sticker.',
    storyDesk: 'Story downloaded and link copied. Post it from your phone and paste the link with the “Link” sticker.',
    subj: 'A photograph by Iyán Rojo',
    waMob: 'Choose WhatsApp: the image is sent with the link.',
    waDesk: 'Image downloaded. Attach it in WhatsApp next to the message with the link.'
  };

  var menu = document.createElement('div'); menu.className = 'share-menu'; menu.setAttribute('role', 'menu');
  var toast = document.createElement('div'); toast.className = 'share-toast'; toast.setAttribute('role', 'status');
  document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(menu); document.body.appendChild(toast); });
  if (document.body) { document.body.appendChild(menu); document.body.appendChild(toast); }

  function say(t) { toast.textContent = t; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('on'); }, 5200); }
  function copy(text) { try { return navigator.clipboard.writeText(text); } catch (e) { return Promise.reject(e); } }
  function close() { menu.classList.remove('open'); }
  document.addEventListener('click', function (e) { if (!menu.contains(e.target) && !e.target.closest('.share-btn')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  function loadImg(src) { return new Promise(function (ok, ko) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = ko; i.src = src; }); }

  // 1080×1920 story: name, the photo on white paper, a line of text and the link.
  function story(d) {
    var W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d');
    var numImg = null;
    return (document.fonts ? document.fonts.ready : Promise.resolve())
      .then(function () { return d.num ? loadImg(d.num).then(function (n) { numImg = n; }, function () {}) : null; })
      .then(function () { return loadImg(d.img); }).then(function (im) {
      g.fillStyle = '#f1eee8'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#16140f'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.font = '700 40px Archivo, Helvetica, Arial, sans-serif'; try { g.letterSpacing = '8px'; } catch (e) {}
      g.fillText('IYÁN ROJO', W / 2, 190);
      var maxW = 860, maxH = 1160, r = im.width / im.height, w = maxW, h = w / r; if (h > maxH) { h = maxH; w = h * r; }
      var x = (W - w) / 2, y = 300 + (maxH - h) / 2, m = Math.round(Math.min(w, h) * 0.035);
      g.save(); g.shadowColor = 'rgba(0,0,0,.28)'; g.shadowBlur = 50; g.shadowOffsetY = 22;
      var mb = numImg ? Math.round(m * 2.2) : m;          // prints: deeper bottom margin for initials and number
      g.fillStyle = '#fbfaf6'; g.fillRect(x - m, y - m, w + 2 * m, h + m + mb); g.restore();
      g.drawImage(im, x, y, w, h);
      if (numImg) { var nh = Math.round(mb * 0.5), nw = nh * numImg.width / numImg.height;
        g.globalAlpha = .9; g.drawImage(numImg, x + w - nw, y + h + (mb - nh) / 2, nw, nh); g.globalAlpha = 1; }
      var ty = y + h + mb + 110;
      try { g.letterSpacing = '0px'; } catch (e) {}
      g.fillStyle = '#16140f'; g.font = 'italic 500 50px "Cormorant Garamond", Georgia, serif';
      g.fillText(d.line || ('Ref. ' + d.ref), W / 2, ty);
      g.fillStyle = '#6f6b63'; g.font = '500 30px Archivo, Helvetica, Arial, sans-serif'; try { g.letterSpacing = '4px'; } catch (e) {}
      g.fillText('IYANROJO.COM', W / 2, H - 150);
      return new Promise(function (ok) { c.toBlob(ok, 'image/jpeg', 0.92); });
    });
  }

  // The image is prepared as soon as the menu opens, so sharing can start right on the tap
  // (phones only allow the share sheet directly from a tap, not after waiting).
  var ready = { key: '', blob: null };
  function prepare(d) { var key = d.img + '|' + d.line; if (ready.key === key) return; ready = { key: key, blob: null };
    story(d).then(function (b) { if (ready.key === key) ready.blob = b; }).catch(function () {}); }
  function fileOf(d) { return ready.blob ? new File([ready.blob], 'iyanrojo-' + d.ref + '.jpg', { type: 'image/jpeg' }) : null; }
  function download(d) { if (!ready.blob) return; var a = document.createElement('a'); a.href = URL.createObjectURL(ready.blob); a.download = 'iyanrojo-' + d.ref + '.jpg';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  var touch = window.matchMedia && matchMedia('(pointer:coarse)').matches;

  function shareStory(d) {
    copy(d.url).catch(function () {});
    var f = fileOf(d);
    if (touch && f && navigator.canShare && navigator.canShare({ files: [f] })) { say(T.storyMob); navigator.share({ files: [f] }).catch(function () {}); }
    else { download(d); say(T.storyDesk); }
  }

  // WhatsApp: the same image as the story, with the text and the link.
  function shareWhatsApp(d, text) {
    var msg = text + '\n' + d.url, f = fileOf(d);
    if (touch && f && navigator.canShare && navigator.canShare({ files: [f], text: msg })) {
      copy(d.url).catch(function () {}); say(T.waMob);
      navigator.share({ files: [f], text: msg }).catch(function () {});
      return;
    }
    var u = 'https://wa.me/?text=' + encodeURIComponent(msg);
    if (touch) { location.href = u; return; }           // phone without file sharing: WhatsApp with the link
    download(d); window.open(u, '_blank', 'noopener'); say(T.waDesk);
  }

  function item(label, fn) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.textContent = label; b.addEventListener('click', function () { close(); fn(); }); return b; }

  window.SHARE = {
    open: function (btn, d) {
      if (menu.classList.contains('open') && menu._for === btn) { close(); return; }
      menu.innerHTML = ''; menu._for = btn; prepare(d);
      var text = (d.line ? d.line + ' · ' : '') + 'Iyán Rojo';
      menu.appendChild(item(T.story, function () { shareStory(d); }));
      menu.appendChild(item(T.wa, function () { shareWhatsApp(d, text); }));
      menu.appendChild(item(T.mail, function () { location.href = 'mailto:?subject=' + encodeURIComponent(T.subj) + '&body=' + encodeURIComponent(text + '\n' + d.url); }));
      menu.appendChild(item(T.copy, function () { copy(d.url).then(function () { say(T.copied); }, function () { say(d.url); }); }));
      if (navigator.share) menu.appendChild(item(T.more, function () { navigator.share({ title: T.subj, text: text, url: d.url }).catch(function () {}); }));
      var r = btn.getBoundingClientRect();
      menu.style.visibility = 'hidden'; menu.classList.add('open');
      var mw = menu.offsetWidth, mh = menu.offsetHeight;
      var left = Math.min(Math.max(12, r.right - mw), window.innerWidth - mw - 12);
      var top = r.top - mh - 10 > 12 ? r.top - mh - 10 : r.bottom + 10;
      menu.style.left = left + 'px'; menu.style.top = top + 'px'; menu.style.visibility = '';
    }
  };
})();
