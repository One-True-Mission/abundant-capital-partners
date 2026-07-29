/* ============================================================
   ABUNDANT CAPITAL PARTNERS - site behavior
   Built by OTM Web Design
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Active nav state ---------- */
  var page = document.body.getAttribute("data-page");
  if (page) {
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === page) link.classList.add("is-active");
    });
  }

  /* ---------- Mobile menu ---------- */
  var hamburger = document.querySelector(".hamburger");
  var mobileMenu = document.querySelector(".mobile-menu");
  var backdrop = document.querySelector(".nav-backdrop");

  function closeMenu() {
    if (!hamburger) return;
    hamburger.classList.remove("is-open");
    if (mobileMenu) mobileMenu.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    hamburger.setAttribute("aria-expanded", "false");
  }

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      var open = hamburger.classList.toggle("is-open");
      if (mobileMenu) mobileMenu.classList.toggle("is-open", open);
      if (backdrop) backdrop.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Gallery carousel: featured-center, auto-advancing ----------
     Supports multiple carousels on one page. Each gets its own index,
     timer, and dots so they run independently. ---------- */
  document.querySelectorAll(".gallery-carousel").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".gallery-slide"));
    if (!slides.length) return;

    var dotsWrap = carousel.querySelector(".carousel-dots");
    var prevBtn = carousel.querySelector(".carousel-prev");
    var nextBtn = carousel.querySelector(".carousel-next");
    var index = 0;
    var timer = null;
    var INTERVAL = 4500;
    var dots = [];

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.className = "carousel-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", "Go to image " + (i + 1));
        dot.addEventListener("click", function () { goTo(i); restart(); });
        dotsWrap.appendChild(dot);
      });
      dots = Array.prototype.slice.call(dotsWrap.children);
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      var prev = (index - 1 + slides.length) % slides.length;
      var next = (index + 1) % slides.length;
      slides.forEach(function (slide, s) {
        slide.classList.remove("is-active", "is-prev", "is-next");
        if (s === index) slide.classList.add("is-active");
        else if (s === prev) slide.classList.add("is-prev");
        else if (s === next) slide.classList.add("is-next");
      });
      dots.forEach(function (dot, d) { dot.classList.toggle("is-active", d === index); });
    }
    function start() { if (reduceMotion) return; timer = setInterval(function () { goTo(index + 1); }, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(index - 1); restart(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(index + 1); restart(); });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", function () { if (!timer) start(); });

    goTo(0);
    start();
  });

  /* ---------- Straight answers accordion ---------- */
  document.querySelectorAll(".qa-item").forEach(function (item) {
    var btn = item.querySelector(".qa-q");
    var panel = item.querySelector(".qa-a");
    if (!btn || !panel) return;

    btn.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
    });
  });

  /* ---------- Phone fields: live US formatting ---------- */
  function initPhoneFields() {
    document.querySelectorAll('input[type="tel"]').forEach(function (field) {
      field.setAttribute("inputmode", "numeric");
      field.setAttribute("maxlength", "14");
      field.setAttribute("autocomplete", "tel");
      if (!field.getAttribute("placeholder")) field.setAttribute("placeholder", "(704) 555-0142");

      field.addEventListener("input", function () {
        var d = field.value.replace(/\D/g, "").slice(0, 10);
        var out = "";
        if (d.length > 6) out = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
        else if (d.length > 3) out = "(" + d.slice(0, 3) + ") " + d.slice(3);
        else if (d.length > 0) out = "(" + d.slice(0, 3);
        field.value = out;
      });
    });
  }
  initPhoneFields();

  /* ---------- Validation helpers ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  function errorSlot(field) {
    var wrap = field.closest(".field") || field.parentNode;
    var slot = wrap.querySelector(".field-error");
    if (!slot) {
      slot = document.createElement("span");
      slot.className = "field-error";
      wrap.appendChild(slot);
    }
    return slot;
  }

  function setError(field, message) {
    field.classList.add("has-error");
    var slot = errorSlot(field);
    slot.textContent = message;
    slot.classList.add("show");
  }

  function clearError(field) {
    field.classList.remove("has-error");
    var wrap = field.closest(".field") || field.parentNode;
    var slot = wrap.querySelector(".field-error");
    if (slot) slot.classList.remove("show");
  }

  /* Checks one field and returns true when it passes. */
  function checkField(field) {
    var value = field.value.trim();

    if (field.hasAttribute("required") && !value) {
      setError(field, "This field is required.");
      return false;
    }
    if (!value) { clearError(field); return true; }

    if (field.type === "tel") {
      if (value.replace(/\D/g, "").length !== 10) {
        setError(field, "Enter a 10 digit phone number.");
        return false;
      }
    } else if (field.type === "email") {
      if (!EMAIL_RE.test(value)) {
        setError(field, "Enter a valid email address.");
        return false;
      }
    } else if (field.dataset.minLength) {
      if (value.length < parseInt(field.dataset.minLength, 10)) {
        setError(field, "Enter at least " + field.dataset.minLength + " characters.");
        return false;
      }
    }

    clearError(field);
    return true;
  }

  /* Validates every visible, enabled control inside a scope. */
  function validateScope(scope) {
    var ok = true;
    var firstBad = null;
    scope.querySelectorAll("input, textarea, select").forEach(function (field) {
      if (field.type === "hidden" || field.type === "checkbox" || field.disabled) return;
      if (field.closest(".honeypot")) return;
      if (field.offsetParent === null) return;
      if (!checkField(field)) {
        ok = false;
        if (!firstBad) firstBad = field;
      }
    });
    if (firstBad) {
      firstBad.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      firstBad.focus({ preventScroll: true });
    }
    return ok;
  }

  /* Consent must be checked before anything sends. A form that collects a
     phone number is opting the visitor into calls and texts, so this is
     not optional decoration. */
  function validateConsent(form) {
    var consent = form.querySelector('input[name="consent"]');
    if (!consent) return true;
    var wrap = consent.closest(".field");
    var slot = wrap ? wrap.querySelector(".field-error") : null;
    if (!consent.checked) {
      if (slot) {
        slot.textContent = "Please check this box so we can contact you about your deal.";
        slot.classList.add("show");
      }
      consent.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      consent.focus({ preventScroll: true });
      return false;
    }
    if (slot) slot.classList.remove("show");
    return true;
  }

  /* Clear a field's error the moment the visitor edits it. */
  document.querySelectorAll("form[data-validate] input, form[data-validate] textarea, form[data-validate] select")
    .forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.classList.contains("has-error")) clearError(field);
      });
      field.addEventListener("change", function () {
        if (field.classList.contains("has-error")) clearError(field);
      });
    });

  /* ---------- Form submit: AJAX, then we redirect ourselves ----------
     Formspree no longer honors a _next input, so the redirect is
     performed here. Resolving against window.location keeps it correct
     on a github.io subpath, a custom domain, and a local preview. */
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    if (form.hasAttribute("data-two-step")) return;
    var banner = form.querySelector(".form-error-banner");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (banner) banner.classList.remove("show");
      if (!validateScope(form) || !validateConsent(form)) return;

      var btn = form.querySelector('[type="submit"]');
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("bad-response");
        window.location.href = new URL("thank-you.html", window.location.href).href;
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        if (banner) {
          banner.textContent = "Something went wrong sending your message. Please try again, or call us at (704) 412-4192.";
          banner.classList.add("show");
        }
      });
    });
  });

  /* ---------- Two-step deal form ----------
     Step one fires its own real submit before step two is revealed, so an
     abandoned form still produces a usable lead. Nothing is captured
     before the visitor presses a button: there is no keystroke logging,
     no partial-field capture, and no session replay anywhere on this site.
     Step two posts the complete record, with the step one email carried
     through as the join key. ---------- */
  document.querySelectorAll("form[data-two-step]").forEach(function (form) {
    var stepOne = form.querySelector('[data-step="1"]');
    var stepTwo = form.querySelector('[data-step="2"]');
    var nextBtn = form.querySelector("[data-next]");
    var banner = form.querySelector(".form-error-banner");
    /* The step indicator sits above the form inside the card, not inside the
       form element, so look for it on the card rather than on the form. */
    var pips = (form.closest(".form-card") || form).querySelectorAll(".form-step-pip");
    if (!stepOne || !stepTwo || !nextBtn) return;

    function post(data) {
      return fetch(form.action, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      });
    }

    /* Builds a FormData from one step plus the shared hidden inputs. */
    function collect(scope, stage) {
      var data = new FormData();
      scope.querySelectorAll("input, textarea, select").forEach(function (f) {
        if (!f.name || f.disabled) return;
        if (f.type === "hidden") return;          /* added once, below */
        if (f.closest(".honeypot")) return;
        if (f.type === "checkbox" && !f.checked) return;
        data.append(f.name, f.value);
      });
      form.querySelectorAll('input[type="hidden"]').forEach(function (f) {
        if (f.name && f.name !== "stage") data.append(f.name, f.value);
      });
      data.append("stage", stage);
      return data;
    }

    nextBtn.addEventListener("click", function () {
      if (banner) banner.classList.remove("show");
      if (!validateScope(stepOne) || !validateConsent(form)) return;

      /* Honeypot: a filled hidden field means a bot. Behave normally and
         send nothing. */
      var pot = form.querySelector('.honeypot input');
      var isBot = pot && pot.value;

      nextBtn.disabled = true;
      var label = nextBtn.textContent;
      nextBtn.textContent = "Saving...";

      /* The partial post is a best-effort lead capture. If it fails we
         still advance, because step two resends everything including
         these fields and its failure is surfaced to the visitor. */
      var done = function () {
        nextBtn.disabled = false;
        nextBtn.textContent = label;
        stepOne.setAttribute("hidden", "");
        stepTwo.removeAttribute("hidden");
        if (pips[0]) { pips[0].classList.remove("is-active"); pips[0].classList.add("is-done"); }
        if (pips[1]) pips[1].classList.add("is-active");
        stepTwo.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        var first = stepTwo.querySelector("input, select, textarea");
        if (first) first.focus({ preventScroll: true });
      };

      if (isBot) { done(); return; }
      post(collect(stepOne, "inquiry")).then(done).catch(done);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (banner) banner.classList.remove("show");
      if (!validateScope(stepTwo)) return;

      var pot = form.querySelector('.honeypot input');
      if (pot && pot.value) {
        window.location.href = new URL("thank-you.html", window.location.href).href;
        return;
      }

      var btn = form.querySelector('[type="submit"]');
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

      post(collect(form, "full")).then(function (res) {
        if (!res.ok) throw new Error("bad-response");
        window.location.href = new URL("thank-you.html", window.location.href).href;
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        if (banner) {
          banner.textContent = "Something went wrong sending your deal. Please try again, or call us at (704) 412-4192.";
          banner.classList.add("show");
        }
      });
    });
  });
})();
