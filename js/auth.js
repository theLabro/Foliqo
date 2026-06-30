/* ============================================================
   Foliqo — Real auth (auth.js)
   Wired to Supabase Auth. Requires js/supabase-client.js to be
   loaded BEFORE this file (defines window.GF_supabase).
   ============================================================ */

(function () {
  var cachedSession = null;
  window.GF_supabase.auth.getSession().then(function (r) {
    cachedSession = r.data.session;
    renderAuthNav();
  });
  window.GF_supabase.auth.onAuthStateChange(function (_event, session) {
    cachedSession = session;
    renderAuthNav();
  });

  function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function go() { window.location.href = "app.html"; }

  async function signUp(name, email, password) {
    email = String(email || "").trim().toLowerCase();
    if (!name || !name.trim()) throw new Error("Please enter your name.");
    if (!validEmail(email)) throw new Error("Please enter a valid email address.");
    if (!password || password.length < 6) throw new Error("Password must be at least 6 characters.");
    var res = await window.GF_supabase.auth.signUp({
      email: email,
      password: password,
      options: { data: { display_name: name.trim() } }
    });
    if (res.error) throw new Error(res.error.message);
    return { name: name.trim(), email: email };
  }

  async function signIn(email, password) {
    email = String(email || "").trim().toLowerCase();
    if (!validEmail(email)) throw new Error("Please enter a valid email address.");
    var res = await window.GF_supabase.auth.signInWithPassword({ email: email, password: password });
    if (res.error) throw new Error(res.error.message);
    var u = res.data.user;
    return { name: u.user_metadata.display_name || email, email: email };
  }

  // real Google OAuth — redirects away and back via Supabase
  function googleSignIn() {
    window.GF_supabase.auth.signInWithOAuth({ provider: "google" });
  }

  // GitHub: still reads PUBLIC profile via the GitHub API for deploy personalisation
  // (this is unrelated to login — kept as-is for now)
  async function githubConnect(username) {
    username = String(username || "").trim().replace(/^@/, "");
    if (!username) throw new Error("Enter your GitHub username.");
    var res;
    try { res = await fetch("https://api.github.com/users/" + encodeURIComponent(username)); }
    catch (e) { throw new Error("Network error — check your connection."); }
    if (res.status === 404) throw new Error("No GitHub user named \u201c" + username + "\u201d.");
    if (!res.ok) throw new Error("Couldn't reach GitHub (rate limited?). Try again later.");
    var d = await res.json();
    // store alongside the real session info, not replacing it
    window.GF_githubProfile = {
      githubUser: d.login,
      avatar: d.avatar_url,
      profile: d.html_url
    };
    go();
  }

  function signOut() { window.GF_supabase.auth.signOut(); }

  function currentUser() {
    if (!cachedSession) return null;
    var u = cachedSession.user;
    var base = { name: u.user_metadata.display_name || u.email, email: u.email, provider: "password" };
    if (window.GF_githubProfile) Object.assign(base, window.GF_githubProfile);
    return base;
  }

  // ---- header nav state ----
  function renderAuthNav() {
    var el = document.getElementById("authNav");
    if (!el) return;
    var s = currentUser();
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
        if (mode === "signup") {
          await signUp(nameInput.value, form.email.value, passInput.value);
          err.textContent = "Account created! Check your email to confirm, then sign in.";
          submit.disabled = false;
        } else {
          await signIn(form.email.value, passInput.value);
          go();
        }
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
      ghConnectBtn.textContent = "Connecting\u2026";
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