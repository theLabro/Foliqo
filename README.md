# Foliqo

A drag-and-drop portfolio builder for developers and designers. Pick a theme, drop in
your projects, skills, and experience, preview live across breakpoints, and export a
complete, deployable HTML/CSS/JS site — no code required.

Built with vanilla HTML, CSS, and JavaScript. No build step, no framework, no backend.

## Documentation

Guides for adding real backend services (auth, database, contact delivery, one-click
deploy) live in [`docs/`](docs/README.md):

- [Backend overview](docs/backend-overview.md) · [Authentication](docs/authentication.md) · [Database schema](docs/database-schema.md)
- Database: [Supabase](docs/supabase-setup.md) · [Firebase](docs/firebase-setup.md)
- [Contact form delivery](docs/contact-form.md) · [One-click GitHub deploy](docs/github-oauth-deploy.md)
- Deploy: [Netlify](docs/deployment-netlify.md) · [Vercel](docs/deployment-vercel.md) · [GitHub Pages / Cloudflare](docs/deployment-other.md)
- [Environment variables & secrets](docs/environment-variables.md)

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Marketing landing page |
| `app.html` | The portfolio builder (the core app) |
| `auth.html` | Combined sign in / sign up (demo auth — see below) |
| `contact.html` | Contact page with form |
| `404.html` | Not-found page |

## Project structure

```
.
├── index.html        landing
├── app.html          builder
├── auth.html  contact.html  404.html
├── logo.png           brand logo (also used as favicon)
├── css/
│   ├── site.css      landing / auth / contact / 404
│   ├── app.css       builder UI
│   └── animations.css
└── js/
    ├── auth.js       demo auth (local only)
    ├── store.js  render.js  preview.js  builder.js
    ├── dragdrop.js  export.js  themes.js  fonts.js  suggest.js
    └── lib/zip.js    dependency-free ZIP writer
```

## Run locally

It's static — open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Any static host works. The site needs no server-side runtime.

**GitHub Pages**
1. Push these files to the root of a public repo.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `root`.
3. Visit `https://USER.github.io/REPO/`.

**Netlify / Vercel / Cloudflare Pages**
- Drag-and-drop the folder, or connect the repo.
- No build command. Publish directory: project root.
- `404.html` is served automatically as the not-found page.

## Important: demo authentication

`js/auth.js` is a **client-side demo only**. Accounts live in the browser's
`localStorage` and passwords are SHA-256 hashed — but this is **not secure
authentication**. Anyone with access to the device can read or bypass it, and
accounts don't sync across browsers or devices.

`auth.html` is a single combined sign in / sign up screen with three paths:
- **Email + password** — local demo accounts.
- **Continue with Google** — *simulated* (real OAuth needs a backend).
- **Continue with GitHub** — reads your **public** GitHub profile via the GitHub
  API (no login, no token). This personalises the builder's deploy flow
  (prefilled username, repo-creation link) but does **not** grant push access.
- **Continue as guest** — straight into the builder, no account.

The builder (`app.html`) is intentionally **not gated** — guest access keeps it
fully usable without an account.

**To add real authentication and true one-click deploy**, replace `js/auth.js`
with a real provider and an OAuth backend:
- [Supabase Auth](https://supabase.com/auth), [Firebase Auth](https://firebase.google.com/products/auth),
  [Auth0](https://auth0.com), or [Clerk](https://clerk.com).
- For GitHub push-from-browser, use the GitHub OAuth web/device flow through a
  small serverless function (so the client secret + access token stay server-side),
  then call the GitHub Contents API or trigger a GitHub Action to publish.
- Keep the same `GF_Auth` interface (`signUp`, `signIn`, `signOut`, `currentUser`,
  `githubConnect`) so the rest of the app is unaffected.

## Contact form delivery

`contact.html` works with **no backend** by composing a `mailto:` link. To deliver
messages to an inbox instead:
1. Create a form at [Formspree](https://formspree.io) (or similar) and copy the endpoint.
2. In `contact.html`, set `<form action="https://formspree.io/f/XXXX" method="POST">`.
3. Set `USE_MAILTO = false` in the inline script (or remove it).

Also update the placeholder email `hello@foliqo.app` in `contact.html`.

## AI suggestions

The "Suggest" buttons (`js/suggest.js`) run a **local** engine — a curated skills
knowledge base, a skill co-occurrence graph, keyword extraction, and templated copy.
No API key, no network calls, nothing leaves the browser. To upgrade to a real LLM,
swap the `GF_Suggest` implementation to call your model through a serverless proxy
(so the API key stays server-side).

## Privacy

All portfolio data and demo accounts are stored locally in the browser via
`localStorage`. Nothing is uploaded.
