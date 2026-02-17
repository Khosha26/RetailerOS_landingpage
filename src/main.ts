import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// SCROLL SEQUENCE ANIMATION
// ==========================================
// ==========================================
// SCROLL SEQUENCE ANIMATION
// ==========================================
const initScrollAnimation = () => {
  const canvas = document.getElementById("frame-canvas") as HTMLCanvasElement;
  const context = canvas?.getContext("2d");

  if (!canvas || !context) return;

  // Configuration
  const frameCount = 151;
  const currentFrame = { index: 0 };
  const images: HTMLImageElement[] = [];

  // Set canvas dimensions to match window for high DPI
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas(); // Initial call

  // Preload images
  const getFrameUrl = (index: number) => {
    // New indices start at 1000
    const fileIndex = 1000 + index;
    const folder = encodeURIComponent("FINAL image sequence landscape");
    return `/${folder}/${fileIndex}.jpg?v=2`;
  };

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);
    images.push(img);
  }

  // Render function (Single Layer)
  const render = () => {
    const img = images[currentFrame.index];
    if (img && img.complete) {
      // Calculate aspect ratio for COVER fit
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);

      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
      );
    }
  };

  // Initial render of first frame once loaded
  images[0].onload = render;

  // GSAP Timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#immersive-wrapper",
      start: "top top",
      end: "+=2500", /* Increased for full video playback before fade */
      scrub: 0.5,
      pin: true,
      onUpdate: () => { }
    }
  });

  // 1. Fade out Hero Content immediately
  tl.to(".hero__content, #hero-scroll", {
    opacity: 0,
    y: -50,
    scale: 0.95,
    duration: 0.1,
    ease: "power1.out"
  }, 0);



  // 2. Animate frame index (runs for most of scroll)
  tl.to(currentFrame, {
    index: frameCount - 1,
    roundProps: "index",
    ease: "none",
    onUpdate: render,
    duration: 0.8
  }, 0);

  // 3. Narrative Overlays Sync
  const overlay1 = document.getElementById("overlay-1");
  const overlay2 = document.getElementById("overlay-2");

  if (overlay1 && overlay2) {
    // Show Overlay 1 (Foundation) - Earlier
    tl.to(overlay1, {
      opacity: 1,
      y: 0,
      duration: 0.1,
      onStart: () => overlay1.classList.add("active"),
      onReverseComplete: () => overlay1.classList.remove("active")
    }, 0.10);

    // Hide Overlay 1
    tl.to(overlay1, {
      opacity: 0,
      y: -30,
      duration: 0.05
    }, 0.30);

    // Show Overlay 2 (16 Modules) - Earlier (Closes gap)
    tl.fromTo(overlay2,
      {
        opacity: 0,
        x: -100,
        yPercent: -50
      },
      {
        opacity: 1,
        x: 0,
        yPercent: -50,
        duration: 0.1,
        ease: "power2.out",
        onStart: () => overlay2.classList.add("active"),
        onReverseComplete: () => overlay2.classList.remove("active")
      },
      0.40 // Start after Overlay 1
    );

    // Hide Overlay 2 before transition
    tl.to(overlay2, {
      opacity: 0,
      x: -30,
      duration: 0.1,
      ease: "power2.in"
    }, 0.75); // Ensure it exits before video ends (0.8)
  }

  // 4. PREPARE THEME TRANSITION (Dark -> Light)
  const nav = document.getElementById("nav");
  const transitionStart = 0.75; // Overlap video end slightly for fog effect

  // Switch Nav to Light Mode
  tl.to({}, {
    duration: 0.01,
    onStart: () => nav?.classList.add("nav--light"),
    onReverseComplete: () => nav?.classList.remove("nav--light")
  }, transitionStart);

  // Fade Out Dark Canvas (Reveals White Page BG)
  tl.to("#frame-canvas", {
    opacity: 0,
    duration: 0.15,
    ease: "power2.inOut"
  }, transitionStart);

  // Fade In Transition Overlay (Soft White Gradient)
  tl.to("#theme-transition", {
    opacity: 1,
    duration: 0.15,
    ease: "power2.inOut"
  }, transitionStart);




  // 5. ANIMATE FEATURES ENTRY TEXT (Text also should appear)
  // Bring it in dynamically as Overlay 2 fades out.
  tl.to(".features .section-tag, .features .section-title, .features .section-desc", {
    opacity: 1,
    y: 0,
    duration: 0.15,
    stagger: 0.05,
    ease: "power2.out"
  }, transitionStart);

};

// ==========================================
// FEATURES SHOWCASE ANIMATION (Intro -> Monitor)
// ==========================================
const initFeaturesShowcase = () => {
  const pinWrapper = document.querySelector(".features__pinned-wrapper");
  const intro = document.querySelector(".features__intro");
  const showcase = document.querySelector(".features__showcase");
  const monitor = document.querySelector(".features__monitor-wrap");
  const details = document.querySelector(".features__details-wrap");

  if (!pinWrapper) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pinWrapper,
      start: "top top", // Pin immediately
      end: "+=2000", // Increased scroll distance for sequence
      pin: true,
      scrub: 1,
      preventOverlaps: true,
      fastScrollEnd: true
    }
  });

  // 1. HOLD Intro at Center
  tl.to({}, { duration: 1 });

  // 2. Intro Fades Out (Clean exit)
  if (intro) {
    tl.to(intro, {
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: "power2.inOut"
    });
  }

  // 3. Showcase Enters (Container visible)
  if (showcase) {
    tl.set(showcase, { opacity: 1 });
  }

  // 4. Split Screen Entry (Monitor Left, Details Right)
  // Start THIS animation 0.5s before the text finishes fading out ("-=0.5")
  if (monitor && details) {
    tl.to([monitor, details], {
      x: 0,
      opacity: 1,
      duration: 1.5,
      stagger: 0.2,
      ease: "power2.out"
    }, "-=0.5");
  }

  // 5. Hold Final State
  tl.to({}, { duration: 2 });
};


// ==========================================
// UI INTERACTIONS & REVEALS
// ==========================================
const initUI = () => {
  // 1. Mobile Menu Toggle
  const hamburger = document.getElementById("nav-hamburger");
  const mobileMenu = document.getElementById("nav-mobile-menu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isActive = mobileMenu.classList.contains("active");
      if (isActive) {
        mobileMenu.classList.remove("active");
        // Animate hamburger back
        gsap.to(hamburger.children[0], { rotate: 0, y: 0 });
        gsap.to(hamburger.children[1], { opacity: 1 });
        gsap.to(hamburger.children[2], { rotate: 0, y: 0 });
      } else {
        mobileMenu.classList.add("active");
        // Animate hamburger to X
        gsap.to(hamburger.children[0], { rotate: 45, y: 7 });
        gsap.to(hamburger.children[1], { opacity: 0 });
        gsap.to(hamburger.children[2], { rotate: -45, y: -7 });
      }
    });
  }

  // 2. Sticky Nav Background - Removed (Handled by GSAP ScrollTrigger in initScrollAnimation)

  // Dark Theme Trigger for Modules Section
  // (Switch to transparent nav when in dark section)
  ScrollTrigger.create({
    trigger: ".modules",
    start: "top 20%",
    end: "bottom 20%",
    onEnter: () => document.getElementById("nav")?.classList.remove("nav--light"),
    onLeave: () => document.getElementById("nav")?.classList.add("nav--light"),
    onEnterBack: () => document.getElementById("nav")?.classList.remove("nav--light"),
    onLeaveBack: () => document.getElementById("nav")?.classList.add("nav--light")
  });

  // 3. Scroll Reveal Elements (Intersection Observer)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  // Select elements to reveal (EXCLUDING feature-card for custom GSAP anim)
  const revealElements = document.querySelectorAll('.module-card, .hiw__step, .pricing-card, .modules .section-header, .hiw .section-header, .pricing .section-header');
  revealElements.forEach((el, index) => {
    // Add base class for animation
    el.classList.add('reveal-up');
    (el as HTMLElement).style.transitionDelay = `${(index % 3) * 0.1}s`;
    observer.observe(el);
  });

  // Custom GSAP Animation for Feature Cards (Slide in from Right)
  gsap.from(".feature-card", {
    x: 100,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".features__grid",
      start: "top 85%", // Start when grid is near viewport bottom
      toggleActions: "play none none reverse"
    }
  });

  // 5. Features -> Modules Layered Transition
  // Pin Features section so Modules slides/fades over it
  const modulesSection = document.querySelector(".modules");
  if (modulesSection) {
    ScrollTrigger.create({
      trigger: ".features",
      start: "bottom bottom",
      pin: true,
      pinSpacing: false, // Allow modules to scroll over
      scrub: true,
      // Keep pinned until modules section has scrolled past
      end: () => `+=${modulesSection.clientHeight}`
    });

    // Animate Modules Entry
    gsap.fromTo(".modules",
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".modules",
          start: "top bottom", // Start when top of modules hits bottom of viewport
          end: "center center", // Full opacity by center
          scrub: true
        }
      }
    );
  }

  // 6. Modules -> How It Works Layered Transition
  const hiwSection = document.querySelector(".hiw");
  if (hiwSection) {
    const pinDuration = window.innerWidth < 768 ? "+=80%" : "+=150%";

    // 1. Pin Modules (The Stage)
    ScrollTrigger.create({
      trigger: ".modules",
      start: "bottom bottom",
      pin: true,
      pinSpacing: false, // Allows HIW to slide over
      scrub: true,
      end: pinDuration
    });

    // 2. Dim Modules Background (Cinematic Fade)
    gsap.to(".modules", {
      filter: "brightness(0.6)", // Dim the stage
      scale: 0.95, // Subtle recession
      ease: "none",
      scrollTrigger: {
        trigger: ".modules",
        start: "bottom bottom",
        end: pinDuration,
        scrub: true
      }
    });

    // 3. Animate HIW Entry
    gsap.fromTo(".hiw",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".hiw",
          start: "top 95%", // Start slightly before it enters
          end: "top 60%", // Fast fade in
          scrub: true
        }
      }
    );
  }
};

// ==========================================
// INITIALIZATION
// ==========================================
window.addEventListener("load", () => {
  initScrollAnimation();
  initFeaturesShowcase();

  initUI();
  console.log("RetailerOS Premium Landing Page Initialized");
});
