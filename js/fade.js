/* As you scroll down, the page slowly turns from light to dark:
   the background darkens and the text lightens, until the colours are inverted at the end. */
(function () {
  var root = document.documentElement;
  if (document.body.classList.contains("landing")) return;
  var FROM = { bg: [246,245,242], ink: [17,17,16], muted: [138,137,132], slot: [230,228,223], rule: [217,215,209], "ink-2": [58,57,54], "ink-3": [74,73,69] };
  var TO   = { bg: [17,17,16], ink: [246,245,242], muted: [150,149,144], slot: [38,37,35], rule: [52,51,48], "ink-2": [214,212,206], "ink-3": [190,188,182] };
  var TEXT = { ink: 1, muted: 1, "ink-2": 1, "ink-3": 1 };
  var ticking = false, last = -1;
  function ease(t) { return t * t * (3 - 2 * t); }            // smooth start and end
  function update() {
    ticking = false;
    var max = Math.max(1, root.scrollHeight - window.innerHeight);
    var span = Math.max(max, 900);                            // short pages change less
    var t = Math.min(1, Math.max(0, (window.scrollY - span * 0.12) / (span * 0.8)));
    t = ease(t);
    if (Math.abs(t - last) < 0.002) return;
    last = t;
    // Text stays readable: it crosses over to light around the middle, while the background darkens gradually.
    var tt = ease(Math.min(1, Math.max(0, (t - 0.42) / 0.16)));
    for (var k in FROM) {
      var a = FROM[k], b = TO[k], u = TEXT[k] ? tt : t;
      root.style.setProperty("--" + k, "rgb(" + Math.round(a[0] + (b[0] - a[0]) * u) + "," + Math.round(a[1] + (b[1] - a[1]) * u) + "," + Math.round(a[2] + (b[2] - a[2]) * u) + ")");
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue("--bg");
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
