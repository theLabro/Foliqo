/* ============================================================
   Gridfolio — Demo auth (auth.js)
   ⚠ CLIENT-SIDE DEMO ONLY. No backend, no real security.
   - Email/password accounts live in localStorage (SHA-256 hashed).
   - Google sign-in is SIMULATED (no real OAuth without a backend).
   - GitHub sign-in reads your PUBLIC profile via the GitHub API
     (no auth) to personalise deploy — it does NOT grant push access.
   For production auth + true one-click deploy, use a real provider
   and an OAuth backend. See README.
   ============================================================ */

(function () {
  var USERS_KEY = "gridfolio.users.v1";
  var SESSION_KEY = "gridfolio.session.v1";

  function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); } catch (e) { return {}; } }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) { return null; } }
  function setSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  async function hash(text) {
    if (window.crypto && window.crypto.subtle) {
      var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    }
    var h = 0; for (var i = 0; i < text.length; i++) { h = (h << 5) - h + text.charCodeAt(i); h |= 0; }
    return "x" + (h >>> 0).toString(16);
  }
  function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function go() { window.location.href = "app.html"; }

  async function signUp(name, email, password) {
    email = String(email || "").trim().toLowerCase();
    if (!name || !name.trim()) throw new Error("Please enter your name.");
    if (!validEmail(email)) throw new Error("Please enter a valid email address.");
    if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");
    var users = getUsers();
    if (users[email]) throw new Error("An account with this email already exists.");
    users[email] = { name: name.trim(), hash: await hash(password), created: Date.now() };
    saveUsers(users);
    setSession({ email: email, name: name.trim(), provider: "password" });
    return users[email];
  }

  async function signIn(email, password) {
    email = String(email || "").trim().toLowerCase();
    if (!validEmail(email)) throw new Error("Please enter a valid email address.");
    var users = getUsers();
    var u = users[email];
    if (!u) throw new Error("No account found with this email.");
    if (u.hash !== await hash(password)) throw new Error("Incorrect password.");
    setSession({ email: email, name: u.name, provider: "password" });
    return u;
  }

  // simulated Google sign-in (demo)
  function googleSignIn() {
    setSession({ name: "Google User", email: "", provider: "google" });
    go();
  }

  // GitHub: fetch real public profile, store as session (no push token)
  async function githubConnect(username) {
    username = String(username || "").trim().replace(/^@/, "");
    if (!username) throw new Error("Enter your GitHub username.");
    var res;
    try { res = await fetch("https://api.github.com/users/" + encodeURIComponent(username)); }
    catch (e) { throw new Error("Network error — check your connection."); }
    if (res.status === 404) throw new Error("No GitHub user named “" + username + "”.");
    if (!res.ok) throw new Error("Couldn't reach GitHub (rate limited?). Try again later.");
    var d = await res.json();
    setSession({
      name: d.name || d.login,
      email: "",
      provider: "github",
      githubUser: d.login,
      avatar: d.avatar_url,
      profile: d.html_url
    });
    go();
  }

  function signOut() { clearSession(); }
  function currentUser() { return getSession(); }

  // ---- header nav state ----
  function renderAuthNav() {
    var el = document.getElementById("authNav");
    if (!el) return;
    var s = getSession();
    if (s) {
      var avatar = s.avatar ? '<img class="nav-avatar" src="' + escapeHtml(s.avatar) + '" alt="" />' : "";
      el.innerHTML =
        '<a class="navlink hide-sm" href="contact.html">Contact</a>' +
        '<span class="nav-user">' + avatar + 'Hi, ' + escapeHtml((s.name || "there").split(" ")[0]) + '</span>' +
        '<a class="btn" href="#" id="signoutBtn">Sign out</a>' +
        '<a class="btn btn--accent" href="app.html">Open builder</a>';
      var so = document.getElementById("signoutBtn");
      if (so) so.addEventListener("click", function (e) { e.preventDefault(); signOut(); renderAuthNav(); });
    } else {
      el.innerHTML =
        '<a class="navlink hide-sm" href="contact.html">Contact</a>' +
        '<a class="navlink" href="auth.html">Sign in</a>' +
        '<a class="btn btn--accent" href="app.html">Get started</a>';
    }
  }

  // ---- combined auth page wiring ----
  function wireAuthPage() {
    var form = document.getElementById("authForm");
    if (!form) return;

    var mode = (new URLSearchParams(location.search).get("mode") === "signup") ? "signup" : "signin";
    var title = document.getElementById("authTitle");
    var sub = document.getElementById("authSub");
    var submit = document.getElementById("authSubmit");
    var nameField = document.getElementById("nameField");
    var nameInput = document.getElementById("a-name");
    var passInput = document.getElementById("a-pass");
    var alt = document.getElementById("authAlt");
    var toggle = document.getElementById("authToggle");
    var err = document.getElementById("authError");

    function applyMode(animate) {
      var signup = mode === "signup";
      if (animate) { form.classList.remove("swap"); void form.offsetWidth; form.classList.add("swap"); }
      title.textContent = signup ? "Create your account" : "Welcome back";
      sub.textContent = signup ? "Start building and save your work." : "Sign in to continue to your builder.";
      submit.textContent = signup ? "Create account" : "Sign in";
      nameField.classList.toggle("open", signup);
      nameInput.required = signup;
      passInput.setAttribute("autocomplete", signup ? "new-password" : "current-password");
      alt.innerHTML = signup
        ? 'Already have an account? <a href="#" id="authToggle">Sign in</a>'
        : 'New to Foliqo? <a href="#" id="authToggle">Create an account</a>';
      bindToggle();
      err.textContent = "";
    }
    function bindToggle() {
      var t = document.getElementById("authToggle");
      if (t) t.addEventListener("click", function (e) {
        e.preventDefault();
        mode = (mode === "signup") ? "signin" : "signup";
        applyMode(true);
      });
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      err.textContent = "";
      submit.disabled = true;
      try {
        if (mode === "signup") await signUp(nameInput.value, form.email.value, passInput.value);
        else await signIn(form.email.value, passInput.value);
        go();
      } catch (ex) { err.textContent = ex.message; submit.disabled = false; }
    });

    // social
    document.querySelectorAll("[data-provider]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.provider === "google") googleSignIn();
        else toggleGhPanel();
      });
    });

    // github panel
    var ghPanel = document.getElementById("ghPanel");
    var ghInput = document.getElementById("ghUsername");
    var ghConnectBtn = document.getElementById("ghConnect");
    var ghErr = document.getElementById("ghError");
    function toggleGhPanel() {
      var open = ghPanel.hasAttribute("hidden");
      if (open) { ghPanel.hidden = false; requestAnimationFrame(function () { ghPanel.classList.add("open"); ghInput.focus(); }); }
      else { ghPanel.classList.remove("open"); setTimeout(function () { ghPanel.hidden = true; }, 280); }
    }
    async function doGhConnect() {
      ghErr.textContent = "";
      ghConnectBtn.disabled = true;
      ghConnectBtn.textContent = "Connecting…";
      try { await githubConnect(ghInput.value); }
      catch (ex) { ghErr.textContent = ex.message; ghConnectBtn.disabled = false; ghConnectBtn.textContent = "Connect"; }
    }
    if (ghConnectBtn) ghConnectBtn.addEventListener("click", doGhConnect);
    if (ghInput) ghInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); doGhConnect(); } });

    applyMode(false);
  }

  function init() { renderAuthNav(); wireAuthPage(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.GF_Auth = { signUp: signUp, signIn: signIn, signOut: signOut, currentUser: currentUser, githubConnect: githubConnect };
})();
