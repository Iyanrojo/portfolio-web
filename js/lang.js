/* Language link (EN pages at /, Spanish pages at /es/).
   Remembers the visitor's choice; on a first visit from a Spanish-language browser,
   the English page sends them to its Spanish version. */
(function () {
  var KEY = "site-lang";
  var es = document.documentElement.lang === "es";
  var link = document.getElementById("lang");
  if (link) link.addEventListener("click", function () {
    try { localStorage.setItem(KEY, es ? "en" : "es"); } catch (e) {}
  });
  if (es) return;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var wantsEs = saved === "es" || (!saved && (navigator.language || "").toLowerCase().indexOf("es") === 0);
  if (wantsEs && link && !/bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent)) location.replace(link.getAttribute("href"));
})();
