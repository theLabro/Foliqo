/* ============================================================
   Gridfolio — Theme definitions (themes.js)
   Each theme exposes default colour roles + a CSS generator
   used by render.js for the preview AND the export.
   ============================================================ */

window.GF_THEMES = {
  "minimal": {
    label: "Minimal",
    defaults: { accent: "#2563eb", bg: "#ffffff", text: "#1e293b" },
    font: "Inter"
  },
  "dark-pro": {
    label: "Dark Pro",
    defaults: { accent: "#38bdf8", bg: "#0f172a", text: "#e2e8f0" },
    font: "Space Grotesk"
  },
  "glassmorphic": {
    label: "Glassmorphic",
    defaults: { accent: "#a78bfa", bg: "#1e1b4b", text: "#f5f3ff" },
    font: "Outfit"
  },
  "neon": {
    label: "Neon",
    defaults: { accent: "#22d3ee", bg: "#0a0a0f", text: "#f0fdfa" },
    font: "Fira Code"
  },
  "typographic": {
    label: "Typographic",
    defaults: { accent: "#b91c1c", bg: "#fefce8", text: "#1c1917" },
    font: "Playfair Display"
  },
  "magazine": {
    label: "Magazine",
    defaults: { accent: "#db2777", bg: "#fff1f2", text: "#27272a" },
    font: "DM Sans"
  }
};

/* Returns a CSS string of theme-specific decorative rules.
   Colour values are injected as CSS variables, so these rules
   only define *treatment* (shadows, borders, layout flavour). */
window.GF_THEME_CSS = function (themeId) {
  switch (themeId) {
    case "dark-pro":
      return `
        body.pf{background:
          radial-gradient(900px 500px at 85% -10%, rgba(56,189,248,.10), transparent 60%),
          var(--pf-bg);}
        .pf-card{background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02));backdrop-filter:blur(6px)}
        .pf-h1{background:linear-gradient(120deg,#fff 20%,var(--pf-accent));-webkit-background-clip:text;background-clip:text;color:transparent}
        .pf-contact-card{background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.01))}
      `;
    case "glassmorphic":
      return `
        body.pf{background:
          radial-gradient(820px 620px at 82% -12%, color-mix(in srgb,var(--pf-accent) 55%,transparent), transparent 60%),
          radial-gradient(680px 520px at -8% 112%, #3b82f6aa, transparent 55%),
          radial-gradient(600px 600px at 50% 50%, #ec489955, transparent 60%),
          var(--pf-bg);background-attachment:fixed}
        .pf-card,.pf-contact-card{background:rgba(255,255,255,.07);backdrop-filter:blur(20px) saturate(140%);-webkit-backdrop-filter:blur(20px) saturate(140%);
          border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 40px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.25)}
        .pf-chip{background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.25)}
        .pf-bar{background:rgba(255,255,255,.14)}
        .pf-eyebrow{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)}
      `;
    case "neon":
      return `
        body.pf{background:
          radial-gradient(700px 500px at 80% 0%, color-mix(in srgb,var(--pf-accent) 18%,transparent), transparent 60%),
          linear-gradient(180deg,#06060a,var(--pf-bg));background-attachment:fixed}
        .pf-h1{background:none;color:var(--pf-text);text-shadow:0 0 28px color-mix(in srgb,var(--pf-accent) 70%,transparent)}
        .pf-card{background:rgba(255,255,255,.015);border:1px solid color-mix(in srgb,var(--pf-accent) 45%,transparent);box-shadow:0 0 22px -6px color-mix(in srgb,var(--pf-accent) 60%,transparent)}
        .pf-card:hover{border-color:var(--pf-accent);box-shadow:0 0 38px -6px var(--pf-accent)}
        .pf-section-title{text-transform:uppercase;letter-spacing:.12em}
        .pf-chip{background:transparent;color:var(--pf-accent);border:1px solid var(--pf-accent);box-shadow:0 0 12px -2px var(--pf-accent)}
        .pf-bar-fill{box-shadow:0 0 14px var(--pf-accent)}
        .pf-btn{box-shadow:0 0 22px -4px var(--pf-accent)}
        .pf-timeline-dot{box-shadow:0 0 0 5px var(--pf-bg),0 0 18px var(--pf-accent)}
        .pf-contact-card{border-color:color-mix(in srgb,var(--pf-accent) 40%,transparent);box-shadow:0 0 50px -20px var(--pf-accent)}
      `;
    case "typographic":
      return `
        .pf-h1{background:none;color:var(--pf-text);font-size:clamp(3rem,11vw,7rem);letter-spacing:-.05em;text-transform:uppercase}
        .pf-section-title{font-size:clamp(2rem,5.5vw,3.4rem);text-transform:uppercase;letter-spacing:-.02em}
        .pf-kicker{align-self:flex-start;border-top:3px solid var(--pf-text);padding-top:6px}
        .pf-card{border:1.5px solid var(--pf-text);border-radius:0;background:transparent;box-shadow:6px 6px 0 var(--pf-text)}
        .pf-card:hover{transform:translate(-3px,-3px);box-shadow:9px 9px 0 var(--pf-accent)}
        .pf-card-media{border-bottom:1.5px solid var(--pf-text)}
        .pf-chip{border-radius:0;background:var(--pf-text);color:var(--pf-bg)}
        .pf-btn{border-radius:0;box-shadow:4px 4px 0 var(--pf-text)}
        .pf-btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--pf-text)}
        .pf-contact-card{border-radius:0;border:1.5px solid var(--pf-text);box-shadow:8px 8px 0 var(--pf-text)}
        .pf-eyebrow{border-radius:0}
      `;
    case "magazine":
      return `
        .pf-h1{background:none;color:var(--pf-text);font-weight:800}
        .pf-section-title::before{content:none}
        .pf-kicker{font-style:italic;letter-spacing:.05em}
        .pf-card{background:#fff;border:0;border-radius:6px;box-shadow:0 14px 40px -18px rgba(0,0,0,.3)}
        .pf-card-body h3{font-size:1.35rem}
        .pf-chip{background:var(--pf-accent);color:#fff}
        .pf-projects-grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
        .pf-contact-card{background:var(--pf-text);color:var(--pf-bg)}
        .pf-contact-card .pf-contact-title{color:var(--pf-bg)}
      `;
    case "minimal":
    default:
      return `
        .pf-card{background:#fff;border:1px solid rgba(0,0,0,.07);box-shadow:0 4px 20px -8px rgba(0,0,0,.12)}
        .pf-chip{background:var(--pf-accent-soft);color:var(--pf-accent)}
      `;
  }
};
