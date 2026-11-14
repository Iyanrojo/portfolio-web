/* Plays YouTube and Vimeo links inside the site, in a dark overlay,
   instead of sending visitors to the platform. Instagram links still open outside. */
(function () {
  function embed(href) {
    var m = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
    if (m) return "https://www.youtube-nocookie.com/embed/" + m[1] + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
    m = href.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return "https://player.vimeo.com/video/" + m[1] + "?autoplay=1&title=0&byline=0&portrait=0&dnt=1";
    return null;
  }
  var es = document.documentElement.lang === "es";
  var box = document.createElement("div");
  box.className = "vp"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
  box.innerHTML = '<button type="button" class="vp-close small">' + (es ? "Cerrar" : "Close") + '</button><div class="vp-frame"></div>';
  document.body.appendChild(box);
  var frame = box.querySelector(".vp-frame"), last = null;
  function open(src) {
    last = document.activeElement;
    frame.innerHTML = '<iframe src="' + src + '" title="Video" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>';
    box.classList.add("open"); document.documentElement.style.overflow = "hidden";
    box.querySelector(".vp-close").focus();
  }
  function close() {
    box.classList.remove("open"); document.documentElement.style.overflow = "";
    setTimeout(function () { if (!box.classList.contains("open")) frame.innerHTML = ""; }, 400);
    if (last) last.focus();
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var src = embed(a.getAttribute("href"));
    if (!src) return;
    e.preventDefault(); open(src);
  });
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  box.querySelector(".vp-close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("open")) close(); });
})();
