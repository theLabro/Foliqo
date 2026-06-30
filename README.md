<!--
  GitHub showcase README for Foliqo.
  Living in /docs, so asset paths use ../ (e.g. ../logo.png).
  If you copy this to the repo ROOT as README.md, change ../logo.png -> logo.png
  and ./<guide>.md -> docs/<guide>.md.
-->

<div align="center">

<img src="../logo.png" alt="Foliqo logo" width="96" height="96" />

# Foliqo

### Build a stunning portfolio. No code.

A drag-and-drop portfolio builder for developers &amp; designers — pick a theme, drop in
your work, preview live, and export a deployable site in minutes.

<br/>

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![No Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](#)
[![No Build Step](https://img.shields.io/badge/build_step-none-blue?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](#-license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-7c5cff?style=flat-square)](#-contributing)

<a href="#-quick-start"><b>Quick Start</b></a> &nbsp;·&nbsp;
<a href="#-features"><b>Features</b></a> &nbsp;·&nbsp;
<a href="README.md"><b>Docs</b></a> &nbsp;·&nbsp;
<a href="deployment-netlify.md"><b>Deploy</b></a>

</div>

---

## ✦ Overview

**Foliqo** lets devs and designers ship a professional portfolio without writing a line
of code. The whole studio runs in the browser — a glassless, Apple-clean interface with a
live iframe preview on the right and contextual editor panels on the left. When you're
done, export a complete, self-contained `HTML/CSS/JS` bundle that hosts anywhere.

> 🔒 **Local-first & private** — your work lives in your browser. No account required,
> nothing uploaded. Add a backend only if you want sync, real auth, or one-click deploy.

```
✏️  Edit on the left   →   👀  Live preview on the right   →   📦  Export & deploy
```

## ✨ Features

| | |
|---|---|
| 🧩 **Drag-and-drop sections** | Hero, Projects, Skills, Experience, Contact — reorder by dragging |
| 🎨 **Six refined themes** | Minimal, Dark Pro, Glass, Neon, Typographic, Magazine — each fully tunable |
| 🖥️ **Live responsive preview** | Instant updates across desktop / tablet / mobile |
| ⚡ **Animated skill bars** | Proficiency meters that animate into view |
| 🗂️ **Project & timeline builders** | Cards with tags, images, links + a chronological experience timeline |
| 🌈 **Custom colors & fonts** | Per-theme palette with a live contrast guard + 20+ Google Fonts |
| 🤖 **AI-assisted suggestions** | Generate taglines, descriptions, tags & skill ideas (runs locally) |
| 🔍 **SEO built in** | Meta tags, Open Graph, JSON-LD structured data, live search preview |
| 💾 **Autosave + save points** | Continuous local autosave with named snapshots |
| 📦 **One-click export** | Download a complete static site as a ZIP — zero dependencies |
| 🚀 **Deploy-ready** | GitHub-aware deploy flow + guides for Netlify, Vercel, Pages |
| ♿ **Accessible & responsive** | Keyboard-navigable, reduced-motion aware, mobile-friendly |

## 🎨 Themes

<div align="center">

| Minimal | Dark Pro | Glass | Neon | Typographic | Magazine |
|:---:|:---:|:---:|:---:|:---:|:---:|
| ⬜ | 🟦 | 🟪 | 🟦 | 🟨 | 🌸 |
| clean & light | sleek dark | frosted depth | glowing edges | bold type | editorial |

</div>

Each theme exposes editable accent / background / text colors and its own typeface, with
a built-in WCAG contrast check so your portfolio always stays readable.

## 🖼️ Screenshots

> _Add screenshots/GIFs here to make the page pop._ Suggested shots:
> the landing page, the builder (left panels + live preview), and the theme switcher.

```
docs/screenshots/
├── landing.png
├── builder.png
└── themes.gif
```

<!-- Example once added:
<div align="center">
  <img src="screenshots/builder.png" alt="The Foliqo builder" width="800" />
</div>
-->

## 🚀 Quick Start

No install, no build — it's a static site.

```bash
# 1. clone
git clone https://github.com/USER/foliqo.git
cd foliqo

# 2. serve (pick one)
python -m http.server 8000
#   or
npx serve .

# 3. open
#   http://localhost:8000
```

Or just open `index.html` directly in your browser. Click **Get started** to launch the
builder (`app.html`).

## 🧱 Tech Stack

- **Vanilla JavaScript** — small, framework-free modules (`GF_Store`, `GF_Render`,
  `GF_Builder`, `GF_Auth`, `GF_Suggest`, …)
- **Modern CSS** — custom properties, grid, `color-mix()`, container-free responsive layout
- **Zero dependencies** — including a tiny hand-rolled ZIP writer for export
- **No build step** — ship the folder as-is to any static host

## 📁 Project Structure

```
foliqo/
├── index.html            # landing page
├── app.html              # the builder
├── auth.html             # combined sign in / sign up (+ Google/GitHub, guest)
├── contact.html          # contact page
├── 404.html              # not-found page
├── logo.png              # brand mark / favicon
├── css/
│   ├── site.css          # landing / auth / contact
│   ├── app.css           # builder UI
│   └── animations.css
├── js/
│   ├── store.js  render.js  preview.js  builder.js
│   ├── dragdrop.js  export.js  suggest.js  auth.js
│   ├── themes.js  fonts.js  site.js
│   └── lib/zip.js        # dependency-free ZIP writer
└── docs/                 # backend + deployment guides
```

## 🔌 Backend &amp; Deployment

Foliqo is fully functional as a static site. When you're ready to add real auth, a
database, contact delivery, or one-click deploy, the [`docs/`](README.md) folder has you
covered:

- 🧭 [Backend overview](backend-overview.md)
- 🔐 [Authentication](authentication.md) (incl. Google / GitHub OAuth)
- 🗃️ Database — [Supabase](supabase-setup.md) · [Firebase](firebase-setup.md)
- ✉️ [Contact form delivery](contact-form.md)
- 🚀 [One-click GitHub deploy](github-oauth-deploy.md)
- 🌐 Hosting — [Netlify](deployment-netlify.md) · [Vercel / Pages / Cloudflare](deployment-other.md)
- 🔑 [Environment variables &amp; secrets](environment-variables.md)

**Deploy in 30 seconds:** drag the folder onto [Netlify](https://app.netlify.com/drop),
or push to a repo and enable **GitHub Pages** (Settings → Pages → branch `main` / root).

## 🗺️ Roadmap

- [ ] Undo / redo history
- [ ] Reorder items within a section (projects, skills, timeline)
- [ ] Project import/export as JSON
- [ ] DEFLATE compression + image assets in export
- [ ] Real auth + cross-device sync (Supabase / Firebase)
- [ ] True one-click GitHub Pages publish

## 🤝 Contributing

Contributions are welcome! 

1. Fork the repo
2. Create a branch — `git checkout -b feature/your-idea`
3. Commit — `git commit -m "Add your idea"`
4. Push — `git push origin feature/your-idea`
5. Open a Pull Request

Since there's no build step, just open the files and go. Please keep the
no-dependency, vanilla-JS spirit.

## 📄 License

Released under the **MIT License** — free to use, modify, and distribute.
Add a `LICENSE` file at the repo root to make it official.

---

<div align="center">

Made with vanilla HTML, CSS &amp; JavaScript — no frameworks, no build, no fuss.

<sub>⭐ If Foliqo helps you ship your portfolio, consider starring the repo.</sub>

</div>
