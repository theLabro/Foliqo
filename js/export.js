/* ============================================================
   Gridfolio — Export to ZIP (export.js)
   Builds a self-contained static site bundle and downloads it,
   morphing the export button into a progress bar.
   ============================================================ */

(function () {
  var btn, bar, pct;
  var README = function (state) {
    var hero = (state.sections || []).find(function (s) { return s.type === "hero"; });
    var who = hero ? hero.data.name : "your portfolio";
    return "# " + (state.seo.title || who) + "\n\n" +
      "Exported with Foliqo.\n\n" +
      "## Run locally\n\n" +
      "Just open `index.html` in a browser, or serve the folder:\n\n" +
      "```\npython -m http.server\n```\n\n" +
      "## Deploy to GitHub Pages\n\n" +
      "1. Create a new public repository.\n" +
      "2. Push these files to the repo root.\n" +
      "3. Settings -> Pages -> Source: Deploy from a branch -> `main` / root.\n" +
      "4. Visit `https://USER.github.io/REPO/`.\n\n" +
      "Docs: https://docs.github.com/pages/getting-started-with-github-pages\n";
  };

  function setProgress(p) {
    p = Math.max(0, Math.min(100, Math.round(p)));
    if (bar) bar.style.width = p + "%";
    if (pct) pct.textContent = p + "%";
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function slugify(s) {
    return (s || "portfolio").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "portfolio";
  }

  async function run() {
    if (btn.classList.contains("exporting")) return;
    var state = window.GF_Store.get();
    btn.classList.add("exporting");
    setProgress(0);

    try {
      var zip = new window.GF_Zip.Writer();

      await sleep(120); setProgress(20);
      var html = window.GF_Render.document(state, "export");
      zip.add("index.html", html);

      await sleep(120); setProgress(45);
      zip.add("css/style.css", window.GF_Render.css(state));

      await sleep(120); setProgress(65);
      zip.add("js/main.js", window.GF_Render.js(state));

      await sleep(120); setProgress(80);
      zip.add("README.md", README(state));
      // .nojekyll so GitHub Pages serves files as-is
      zip.add(".nojekyll", "");

      await sleep(120); setProgress(92);
      var blob = zip.generate();

      setProgress(100);
      btn.classList.add("done");
      await sleep(280);

      var hero = (state.sections || []).find(function (s) { return s.type === "hero"; });
      var name = slugify(state.seo.title || (hero && hero.data.name) || "portfolio");
      download(blob, name + ".zip");
      window.GF_toast("Exported " + name + ".zip", "ok");
    } catch (err) {
      console.error(err);
      window.GF_toast("Export failed. Check console.", "err");
    } finally {
      await sleep(200);
      btn.classList.remove("exporting", "done");
      setProgress(0);
    }
  }

  function init() {
    btn = document.getElementById("exportBtn");
    bar = btn.querySelector(".export-bar");
    pct = btn.querySelector(".export-pct");
    btn.addEventListener("click", run);
  }

  window.GF_Export = { init: init };
})();
