/* ============================================================
   Gridfolio — Portfolio renderer (render.js)
   Generates a polished, export-ready portfolio from state.
   Shared by the live preview and the ZIP export.
   ============================================================ */

(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function escAttr(s) { return esc(s); }
  function safeUrl(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https?:|mailto:|data:image\/)/i.test(u)) return u;
    return "";
  }
  function clampDesc(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, n) : s; }
  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ""; }).join("").toUpperCase() || "?";
  }
  function fmtDate(d) {
    if (!d) return "";
    if (d === "Present") return "Present";
    var m = /^(\d{4})-(\d{2})$/.exec(d);
    if (!m) return esc(d);
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[parseInt(m[2], 10) - 1] + " " + m[1];
  }

  // ---------- section renderers ----------
  function renderHero(d, ctx) {
    var avatar = safeUrl(d.avatar);
    var avatarBlock = avatar
      ? `<div class="pf-avatar-ring reveal"><img class="pf-avatar" src="${escAttr(avatar)}" alt="${escAttr(d.name)}" /></div>`
      : `<div class="pf-avatar-ring reveal"><div class="pf-avatar pf-avatar--mono">${esc(initials(d.name))}</div></div>`;
    var hasProjects = ctx.has.projects, hasContact = ctx.has.contact;
    var ctas = "";
    if (hasProjects) ctas += `<a class="pf-btn" href="#projects">View work</a>`;
    if (hasContact) ctas += `<a class="pf-btn pf-btn--ghost" href="#contact">Get in touch</a>`;
    return `<header class="pf-section pf-hero" id="top">
      <span class="pf-orb pf-orb--a" aria-hidden="true"></span>
      <span class="pf-orb pf-orb--b" aria-hidden="true"></span>
      <div class="pf-hero-inner">
        ${avatarBlock}
        <div class="pf-hero-text">
          <span class="pf-eyebrow reveal"><span class="pf-status-dot"></span>Available for work</span>
          <h1 class="pf-h1 reveal">${esc(d.name) || "Your Name"}</h1>
          <p class="pf-role reveal">${esc(d.title)}</p>
          <p class="pf-tagline reveal">${esc(d.tagline)}</p>
          ${ctas ? `<div class="pf-hero-cta reveal">${ctas}</div>` : ""}
        </div>
      </div>
    </header>`;
  }

  function renderProjects(d) {
    var items = (d.items || []).map(function (p, i) {
      var img = safeUrl(p.image);
      var tags = (p.tags || []).map(function (t) { return `<span class="pf-chip">${esc(t)}</span>`; }).join("");
      var demo = safeUrl(p.demo), src = safeUrl(p.source);
      var links = "";
      if (demo) links += `<a class="pf-card-link" href="${escAttr(demo)}" target="_blank" rel="noopener">Live demo<span aria-hidden="true">↗</span></a>`;
      if (src) links += `<a class="pf-card-link pf-card-link--muted" href="${escAttr(src)}" target="_blank" rel="noopener">Source<span aria-hidden="true">↗</span></a>`;
      var media = img
        ? `<div class="pf-card-media"><img src="${escAttr(img)}" alt="${escAttr(p.title)}" loading="lazy" /></div>`
        : `<div class="pf-card-media pf-card-media--ph"><span>${esc(initials(p.title))}</span></div>`;
      return `<article class="pf-card reveal" style="--d:${i * 60}ms">
        ${media}
        <div class="pf-card-body">
          <h3>${esc(p.title)}</h3>
          <p>${esc(clampDesc(p.description, 500))}</p>
          ${tags ? `<div class="pf-chips">${tags}</div>` : ""}
          ${links ? `<div class="pf-card-links">${links}</div>` : ""}
        </div>
      </article>`;
    }).join("");
    return `<section class="pf-section" id="projects">
      <div class="pf-head reveal"><span class="pf-kicker">01</span><h2 class="pf-section-title">Selected Work</h2></div>
      <div class="pf-projects-grid">${items || ""}</div>
    </section>`;
  }

  function renderSkills(d) {
    var bars = (d.items || []).map(function (s, i) {
      var lvl = Math.max(0, Math.min(100, parseInt(s.level, 10) || 0));
      return `<div class="pf-skill reveal" style="--d:${i * 50}ms">
        <div class="pf-skill-head"><span>${esc(s.name)}</span><span class="pf-skill-pct">${lvl}%</span></div>
        <div class="pf-bar"><div class="pf-bar-fill" data-level="${lvl}" style="width:0%"></div></div>
      </div>`;
    }).join("");
    return `<section class="pf-section" id="skills">
      <div class="pf-head reveal"><span class="pf-kicker">02</span><h2 class="pf-section-title">Skills</h2></div>
      <div class="pf-skills">${bars || ""}</div>
    </section>`;
  }

  function renderExperience(d) {
    var items = (d.items || []).slice().sort(function (a, b) {
      return String(b.start || "").localeCompare(String(a.start || ""));
    }).map(function (e, i) {
      return `<div class="pf-timeline-item reveal" style="--d:${i * 60}ms">
        <div class="pf-timeline-dot"></div>
        <div class="pf-timeline-body">
          <div class="pf-timeline-dates">${fmtDate(e.start)} — ${fmtDate(e.end)}</div>
          <h3>${esc(e.title)}</h3>
          <p class="pf-org">${esc(e.org)}</p>
          <p class="pf-muted-text">${esc(clampDesc(e.description, 1000))}</p>
        </div>
      </div>`;
    }).join("");
    return `<section class="pf-section" id="experience">
      <div class="pf-head reveal"><span class="pf-kicker">03</span><h2 class="pf-section-title">Experience</h2></div>
      <div class="pf-timeline">${items || ""}</div>
    </section>`;
  }

  function renderContact(d) {
    var socials = (d.socials || []).map(function (s) {
      var u = safeUrl(s.url);
      if (!u) return "";
      return `<a class="pf-social" href="${escAttr(u)}" target="_blank" rel="noopener">${esc(s.label)}<span aria-hidden="true">↗</span></a>`;
    }).join("");
    var mail = String(d.email || "").trim();
    return `<section class="pf-section pf-contact" id="contact">
      <div class="pf-contact-card reveal">
        <h2 class="pf-contact-title">${esc(d.message) || "Let's build something."}</h2>
        ${mail ? `<a class="pf-btn pf-btn--lg" href="mailto:${escAttr(mail)}">${esc(mail)}</a>` : ""}
        ${socials ? `<div class="pf-socials">${socials}</div>` : ""}
      </div>
    </section>`;
  }

  var RENDERERS = { hero: renderHero, projects: renderProjects, skills: renderSkills, experience: renderExperience, contact: renderContact };

  // ---------- CSS ----------
  function buildCSS(state) {
    var font = window.GF_FONT_MAP[state.font] || window.GF_FONT_MAP["Inter"];
    var c = state.colors;
    return `
:root{
  --pf-accent:${c.accent};
  --pf-bg:${c.bg};
  --pf-text:${c.text};
  --pf-font:${font.stack};
  --pf-muted:color-mix(in srgb, var(--pf-text) 60%, transparent);
  --pf-faint:color-mix(in srgb, var(--pf-text) 38%, transparent);
  --pf-line:color-mix(in srgb, var(--pf-text) 12%, transparent);
  --pf-surface:color-mix(in srgb, var(--pf-text) 4%, var(--pf-bg));
  --pf-accent-soft:color-mix(in srgb, var(--pf-accent) 14%, transparent);
  --pf-accent-2:color-mix(in srgb, var(--pf-accent) 55%, #ffffff 0%);
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body.pf{
  font-family:var(--pf-font);
  background:var(--pf-bg); color:var(--pf-text);
  line-height:1.65; -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  padding:0 24px; overflow-x:hidden;
}
.pf-wrap{max-width:980px;margin:0 auto;padding:0 0 96px}
.pf-section{margin:0 0 96px;position:relative}
.pf-head{display:flex;align-items:baseline;gap:14px;margin-bottom:34px}
.pf-kicker{font-size:.8rem;font-weight:700;letter-spacing:.2em;color:var(--pf-accent);font-variant-numeric:tabular-nums}
.pf-section-title{font-size:clamp(1.7rem,4vw,2.6rem);font-weight:800;letter-spacing:-.03em;line-height:1}
.pf-muted-text{color:var(--pf-muted)}

/* hero */
.pf-hero{min-height:min(86vh,720px);display:flex;align-items:center;margin-bottom:120px;overflow:visible}
.pf-hero-inner{display:flex;gap:40px;align-items:center;flex-wrap:wrap;position:relative;z-index:1}
.pf-orb{position:absolute;border-radius:50%;filter:blur(70px);opacity:.5;z-index:0;pointer-events:none}
.pf-orb--a{width:340px;height:340px;background:var(--pf-accent);top:-120px;right:-60px;opacity:.35}
.pf-orb--b{width:260px;height:260px;background:color-mix(in srgb,var(--pf-accent) 60%,#6d28d9);bottom:-80px;left:-40px;opacity:.25}
.pf-avatar-ring{padding:5px;border-radius:50%;background:conic-gradient(from 180deg,var(--pf-accent),color-mix(in srgb,var(--pf-accent) 30%,transparent),var(--pf-accent));flex-shrink:0}
.pf-avatar{width:128px;height:128px;border-radius:50%;object-fit:cover;display:block;background:var(--pf-bg)}
.pf-avatar--mono{display:grid;place-items:center;font-size:2.6rem;font-weight:800;color:var(--pf-accent);background:var(--pf-surface)}
.pf-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:.82rem;font-weight:600;color:var(--pf-muted);
  background:var(--pf-accent-soft);border:1px solid var(--pf-line);padding:6px 13px;border-radius:999px;margin-bottom:20px}
.pf-status-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 0 rgba(34,197,94,.5);animation:pfPulse 2s infinite}
@keyframes pfPulse{70%{box-shadow:0 0 0 7px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
.pf-h1{font-size:clamp(2.6rem,8vw,5rem);line-height:.98;letter-spacing:-.04em;font-weight:800;
  background:linear-gradient(135deg,var(--pf-text) 30%,var(--pf-accent));-webkit-background-clip:text;background-clip:text;color:transparent}
.pf-role{color:var(--pf-accent);font-weight:700;font-size:clamp(1.1rem,2.5vw,1.5rem);margin-top:14px;letter-spacing:-.01em}
.pf-tagline{color:var(--pf-muted);font-size:1.12rem;margin-top:16px;max-width:48ch}
.pf-hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}

/* buttons */
.pf-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;font-weight:600;font-size:.95rem;
  padding:12px 22px;border-radius:12px;background:var(--pf-accent);color:#fff;border:1px solid transparent;
  transition:transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s,filter .2s;
  box-shadow:0 8px 24px -8px var(--pf-accent)}
.pf-btn:hover{transform:translateY(-3px);box-shadow:0 14px 32px -8px var(--pf-accent);filter:brightness(1.05)}
.pf-btn--ghost{background:transparent;color:var(--pf-text);border-color:var(--pf-line);box-shadow:none}
.pf-btn--ghost:hover{border-color:var(--pf-accent);color:var(--pf-accent);box-shadow:none}
.pf-btn--lg{padding:15px 30px;font-size:1.05rem}

/* projects */
.pf-projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:22px}
.pf-card{border-radius:18px;overflow:hidden;display:flex;flex-direction:column;background:var(--pf-surface);
  border:1px solid var(--pf-line);transition:transform .3s cubic-bezier(.22,1,.36,1),border-color .3s,box-shadow .3s}
.pf-card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--pf-accent) 50%,transparent);box-shadow:0 24px 50px -20px rgba(0,0,0,.45)}
.pf-card-media{aspect-ratio:16/10;overflow:hidden}
.pf-card-media img{width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.22,1,.36,1)}
.pf-card:hover .pf-card-media img{transform:scale(1.06)}
.pf-card-media--ph{display:grid;place-items:center;background:linear-gradient(135deg,var(--pf-accent-soft),transparent)}
.pf-card-media--ph span{font-size:2.4rem;font-weight:800;color:color-mix(in srgb,var(--pf-accent) 70%,transparent)}
.pf-card-body{padding:22px;display:flex;flex-direction:column;gap:12px;flex:1}
.pf-card-body h3{font-size:1.22rem;font-weight:700;letter-spacing:-.01em}
.pf-card-body p{color:var(--pf-muted);font-size:.96rem}
.pf-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:auto}
.pf-chip{font-size:.74rem;font-weight:600;padding:4px 11px;border-radius:999px;background:var(--pf-accent-soft);color:var(--pf-accent)}
.pf-card-links{display:flex;gap:18px;flex-wrap:wrap;padding-top:4px}
.pf-card-link{display:inline-flex;align-items:center;gap:5px;text-decoration:none;color:var(--pf-accent);font-weight:600;font-size:.9rem}
.pf-card-link span{transition:transform .2s}.pf-card-link:hover span{transform:translate(2px,-2px)}
.pf-card-link--muted{color:var(--pf-muted)}

/* skills */
.pf-skills{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px 36px}
.pf-skill-head{display:flex;justify-content:space-between;font-weight:600;font-size:.95rem;margin-bottom:9px}
.pf-skill-pct{color:var(--pf-accent);font-variant-numeric:tabular-nums}
.pf-bar{height:10px;border-radius:999px;background:var(--pf-line);overflow:hidden}
.pf-bar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--pf-accent),color-mix(in srgb,var(--pf-accent) 50%,#fff));transition:width 1s cubic-bezier(.22,1,.36,1)}

/* timeline */
.pf-timeline{position:relative;padding-left:30px}
.pf-timeline::before{content:"";position:absolute;left:7px;top:8px;bottom:8px;width:2px;background:linear-gradient(var(--pf-accent),transparent)}
.pf-timeline-item{position:relative;padding-bottom:34px}
.pf-timeline-dot{position:absolute;left:-26px;top:6px;width:14px;height:14px;border-radius:50%;background:var(--pf-accent);box-shadow:0 0 0 5px var(--pf-bg),0 0 14px var(--pf-accent)}
.pf-timeline-dates{font-size:.82rem;color:var(--pf-accent);font-weight:700;letter-spacing:.02em}
.pf-timeline-body h3{font-size:1.15rem;margin-top:3px;font-weight:700}
.pf-org{color:var(--pf-text);font-weight:600;margin-bottom:7px;opacity:.85}

/* contact */
.pf-contact{margin-bottom:40px}
.pf-contact-card{text-align:center;padding:64px 28px;border-radius:28px;background:
  radial-gradient(120% 140% at 50% 0%,var(--pf-accent-soft),transparent 60%),var(--pf-surface);
  border:1px solid var(--pf-line)}
.pf-contact-title{font-size:clamp(1.8rem,5vw,3rem);font-weight:800;letter-spacing:-.03em;margin-bottom:28px;max-width:18ch;margin-inline:auto;line-height:1.05}
.pf-socials{display:flex;flex-wrap:wrap;gap:22px;justify-content:center;margin-top:26px}
.pf-social{display:inline-flex;align-items:center;gap:5px;color:var(--pf-muted);text-decoration:none;font-weight:600;transition:color .18s}
.pf-social span{transition:transform .2s}.pf-social:hover{color:var(--pf-accent)}.pf-social:hover span{transform:translate(2px,-2px)}

/* scroll reveal */
.reveal{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1);transition-delay:var(--d,0ms)}
.reveal.in{opacity:1;transform:none}

@media(max-width:860px){
  .pf-hero{min-height:auto;padding:64px 0 24px;margin-bottom:80px}
  .pf-section{margin-bottom:80px}
  .pf-avatar{width:104px;height:104px}
}
@media(max-width:600px){
  body.pf{padding:0 18px}
  .pf-hero{padding:48px 0 16px;margin-bottom:64px}
  .pf-hero-inner{gap:24px}
  .pf-section{margin-bottom:64px}
  .pf-head{margin-bottom:24px}
  .pf-hero-cta{width:100%}
  .pf-hero-cta .pf-btn{flex:1}
  .pf-contact-card{padding:44px 20px}
}

/* theme treatment */
${window.GF_THEME_CSS(state.theme)}
`;
  }

  // ---------- runtime JS: reveal + skill bars ----------
  function buildJS() {
    return `(function(){
  function fillBars(scope){
    (scope||document).querySelectorAll('.pf-bar-fill').forEach(function(el){
      el.style.width = (el.getAttribute('data-level')||0)+'%';
    });
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in');
        if(e.target.querySelector){ fillBars(e.target); }
        if(e.target.classList.contains('pf-bar-fill')){ e.target.style.width=(e.target.getAttribute('data-level')||0)+'%'; }
        io.unobserve(e.target);} });
    },{threshold:.15,rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
    document.querySelectorAll('.pf-bar-fill').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
    fillBars();
  }
})();`;
  }

  function buildBody(state) {
    var has = {};
    (state.sections || []).forEach(function (s) { has[s.type] = true; });
    var ctx = { has: has };
    var inner = (state.sections || []).map(function (s) {
      var fn = RENDERERS[s.type];
      return fn ? fn(s.data || {}, ctx) : "";
    }).join("\n");
    return `<div class="pf-wrap">\n${inner}\n</div>`;
  }

  function buildJsonLd(state) {
    var hero = (state.sections || []).find(function (s) { return s.type === "hero"; });
    var contact = (state.sections || []).find(function (s) { return s.type === "contact"; });
    var name = hero ? hero.data.name : (state.seo.title || "Portfolio");
    var jobTitle = hero ? hero.data.title : "";
    var sameAs = contact ? (contact.data.socials || []).map(function (s) { return s.url; }).filter(Boolean) : [];
    var data = { "@context": "https://schema.org", "@type": "Person", "name": name, "jobTitle": jobTitle, "description": state.seo.description || "", "sameAs": sameAs };
    if (contact && contact.data.email) data.email = "mailto:" + contact.data.email;
    if (state.seo.ogImage) data.image = state.seo.ogImage;
    return JSON.stringify(data, null, 2);
  }

  function buildDocument(state, mode) {
    var hero = (state.sections || []).find(function (s) { return s.type === "hero"; });
    var title = state.seo.title || (hero ? (hero.data.name + " — " + hero.data.title) : "My Portfolio");
    var desc = clampDesc(state.seo.description, 160);
    var og = safeUrl(state.seo.ogImage);
    var fontHref = window.GF_fontHref(state.font);
    var head =
      `<meta charset="UTF-8">\n` +
      `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n` +
      `<title>${esc(title)}</title>\n` +
      `<meta name="description" content="${escAttr(desc)}">\n` +
      `<meta property="og:type" content="website">\n` +
      `<meta property="og:title" content="${escAttr(title)}">\n` +
      `<meta property="og:description" content="${escAttr(desc)}">\n` +
      (og ? `<meta property="og:image" content="${escAttr(og)}">\n` : "") +
      `<meta name="twitter:card" content="summary_large_image">\n` +
      `<link rel="preconnect" href="https://fonts.googleapis.com">\n` +
      `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n` +
      `<link rel="stylesheet" href="${escAttr(fontHref)}">\n` +
      `<script type="application/ld+json">\n${buildJsonLd(state)}\n</scr` + `ipt>\n`;
    var styleTag = mode === "export" ? `<link rel="stylesheet" href="css/style.css">` : `<style>${buildCSS(state)}</style>`;
    var scriptTag = mode === "export" ? `<script src="js/main.js"></scr` + `ipt>` : `<script>${buildJS()}</scr` + `ipt>`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
${head}${styleTag}
</head>
<body class="pf">
${buildBody(state)}
${scriptTag}
</body>
</html>`;
  }

  window.GF_Render = { document: buildDocument, css: buildCSS, js: buildJS, jsonLd: buildJsonLd };
})();
