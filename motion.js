/*
  Gym Point — motion layer.
  Lenis smooth scroll + GSAP/ScrollTrigger for entrance and scroll animation,
  cursor-tilt cards, magnetic buttons, price count-up, nav state.
  Everything here checks prefers-reduced-motion and pointer type before
  attaching listeners, and is written to fail quietly if a CDN script
  didn't load (site still works with the CSS .reveal fallback).
*/
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarse = !window.matchMedia("(pointer: fine)").matches;
  var hasGSAP = typeof gsap !== "undefined";
  var hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== "undefined";
  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------- Loader ---------------- */
  var loader = $("#loader");
  var loaderFill = $("#loaderFill");
  if (loader) {
    var pct = 0;
    var fillTimer = setInterval(function () {
      pct = Math.min(pct + Math.random() * 22, 92);
      if (loaderFill) loaderFill.style.width = pct + "%";
    }, 120);
    window.addEventListener("load", function () {
      clearInterval(fillTimer);
      if (loaderFill) loaderFill.style.width = "100%";
      setTimeout(function () {
        loader.classList.add("done");
        document.body.classList.add("loaded");
        runEntrance();
      }, reduceMotion ? 0 : 350);
    });
    // Safety net in case 'load' fires very late for slow embeds.
    setTimeout(function () {
      if (!loader.classList.contains("done")) {
        clearInterval(fillTimer);
        loader.classList.add("done");
        document.body.classList.add("loaded");
        runEntrance();
      }
    }, 4000);
  } else {
    runEntrance();
  }

  /* ---------------- Lenis smooth scroll ---------------- */
  var lenis = null;
  if (!reduceMotion && typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      smoothTouch: false
    });
    document.documentElement.classList.add("has-lenis");
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (hasScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    // Smooth in-page anchor scrolling via Lenis.
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length > 1 && $(id)) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: -70 });
        }
      });
    });
  }

  /* ---------------- Hero entrance ---------------- */
  function runEntrance() {
    if (!hasGSAP || reduceMotion) {
      $$(".js-split-fade,.js-char-reveal").forEach(function (el) { el.style.opacity = 1; });
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".hero-title .line-inner", { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.12 })
      .fromTo(".hero-kicker", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.7")
      .fromTo(".hero-lede", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.55")
      .fromTo(".hero-meta", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5")
      .fromTo(".hero-actions", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.45");
  }

  /* ---------------- Scroll-triggered reveal (GSAP if present, CSS .reveal as fallback) ---------------- */
  if (hasScrollTrigger && !reduceMotion) {
    $$(".reveal").forEach(function (el) {
      el.classList.add("visible"); // let CSS opacity sit at 1; GSAP owns the actual motion below
      gsap.fromTo(el, { opacity: 0, y: 34 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
        onComplete: function () {
          // GSAP leaves an inline transform behind even at y:0, and any
          // transform on an ancestor breaks position:fixed descendants
          // (they become "fixed" relative to that ancestor instead of the
          // viewport). Not needed once the animation is done — clear it.
          gsap.set(el, { clearProps: "transform" });
        }
      });
    });
  } else {
    // Fallback: plain IntersectionObserver toggling the CSS class.
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------- Nav: shrink-on-scroll + active section ---------------- */
  var nav = $("#siteNav");
  var navLinkEls = $$("#navLinks a[href^='#']");
  if (nav) {
    var onNavScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onNavScroll, { passive: true });
    onNavScroll();
  }
  if (hasScrollTrigger && navLinkEls.length) {
    $$("main > section[id]").forEach(function (section) {
      ScrollTrigger.create({
        trigger: section,
        start: "top 45%",
        end: "bottom 45%",
        onToggle: function (self) {
          if (!self.isActive) return;
          navLinkEls.forEach(function (l) { l.classList.remove("active"); });
          var match = navLinkEls.filter(function (l) { return l.getAttribute("href") === "#" + section.id; })[0];
          if (match) match.classList.add("active");
        }
      });
    });
  }

  /* ---------------- About panel parallax ---------------- */
  if (hasScrollTrigger && !reduceMotion) {
    var aboutPanel = $(".about-panel");
    if (aboutPanel) {
      gsap.to(aboutPanel, {
        y: -40,
        ease: "none",
        scrollTrigger: { trigger: aboutPanel, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    }
  }

  /* ---------------- Tilt cards (feature / service / plan) ---------------- */
  if (!isCoarse && !reduceMotion) {
    $$(".tilt-card").forEach(function (card) {
      var bounds;
      var raf = null;
      function onEnter() { bounds = card.getBoundingClientRect(); }
      function onMove(e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        var px = (e.clientX - bounds.left) / bounds.width;
        var py = (e.clientY - bounds.top) / bounds.height;
        var rotY = (px - 0.5) * 10;
        var rotX = (0.5 - py) * 10;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transform = "perspective(900px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) translateY(-4px)";
          card.style.setProperty("--mx", px * 100 + "%");
          card.style.setProperty("--my", py * 100 + "%");
        });
      }
      function onLeave() {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = "";
      }
      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
if (!reduceMotion) {
  $$(".btn-magnetic").forEach(function (btn) {
    var strength = isCoarse ? 0.12 : 0.28;
    var active = false;

    function onMove(e) {
      if (isCoarse && e.pointerType === "touch" && !active) return;

      var b = btn.getBoundingClientRect();

      var x = (e.clientX - b.left - b.width / 2) * strength;
      var y = (e.clientY - b.top - b.height / 2) * strength;

      btn.style.transform =
        "translate(" + x + "px," + y + "px)";
    }

    function onEnter(e) {
      if (!isCoarse) {
        active = true;
        onMove(e);
      }
    }

    function onLeave() {
      active = false;
      btn.style.transform = "";
    }

    function onPointerDown(e) {
      if (isCoarse && e.pointerType === "touch") {
        active = true;
        onMove(e);
      }
    }

    function onPointerUp() {
      if (isCoarse) {
        active = false;
        btn.style.transform = "";
      }
    }

    btn.addEventListener("pointerenter", onEnter);
    btn.addEventListener("pointermove", onMove);
    btn.addEventListener("pointerleave", onLeave);
    btn.addEventListener("pointerdown", onPointerDown);
    btn.addEventListener("pointerup", onPointerUp);
    btn.addEventListener("pointercancel", onPointerUp);
  });
}

  /* ---------------- Price count-up ---------------- */
  var countEls = $$(".count-up");
  if (countEls.length) {
    var formatBirr = function (n) { return Math.round(n).toLocaleString("en-US"); };
    var animateCount = function (el) {
      var target = parseFloat(el.dataset.count || "0", 10);
      if (reduceMotion || !hasGSAP) {
        el.textContent = formatBirr(target);
        return;
      }
      var obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: function () { el.textContent = formatBirr(obj.val); }
      });
    };
    if (hasScrollTrigger && !reduceMotion) {
      countEls.forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          once: true,
          onEnter: function () { animateCount(el); }
        });
      });
    } else if ("IntersectionObserver" in window) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      countEls.forEach(function (el) { countObserver.observe(el); });
    } else {
      countEls.forEach(animateCount);
    }
  }

  /* ---------------- Form focus states ---------------- */
  $$(".field input, .field select, .field textarea").forEach(function (input) {
    var field = input.closest(".field");
    if (!field) return;
    input.addEventListener("focus", function () { field.classList.add("focused"); });
    input.addEventListener("blur", function () { field.classList.remove("focused"); });
  });

  /* ---------------- Featured plan glow angle (CSS var driven by @property, no JS needed) ---------------- */
  // handled purely in CSS via @keyframes spin-border.

  if (hasScrollTrigger) {
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
})();
