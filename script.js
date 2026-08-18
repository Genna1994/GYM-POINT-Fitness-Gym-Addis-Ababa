/* One source of truth for business information used by the page and FAQ assistant. */
    const GYM_POINT = {
      phoneDisplay: "0913505702",
      phoneTel: "+251913505702",
      whatsapp: "251913505702",
      telegram: "+251913505702",
      location: "Tesnm Building 6th floor, 4 Kilo behind Ambassador Mall, Addis Ababa",
      hours: "Monday–Saturday · 6:00 AM–9:00 PM",
      registrationFee: "200 Birr",
      plans: {
        month: "Monthly Package — 2,400 Birr",
        quarter: "3 Month Package — 6,000 Birr",
        half: "6 Month Package — 11,000 Birr",
        annual: "Annual Package — 19,000 Birr"
      },
      personalTrainer: {
        threeDays: "3 Days/Week — 2,000 Birr",
        fourDays: "4 Days/Week — 2,500 Birr",
        fiveDays: "5 Days/Week — 3,000 Birr"
      },
      boxing: "Boxing (per month) — 1,000 Birr",
      facilities: [
        "Free weights",
        "Modern cable machines and presses",
        "Cardio equipment including treadmills and bikes",
        "Full-body machine circuits",
        "Hot and cold showers",
        "Locker access",
        "Expert trainer support"
      ]
    };

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    // Fancy desktop cursor; normal cursor remains on touch devices.
    if (window.matchMedia("(pointer:fine)").matches) {
      document.body.classList.add("custom-cursor");
      const cursorDot = $("#cursorDot");
      const cursorRing = $("#cursorRing");
      let mx = window.innerWidth / 2, my = window.innerHeight / 2;
      let rx = mx, ry = my;

      const moveCursor = (event) => {
        mx = event.clientX; my = event.clientY;
        cursorDot.style.left = `${mx}px`;
        cursorDot.style.top = `${my}px`;
        cursorDot.style.opacity = "1";
        cursorRing.style.opacity = "1";
      };
      const animateCursor = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        cursorRing.style.left = `${rx}px`;
        cursorRing.style.top = `${ry}px`;
        requestAnimationFrame(animateCursor);
      };
      document.addEventListener("pointermove", moveCursor, { passive: true });
      document.addEventListener("pointerleave", () => {
          cursorDot.style.opacity = "0";
          cursorRing.style.opacity = "0";
      });
      document.addEventListener("mouseenter", () => {
        cursorDot.style.opacity = "1";
        cursorRing.style.opacity = "1";
      });
      document.addEventListener("mousedown", () => cursorRing.classList.add("click"));
      document.addEventListener("mouseup", () => cursorRing.classList.remove("click"));

      const attachHoverTargets = () => {
        $$("a, button, input, textarea, select, .tiktok-embed, .tilt-card").forEach(el => {
          el.addEventListener("mouseenter", () => cursorRing.classList.add("hover"));
          el.addEventListener("mouseleave", () => cursorRing.classList.remove("hover"));
        });
      };
      attachHoverTargets();

      // The Google Maps embed is a cross-origin iframe — the page never
      // receives mousemove events once the pointer is inside it, so the fake
      // cursor froze at the iframe's edge instead of disappearing. Hide it
      // on entry; the browser's native pointer cursor shows automatically
      // once inside, since cursor:none can't reach cross-origin content.
      const mapWrap = $(".map-wrap");
      if (mapWrap) {
        mapWrap.addEventListener("mouseenter", () => {
          cursorDot.style.opacity = "0";
          cursorRing.style.opacity = "0";
          cursorRing.classList.remove("hover");
        });
      }
      document.addEventListener("mousemove", () => {
        cursorDot.style.opacity = "1";
        cursorRing.style.opacity = "1";
      }, { passive: true });

      animateCursor();
    }

    // Mobile navigation
    const menuToggle = $("#menuToggle");
    const navLinks = $("#navLinks");
    const closeMenu = () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    };
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("#navLinks a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("click", e => {
      if (window.innerWidth <= 760 && navLinks.classList.contains("open") && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Note: scroll-reveal animation for .reveal elements is handled by motion.js
    // (GSAP ScrollTrigger where available, with a plain IntersectionObserver fallback).

    // Membership CTAs preselect the relevant plan.
    $$(".plan [data-plan]").forEach(link => {
      link.addEventListener("click", () => {
        const interest = $("#interest");
        if (interest) interest.value = link.dataset.plan;
      });
    });

    // Lead form -> WhatsApp or Telegram, depending on which button was pressed.
    let lastChannel = "whatsapp";
    $$("#leadForm button[data-channel]").forEach(btn => {
      btn.addEventListener("click", () => { lastChannel = btn.dataset.channel; });
    });
    $("#leadForm").addEventListener("submit", event => {
      event.preventDefault();
      const first = $("#firstName").value.trim();
      const last = $("#lastName").value.trim();
      const phone = $("#phone").value.trim();
      const interest = $("#interest").value || "General enquiry";
      const message = $("#message").value.trim();

      if (!first || !phone) return;

      const text = [
        "Hi Gym Point, I'm interested in joining the gym. I'd like to know more about the membership.",
        "",      
        `Name: ${first}${last ? " " + last : ""}`,
        `Phone: ${phone}`,
        `Interest: ${interest}`,
        message ? `Message: ${message}` : ""
      ].filter(Boolean).join("\n");

      const url = lastChannel === "telegram"
        ? `https://t.me/${GYM_POINT.telegram}?text=${encodeURIComponent(text)}`
        : `https://wa.me/${GYM_POINT.whatsapp}?text=${encodeURIComponent(text)}`;

      $("#formStatus").textContent = lastChannel === "telegram"
        ? "Opening Telegram with your enquiry…"
        : "Opening WhatsApp with your enquiry…";
      window.open(url, "_blank", "noopener,noreferrer");
    });

    // FAQ
    $$(".faq-question").forEach(button => {
      button.addEventListener("click", () => {
        const item = button.closest(".faq-item");
        const open = item.classList.toggle("open");
        button.setAttribute("aria-expanded", String(open));
        button.lastElementChild.textContent = open ? "−" : "+";
      });
    });

    // FAQ assistant — deterministic, based on the same source-of-truth object above.
    const answers = {
      price: `Registration Fee: 200 birr

      Gym Packages:
      • Monthly Package — 2,400 birr
      • 3 Month Package — 6,000 birr
      • 6 Month Package — 11,000 birr
      • Annual Package — 19,000 birr

      Personal Trainer (billed monthly):
      • 3 days/week — 2,000 birr
      • 4 days/week — 2,500 birr
      • 5 days/week — 3,000 birr

      Boxing:
      • Per month — 1,000 birr

      Gym packages include access, equipment, locker & shower access, and expert trainer support.`,
      location: `Gym Point is at Tesnm Building 6th floor, 4 Kilo behind Ambassador Mall, Addis Ababa
      
      Call us on 091 350 5702 for directions.`,
      hours: `Opening hours: 

      • Monday – Saturday: 6:00 AM – 9:00 PM

      Best to call ahead on public holidays.`,
      facilities: `The website lists:
      • ${GYM_POINT.facilities.join("\\n• ")}`,
      join: `Joining is simple:
      
      1) Visit Gym Point at Tesnm Building 6th floor, 4 Kilo behind Ambassador Mall, Addis Ababa
      2) Ask the front desk or the team for more detail that you want to know
      3) You can ask the team or the front desk to show you the Gym
      
      You can also call 0913505702 or send us a message via whatsapp or telegram through the contact form on this page.`,
      fallback: `I can only answer confirmed website information about membership, hours, location, facilities and joining. For anything else, contact Gym Point at ${GYM_POINT.phoneDisplay}.`
    };

    function getFaqAnswer(question) {
      const q = question.toLowerCase();
      if (/(price|cost|birr|membership|plan|fee|boxing|personal trainer|registration)/.test(q)) return answers.price;
      if (/(where|location|address|kilo|ambassador|tesnm|map)/.test(q)) return answers.location;
      if (/(hour|open|close|time|monday|saturday|sunday)/.test(q)) return answers.hours;
      if (/(facility|facilities|equipment|machine|cardio|shower|locker|trainer)/.test(q)) return answers.facilities;
      if (/(join|joining|sign|register|start|enroll)/.test(q)) return answers.join;
      return answers.fallback;
    }

    const chatPanel = $("#chatPanel");
    const chatLaunch = $("#chatLaunch");
    const chatClose = $("#chatClose");
    const chatMessages = $("#chatMessages");
    const chatInput = $("#chatInput");

    function setChat(open) {
      chatPanel.hidden = !open;
      chatLaunch.setAttribute("aria-expanded", String(open));
      chatLaunch.textContent = open ? "×" : "?";
      if (open) chatInput.focus();
    }
    chatLaunch.addEventListener("click", () => setChat(chatPanel.hidden));
    chatClose.addEventListener("click", () => setChat(false));

    function addChatMessage(text, type = "bot") {
      const el = document.createElement("div");
      el.className = `chat-msg${type === "user" ? " user" : ""}`;
      el.textContent = text;
      chatMessages.appendChild(el);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    function askQuestion(question) {
      const clean = question.trim();
      if (!clean) return;
      addChatMessage(clean, "user");
      addChatMessage(getFaqAnswer(clean));
    }
    $("#chatSend").addEventListener("click", () => {
      askQuestion(chatInput.value);
      chatInput.value = "";
    });
    chatInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        $("#chatSend").click();
      }
    });
    $$(".chat-quick button").forEach(button => {
      button.addEventListener("click", () => askQuestion(button.dataset.question));
    });

/* --------------------------------------------------------------------------
   GALLERY PHOTOS + LOCAL TIKTOK VIDEOS
   -------------------------------------------------------------------------- */
(() => {
  const photoButtons = $$('.gallery-photo-card');
  const lightbox = $('#galleryLightbox');
  const lightboxImage = $('#galleryLightboxImage');
  const lightboxCaption = $('#galleryLightboxCaption');
  const lightboxPrev = $('[data-lightbox-prev]');
  const lightboxNext = $('[data-lightbox-next]');
  const lightboxCloseButtons = $$('[data-lightbox-close]');

  if (photoButtons.length && lightbox) {
    const photos = photoButtons.map(button => ({
      src: button.dataset.galleryImage,
      title: button.dataset.galleryTitle || ''
    }));
    let photoIndex = 0;
    let previousBodyOverflow = '';
    let historyPushedForLightbox = false;
    const isMobileViewport = () => window.matchMedia('(max-width: 760px)').matches;

    const renderPhoto = index => {
      photoIndex = (index + photos.length) % photos.length;
      lightboxImage.src = photos[photoIndex].src;
      lightboxImage.alt = photos[photoIndex].title;
      lightboxCaption.textContent = photos[photoIndex].title;
    };

    const openLightbox = index => {
      renderPhoto(index);
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      lightboxCloseButtons[0]?.focus();

      // On phones, push a history entry so the device back gesture/button
      // closes the photo instead of leaving the site.
      if (isMobileViewport()) {
        history.pushState({ galleryLightbox: true }, '');
        historyPushedForLightbox = true;
      }
    };

    const hideLightbox = () => {
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImage.removeAttribute('src');
      document.body.style.overflow = previousBodyOverflow;
    };

    const closeLightbox = () => {
      if (lightbox.hidden) return;
      hideLightbox();
      if (historyPushedForLightbox) {
        historyPushedForLightbox = false;
        history.back(); // consumes the entry we pushed when opening
      }
    };

    window.addEventListener('popstate', () => {
      if (!lightbox.hidden) {
        historyPushedForLightbox = false;
        hideLightbox();
      }
    });

    photoButtons.forEach((button, index) => button.addEventListener('click', () => openLightbox(index)));
    lightboxPrev?.addEventListener('click', () => renderPhoto(photoIndex - 1));
    lightboxNext?.addEventListener('click', () => renderPhoto(photoIndex + 1));
    lightboxCloseButtons.forEach(button => button.addEventListener('click', closeLightbox));

    document.addEventListener('keydown', event => {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') renderPhoto(photoIndex - 1);
      if (event.key === 'ArrowRight') renderPhoto(photoIndex + 1);
    });

    // Swipe left/right to change photos on touch devices.
    let touchStartX = 0;
    let touchStartY = 0;
    const lightboxDialog = $('.gallery-lightbox-dialog');
    lightboxDialog?.addEventListener('touchstart', event => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });
    lightboxDialog?.addEventListener('touchend', event => {
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        renderPhoto(photoIndex + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
  }

  const cards = $$('.tiktok-embed');
  const videos = $$('.tiktok-video');
  if (!videos.length) return;

  // True only on touch devices (Android/iOS/iPad/tablet) — always false on desktop.
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // Scale whichever photo sits closest to the center of the row while swiping —
  // mirrors the TikTok card behavior, but picks exactly one active card at a
  // time instead of an intersection-ratio threshold that could match two
  // neighboring cards at once near the edges.
  if (isTouchDevice && photoButtons.length) {
    const photoGrid = $('.gallery-photo-grid');
    if (photoGrid) {
      let scaleRaf = null;
      const updateActivePhoto = () => {
        const gridRect = photoGrid.getBoundingClientRect();
        const gridCenter = gridRect.left + gridRect.width / 2;
        let closest = null;
        let closestDist = Infinity;
        photoButtons.forEach(button => {
          const rect = button.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const dist = Math.abs(cardCenter - gridCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closest = button;
          }
        });
        photoButtons.forEach(button => {
          button.classList.toggle('gallery-scale-active', button === closest);
        });
      };
      photoGrid.addEventListener('scroll', () => {
        if (scaleRaf) cancelAnimationFrame(scaleRaf);
        scaleRaf = requestAnimationFrame(updateActivePhoto);
      }, { passive: true });
      updateActivePhoto();
    }
  }

  let activeVideo = null;

  // Any pause() call WE trigger internally (switching videos, leaving viewport, etc.)
  // is flagged here first, so the generic 'pause' listener below can tell it apart
  // from a pause the person actually chose (native controls, our own toggle, a
  // pause inside fullscreen). Only genuine user pauses set `userPaused`, which is
  // what stops the IntersectionObserver from silently resuming playback afterward.
  const markAutoPause = video => { video.dataset.autoPause = 'true'; };

  const stopOtherVideos = current => {
    videos.forEach(video => {
      if (video !== current) {
        markAutoPause(video);
        video.pause();
        video.dataset.hoverPlaying = 'false';
        if (video.closest('.tiktok-embed')?.classList.contains('is-active')) {
          video.closest('.tiktok-embed').classList.remove('is-active');
        }
      }
    });
    activeVideo = current || activeVideo;
  };

  const tryPlayWithSound = async video => {
    if (!video) return false;
    stopOtherVideos(video);

    // Try the requested behavior first: hover/viewport playback with audio.
    video.muted = false;
    try {
      await video.play();
      return true;
    } catch (error) {
      // Browsers commonly block autoplay with sound. Fall back to muted autoplay.
      video.muted = true;
      try {
        await video.play();
        return true;
      } catch (fallbackError) {
        return false;
      }
    }
  };

  const pauseVideo = (video, keepFrame = true, auto = true) => {
    if (!video) return;
    if (auto) markAutoPause(video);
    video.pause();
    if (!keepFrame) video.currentTime = 0;
    video.dataset.hoverPlaying = 'false';
    const card = video.closest('.tiktok-embed');
    card?.classList.remove('is-active');
    if (activeVideo === video) activeVideo = null;
  };

  videos.forEach((video, index) => {
    const card = cards[index];
    if (!card) return;
    video.dataset.userPaused = 'false';
    video.dataset.hoverPlaying = 'false';

   // Explicit click on the media toggles playback. Native control clicks remain native.
    video.addEventListener('click', event => {
      // A click that starts/stops the HTML5 player must never navigate away.
      event.stopPropagation();
      if (video.paused) {
        video.dataset.userPaused = 'false';
        video.muted = false;
        tryPlayWithSound(video);
      } else {
        video.dataset.userPaused = 'true';
        pauseVideo(video, true);
      }
    });

    // Double click on the media enters fullscreen for this card.
    video.addEventListener('dblclick', event => {
      event.stopPropagation();
      event.preventDefault();
      enterFullscreenForCard(card);
    });

    video.addEventListener('play', () => {
      card.classList.add('is-active');
      activeVideo = video;
      video.dataset.userPaused = 'false';
    });
    video.addEventListener('pause', () => {
      card.classList.remove('is-active');
      if (activeVideo === video) activeVideo = null;
      if (video.dataset.autoPause === 'true') {
        // We paused this ourselves (switching cards, scrolling it out of view) —
        // it's still eligible to auto-resume later.
        video.dataset.autoPause = 'false';
      } else {
        // The person paused it directly — native controls, our click toggle, or
        // the fullscreen player's own pause button. Respect it: don't let the
        // IntersectionObserver below silently restart playback.
        video.dataset.userPaused = 'true';
      }
    });

    // Desktop: hover preview. Manual pause blocks replay until the pointer leaves.
    // Skipped while fullscreen is active — the Prev/Next/Close buttons are
    // hoisted to <body> so they sit outside this card in the DOM, and moving
    // the cursor onto them was triggering this same mouseleave/pause logic
    // meant for the grid view.
    card.addEventListener('mouseenter', () => {
      if (document.body.classList.contains('tiktok-fs-mode')) return;
      if (window.matchMedia('(pointer:fine)').matches && video.dataset.userPaused !== 'true') {
        video.dataset.hoverPlaying = 'true';
        tryPlayWithSound(video);
      }
    });

    card.addEventListener('mouseleave', () => {
      if (document.body.classList.contains('tiktok-fs-mode')) return;
      if (window.matchMedia('(pointer:fine)').matches) {
        pauseVideo(video, true);
        video.dataset.userPaused = 'false';
      }
    });

    // If a separate native control/link receives the click, do not let the card act as a link.
    card.addEventListener('click', event => {
      if (event.target.closest('.tiktok-open-link')) return;
      event.stopPropagation();
    });
  });

  // Touch-only custom play/pause button — always centered on its own card,
  // regardless of scroll position, since it's positioned relative to the card itself.
  if (isTouchDevice) {
    cards.forEach((card, index) => {
      const video = videos[index];
      const btn = card.querySelector('.tiktok-playpause-btn');
      if (!btn || !video) return;

      const iconPlay = btn.querySelector('.icon-play');
      const iconPause = btn.querySelector('.icon-pause');
      const syncIcon = () => {
        iconPlay.hidden = !video.paused;
        iconPause.hidden = video.paused;
        btn.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      };
      syncIcon();
      video.addEventListener('play', syncIcon);
      video.addEventListener('pause', syncIcon);

      btn.addEventListener('click', event => {
        event.stopPropagation();
        if (video.paused) {
          video.dataset.userPaused = 'false';
          video.muted = false;
          tryPlayWithSound(video);
        } else {
          video.dataset.userPaused = 'true';
          pauseVideo(video, true);
        }
      });
    });
  }

  // Mobile/tablet: play the card nearest the viewport center; pause cards that leave view.
  // Also scales the active card up to cover its neighbors, and restores the
  // previous card automatically — driven purely by scroll position, no tap needed.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        const card = video.closest('.tiktok-embed');
        const isActive = entry.isIntersecting && entry.intersectionRatio >= 0.62;

        if (isTouchDevice && card) {
          card.classList.toggle('tiktok-scale-active', isActive);
        }

        if (!isActive) {
          pauseVideo(video, true);
          return;
        }

        if (!window.matchMedia('(pointer:fine)').matches && video.dataset.userPaused !== 'true') {
          tryPlayWithSound(video);
        }
      });
    }, {
      threshold: [0, 0.62, 0.85],
      rootMargin: '-15% 0px -15% 0px'
    });

    videos.forEach(video => observer.observe(video));
  }

  // ------------------------------------------------------------------------
  // Fullscreen: dedicated expand button fullscreens the CARD (not the bare
  // <video>), so our own Prev/Next/Close buttons — siblings inside that same
  // card — stay on top and visible while the browser is in fullscreen mode.
  // The video's native fullscreen control is hidden via controlsList so the
  // person always ends up in this overlay-equipped fullscreen, not the plain
  // browser one. Browsers that ignore controlsList (Firefox, Safari) still
  // fall back gracefully to native fullscreen without our overlay.
  // ------------------------------------------------------------------------
  const getFsElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  const requestFs = el => (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  const exitFs = () => (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);

  // Nothing is ever moved in the DOM here — that was what caused the video
  // to reload (and silently refuse to play) every time it changed. Instead
  // we fullscreen the whole page once, then use a CSS class to visually
  // blow up whichever card is "active". Switching videos is just a class
  // swap, so it's instant and the video never stops.
  const fsBackdrop = document.createElement('div');
  fsBackdrop.className = 'tiktok-fs-backdrop';
  document.body.appendChild(fsBackdrop);

  let currentFsCard = null;

  // Any ancestor with a transform (the GSAP scroll-reveal wrapper leaves one
  // behind permanently after it animates in) becomes the containing block
  // for position:fixed descendants — the card stops being fixed relative to
  // the viewport and instead sits inside that ancestor's box, which is why
  // the screen went black while the video kept playing (audio only).
  // Stripping transform off every ancestor while fullscreen is active fixes it.
  const FS_BREAK_CLASS = 'tiktok-fs-break-stacking';
  let fsAncestors = [];

  const clearFsAncestors = () => {
    fsAncestors.forEach(el => el.classList.remove(FS_BREAK_CLASS));
    fsAncestors = [];
  };

  const markFsAncestors = card => {
    clearFsAncestors();
    let el = card.parentElement;
    while (el && el !== document.body) {
      el.classList.add(FS_BREAK_CLASS);
      fsAncestors.push(el);
      el = el.parentElement;
    }
  };

  // Even as position:fixed, the Prev/Next/Close overlay can still get
  // clipped by an ancestor's overflow box while nested deep in the page
  // (grid > scroll-wrap > section) — that's what was cropping the buttons
  // at the video's edge instead of the true screen edge. Moving the overlay
  // to be a direct child of <body> while active sidesteps every ancestor
  // entirely. We only move this empty overlay div, never the <video>
  // itself, so playback is never interrupted.
  let hoistedControls = null;

  const hoistControls = card => {
    const controls = card.querySelector('.tiktok-fs-controls');
    if (!controls) return;
    controls.classList.add('tiktok-fs-controls-active');
    document.body.appendChild(controls);
    hoistedControls = { controls, originalCard: card };
  };

  const unhoistControls = () => {
    if (!hoistedControls) return;
    hoistedControls.controls.classList.remove('tiktok-fs-controls-active');
    hoistedControls.originalCard.appendChild(hoistedControls.controls);
    hoistedControls = null;
  };

  const setActiveFsCard = card => {
    unhoistControls();
    cards.forEach(c => c.classList.toggle('tiktok-fs-active-card', c === card));
    currentFsCard = card;
    markFsAncestors(card);
    hoistControls(card);
  };

  const enterFullscreenForCard = card => {
    const video = card.querySelector('.tiktok-video');
    if (!video) return;
    document.body.classList.add('tiktok-fs-mode');
    setActiveFsCard(card);
    requestFs(document.documentElement);
    video.dataset.userPaused = 'false';
    video.muted = false;
    tryPlayWithSound(video);
  };

  const switchFullscreenVideo = direction => {
    if (!document.body.classList.contains('tiktok-fs-mode') || !currentFsCard) return;
    const currentIndex = cards.indexOf(currentFsCard);
    const nextCard = cards[(currentIndex + direction + cards.length) % cards.length];
    if (!nextCard) return;

    const outgoingVideo = currentFsCard.querySelector('.tiktok-video');
    if (outgoingVideo) pauseVideo(outgoingVideo, true);

    setActiveFsCard(nextCard);
    const nextVideo = nextCard.querySelector('.tiktok-video');
    if (nextVideo) {
      nextVideo.dataset.userPaused = 'false';
      nextVideo.muted = false;
      tryPlayWithSound(nextVideo);
    }
  };

  cards.forEach(card => {
    const expandBtn = card.querySelector('.tiktok-expand-btn');
    const closeBtn = card.querySelector('.tiktok-fs-close');
    const prevBtn = card.querySelector('.tiktok-fs-prev');
    const nextBtn = card.querySelector('.tiktok-fs-next');

    expandBtn?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      enterFullscreenForCard(card);
    });
    closeBtn?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      exitFs();
    });
    prevBtn?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      switchFullscreenVideo(-1);
    });
    nextBtn?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      switchFullscreenVideo(1);
    });
  });

  const onFullscreenChange = () => {
    if (!getFsElement()) {
      // Real fullscreen actually ended (Close button, Escape, browser UI).
      document.body.classList.remove('tiktok-fs-mode');
      const video = currentFsCard?.querySelector('.tiktok-video');
      if (video) pauseVideo(video, true);
      cards.forEach(c => c.classList.remove('tiktok-fs-active-card'));
      currentFsCard = null;
      clearFsAncestors();
      unhoistControls();
    }
  };
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);

  // Keyboard support while a TikTok card is fullscreen: Left/Right switches
  // videos, Escape exits. Browsers already exit fullscreen on Escape by
  // default, so we only need to wire up the arrow keys here.
  document.addEventListener('keydown', event => {
    if (!document.body.classList.contains('tiktok-fs-mode')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      switchFullscreenVideo(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      switchFullscreenVideo(1);
    } else if (event.key === 'Escape') {
      exitFs();
    }
  });

  // `playsinline` still prevents a normal tap/click from forcing fullscreen on mobile;
  // the expand button above is the only intentional fullscreen entry point.
})();
