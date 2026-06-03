/* ===========================================================
   TankopaniJam — shared chrome (header + footer)
   Injected on every page so the logo stays persistent.
   Pure vanilla, no build step, works over file://
   =========================================================== */
(function () {
  // Figure out the path back to the site root.
  // Pages in /pages/ need "../", root pages need "".
  var inPages = /\/pages\//.test(location.pathname);
  var ROOT = inPages ? "../" : "";

  // Ordered list of all content pages — powers nav, contents, and pagers.
  var PAGES = [
    { slug: "what-is-a-game-jam",        title: "What is a Game Jam",      nav: true,  desc: "The 72-hour creative marathon, explained." },
    { slug: "summary",                   title: "Summary",                 nav: true,  desc: "The big picture for every stakeholder." },
    { slug: "who",                       title: "Who",                     nav: true,  desc: "Teams, sponsors, and who can take part." },
    { slug: "participation-requirements",title: "Participation",           nav: true,  desc: "What it takes to join a team." },
    { slug: "timeline",                  title: "Timeline",                nav: true,  desc: "Three build days, a rest day, release day." },
    { slug: "judging-criteria",          title: "Judging Criteria",        nav: true,  desc: "The Alfred, Jessie & Alicia measures." },
    { slug: "rubric",                    title: "Judging Rubric",          nav: true,  desc: "The interactive scorecard judges use." },
    { slug: "judging-day",               title: "Judging Day",             nav: true,  desc: "How judges work the rest day." },
    { slug: "patients",                  title: "Patients",                nav: false, desc: "The panel at the heart of the jam." },
    { slug: "game-requirements",         title: "Game Requirements",       nav: true,  desc: "What every submitted game must do." },
    { slug: "theme",                     title: "Theme",                   nav: true,  desc: "One word, Estate objects, and a tune." },
    { slug: "check-ins",                 title: "Check-ins",               nav: true,  desc: "Six checkpoints across three days." },
    { slug: "awards",                    title: "Awards",                  nav: true,  desc: "Trophies, the Minors, and scholarships." },
    { slug: "judge-requirements",        title: "Judge Requirements",      nav: true,  desc: "What makes someone a TankopaniJam judge." },
    { slug: "roi",                       title: "Outcomes & ROI",          nav: true,  desc: "What students, patients & Nemours gain." },
    { slug: "alfred",                    title: "Alfred — the Original AI",nav: false, desc: "A nod to the Estate's namesake." }
  ];

  function href(slug) { return ROOT + "pages/" + slug + ".html"; }

  function buildHeader() {
    var current = document.body.getAttribute("data-page") || "";

    // Dropdown items: Home + Contents + every content page, numbered.
    var items = '<a class="menu__item" href="' + ROOT + 'index.html" role="menuitem">' +
                  '<span class="menu__num">◆</span><span>Home</span></a>' +
                '<a class="menu__item" href="' + ROOT + 'contents.html" role="menuitem">' +
                  '<span class="menu__num">≡</span><span>Contents</span></a>' +
                '<div class="menu__divider"></div>';
    items += PAGES.map(function (p, i) {
      var active = p.slug === current ? " is-active" : "";
      return '<a class="menu__item' + active + '" href="' + href(p.slug) + '" role="menuitem">' +
               '<span class="menu__num">' + String(i + 1).padStart(2, "0") + '</span>' +
               '<span>' + p.title + '</span></a>';
    }).join("");

    var signupActive = current === "team-signup" ? " is-active" : "";

    return '' +
      '<header class="site-header">' +
        '<div class="site-header__inner">' +
          '<a class="brand" href="' + ROOT + 'index.html" aria-label="TankopaniJam home">' +
            '<img class="brand__logo" src="' + ROOT + 'assets/img/logo.png" alt="TankopaniJam logo">' +
            '<span class="brand__text">' +
              '<span class="brand__name">TankopaniJam</span>' +
              '<span class="brand__tag">Nemours Game Jam</span>' +
            '</span>' +
          '</a>' +
          '<div class="header-actions">' +
            '<a class="btn btn--primary btn--sm signup-btn' + signupActive + '" href="' + ROOT + 'pages/team-signup.html">Sign Up &rarr;</a>' +
            '<div class="menu">' +
              '<button class="menu__toggle" aria-haspopup="true" aria-expanded="false" aria-controls="site-menu">' +
                'Contents <span class="menu__caret">▾</span>' +
              '</button>' +
              '<nav class="menu__panel" id="site-menu" role="menu" hidden>' + items + '</nav>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</header>';
  }

  function buildFooter() {
    var links = PAGES.map(function (p) {
      return '<a href="' + href(p.slug) + '">' + p.title + "</a>";
    }).join("");
    return '' +
      '<footer class="site-footer">' +
        '<div class="site-footer__inner">' +
          '<div>' +
            '<strong style="color:var(--cream)">TankopaniJam</strong> &middot; aka the Nemours Game Jam' +
            '<br><span style="opacity:.7">A college game jam built around the Estate, its patients, and Child Life.</span>' +
            '<br><a href="' + ROOT + 'pages/team-signup.html" style="color:var(--gold-400)">Register your team &rarr;</a>' +
          '</div>' +
          '<nav class="footer-nav">' +
            '<a href="' + ROOT + 'index.html">Home</a>' +
            '<a href="' + ROOT + 'contents.html">Contents</a>' +
            links +
          '</nav>' +
        '</div>' +
      '</footer>';
  }

  function buildPager() {
    var current = document.body.getAttribute("data-page") || "";
    var idx = PAGES.findIndex(function (p) { return p.slug === current; });
    if (idx === -1) return "";
    var prev = idx > 0 ? PAGES[idx - 1] : null;
    var next = idx < PAGES.length - 1 ? PAGES[idx + 1] : null;
    var html = '<nav class="pager">';
    if (prev) html += '<a href="' + href(prev.slug) + '"><span class="lbl">&larr; Previous</span><span class="ttl">' + prev.title + '</span></a>';
    if (next) html += '<a class="next" href="' + href(next.slug) + '"><span class="lbl">Next &rarr;</span><span class="ttl">' + next.title + '</span></a>';
    html += '</nav>';
    return html;
  }

  function mount(id, html) {
    var el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  document.addEventListener("DOMContentLoaded", function () {
    mount("site-header", buildHeader());
    mount("site-pager", buildPager());
    mount("site-footer", buildFooter());

    // expose page list for the contents page to render itself
    window.TANKOPANI_PAGES = PAGES;
    window.TANKOPANI_HREF = href;
    document.dispatchEvent(new Event("tankopani:ready"));

    // dropdown menu behaviour
    var menu = document.querySelector(".menu");
    var toggle = menu && menu.querySelector(".menu__toggle");
    var panel = menu && menu.querySelector(".menu__panel");

    function closeMenu() {
      if (!menu) return;
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    }
    function openMenu() {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
    }

    if (toggle) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.classList.contains("is-open") ? closeMenu() : openMenu();
      });
      document.addEventListener("click", function (e) {
        if (menu && !menu.contains(e.target)) closeMenu();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });
    }
  });
})();
