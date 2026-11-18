#!/usr/bin/env python3
"""Generate the Spanish pages in /es/ from the English pages.

Run from the site folder:  python3 tools/build_es.py
- Translations come from js/i18n.js (English HTML -> Spanish HTML).
- Titles and descriptions for search engines come from SEO below.
- Also rewrites the SEO block (canonical, hreflang, Open Graph) of the English pages
  and regenerates sitemap.xml.
Edit the English pages, then run this script again: never edit /es/ by hand.
"""
import datetime, html, json, os, re, subprocess, sys
from bs4 import BeautifulSoup

D = "https://iyanrojo.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# page: (EN title, EN description, ES title, ES description, share image)
HIDDEN = set()  # built in both languages but kept out of the sitemap (and noindex in the page)

SEO = {
 "index.html": ("Iyán Rojo · Photographer and filmmaker in Cantabria, Spain",
   "Iyán Rojo Greciet, analogue photographer and filmmaker based in Cantabria, Spain: video production and filming, documentaries, campaigns and film photography.",
   "Iyán Rojo · Fotógrafo y producción de vídeo en Cantabria",
   "Iyán Rojo Greciet, fotógrafo analógico y realizador audiovisual en Cantabria: producción y grabación de vídeo, documentales, campañas y fotografía analógica.",
   "photos/02.jpg"),
 "gallery.html": ("Analogue photography · Iyán Rojo, photographer in Cantabria",
   "Analogue photography by Iyán Rojo, photographer based in Cantabria: 35 mm and medium-format film, black-and-white and colour. Prints available.",
   "Fotografía analógica · Iyán Rojo, fotógrafo en Cantabria",
   "Fotografía analógica de Iyán Rojo, fotógrafo en Cantabria: 35 mm y medio formato, en blanco y negro y en color. Copias de autor disponibles.",
   "photos/28.jpg"),
 "calima.html": ("CALIMA · Analogue photography series · Iyán Rojo",
   "CALIMA: a 35 mm colour film series by Iyán Rojo shot in Gran Canaria in 2022, when Saharan dust tints the most touristic coast of the Canary Islands orange.",
   "CALIMA · Serie de fotografía analógica · Iyán Rojo",
   "CALIMA: serie en película de color de 35 mm de Iyán Rojo, fotografiada en Gran Canaria en 2022, cuando el polvo del Sáhara tiñe de naranja la costa más turística de Canarias.",
   "photos/cal-cover.jpg"),
 "prints.html": ("Prints · Iyán Rojo",
   "Fine art prints of analogue photographs by Iyán Rojo signed and numbered, limited editions of 15.",
   "Copias · Iyán Rojo",
   "Copias fine art de fotografías analógicas de Iyán Rojo firmadas y numeradas, ediciones limitadas de 15.",
   "photos/02.jpg"),
 "dos-amigos.html": ("2 amigos · Analogue photography series · Iyán Rojo",
   "2 amigos: a medium-format film series by Iyán Rojo about Pedro and Tino ‘el Tigre’. Exhibited at the Centro Nacional de Fotografía, Torrelavega (Cantabria).",
   "2 amigos · Serie de fotografía analógica · Iyán Rojo",
   "2 amigos: serie en película de medio formato de Iyán Rojo sobre Pedro y Tino ‘el Tigre’. Expuesta en el Centro Nacional de Fotografía de Torrelavega (Cantabria).",
   "photos/2a-cover.jpg"),
 "tierra-de-nadie.html": ("Tierra de nadie · Photo-poetry book · Iyán Rojo",
   "Tierra de nadie: a photo-poetry book by Iyán Rojo inspired by Tierra de Campos, with black-and-white 6×6 medium-format film photographs.",
   "Tierra de nadie · Fotopoemario · Iyán Rojo",
   "Tierra de nadie: fotopoemario de Iyán Rojo inspirado en Tierra de Campos, con fotografías analógicas en blanco y negro en medio formato 6×6.",
   "photos/tdn-cover.jpg"),
 "films.html": ("Films and documentaries · Iyán Rojo, filmmaker",
   "Documentaries, video portraits and personal films by Iyán Rojo, filmmaker based in Cantabria: TIERRA, Skateboard Diaries, LeFeu the music video AGUA for Leapoldo and book trailers for Carolina Sarmiento.",
   "Documentales y películas · Iyán Rojo, realizador audiovisual",
   "Documentales, videorretratos y películas de Iyán Rojo, realizador audiovisual en Cantabria: TIERRA, Skateboard Diaries, LeFeu el videoclip AGUA para Leapoldo y book trailers para Carolina Sarmiento.",
   "photos/art-03.jpg"),
 "tierra.html": ("TIERRA · Documentary (2019) · Iyán Rojo",
   "TIERRA: a documentary about don Adolfo, the schoolteacher murdered in Sahelices del Río during the Spanish Civil War. Directed and edited by Iyán Rojo.",
   "TIERRA · Documental (2019) · Iyán Rojo",
   "TIERRA: documental sobre don Adolfo, el maestro asesinado en Sahelices del Río durante la Guerra Civil. Dirección y montaje de Iyán Rojo.",
   "photos/tierra-05.jpg"),
 "work.html": ("Video production and campaigns in Cantabria · Iyán Rojo",
   "Video production, filming and campaigns by Iyán Rojo in Cantabria for NGOs, international cooperation and brands: Nueva Vida, El Free Tour de la Trata, Calidad Rural, GIZ.",
   "Producción de vídeo y campañas en Cantabria · Iyán Rojo",
   "Producción y grabación de vídeo, campañas y documentales de Iyán Rojo en Cantabria para ONG, cooperación internacional y marcas: Nueva Vida, El Free Tour de la Trata, Calidad Rural, GIZ.",
   "photos/film-09.jpg"),
 "nueva-vida.html": ("Asociación Nueva Vida · Documentary and campaigns · Iyán Rojo",
   "Documentary filmmaker for Asociación Nueva Vida for more than three years: the stories of the people it supports, its programmes and campaigns such as El Free Tour de la Trata.",
   "Asociación Nueva Vida · Documental y campañas · Iyán Rojo",
   "Más de tres años como realizador documental de la Asociación Nueva Vida: las historias de las personas usuarias, sus programas y campañas como El Free Tour de la Trata.",
   "photos/film-09.jpg"),
 "free-tour.html": ("El Free Tour de la Trata · Campaign · Iyán Rojo",
   "El Free Tour de la Trata: an awareness campaign on human trafficking in Santander framed as a city walking tour. More than 4 million views.",
   "El Free Tour de la Trata · Campaña · Iyán Rojo",
   "El Free Tour de la Trata: campaña de sensibilización sobre la trata en Santander en forma de visita guiada. Más de 4 millones de visualizaciones.",
   "photos/film-09.jpg"),
 "bienvenido-al-futuro.html": ("Bienvenido al futuro · Calidad Rural · Iyán Rojo",
   "Bienvenido al futuro: a short film for Calidad Rural that presents rural life like a product launch. Filmed in Cantabria. More than 300,000 organic views.",
   "Bienvenido al futuro · Calidad Rural · Iyán Rojo",
   "Bienvenido al futuro: pieza para Calidad Rural que presenta la vida rural como el lanzamiento de un producto. Rodada en Cantabria. Más de 300.000 visualizaciones orgánicas.",
   "photos/film-08.jpg"),
 "eurosocial.html": ("EUROsociAL+ · Video campaigns · Iyán Rojo",
   "Two video campaigns directed by Iyán Rojo for EUROsociAL+, the European Union programme for social cohesion in Latin America, on its cooperation with Central America.",
   "EUROsociAL+ · Campañas en vídeo · Iyán Rojo",
   "Dos campañas en vídeo dirigidas por Iyán Rojo para EUROsociAL+, el programa de la Unión Europea para la cohesión social en América Latina, sobre su cooperación con Centroamérica.",
   "photos/film-03.jpg"),
 "exhibition.html": ("Exhibition view · Analogue photography · Iyán Rojo",
   "Iyán Rojo's analogue photographs one by one, full screen on a black background, with optional music.",
   "Vista exposición · Fotografía analógica · Iyán Rojo",
   "Las fotografías analógicas de Iyán Rojo una a una, a pantalla completa sobre fondo negro, con música opcional.",
   "photos/28.jpg"),
 "contact.html": ("Contact · Photographer and video production in Cantabria · Iyán Rojo",
   "Contact Iyán Rojo, photographer and filmmaker in Cantabria (Santander, Torrelavega): video production and filming, analogue photography, campaigns and prints.",
   "Contacto · Fotógrafo y producción de vídeo en Cantabria · Iyán Rojo",
   "Contacta con Iyán Rojo, fotógrafo y realizador en Cantabria (Santander, Torrelavega): producción y grabación de vídeo, fotografía analógica, campañas y copias de autor.",
   "assets/portrait.jpg"),
}

BUSINESS = {
 "@context": "https://schema.org",
 "@graph": [
  {"@type": "Person", "@id": D + "/#person", "name": "Iyán Rojo Greciet", "alternateName": ["Iyán Rojo", "Iyan Rojo", "Iyan Rojo Greciet"],
   "url": D + "/", "image": D + "/assets/portrait.jpg",
   "jobTitle": ["Fotógrafo", "Realizador audiovisual", "Photographer", "Filmmaker"],
   "knowsAbout": ["Fotografía analógica", "Producción de vídeo", "Grabación de vídeo", "Documental", "Analogue photography", "Video production"],
   "address": {"@type": "PostalAddress", "addressLocality": "Torrelavega", "addressRegion": "Cantabria", "addressCountry": "ES"},
   "sameAs": ["https://www.instagram.com/iyanrojo_/", "https://vimeo.com/341890221", "https://www.youtube.com/watch?v=FFCa6GAHRDk"]},
  {"@type": "ProfessionalService", "@id": D + "/#service", "name": "Iyán Rojo · Fotografía y producción de vídeo",
   "url": D + "/", "image": D + "/photos/02.jpg", "founder": {"@id": D + "/#person"},
   "email": "iyanrojo@gmail.com", "telephone": "+34649925806",
   "address": {"@type": "PostalAddress", "addressLocality": "Torrelavega", "addressRegion": "Cantabria", "addressCountry": "ES"},
   "areaServed": [{"@type": "AdministrativeArea", "name": "Cantabria"}, {"@type": "City", "name": "Santander"}, {"@type": "City", "name": "Torrelavega"}, {"@type": "Country", "name": "España"}],
   "serviceType": ["Producción de vídeo", "Grabación de vídeo", "Fotografía analógica", "Fotógrafo", "Documental", "Campañas audiovisuales"]}
 ]}

ASSET_PREFIXES = ("css/", "js/", "photos/", "docs/", "cv/", "assets/")

def es_dict():
    js = subprocess.run(["node", "-e",
        "const fs=require('fs');const s=fs.readFileSync('js/i18n.js','utf8');"
        "const i=s.indexOf('var ES');const j=s.indexOf('\\n};',i);"
        "eval(s.slice(i,j+3).replace('var ES','global.ES'));process.stdout.write(JSON.stringify(ES));"],
        capture_output=True, text=True, check=True).stdout
    return json.loads(js)

def norm(h):
    return re.sub(r"<br\s*/?>", "<br>", h.strip())

def url(page, lang):
    p = "" if page == "index.html" else page
    return D + ("/es/" if lang == "es" else "/") + p

def seo_block(page, lang):
    t_en, d_en, t_es, d_es, img = SEO[page]
    t, d = (t_es, d_es) if lang == "es" else (t_en, d_en)
    out = ['<!-- SEO -->',
      '<link rel="canonical" href="%s">' % url(page, lang),
      '<link rel="alternate" hreflang="en" href="%s">' % url(page, "en"),
      '<link rel="alternate" hreflang="es" href="%s">' % url(page, "es"),
      '<link rel="alternate" hreflang="x-default" href="%s">' % url(page, "en"),
      '<link rel="icon" href="/favicon.ico" sizes="48x48">',
      '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
      '<link rel="icon" href="/assets/favicon-96.png" type="image/png" sizes="96x96">',
      '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=2">',
      '<meta property="og:type" content="website">',
      '<meta property="og:site_name" content="Iyán Rojo">',
      '<meta property="og:locale" content="%s">' % ("es_ES" if lang == "es" else "en_GB"),
      '<meta property="og:title" content="%s">' % html.escape(t),
      '<meta property="og:description" content="%s">' % html.escape(d),
      '<meta property="og:url" content="%s">' % url(page, lang),
      '<meta property="og:image" content="%s/%s">' % (D, img),
      '<meta name="twitter:card" content="summary_large_image">']
    if page in ("index.html", "contact.html"):
        out.append('<script type="application/ld+json">%s</script>' % json.dumps(BUSINESS, ensure_ascii=False))
    out.append('<!-- /SEO -->')
    return t, d, "\n".join(out)

def set_head(s, page, lang):
    t, d, block = seo_block(page, lang)
    s = re.sub(r"<title>.*?</title>", lambda m: "<title>%s</title>" % html.escape(t, quote=False), s, count=1, flags=re.S)
    s = re.sub(r'<meta (?:name="description" content="[^"]*"|content="[^"]*" name="description")\s*/?>', lambda m: '<meta name="description" content="%s">' % html.escape(d), s, count=1)
    s = re.sub(r"<!-- SEO -->.*?<!-- /SEO -->", lambda m: block, s, count=1, flags=re.S)
    return s

def bust(s):
    """Add ?v=<content hash> to css/js links so browsers fetch new versions after each publish."""
    import hashlib
    def rep(m):
        p = m.group(1)
        try: h = hashlib.md5(open(p, "rb").read()).hexdigest()[:8]
        except OSError: return m.group(0)
        return '%s?v=%s"' % (p, h)
    return re.sub(r'((?:css|js)/[\w.-]+\.(?:css|js))(?:\?v=\w+)?"', rep, s)

def build():
    ES = {}
    for k, v in es_dict().items():
        ES[norm(k)] = v
        ES[norm(BeautifulSoup(k, "html.parser").decode())] = v  # same markup as BeautifulSoup writes it
    os.makedirs("es", exist_ok=True)
    today = datetime.date.today().isoformat()
    missing = {}
    for page in SEO:
        src = open(page, encoding="utf-8").read()
        src = bust(set_head(src, page, "en"))
        open(page, "w", encoding="utf-8").write(src)

        soup = BeautifulSoup(src, "html.parser")
        soup.html["lang"] = "es"
        done = set()
        for el in soup.body.find_all(True):
            if el.name in ("script", "style") or any(id(p) in done for p in el.parents):
                continue
            inner = norm(el.decode_contents())
            if inner in ES:
                el.clear()
                el.append(BeautifulSoup(ES[inner], "html.parser"))
                done.add(id(el))
        # language link points back to English
        a = soup.find(id="lang")
        if a:
            a["href"] = "../" + ("" if page == "index.html" else page)
            a["hreflang"] = "en"; a["lang"] = "en"; a["title"] = "View in English"
            a.clear(); a.append(BeautifulSoup("<b>ES</b> / EN", "html.parser"))
        # asset paths one level up
        for tag in soup.find_all(True):
            for attr in ("src", "href", "data-cover", "poster"):
                v = tag.get(attr)
                if isinstance(v, str) and v.startswith(ASSET_PREFIXES):
                    tag[attr] = "../" + v
        root = soup.new_tag("script"); root.string = "window.ROOT='../';"
        soup.head.append(root)
        out = set_head(str(soup), page, "es")   # Spanish title, description, canonical and Open Graph
        open(os.path.join("es", page), "w", encoding="utf-8").write(out)

    for extra in ("404.html",):
        if os.path.exists(extra):
            x = open(extra, encoding="utf-8").read(); open(extra, "w", encoding="utf-8").write(bust(x))

    # sitemap with language alternates
    rows = []
    for page in SEO:
        if page in HIDDEN: continue
        for lang in ("en", "es"):
            rows.append('  <url><loc>%s</loc><lastmod>%s</lastmod>'
                        '<xhtml:link rel="alternate" hreflang="en" href="%s"/>'
                        '<xhtml:link rel="alternate" hreflang="es" href="%s"/></url>'
                        % (url(page, lang), today, url(page, "en"), url(page, "es")))
    open("sitemap.xml", "w").write('<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(rows) + "\n</urlset>\n")
    print("Built", len(SEO), "Spanish pages in es/")

if __name__ == "__main__":
    build()
