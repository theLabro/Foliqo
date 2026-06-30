/* ============================================================
   Gridfolio — Builder UI (builder.js)
   Renders accordion section panels + forms, wires them to the
   store via event delegation (so typing never re-renders/loses focus).
   ============================================================ */

(function () {
  var listEl, modal, typeGrid;
  var SECTION_META = {
    hero:       { icon: "🚀", label: "Hero" },
    projects:   { icon: "💼", label: "Projects" },
    skills:     { icon: "⚡", label: "Skills" },
    experience: { icon: "📅", label: "Experience" },
    contact:    { icon: "✉️", label: "Contact" }
  };
  var ALL_TYPES = ["hero", "projects", "skills", "experience", "contact"];
  var LIMITS = { projects: 20, skills: 30, experience: 50, socials: 10, tags: 10 };

  function S() { return window.GF_Store.get(); }
  function uid() { return window.GF_Store.uid(); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var SPARK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 1.5l1.5 4.2 4.2 1.5-4.2 1.5L10 12.9 8.5 8.7 4.3 7.2l4.2-1.5L10 1.5zm5.6 9.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/></svg>';
  function suggestBtn(action, sid, iid, label) {
    return '<button type="button" class="btn-suggest" data-action="' + action + '" data-sid="' + sid + '"' +
      (iid ? ' data-iid="' + iid + '"' : '') + '>' + SPARK + esc(label) + '</button>';
  }

  // ---------- field templates ----------
  function fieldText(sid, field, label, val, opts) {
    opts = opts || {};
    var tag = opts.textarea
      ? `<textarea class="input" rows="${opts.rows||3}" data-sid="${sid}" data-field="${field}" ${opts.maxlength?`maxlength="${opts.maxlength}"`:""} placeholder="${esc(opts.ph||"")}">${esc(val)}</textarea>`
      : `<input type="${opts.type||"text"}" class="input" data-sid="${sid}" data-field="${field}" value="${esc(val)}" placeholder="${esc(opts.ph||"")}" />`;
    return `<div class="field"><label>${esc(label)}</label>${tag}</div>`;
  }

  function itemField(sid, iid, field, label, val, opts) {
    opts = opts || {};
    var tag = opts.textarea
      ? `<textarea class="input" rows="${opts.rows||2}" data-sid="${sid}" data-iid="${iid}" data-field="${field}" ${opts.maxlength?`maxlength="${opts.maxlength}"`:""} placeholder="${esc(opts.ph||"")}">${esc(val)}</textarea>`
      : `<input type="${opts.type||"text"}" class="input" data-sid="${sid}" data-iid="${iid}" data-field="${field}" value="${esc(val)}" placeholder="${esc(opts.ph||"")}" ${opts.attrs||""} />`;
    return `<div class="field"><label>${esc(label)}</label>${tag}</div>`;
  }

  // ---------- per-type body ----------
  function bodyHero(s) {
    var d = s.data;
    return fieldText(s.id, "name", "Full name", d.name, { ph: "Jane Doe" })
      + fieldText(s.id, "title", "Professional title", d.title, { ph: "Frontend Developer" })
      + fieldText(s.id, "tagline", "Tagline", d.tagline, { textarea: true, rows: 2, ph: "One line about you" })
      + suggestBtn("ai-tagline", s.id, null, "Suggest tagline")
      + fieldText(s.id, "avatar", "Avatar image URL", d.avatar, { type: "url", ph: "https://…/me.jpg" })
      + uploadRow(s.id, null, "avatar", "Or upload avatar");
  }

  function uploadRow(sid, iid, field, label) {
    var attrs = `data-sid="${sid}" ${iid?`data-iid="${iid}"`:""} data-upload="${field}"`;
    return `<div class="field"><label>${esc(label)}</label>
      <input type="file" accept="image/*" class="input" ${attrs} />
      <span class="inline-error" data-err="${field}-${iid||sid}"></span></div>`;
  }

  function bodyProjects(s) {
    var items = (s.data.items || []).map(function (p) {
      var tags = (p.tags || []).map(function (t, i) {
        return `<span class="tag-pill">${esc(t)}<button data-action="del-tag" data-sid="${s.id}" data-iid="${p.id}" data-tagidx="${i}" aria-label="Remove tag">✕</button></span>`;
      }).join("");
      return `<div class="item-card" data-card="${p.id}">
        <div class="item-card__head"><strong>Project</strong>
          <button class="btn-mini danger" data-action="del-item" data-sid="${s.id}" data-iid="${p.id}">Delete</button>
        </div>
        ${itemField(s.id, p.id, "title", "Title", p.title, { ph: "Project name" })}
        ${itemField(s.id, p.id, "image", "Image URL", p.image, { type: "url", ph: "https://…" })}
        ${uploadRow(s.id, p.id, "image", "Or upload image")}
        ${itemField(s.id, p.id, "description", "Description", p.description, { textarea: true, maxlength: 500, ph: "What it does (max 500 chars)" })}
        ${suggestBtn("ai-describe", s.id, p.id, "Write description")}
        <div class="field"><label>Tags <span class="counter">${(p.tags||[]).length}/${LIMITS.tags}</span></label>
          <div class="tag-row">${tags}</div>
          <input type="text" class="input" data-action="tag-input" data-sid="${s.id}" data-iid="${p.id}" placeholder="Type a tag, press Enter" />
          ${suggestBtn("ai-tags", s.id, p.id, "Suggest tags")}
        </div>
        ${itemField(s.id, p.id, "demo", "Live demo URL", p.demo, { type: "url", ph: "https://…" })}
        ${itemField(s.id, p.id, "source", "Source code URL", p.source, { type: "url", ph: "https://github.com/…" })}
      </div>`;
    }).join("");
    var canAdd = (s.data.items || []).length < LIMITS.projects;
    return items
      + `<button class="btn-mini btn-add-item" data-action="add-item" data-sid="${s.id}" ${canAdd?"":"disabled"}>+ Add project ${canAdd?"":"(max "+LIMITS.projects+")"}</button>`;
  }

  function bodySkills(s) {
    var items = (s.data.items || []).map(function (sk) {
      return `<div class="item-card" data-card="${sk.id}">
        <div class="item-card__head"><strong>Skill</strong>
          <button class="btn-mini danger" data-action="del-item" data-sid="${s.id}" data-iid="${sk.id}">Delete</button>
        </div>
        ${itemField(s.id, sk.id, "name", "Skill name", sk.name, { maxlength: 60, ph: "JavaScript" })}
        <div class="field"><label>Proficiency</label>
          <div class="range-row">
            <input type="range" min="0" max="100" value="${parseInt(sk.level,10)||0}" data-sid="${s.id}" data-iid="${sk.id}" data-field="level" data-range="1" />
            <span class="range-val">${parseInt(sk.level,10)||0}%</span>
          </div>
        </div>
      </div>`;
    }).join("");
    var canAdd = (s.data.items || []).length < LIMITS.skills;
    return items
      + `<button class="btn-mini btn-add-item" data-action="add-item" data-sid="${s.id}" ${canAdd?"":"disabled"}>+ Add skill ${canAdd?"":"(max "+LIMITS.skills+")"}</button>`
      + suggestBtn("ai-suggest-skills", s.id, null, "Suggest skills")
      + `<div class="suggest-tray" id="skill-tray-${s.id}"></div>`;
  }

  function bodyExperience(s) {
    var items = (s.data.items || []).map(function (e) {
      var isPresent = e.end === "Present";
      return `<div class="item-card" data-card="${e.id}">
        <div class="item-card__head"><strong>Entry</strong>
          <button class="btn-mini danger" data-action="del-item" data-sid="${s.id}" data-iid="${e.id}">Delete</button>
        </div>
        ${itemField(s.id, e.id, "title", "Title", e.title, { ph: "Senior Developer" })}
        ${itemField(s.id, e.id, "org", "Organisation", e.org, { ph: "Company / School" })}
        <div class="field-row">
          ${itemField(s.id, e.id, "start", "Start", e.start, { type: "month" })}
          <div class="field"><label>End</label>
            <input type="month" class="input" data-sid="${s.id}" data-iid="${e.id}" data-field="end" value="${isPresent?"":esc(e.end)}" ${isPresent?"disabled":""} />
          </div>
        </div>
        <label style="font-size:11.5px;color:var(--txt-dim);display:flex;gap:6px;align-items:center;cursor:pointer">
          <input type="checkbox" data-action="present" data-sid="${s.id}" data-iid="${e.id}" ${isPresent?"checked":""} /> Currently here (Present)
        </label>
        <span class="inline-error" data-err="date-${e.id}">End date must be after start date.</span>
        ${itemField(s.id, e.id, "description", "Description", e.description, { textarea: true, maxlength: 1000, rows: 3 })}
      </div>`;
    }).join("");
    var canAdd = (s.data.items || []).length < LIMITS.experience;
    return items
      + `<button class="btn-mini btn-add-item" data-action="add-item" data-sid="${s.id}" ${canAdd?"":"disabled"}>+ Add experience</button>`;
  }

  function bodyContact(s) {
    var d = s.data;
    var socials = (d.socials || []).map(function (so) {
      return `<div class="item-card" data-card="${so.id}">
        <div class="item-card__head"><strong>Social link</strong>
          <button class="btn-mini danger" data-action="del-social" data-sid="${s.id}" data-iid="${so.id}">Delete</button>
        </div>
        ${itemField(s.id, so.id, "label", "Label", so.label, { ph: "GitHub" })}
        ${itemField(s.id, so.id, "url", "URL", so.url, { type: "url", ph: "https://…" })}
        <span class="inline-error" data-err="url-${so.id}">Enter a valid http(s):// URL.</span>
      </div>`;
    }).join("");
    var canAdd = (d.socials || []).length < LIMITS.socials;
    return fieldText(s.id, "email", "Email", d.email, { type: "email", ph: "hello@example.com" })
      + fieldText(s.id, "message", "Message", d.message, { textarea: true, rows: 2, ph: "Let's work together." })
      + `<div class="field"><label>Social links</label></div>`
      + socials
      + `<button class="btn-mini btn-add-item" data-action="add-social" data-sid="${s.id}" ${canAdd?"":"disabled"}>+ Add social link ${canAdd?"":"(max "+LIMITS.socials+")"}</button>`;
  }

  var BODY = { hero: bodyHero, projects: bodyProjects, skills: bodySkills, experience: bodyExperience, contact: bodyContact };

  // ---------- render section list ----------
  function renderSections() {
    var sections = S().sections;
    if (!sections.length) {
      listEl.innerHTML = `<li class="empty-hint">No sections yet. Click <strong>Add</strong> to start building.</li>`;
      return;
    }
    // preserve which cards are open
    var openIds = {};
    listEl.querySelectorAll(".section-card.open").forEach(function (c) { openIds[c.dataset.sid] = true; });

    listEl.innerHTML = sections.map(function (s) {
      var meta = SECTION_META[s.type];
      var open = openIds[s.id];
      return `<li class="section-card ${open?"open":""}" data-sid="${s.id}" draggable="false">
        <div class="section-head" data-action="toggle" data-sid="${s.id}" role="button" tabindex="0" aria-expanded="${open?"true":"false"}">
          <span class="drag-handle" data-drag-handle title="Drag to reorder" aria-label="Drag handle">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><circle cx="7" cy="5" r="1.4"/><circle cx="13" cy="5" r="1.4"/><circle cx="7" cy="10" r="1.4"/><circle cx="13" cy="10" r="1.4"/><circle cx="7" cy="15" r="1.4"/><circle cx="13" cy="15" r="1.4"/></svg>
          </span>
          <span class="section-icon">${meta.icon}</span>
          <span class="section-title">${meta.label}</span>
          <button class="btn-remove-section" data-action="del-section" data-sid="${s.id}" aria-label="Remove ${meta.label} section" title="Remove">
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h1v9a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm1 4h6v9H7V6zm2 2a1 1 0 112 0v5a1 1 0 11-2 0V8z"/></svg>
          </button>
          <span class="section-chevron">⌄</span>
        </div>
        <div class="section-body-wrap"><div class="section-body"><div class="section-body-inner" data-body="${s.id}">
          ${BODY[s.type](s)}
        </div></div></div>
      </li>`;
    }).join("");
  }

  // ---------- helpers to find/mutate ----------
  function findSection(sid) { return S().sections.find(function (s) { return s.id === sid; }); }
  function findItem(sec, iid, key) { return (sec.data[key||"items"] || []).find(function (i) { return i.id === iid; }); }

  function setErr(key, show, msg) {
    var el = listEl.querySelector('[data-err="' + key + '"]');
    if (!el) return;
    if (msg) el.textContent = msg;
    el.classList.toggle("show", !!show);
  }

  // ---------- event delegation ----------
  function onInput(e) {
    var t = e.target;
    var sid = t.dataset.sid;
    if (!sid) return;
    var sec = findSection(sid);
    if (!sec) return;
    var field = t.dataset.field;

    // tag input handled on keydown
    if (t.dataset.action === "tag-input") return;

    // range live value
    if (t.dataset.range) {
      var span = t.parentElement.querySelector(".range-val");
      if (span) span.textContent = (parseInt(t.value, 10) || 0) + "%";
    }

    window.GF_Store.update(function () {
      if (t.dataset.iid) {
        var key = (sec.type === "contact") ? "socials" : "items";
        var item = findItem(sec, t.dataset.iid, key);
        if (item && field) item[field] = (field === "level") ? (parseInt(t.value, 10) || 0) : t.value;
      } else if (field) {
        sec.data[field] = t.value;
      }
    });

    // validations
    if (field === "url" && t.dataset.iid) {
      var bad = t.value && !/^https?:\/\//i.test(t.value);
      setErr("url-" + t.dataset.iid, bad);
    }
    validateDates(sec, t);
  }

  function validateDates(sec, t) {
    if (sec.type !== "experience") return;
    if (!t.dataset.iid) return;
    var item = findItem(sec, t.dataset.iid, "items");
    if (!item) return;
    var bad = item.start && item.end && item.end !== "Present" && item.end < item.start;
    setErr("date-" + item.id, bad);
  }

  function onKeydown(e) {
    var t = e.target;
    if (t.dataset.action === "tag-input" && e.key === "Enter") {
      e.preventDefault();
      var val = t.value.trim();
      if (!val) return;
      var sec = findSection(t.dataset.sid);
      var item = findItem(sec, t.dataset.iid, "items");
      if (!item) return;
      item.tags = item.tags || [];
      if (item.tags.length >= LIMITS.tags) { window.GF_toast("Max " + LIMITS.tags + " tags", "err"); return; }
      item.tags.push(val);
      t.value = "";
      window.GF_Store.update(function () {});
      renderSections(); reopen(sec.id);
    }
    // keyboard toggle on section head
    if (t.dataset.action === "toggle" && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault(); toggleCard(t.dataset.sid);
    }
  }

  function toggleCard(sid) {
    var card = listEl.querySelector('.section-card[data-sid="' + sid + '"]');
    if (!card) return;
    var open = card.classList.toggle("open");
    var head = card.querySelector(".section-head");
    head.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function reopen(sid) {
    var card = listEl.querySelector('.section-card[data-sid="' + sid + '"]');
    if (card) { card.classList.add("open"); card.querySelector(".section-head").setAttribute("aria-expanded", "true"); }
  }

  function onClick(e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;
    var sid = btn.dataset.sid;
    var sec = sid ? findSection(sid) : null;

    switch (action) {
      case "toggle":
        if (e.target.closest("[data-drag-handle]") || e.target.closest(".btn-remove-section")) return;
        toggleCard(sid); break;

      case "del-section":
        window.GF_Store.update(function (st) {
          st.sections = st.sections.filter(function (s) { return s.id !== sid; });
        });
        renderSections();
        window.GF_toast("Section removed");
        break;

      case "add-item":
        if (!sec) return;
        window.GF_Store.update(function () {
          sec.data.items = sec.data.items || [];
          if (sec.type === "projects") sec.data.items.push({ id: uid(), title: "New project", image: "", description: "", tags: [], demo: "", source: "" });
          else if (sec.type === "skills") sec.data.items.push({ id: uid(), name: "New skill", level: 50 });
          else if (sec.type === "experience") sec.data.items.push({ id: uid(), title: "", org: "", start: "", end: "Present", description: "" });
        });
        renderSections(); reopen(sid);
        break;

      case "del-item":
        window.GF_Store.update(function () {
          sec.data.items = sec.data.items.filter(function (i) { return i.id !== btn.dataset.iid; });
        });
        renderSections(); reopen(sid);
        break;

      case "del-tag":
        window.GF_Store.update(function () {
          var item = findItem(sec, btn.dataset.iid, "items");
          if (item) item.tags.splice(parseInt(btn.dataset.tagidx, 10), 1);
        });
        renderSections(); reopen(sid);
        break;

      case "add-social":
        window.GF_Store.update(function () {
          sec.data.socials = sec.data.socials || [];
          sec.data.socials.push({ id: uid(), label: "Website", url: "https://" });
        });
        renderSections(); reopen(sid);
        break;

      case "del-social":
        window.GF_Store.update(function () {
          sec.data.socials = sec.data.socials.filter(function (i) { return i.id !== btn.dataset.iid; });
        });
        renderSections(); reopen(sid);
        break;

      case "ai-tagline": {
        var tg = window.GF_Suggest.tagline(sec.data.name, sec.data.title);
        window.GF_Store.update(function () { sec.data.tagline = tg; });
        renderSections(); reopen(sid);
        window.GF_toast("Tagline suggested — click again for another", "ok");
        break;
      }

      case "ai-describe": {
        var pj = findItem(sec, btn.dataset.iid, "items");
        if (!pj) break;
        var desc = window.GF_Suggest.describe(pj.title, pj.tags);
        window.GF_Store.update(function () { pj.description = desc; });
        renderSections(); reopen(sid);
        window.GF_toast("Description suggested", "ok");
        break;
      }

      case "ai-tags": {
        var pjt = findItem(sec, btn.dataset.iid, "items");
        if (!pjt) break;
        var room = LIMITS.tags - (pjt.tags || []).length;
        var newTags = window.GF_Suggest.tags(pjt.title, pjt.description, pjt.tags, room);
        if (!newTags.length) { window.GF_toast("No tag matches found — add more detail", "err"); break; }
        window.GF_Store.update(function () { pjt.tags = (pjt.tags || []).concat(newTags); });
        renderSections(); reopen(sid);
        window.GF_toast("Added " + newTags.length + " tag" + (newTags.length > 1 ? "s" : ""), "ok");
        break;
      }

      case "ai-suggest-skills": {
        var heroSec = S().sections.find(function (x) { return x.type === "hero"; });
        var role = heroSec ? heroSec.data.title : "";
        var existing = (sec.data.items || []).map(function (i) { return i.name; });
        var ideas = window.GF_Suggest.skills(role, existing, 8);
        var tray = document.getElementById("skill-tray-" + sid);
        if (!tray) break;
        if (!ideas.length) { tray.innerHTML = '<span class="suggest-empty">No new suggestions — you\'ve covered the basics.</span>'; break; }
        tray.innerHTML = ideas.map(function (name) {
          return '<button type="button" class="suggest-chip" data-action="ai-add-skill" data-sid="' + sid + '" data-skill="' + esc(name) + '">+ ' + esc(name) + '</button>';
        }).join("");
        break;
      }

      case "ai-add-skill": {
        var skillName = btn.dataset.skill;
        window.GF_Store.update(function () {
          sec.data.items = sec.data.items || [];
          sec.data.items.push({ id: uid(), name: skillName, level: 70 });
        });
        renderSections(); reopen(sid);
        // re-show remaining suggestions
        var ev = listEl.querySelector('[data-action="ai-suggest-skills"][data-sid="' + sid + '"]');
        if (ev) ev.click();
        break;
      }
    }
  }

  function onChange(e) {
    var t = e.target;
    // present checkbox
    if (t.dataset.action === "present") {
      var sec = findSection(t.dataset.sid);
      var item = findItem(sec, t.dataset.iid, "items");
      if (!item) return;
      window.GF_Store.update(function () { item.end = t.checked ? "Present" : ""; });
      renderSections(); reopen(t.dataset.sid);
      return;
    }
    // image upload
    if (t.dataset.upload) {
      handleUpload(t);
    }
  }

  function handleUpload(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var field = input.dataset.upload;
    var sid = input.dataset.sid, iid = input.dataset.iid;
    var errKey = field + "-" + (iid || sid);
    if (file.size > 5 * 1024 * 1024) {
      setErr(errKey, true, "Image exceeds 5 MB limit.");
      input.value = "";
      return;
    }
    setErr(errKey, false);
    var reader = new FileReader();
    reader.onload = function () {
      var dataUri = reader.result;
      var sec = findSection(sid);
      window.GF_Store.update(function () {
        if (iid) {
          var item = findItem(sec, iid, sec.type === "contact" ? "socials" : "items");
          if (item) item[field] = dataUri;
        } else {
          sec.data[field] = dataUri;
        }
      });
      renderSections(); reopen(sid);
      window.GF_toast("Image added");
    };
    reader.onerror = function () { setErr(errKey, true, "Upload failed."); };
    reader.readAsDataURL(file);
  }

  // ---------- add-section modal ----------
  function buildTypeGrid() {
    var present = S().sections.map(function (s) { return s.type; });
    typeGrid.innerHTML = ALL_TYPES.map(function (type) {
      var m = SECTION_META[type];
      var used = present.indexOf(type) !== -1;
      return `<button class="section-type-card" data-add-type="${type}" ${used?"disabled":""} title="${used?"Already added":"Add "+m.label}">
        <span class="section-type-icon">${m.icon}</span><span>${m.label}</span>
      </button>`;
    }).join("");
  }
  function openModal() { buildTypeGrid(); modal.hidden = false; }
  function closeModal() { modal.hidden = true; }

  function addSection(type) {
    var defaults = {
      hero: { name: "", title: "", tagline: "", avatar: "" },
      projects: { items: [] },
      skills: { items: [] },
      experience: { items: [] },
      contact: { email: "", message: "", socials: [] }
    };
    window.GF_Store.update(function (st) {
      st.sections.push({ id: uid(), type: type, data: defaults[type] });
    });
    renderSections();
    var newId = S().sections[S().sections.length - 1].id;
    reopen(newId);
    closeModal();
    window.GF_toast(SECTION_META[type].label + " section added", "ok");
  }

  function init() {
    listEl = document.getElementById("sectionList");
    modal = document.getElementById("addSectionModal");
    typeGrid = document.getElementById("sectionTypeGrid");

    renderSections();

    listEl.addEventListener("input", onInput);
    listEl.addEventListener("keydown", onKeydown);
    listEl.addEventListener("click", onClick);
    listEl.addEventListener("change", onChange);

    document.getElementById("addSectionBtn").addEventListener("click", openModal);
    typeGrid.addEventListener("click", function (e) {
      var b = e.target.closest("[data-add-type]");
      if (b && !b.disabled) addSection(b.dataset.addType);
    });
    document.querySelectorAll("[data-close-modal]").forEach(function (b) {
      b.addEventListener("click", function () { b.closest(".modal-overlay").hidden = true; });
    });
    document.querySelectorAll(".modal-overlay").forEach(function (ov) {
      ov.addEventListener("click", function (e) { if (e.target === ov) ov.hidden = true; });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") document.querySelectorAll(".modal-overlay").forEach(function (m) { m.hidden = true; });
    });
  }

  window.GF_Builder = { init: init, renderSections: renderSections };
})();
