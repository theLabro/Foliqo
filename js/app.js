/* ============================================================
   Gridfolio — App bootstrap (app.js)
   Wires the top bar, appearance/SEO controls, autosave status,
   save points, deploy modal, and initialises all modules.
   ============================================================ */

(function () {
  // ---- tiny event bus ----
  var bus = {};
  window.GF_emit = function (name, payload) { (bus[name] || []).forEach(function (fn) { fn(payload); }); };
  window.GF_on = function (name, fn) { (bus[name] = bus[name] || []).push(fn); };

  // ---- toast ----
  var toastEl, toastTimer;
  window.GF_toast = function (msg, kind) {
    if (!toastEl) toastEl = document.getElementById("toast");
    toastEl.textContent = msg;
    toastEl.className = "toast show " + (kind || "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.className = "toast " + (kind || ""); }, 2400);
  };

  function S() { return window.GF_Store.get(); }

  // ---- theme switcher ----
  function initThemes() {
    var sw = document.getElementById("themeSwitcher");
    sw.addEventListener("click", function (e) {
      var b = e.target.closest(".theme-btn");
      if (!b) return;
      var theme = b.dataset.theme;
      window.GF_Store.update(function (st) {
        st.theme = theme;
        // reset custom colours to the new theme defaults (Req 7.5)
        st.colors = Object.assign({}, window.GF_THEMES[theme].defaults);
        st.font = window.GF_THEMES[theme].font || st.font;
      });
      syncThemeUI();
      syncAppearanceInputs();
      window.GF_loadBuilderFont(S().font);
      applySpecimenFont(S().font);
    });
    syncThemeUI();
  }

  function syncThemeUI() {
    var theme = S().theme;
    document.querySelectorAll(".theme-btn").forEach(function (b) {
      var on = b.dataset.theme === theme;
      b.classList.toggle("active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  // ---- rail / panel navigation ----
  function initRail() {
    var rail = document.getElementById("rail");
    var views = document.querySelectorAll(".panel-view");
    rail.addEventListener("click", function (e) {
      var b = e.target.closest(".rail-btn");
      if (!b) return;
      var panel = b.dataset.panel;
      rail.querySelectorAll(".rail-btn").forEach(function (x) {
        var on = x === b;
        x.classList.toggle("active", on);
        x.setAttribute("aria-selected", on ? "true" : "false");
      });
      views.forEach(function (v) {
        var on = v.dataset.view === panel;
        v.classList.toggle("active", on);
        v.hidden = !on;
      });
    });
  }

  // ---- breakpoint toggle ----
  function initBreakpoints() {
    var tg = document.getElementById("breakpointToggle");
    var sizeEl = document.getElementById("stageSize");
    var labels = { desktop: "Desktop", tablet: "Tablet · 768px", mobile: "Mobile · 390px" };
    tg.addEventListener("click", function (e) {
      var b = e.target.closest(".bp-btn");
      if (!b) return;
      var bp = b.dataset.bp;
      tg.querySelectorAll(".bp-btn").forEach(function (x) {
        var on = x === b;
        x.classList.toggle("active", on);
        x.setAttribute("aria-checked", on ? "true" : "false");
      });
      window.GF_Preview.setBreakpoint(bp);
      if (sizeEl) sizeEl.textContent = labels[bp] || "";
    });
  }

  // ---- font select ----
  var typeSpecimen;
  function applySpecimenFont(name) {
    if (!typeSpecimen) typeSpecimen = document.getElementById("typeSpecimen");
    var f = window.GF_FONT_MAP[name];
    if (typeSpecimen && f) typeSpecimen.style.fontFamily = f.stack;
  }
  function initFonts() {
    var sel = document.getElementById("fontSelect");
    sel.innerHTML = window.GF_FONTS.map(function (f) {
      return '<option value="' + f.name + '">' + f.name + "</option>";
    }).join("");
    sel.value = S().font;
    sel.addEventListener("change", function () {
      window.GF_Store.update(function (st) { st.font = sel.value; });
      window.GF_loadBuilderFont(sel.value);
      applySpecimenFont(sel.value);
    });
    window.GF_loadBuilderFont(S().font);
    applySpecimenFont(S().font);
  }

  // ---- appearance / SEO inputs ----
  var accent, bg, text, seoTitle, seoDesc, seoOg, seoDescCount;
  var accentHex, bgHex, textHex, contrastHint, seoPreviewTitle, seoPreviewDesc;

  function initAppearance() {
    accent = document.getElementById("accentColor");
    bg = document.getElementById("bgColor");
    text = document.getElementById("textColor");
    seoTitle = document.getElementById("seoTitle");
    seoDesc = document.getElementById("seoDesc");
    seoOg = document.getElementById("seoOg");
    seoDescCount = document.getElementById("seoDescCount");
    accentHex = document.getElementById("accentHex");
    bgHex = document.getElementById("bgHex");
    textHex = document.getElementById("textHex");
    contrastHint = document.getElementById("contrastHint");
    seoPreviewTitle = document.getElementById("seoPreviewTitle");
    seoPreviewDesc = document.getElementById("seoPreviewDesc");

    accent.addEventListener("input", function () { window.GF_Store.update(function (st) { st.colors.accent = accent.value; }); updateHex(); });
    bg.addEventListener("input", function () { window.GF_Store.update(function (st) { st.colors.bg = bg.value; }); updateHex(); });
    text.addEventListener("input", function () { window.GF_Store.update(function (st) { st.colors.text = text.value; }); updateHex(); });

    seoTitle.addEventListener("input", function () { window.GF_Store.update(function (st) { st.seo.title = seoTitle.value; }); updateSeoPreview(); });
    seoOg.addEventListener("input", function () { window.GF_Store.update(function (st) { st.seo.ogImage = seoOg.value; }); });
    seoDesc.addEventListener("input", function () {
      window.GF_Store.update(function (st) { st.seo.description = seoDesc.value; });
      updateDescCount(); updateSeoPreview();
    });

    var seoGen = document.getElementById("seoGenBtn");
    if (seoGen) seoGen.addEventListener("click", function () {
      var text = window.GF_Suggest.seo(S());
      seoDesc.value = text;
      window.GF_Store.update(function (st) { st.seo.description = text; });
      updateDescCount(); updateSeoPreview();
      window.GF_toast("Description suggested", "ok");
    });

    syncAppearanceInputs();
  }

  // relative luminance + WCAG contrast ratio
  function luminance(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return 1;
    var ch = [m[1], m[2], m[3]].map(function (h) {
      var v = parseInt(h, 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  function contrastRatio(a, b) {
    var l1 = luminance(a), l2 = luminance(b);
    var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }
  function updateHex() {
    if (accentHex) accentHex.textContent = accent.value;
    if (bgHex) bgHex.textContent = bg.value;
    if (textHex) textHex.textContent = text.value;
    var ratio = contrastRatio(bg.value, text.value);
    if (contrastHint) {
      if (ratio < 4.5) {
        contrastHint.hidden = false;
        contrastHint.textContent = "⚠ Text/background contrast is " + ratio.toFixed(1) + ":1 — below the 4.5:1 readability target.";
      } else {
        contrastHint.hidden = true;
      }
    }
  }
  function updateSeoPreview() {
    if (seoPreviewTitle) seoPreviewTitle.textContent = seoTitle.value || "Your page title";
    if (seoPreviewDesc) seoPreviewDesc.textContent = seoDesc.value || "Your meta description will appear here.";
  }

  function updateDescCount() {
    var len = seoDesc.value.length;
    seoDescCount.textContent = len + "/160";
    seoDescCount.classList.toggle("over", len > 160);
  }

  function syncAppearanceInputs() {
    var st = S();
    accent.value = st.colors.accent;
    bg.value = st.colors.bg;
    text.value = st.colors.text;
    seoTitle.value = st.seo.title || "";
    seoDesc.value = st.seo.description || "";
    seoOg.value = st.seo.ogImage || "";
    document.getElementById("fontSelect").value = st.font;
    updateDescCount();
    updateHex();
    updateSeoPreview();
  }

  // ---- save points ----
  function initSavePoints() {
    document.getElementById("saveBtn").addEventListener("click", function () {
      var name = prompt("Name this save point:", "Save " + new Date().toLocaleString());
      if (name === null) return;
      var sp = window.GF_Store.addSavePoint(name.trim() || undefined);
      if (sp) { renderSavePoints(); window.GF_toast("Save point created", "ok"); }
      else window.GF_toast("Storage unavailable — can't save", "err");
    });
    renderSavePoints();
  }

  function renderSavePoints() {
    var list = document.getElementById("savepointList");
    var points = window.GF_Store.getSavePoints();
    if (!points.length) {
      list.innerHTML = '<li class="empty-hint" style="padding:14px">No save points yet.</li>';
      return;
    }
    list.innerHTML = points.map(function (p) {
      return '<li class="savepoint-item" data-sp="' + p.id + '">' +
        '<span class="sp-name">' + escapeHtml(p.name) + "</span>" +
        "<time>" + new Date(p.at).toLocaleDateString() + "</time>" +
        '<button class="btn-mini" data-restore="' + p.id + '">Restore</button>' +
        '<button class="btn-mini danger" data-delsp="' + p.id + '" aria-label="Delete save point">✕</button>' +
        "</li>";
    }).join("");

    list.querySelectorAll("[data-restore]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (window.GF_Store.restoreSavePoint(b.dataset.restore)) {
          afterRestore();
          window.GF_toast("Save point restored", "ok");
        }
      });
    });
    list.querySelectorAll("[data-delsp]").forEach(function (b) {
      b.addEventListener("click", function () {
        window.GF_Store.deleteSavePoint(b.dataset.delsp);
        renderSavePoints();
      });
    });
  }

  function afterRestore() {
    syncThemeUI();
    syncAppearanceInputs();
    window.GF_loadBuilderFont(S().font);
    applySpecimenFont(S().font);
    window.GF_Builder.renderSections();
    window.GF_Preview.refresh({ immediate: true });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- deploy modal (GitHub-aware) ----
  var DEPLOY_CMDS = 'git init\ngit add .\ngit commit -m "My portfolio"\ngit branch -M main\ngit remote add origin https://github.com/USER/my-portfolio.git\ngit push -u origin main';
  var DEPLOY_URL = "https://USER.github.io/my-portfolio/";

  function refreshDeploy() {
    var u = window.GF_Auth && window.GF_Auth.currentUser();
    var banner = document.getElementById("githubConnect");
    var cmds = document.getElementById("deployCmds");
    var url = document.getElementById("deployUrl");
    var gh = u && u.provider === "github" && u.githubUser ? u.githubUser : null;

    if (gh) {
      if (cmds) cmds.textContent = DEPLOY_CMDS.replace(/USER/g, gh);
      if (url) url.textContent = DEPLOY_URL.replace(/USER/g, gh);
      if (banner) {
        banner.hidden = false;
        banner.innerHTML =
          (u.avatar ? '<img class="gh-connected__avatar" src="' + esc(u.avatar) + '" alt="" />' : "") +
          '<div class="gh-connected__txt"><strong>Connected as @' + esc(gh) + '</strong>' +
          '<span>Commands below are filled in with your username.</span></div>' +
          '<div class="gh-connected__actions">' +
          '<a class="btn btn--sm" href="https://github.com/new" target="_blank" rel="noopener">Create repo ↗</a>' +
          '<a class="btn btn--sm" href="' + esc(u.profile || ("https://github.com/" + gh)) + '" target="_blank" rel="noopener">My profile ↗</a>' +
          '</div>';
      }
    } else {
      if (cmds) cmds.textContent = DEPLOY_CMDS;
      if (url) url.textContent = DEPLOY_URL;
      if (banner) { banner.hidden = true; banner.innerHTML = ""; }
    }
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function initDeploy() {
    var modal = document.getElementById("deployModal");
    document.getElementById("deployBtn").addEventListener("click", function () {
      refreshDeploy();
      modal.hidden = false;
    });
    refreshDeploy();
  }

  // ---- autosave status ----
  function initAutosaveStatus() {
    var el = document.getElementById("autosaveStatus");
    if (window.GF_Store.isMemoryOnly()) {
      el.textContent = "⚠ In-memory only (storage unavailable)";
    } else {
      el.textContent = "All changes saved";
    }
    window.GF_on("autosave", function (info) {
      if (info.status === "pending") el.textContent = "Saving…";
      else if (info.status === "saved") el.textContent = "Saved " + new Date(info.at).toLocaleTimeString();
      else if (info.status === "memory") el.textContent = "⚠ In-memory only";
    });
    window.GF_on("storage-error", function () {
      window.GF_toast("Storage full — running in memory", "err");
    });
  }

  // ---- boot ----
  function boot() {
    window.GF_Store.init();
    window.GF_Preview.init();
    window.GF_Builder.init();
    window.GF_Drag.init();
    window.GF_Export.init();

    initThemes();
    initBreakpoints();
    initRail();
    initFonts();
    initAppearance();
    initSavePoints();
    initDeploy();
    initAutosaveStatus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
