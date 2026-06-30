/* ============================================================
   Gridfolio — Google Fonts subset (fonts.js)
   ============================================================ */

window.GF_FONTS = [
  { name: "Inter",            stack: '"Inter", sans-serif',            weights: "400;500;600;700;800" },
  { name: "Poppins",          stack: '"Poppins", sans-serif',          weights: "400;500;600;700;800" },
  { name: "Space Grotesk",    stack: '"Space Grotesk", sans-serif',    weights: "400;500;600;700" },
  { name: "Fira Code",        stack: '"Fira Code", monospace',         weights: "400;500;600;700" },
  { name: "Playfair Display", stack: '"Playfair Display", serif',      weights: "400;500;600;700;800" },
  { name: "DM Sans",          stack: '"DM Sans", sans-serif',          weights: "400;500;700" },
  { name: "Syne",             stack: '"Syne", sans-serif',             weights: "400;500;600;700;800" },
  { name: "Outfit",           stack: '"Outfit", sans-serif',           weights: "400;500;600;700;800" },
  { name: "Manrope",          stack: '"Manrope", sans-serif',          weights: "400;500;600;700;800" },
  { name: "Sora",             stack: '"Sora", sans-serif',             weights: "400;500;600;700" },
  { name: "Work Sans",        stack: '"Work Sans", sans-serif',        weights: "400;500;600;700" },
  { name: "Lexend",           stack: '"Lexend", sans-serif',           weights: "400;500;600;700" },
  { name: "Montserrat",       stack: '"Montserrat", sans-serif',       weights: "400;500;600;700;800" },
  { name: "Raleway",          stack: '"Raleway", sans-serif',          weights: "400;500;600;700" },
  { name: "Nunito",           stack: '"Nunito", sans-serif',           weights: "400;600;700;800" },
  { name: "Rubik",            stack: '"Rubik", sans-serif',            weights: "400;500;600;700" },
  { name: "JetBrains Mono",   stack: '"JetBrains Mono", monospace',    weights: "400;500;600;700" },
  { name: "IBM Plex Sans",    stack: '"IBM Plex Sans", sans-serif',    weights: "400;500;600;700" },
  { name: "Merriweather",     stack: '"Merriweather", serif',          weights: "400;700" },
  { name: "Lora",             stack: '"Lora", serif',                  weights: "400;500;600;700" },
  { name: "Bricolage Grotesque", stack: '"Bricolage Grotesque", sans-serif', weights: "400;600;700;800" },
  { name: "Unbounded",        stack: '"Unbounded", sans-serif',        weights: "400;600;700;800" }
];

window.GF_FONT_MAP = window.GF_FONTS.reduce(function (m, f) { m[f.name] = f; return m; }, {});

/* Build a Google Fonts <link> href for a given font name. */
window.GF_fontHref = function (name) {
  var f = window.GF_FONT_MAP[name] || window.GF_FONT_MAP["Inter"];
  var family = f.name.replace(/ /g, "+");
  return "https://fonts.googleapis.com/css2?family=" + family + ":wght@" + f.weights + "&display=swap";
};

/* Inject (or update) the font into the BUILDER document so the
   font-select preview etc. look right. Preview iframe loads its own. */
window.GF_loadBuilderFont = function (name) {
  var id = "gf-builder-font";
  var link = document.getElementById(id);
  if (!link) {
    link = document.createElement("link");
    link.id = id; link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = window.GF_fontHref(name);
};
