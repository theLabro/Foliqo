/* ============================================================
   Gridfolio — State store (store.js)
   Single source of truth + localStorage autosave + save points.
   ============================================================ */

(function () {
  var LS_KEY = "gridfolio.autosave.v1";
  var LS_SAVEPOINTS = "gridfolio.savepoints.v1";

  function uid() { return "id_" + Math.random().toString(36).slice(2, 9); }

  function defaultState() {
    return {
      theme: "minimal",
      colors: Object.assign({}, window.GF_THEMES["minimal"].defaults),
      font: "Inter",
      seo: { title: "", description: "", ogImage: "" },
      sections: [
        { id: uid(), type: "hero", data: {
          name: "Jane Doe", title: "Frontend Developer",
          tagline: "I build accessible, delightful web experiences.",
          avatar: "" } },
        { id: uid(), type: "projects", data: { items: [
          { id: uid(), title: "Project One", image: "", description: "A short description of what this project does and the impact it had.", tags: ["JavaScript", "CSS"], demo: "", source: "" }
        ] } },
        { id: uid(), type: "skills", data: { items: [
          { id: uid(), name: "JavaScript", level: 90 },
          { id: uid(), name: "CSS", level: 85 }
        ] } },
        { id: uid(), type: "experience", data: { items: [
          { id: uid(), title: "Frontend Developer", org: "Acme Inc.", start: "2022-01", end: "Present", description: "Building and maintaining the design system." }
        ] } },
        { id: uid(), type: "contact", data: {
          email: "hello@example.com",
          message: "Let's work together.",
          socials: [
            { id: uid(), label: "GitHub", url: "https://github.com/" },
            { id: uid(), label: "LinkedIn", url: "https://linkedin.com/in/" }
          ] } }
      ]
    };
  }

  var listeners = [];
  var saveTimer = null;
  var memoryOnly = false;
  var state = null;

  function storageAvailable() {
    try {
      var t = "__gf_test__";
      localStorage.setItem(t, "1"); localStorage.removeItem(t);
      return true;
    } catch (e) { return false; }
  }

  function load() {
    if (storageAvailable()) {
      try {
        var raw = localStorage.getItem(LS_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) { /* corrupt — fall through */ }
    } else {
      memoryOnly = true;
    }
    return defaultState();
  }

  function persistNow() {
    if (memoryOnly) return false;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      memoryOnly = true;
      window.GF_emit && window.GF_emit("storage-error", e);
      return false;
    }
  }

  // ---- public API ----
  var Store = {
    uid: uid,
    isMemoryOnly: function () { return memoryOnly; },

    init: function () {
      state = load();
      // re-hydrate colour defaults if theme exists but colors missing
      if (!state.colors) state.colors = Object.assign({}, window.GF_THEMES[state.theme].defaults);
      return state;
    },

    get: function () { return state; },

    /* mutate via callback, then notify + schedule autosave */
    update: function (fn, opts) {
      fn(state);
      var silent = opts && opts.silent;
      listeners.forEach(function (l) { l(state); });
      if (!silent) this.scheduleSave();
    },

    /* replace whole state (save point restore) */
    replace: function (next) {
      state = next;
      listeners.forEach(function (l) { l(state); });
      this.scheduleSave();
    },

    subscribe: function (fn) { listeners.push(fn); },

    scheduleSave: function () {
      if (memoryOnly) {
        window.GF_emit && window.GF_emit("autosave", { status: "memory" });
        return;
      }
      clearTimeout(saveTimer);
      window.GF_emit && window.GF_emit("autosave", { status: "pending" });
      saveTimer = setTimeout(function () {
        var ok = persistNow();
        window.GF_emit && window.GF_emit("autosave", { status: ok ? "saved" : "memory", at: Date.now() });
      }, 1200); // well under the 5s requirement
    },

    saveNow: function () { return persistNow(); },

    // ---- save points ----
    getSavePoints: function () {
      if (!storageAvailable()) return [];
      try { return JSON.parse(localStorage.getItem(LS_SAVEPOINTS) || "[]"); }
      catch (e) { return []; }
    },

    addSavePoint: function (name) {
      if (!storageAvailable()) return null;
      var points = this.getSavePoints();
      var sp = { id: uid(), name: name || ("Save " + (points.length + 1)), at: Date.now(), state: JSON.parse(JSON.stringify(state)) };
      points.unshift(sp);
      if (points.length > 20) points = points.slice(0, 20);
      localStorage.setItem(LS_SAVEPOINTS, JSON.stringify(points));
      return sp;
    },

    restoreSavePoint: function (id) {
      var sp = this.getSavePoints().find(function (p) { return p.id === id; });
      if (sp) this.replace(JSON.parse(JSON.stringify(sp.state)));
      return !!sp;
    },

    deleteSavePoint: function (id) {
      if (!storageAvailable()) return;
      var points = this.getSavePoints().filter(function (p) { return p.id !== id; });
      localStorage.setItem(LS_SAVEPOINTS, JSON.stringify(points));
    }
  };

  window.GF_Store = Store;
})();
