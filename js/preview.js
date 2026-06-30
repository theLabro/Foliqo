/* ============================================================
   Gridfolio — Live preview (preview.js)
   Writes the rendered portfolio into the sandboxed iframe with
   a debounced fade-refresh. Handles breakpoint + theme cross-fade.
   ============================================================ */

(function () {
  var iframe, wrapper, refreshTimer = null, lastTheme = null;

  function writeDoc() {
    var state = window.GF_Store.get();
    var html = window.GF_Render.document(state, "preview");
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
  }

  function refresh(opts) {
    opts = opts || {};
    var state = window.GF_Store.get();

    // theme cross-fade flag
    if (lastTheme !== null && lastTheme !== state.theme) {
      wrapper.classList.add("theme-switch");
      setTimeout(function () { wrapper.classList.remove("theme-switch"); }, 420);
    }
    lastTheme = state.theme;

    wrapper.classList.add("refreshing");
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () {
      writeDoc();
      // fade back in once content is in
      requestAnimationFrame(function () {
        wrapper.classList.remove("refreshing");
      });
    }, opts.immediate ? 0 : 120); // keeps within the 300ms budget
  }

  function setBreakpoint(bp) {
    wrapper.setAttribute("data-bp", bp);
  }

  function init() {
    iframe = document.getElementById("previewIframe");
    wrapper = document.getElementById("previewWrapper");
    lastTheme = window.GF_Store.get().theme;
    writeDoc();
    // re-render whenever state changes
    window.GF_Store.subscribe(function () { refresh(); });
  }

  window.GF_Preview = { init: init, refresh: refresh, setBreakpoint: setBreakpoint };
})();
