/* ============================================================
   Gridfolio — Suggestion engine (suggest.js)
   Local, offline "AI-assisted" suggestions: skills, descriptions,
   tags, taglines, and SEO copy. No backend, no API key.
   Curated knowledge base + keyword extraction + templated copy.
   ============================================================ */

(function () {
  // role keyword -> ranked skill list
  var ROLE_SKILLS = {
    front:   ["JavaScript", "TypeScript", "React", "Next.js", "HTML", "CSS", "Tailwind CSS", "Accessibility", "Jest", "Vite"],
    back:    ["Node.js", "Python", "PostgreSQL", "REST APIs", "GraphQL", "Docker", "Redis", "Microservices", "SQL", "Go"],
    full:    ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Next.js", "REST APIs", "Docker", "GraphQL", "Tailwind CSS"],
    design:  ["Figma", "UI Design", "UX Research", "Prototyping", "Design Systems", "Wireframing", "Typography", "Adobe XD", "User Testing", "Interaction Design"],
    mobile:  ["Swift", "Kotlin", "React Native", "Flutter", "Mobile UI", "Firebase", "SwiftUI", "App Store", "Push Notifications"],
    devops:  ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Monitoring", "GitHub Actions", "Nginx"],
    data:    ["SQL", "Python", "Pandas", "Tableau", "Data Visualization", "Excel", "Statistics", "dbt", "BigQuery"],
    ml:      ["Python", "PyTorch", "TensorFlow", "scikit-learn", "NLP", "Deep Learning", "Pandas", "MLOps", "Computer Vision"],
    product: ["Roadmapping", "User Research", "Analytics", "A/B Testing", "Stakeholder Management", "Figma", "Agile", "SQL"],
    generic: ["JavaScript", "HTML", "CSS", "Git", "TypeScript", "Communication", "Problem Solving", "Figma", "REST APIs"]
  };

  // skill -> related skills (co-occurrence)
  var SKILL_GRAPH = {
    "react": ["Redux", "TypeScript", "Next.js", "React Query", "Jest"],
    "next.js": ["React", "TypeScript", "Vercel", "Tailwind CSS"],
    "node.js": ["Express", "MongoDB", "REST APIs", "TypeScript", "Jest"],
    "python": ["Django", "Flask", "Pandas", "NumPy", "FastAPI"],
    "typescript": ["React", "Node.js", "Zod", "tRPC"],
    "figma": ["Design Systems", "Prototyping", "Auto Layout", "Wireframing"],
    "ui design": ["Design Systems", "Typography", "Figma", "Interaction Design"],
    "aws": ["Docker", "Kubernetes", "Terraform", "Lambda"],
    "docker": ["Kubernetes", "CI/CD", "Nginx"],
    "css": ["Tailwind CSS", "Sass", "Accessibility", "Animations"],
    "sql": ["PostgreSQL", "Data Visualization", "dbt"],
    "swift": ["SwiftUI", "iOS", "Xcode"]
  };

  // keyword -> canonical tag (for extracting tags from free text)
  var TAG_KEYWORDS = {
    "react": "React", "next": "Next.js", "vue": "Vue", "angular": "Angular", "svelte": "Svelte",
    "typescript": "TypeScript", "javascript": "JavaScript", "node": "Node.js", "express": "Express",
    "python": "Python", "django": "Django", "flask": "Flask", "fastapi": "FastAPI",
    "tailwind": "Tailwind CSS", "css": "CSS", "html": "HTML", "sass": "Sass",
    "postgres": "PostgreSQL", "mongo": "MongoDB", "redis": "Redis", "sql": "SQL", "graphql": "GraphQL",
    "docker": "Docker", "kubernetes": "Kubernetes", "aws": "AWS", "firebase": "Firebase",
    "figma": "Figma", "design system": "Design Systems", "api": "REST APIs",
    "swift": "Swift", "kotlin": "Kotlin", "flutter": "Flutter", "react native": "React Native",
    "ml": "Machine Learning", "machine learning": "Machine Learning", "tensorflow": "TensorFlow",
    "pytorch": "PyTorch", "websocket": "WebSockets", "stripe": "Stripe", "auth": "Authentication",
    "dashboard": "Dashboard", "mobile": "Mobile", "responsive": "Responsive", "animation": "Animations",
    "ecommerce": "E-commerce", "e-commerce": "E-commerce", "realtime": "Real-time", "real-time": "Real-time"
  };

  function detectRole(title) {
    var t = String(title || "").toLowerCase();
    if (/(ux|ui|design|product design)/.test(t) && !/develop|engineer/.test(t)) return "design";
    if (/full[\s-]?stack/.test(t)) return "full";
    if (/front[\s-]?end/.test(t)) return "front";
    if (/back[\s-]?end/.test(t)) return "back";
    if (/(ios|android|mobile|flutter)/.test(t)) return "mobile";
    if (/(devops|sre|cloud|infrastructure|platform)/.test(t)) return "devops";
    if (/(machine learning|ml engineer|\bai\b|deep learning)/.test(t)) return "ml";
    if (/(data scientist|data analyst|data engineer|analytics)/.test(t)) return "data";
    if (/product manager|\bpm\b/.test(t)) return "product";
    if (/(developer|engineer|programmer|software)/.test(t)) return "full";
    return "generic";
  }

  function dedupe(arr) {
    var seen = {}, out = [];
    arr.forEach(function (x) { var k = x.toLowerCase(); if (x && !seen[k]) { seen[k] = 1; out.push(x); } });
    return out;
  }

  // ---- public methods ----

  // suggest skills from role title + existing skills, excluding already-added
  function suggestSkills(title, existing, limit) {
    limit = limit || 8;
    var have = {};
    (existing || []).forEach(function (s) { have[String(s).toLowerCase()] = 1; });

    var pool = (ROLE_SKILLS[detectRole(title)] || ROLE_SKILLS.generic).slice();
    // expand with related skills of what the user already has
    (existing || []).forEach(function (s) {
      var rel = SKILL_GRAPH[String(s).toLowerCase()];
      if (rel) pool = pool.concat(rel);
    });
    pool = dedupe(pool).filter(function (s) { return !have[s.toLowerCase()]; });
    return pool.slice(0, limit);
  }

  // extract tags from title + description
  function suggestTags(title, description, existing, limit) {
    limit = limit || 6;
    var text = (String(title || "") + " " + String(description || "")).toLowerCase();
    var have = {};
    (existing || []).forEach(function (t) { have[String(t).toLowerCase()] = 1; });
    var found = [];
    Object.keys(TAG_KEYWORDS).forEach(function (kw) {
      if (text.indexOf(kw) !== -1) found.push(TAG_KEYWORDS[kw]);
    });
    found = dedupe(found).filter(function (t) { return !have[t.toLowerCase()]; });
    return found.slice(0, limit);
  }

  var DESC_ADJ = ["modern", "responsive", "performant", "polished", "accessible", "intuitive", "lightweight"];
  var DESC_TYPE = ["web app", "interface", "platform", "tool", "experience", "product"];
  var DESC_OUTCOME = [
    "Focused on clean architecture and a smooth user experience.",
    "Built with attention to performance, accessibility, and detail.",
    "Designed to be fast, reliable, and easy to use.",
    "Shipped end-to-end, from initial concept through to deployment.",
    "Emphasises a thoughtful, detail-driven interface."
  ];

  // rotating index so repeated clicks cycle variants
  var rot = 0;
  function pick(arr, offset) { return arr[(rot + (offset || 0)) % arr.length]; }

  function describeProject(title, tags) {
    rot++;
    var name = String(title || "This project").trim() || "This project";
    var tech = (tags || []).slice(0, 3);
    var techStr = tech.length === 1 ? tech[0]
      : tech.length === 2 ? tech[0] + " and " + tech[1]
      : tech.length >= 3 ? tech[0] + ", " + tech[1] + ", and " + tech[2]
      : "";
    var s = name + " is a " + pick(DESC_ADJ) + " " + pick(DESC_TYPE, 1);
    if (techStr) s += " built with " + techStr;
    s += ". " + pick(DESC_OUTCOME, 2);
    return s;
  }

  var TAGLINES = [
    "{title} crafting fast, accessible, delightful products.",
    "I design and build {focus} with care and precision.",
    "{title} turning ideas into polished digital experiences.",
    "Building thoughtful {focus} that people love to use.",
    "{title} focused on clean design and solid engineering."
  ];
  function suggestTagline(name, title) {
    rot++;
    var t = String(title || "").trim();
    var focus = t ? t.toLowerCase() : "web experiences";
    var tmpl = TAGLINES[rot % TAGLINES.length];
    return tmpl.replace("{title}", t || "I'm a maker —").replace("{focus}", focus);
  }

  function seoDescription(state) {
    var hero = (state.sections || []).find(function (s) { return s.type === "hero"; });
    var skillsSec = (state.sections || []).find(function (s) { return s.type === "skills"; });
    var name = hero && hero.data.name ? hero.data.name : "";
    var role = hero && hero.data.title ? hero.data.title : "";
    var topSkills = skillsSec ? (skillsSec.data.items || []).slice(0, 4).map(function (s) { return s.name; }).filter(Boolean) : [];
    var parts = [];
    if (name && role) parts.push(name + " — " + role + ".");
    else if (role) parts.push(role + ".");
    else if (name) parts.push(name + "'s portfolio.");
    else parts.push("Personal portfolio.");
    if (topSkills.length) parts.push("Skilled in " + topSkills.join(", ") + ".");
    parts.push("View selected projects and get in touch.");
    var out = parts.join(" ");
    return out.length > 160 ? out.slice(0, 157).replace(/[\s,.;]+$/, "") + "…" : out;
  }

  window.GF_Suggest = {
    skills: suggestSkills,
    tags: suggestTags,
    describe: describeProject,
    tagline: suggestTagline,
    seo: seoDescription
  };
})();
