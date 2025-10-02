/**
 * Initializes Lenis smooth scroll only on desktop devices
 * Uses the same mobile detection and configuration as the main codebase
 * Compatible with GSAP animations
 */
gsap.registerPlugin(ScrollTrigger, SplitText);

const MOBILE_SCROLLER = ".page_wrap";

/**
 * Mobile detection function from the main codebase
 */
window.isMobile = function () {
  let userAgentCheck = false;

  if (navigator.userAgentData && navigator.userAgentData.mobile !== undefined) {
    userAgentCheck = navigator.userAgentData.mobile;
  } else {
    userAgentCheck =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
  }

  return userAgentCheck;
};

function getScrollContainer() {
  if (isMobile()) {
    return (
      document.querySelector(`${MOBILE_SCROLLER}`) ||
      document.querySelector("main") ||
      window
    );
  }
  return window;
}

class DesktopScrollManager {
  constructor() {
    this.lenis = null;
    this.resizeTimeout = null;
    this.init();
  }

  /**
   * Determines if Lenis should be active based on mobile detection
   * Uses the same logic as the main codebase
   */
  shouldEnableScroll() {
    // Use the same mobile detection as the main codebase
    return !isMobile();
  }

  /**
   * Apply mobile classes and viewport handling like the main codebase
   */
  configureMobileSettings() {
    if (isMobile()) {
      document.body.classList.add("disable-cursor", "viewport-mobile");

      if (document.body.classList.contains("enable-lenis")) {
        document.body.classList.replace("enable-lenis", "fixed-viewport");
      } else {
        document.body.classList.add("fixed-viewport");
      }

      this.updateViewportHeight();
    } else {
      document.body.classList.remove(
        "disable-cursor",
        "viewport-mobile",
        "fixed-viewport"
      );
      document.body.classList.add("enable-lenis");
    }
  }

  /**
   * Update viewport height for mobile devices (from main codebase)
   */
  updateViewportHeight() {
    if (isMobile()) {
      document.documentElement.style.setProperty(
        "--dvh",
        `${window.innerHeight / 100}px`
      );
      document.documentElement.style.setProperty(
        "--dvw",
        `${window.innerWidth / 100}px`
      );
    }
  }

  /**
   * Initializes Lenis smooth scroll
   */
  initLenis() {
    if (typeof Lenis === "undefined") {
      console.warn("Lenis is not loaded. Please include Lenis library.");
      return;
    }

    // Only initialize if not mobile
    if (isMobile()) {
      console.log("Lenis disabled on mobile device");
      return;
    }

    this.lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -9 * t)), // Same as main codebase
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // GSAP ScrollTrigger integration (same as main codebase)
    if (
      typeof gsap !== "undefined" &&
      gsap.registerPlugin &&
      typeof ScrollTrigger !== "undefined"
    ) {
      // Define a RAF function for Lenis and ScrollTrigger update (from main codebase)
      function raf(time) {
        this.lenis.raf(time);
        ScrollTrigger.update();
        requestAnimationFrame(raf.bind(this));
      }
      requestAnimationFrame(raf.bind(this));

      // Stop Lenis initially like the main codebase
      //   this.lenis.stop();

      // Start Lenis after a delay (like main codebase)
      //   gsap.delayedCall(1, () => {
      //     if (this.lenis) {
      //       this.lenis.start();

      //     }
      //   });
    }

    console.log("Lenis smooth scroll initialized for desktop");
  }

  /**
   * Destroys Lenis instance
   */
  destroyLenis() {
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
      console.log("Lenis smooth scroll destroyed");
    }
  }

  /**
   * Handles window resize with debouncing
   */
  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      // Update viewport height on resize for mobile
      this.updateViewportHeight();
      this.configureMobileSettings();

      const shouldEnable = this.shouldEnableScroll();

      if (shouldEnable && !this.lenis) {
        this.initLenis();
      } else if (!shouldEnable && this.lenis) {
        this.destroyLenis();
      }

      // Refresh ScrollTrigger after configuration changes
      ScrollTrigger.refresh();
    }, 250);
  }

  /**
   * Main initialization function
   */
  init() {
    // Configure mobile settings first
    this.configureMobileSettings();

    // Initial check and setup
    if (this.shouldEnableScroll()) {
      this.initLenis();
    }

    // Listen for resize events
    window.addEventListener("resize", () => this.handleResize());

    // Listen for orientation change (mobile/tablet)
    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.handleResize(), 100);
    });

    // Update viewport height on mobile initially
    if (isMobile()) {
      window.addEventListener("resize", () => {
        this.updateViewportHeight();
      });
    }

    console.log(`Desktop Scroll Manager initialized:
        - Screen width: ${window.innerWidth}px
        - Is mobile device: ${isMobile()}
        - Lenis enabled: ${!!this.lenis}
        - Body classes: ${document.body.className}`);
  }

  /**
   * Public method to manually refresh the scroll state
   */
  refresh() {
    const shouldEnable = this.shouldEnableScroll();

    if (shouldEnable && !this.lenis) {
      this.initLenis();
    } else if (!shouldEnable && this.lenis) {
      this.destroyLenis();
    }

    ScrollTrigger.refresh();
    this.configureMobileSettings();
  }

  /**
   * Get current Lenis instance
   */
  getLenisInstance() {
    return this.lenis;
  }

  /**
   * Check if smooth scroll is currently active
   */
  isActive() {
    return !!this.lenis;
  }

  /**
   * Check if running on mobile (public method)
   */
  isMobile() {
    return isMobile();
  }
}

/**
 * Generalized ScrollTrigger Animation System
 * Automatically adjusts for mobile/desktop configurations
 */
class ScrollAnimationManager {
  constructor() {
    this.animations = new Map();
    this.initAnimations();
  }

  /**
   * Animation configurations
   * Each animation type has its own setup function
   */
  getAnimationConfigs() {
    return {
      "text-reveal": this.setupTextReveal.bind(this),
      "text-reveal-story": this.setupTextRevealStory.bind(this),
      "fade-in": this.setupFadeIn.bind(this),
      "slide-up": this.setupSlideUp.bind(this),
      "slide-left": this.setupSlideLeft.bind(this),
      "slide-right": this.setupSlideRight.bind(this),
      "scale-in": this.setupScaleIn.bind(this),
      "rotate-in": this.setupRotateIn.bind(this),
      "stagger-children": this.setupStaggerChildren.bind(this),
      "horizontal-scroll": this.setupHorizontalScroll.bind(this),
      "image-parallax": this.setupImageParallax.bind(this),
    };
  }

  /**
   * Parse data attributes and extract animation settings
   */
  parseAnimationData(element) {
    const dataset = element.dataset;
    const config = {
      type: dataset.scrollAnimation || null,
      trigger: dataset.scrollTrigger || "top 80%",
      end: dataset.scrollEnd || "bottom 20%",
      scrub: dataset.scrollScrub === "true",
      duration: parseFloat(dataset.scrollDuration) || 1,
      delay: parseFloat(dataset.scrollDelay) || 0,
      stagger: parseFloat(dataset.scrollStagger) || 0.1,
      ease: dataset.scrollEase || "power2.out",
      toggleActions: dataset.scrollToggle || "play none none none",
      splitType: dataset.scrollSplit || "words",
      once: dataset.scrollOnce === "true",
      items: dataset.scrollItems || ".w-dyn-item",
      heightMultiplier: parseFloat(dataset.scrollHeightMultiplier) || 50,
      parallaxAmount: parseFloat(dataset.scrollParallaxAmount) || 50,
    };

    return config;
  }

  /**
   * Get the appropriate scroller for ScrollTrigger based on mobile detection
   */

  /**
   * Text reveal animation (adapted for mobile/desktop)
   */
  setupTextReveal(element, config) {
    const split = new SplitText(element, {
      type: config.splitType,
      wordsClass: "scroll-word",
      charsClass: "scroll-char",
      linesClass: "scroll-line",
    });

    const targets =
      config.splitType === "words"
        ? split.words
        : config.splitType === "chars"
        ? split.chars
        : split.lines;

    gsap.set(targets, { opacity: 0.3 });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: config.trigger,
        end: config.end,
        scrub: config.scrub || 1,
        toggleActions: config.toggleActions,
        once: config.once,
      },
    });

    targets.forEach((target, index) => {
      timeline.to(
        target,
        {
          opacity: 1,
          duration: config.duration,
          ease: config.ease,
        },
        index * config.stagger
      );
    });
  }

  /**
   * Text reveal animation for story sections
   * Uses the nearest parent .story_scroller as the trigger
   */
  setupTextRevealStory(element, config) {
    // Ensure we have a valid DOM element
    if (!element || typeof element.closest !== "function") {
      console.error("Invalid element passed to setupTextRevealStory:", element);
      return;
    }

    // Find the nearest parent .story_scroller
    const storyScroller = element.closest(".story_section");

    if (!storyScroller) {
      console.warn(
        "No parent .story_scroller found for text-reveal-story animation, falling back to regular text-reveal"
      );
      return this.setupTextReveal(element, config);
    }

    // Split the text
    const split = new SplitText(element, {
      type: config.splitType,
      wordsClass: "scroll-word",
      charsClass: "scroll-char",
      linesClass: "scroll-line",
    });

    const targets =
      config.splitType === "words"
        ? split.words
        : config.splitType === "chars"
        ? split.chars
        : split.lines;

    gsap.set(targets, { opacity: 0.3 });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: storyScroller, // Use the parent story_scroller as trigger
        start: config.trigger,
        end: config.end,
        // markers: true,
        scrub: config.scrub || 1,
        toggleActions: config.toggleActions,
        once: config.once,
      },
    });

    targets.forEach((target, index) => {
      timeline.to(
        target,
        {
          opacity: 1,
          duration: config.duration,
          ease: "power4.inOut",
        },
        index * config.stagger
      );
    });

    console.log(
      "Applied text-reveal-story animation with trigger:",
      storyScroller
    );
  }

  /**
   * Create base ScrollTrigger config with appropriate scroller
   */
  createScrollTriggerConfig(element, config) {
    return {
      trigger: element,
      start: config.trigger,
      end: config.end,
      scrub: config.scrub,
      toggleActions: config.toggleActions,
      once: config.once,
    };
  }

  /**
   * Horizontal scroll Animation
   */

  setupHorizontalScroll(element, config) {
    // Run only on desktop
    if (isMobile()) {
      return;
    }

    // Get the first matching item
    const firstItem = element.querySelector(config.items);

    if (!firstItem) {
      console.warn("No items found for horizontal scroll animation");
      return;
    }

    // Use its parent as the list container
    const listContainer = firstItem.parentElement;

    const items = listContainer.querySelectorAll(config.items);

    if (items.length === 0) {
      console.warn("No items found for horizontal scroll animation");
      return;
    }

    // Calculate and set the scroller height
    const calculatedHeight = items.length * config.heightMultiplier;
    element.style.height = `${calculatedHeight}svh`;

    // Calculate scroll distance
    const visibleWidth = element.offsetWidth;
    const wrapperWidth = listContainer.scrollWidth;
    const totalScrollDistance = wrapperWidth - visibleWidth;

    // Create the horizontal scroll animation
    const scrollAnimation = gsap.to(listContainer, {
      x: -totalScrollDistance,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top top",
        end: "bottom-=2.5rem bottom",
        // markers: true,
        invalidateOnRefresh: true,
        scrub: true,
      },
    });

    ScrollTrigger.refresh();

    console.log(`Applied horizontal scroll animation:`, {
      visibleWidth,
      wrapperWidth,
      totalScrollDistance,
    });
  }
  /**
   * Fade in animation
   */
  setupFadeIn(element, config) {
    gsap.set(element, { opacity: 0 });

    gsap.to(element, {
      opacity: 1,
      duration: config.duration,
      delay: config.delay,
      ease: config.ease,
      scrollTrigger: this.createScrollTriggerConfig(element, config),
    });
  }

  /**
   * Slide up animation
   */
  setupSlideUp(element, config) {
    gsap.set(element, { y: 30, opacity: 0 });

    gsap.to(element, {
      y: 0,
      opacity: 1,
      duration: config.duration,
      delay: config.delay,
      ease: config.ease,
      scrollTrigger: this.createScrollTriggerConfig(element, config),
    });
  }

  /**
   * Slide left animation
   */
  setupSlideLeft(element, config) {
    gsap.set(element, { x: 100, opacity: 0 });

    gsap.to(element, {
      x: 0,
      opacity: 1,
      duration: config.duration,
      delay: config.delay,
      ease: config.ease,
      scrollTrigger: this.createScrollTriggerConfig(element, config),
    });
  }

  /**
   * Slide right animation
   */
  setupSlideRight(element, config) {
    gsap.set(element, { x: -100, opacity: 0 });

    gsap.to(element, {
      x: 0,
      opacity: 1,
      duration: config.duration,
      delay: config.delay,
      ease: config.ease,
      scrollTrigger: this.createScrollTriggerConfig(element, config),
    });
  }

  /**
   * Scale in animation
   */
  setupScaleIn(element, config) {
    gsap.set(element, { scale: 0, opacity: 0 });

    gsap.to(element, {
      scale: 1,
      opacity: 1,
      duration: config.duration,
      delay: config.delay,
      ease: config.ease,
      scrollTrigger: this.createScrollTriggerConfig(element, config),
    });
  }

  /**
   * Rotate in animation
   */
  setupRotateIn(element, config) {
    gsap.set(element, {
      rotation: 180,
      opacity: 0,
      transformOrigin: "center center",
    });

    gsap.to(element, {
      rotation: 0,
      opacity: 1,
      duration: config.duration,
      delay: config.delay,
      ease: config.ease,
      scrollTrigger: this.createScrollTriggerConfig(element, config),
    });
  }

  /**
   * Stagger children animation
   */
  setupStaggerChildren(element, config) {
    const children = element.children;
    gsap.set(children, { y: 50, opacity: 0 });

    gsap.to(children, {
      y: 0,
      opacity: 1,
      duration: config.duration,
      stagger: config.stagger,
      delay: config.delay,
      ease: config.ease,
      scrollTrigger: this.createScrollTriggerConfig(element, config),
    });
  }

  /**
   * Image parallax animation
   * Translates the image as you scroll through the viewport
   * Use data-scroll-parallax-amount to control translation amount (positive or negative)
   */
  setupImageParallax(element, config) {
    const parallaxAmount = config.parallaxAmount;

    gsap.to(element, {
      y: parallaxAmount,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: config.trigger,
        end: config.end,
        scrub: config.scrub !== false ? (config.scrub === true ? 1 : config.scrub) : false,
        toggleActions: config.toggleActions,
        once: config.once,
      },
    });

    console.log(`Applied image-parallax animation with amount: ${parallaxAmount}px`);
  }

  /**
   * Initialize all animations
   */
  // initAnimations() {
  //   const animationConfigs = this.getAnimationConfigs();
  //   const elementsWithAnimations = document.querySelectorAll(
  //     "[data-scroll-animation]"
  //   );

  //   elementsWithAnimations.forEach((element, index) => {
  //     const config = this.parseAnimationData(element);
  //     const animationSetup = animationConfigs[config.type];

  //     if (animationSetup) {
  //       try {
  //         animationSetup(element, config);
  //         this.animations.set(`animation-${index}`, { element, config });
  //         console.log(`Applied ${config.type} animation to:`, element);
  //       } catch (error) {
  //         console.warn(`Failed to apply ${config.type} animation:`, error);
  //       }
  //     } else {
  //       console.warn(`Unknown animation type: ${config.type}`);
  //     }
  //   });
  // }

  async initAnimations() {
    const animationConfigs = this.getAnimationConfigs();
    const elementsWithAnimations = document.querySelectorAll(
      "[data-scroll-animation]"
    );

    console.log(
      `Initializing ${elementsWithAnimations.length} scroll animations...`
    );

    // Process all animations
    const animationPromises = Array.from(elementsWithAnimations).map(
      async (element, index) => {
        return new Promise((resolve) => {
          const config = this.parseAnimationData(element);

          // Skip if no animation type is specified
          if (!config.type) {
            console.log('Skipping element with empty data-scroll-animation:', element);
            resolve({ success: true, type: 'skipped', index, skipped: true });
            return;
          }

          const animationSetup = animationConfigs[config.type];

          if (animationSetup) {
            try {
              animationSetup(element, config);
              this.animations.set(`animation-${index}`, { element, config });
              console.log(`Applied ${config.type} animation to:`, element);
              resolve({ success: true, type: config.type, index });
            } catch (error) {
              console.warn(`Failed to apply ${config.type} animation:`, error);
              resolve({ success: false, type: config.type, index, error });
            }
          } else {
            console.warn(`Unknown animation type: ${config.type}`);
            resolve({
              success: false,
              type: config.type,
              index,
              error: "Unknown type",
            });
          }
        });
      }
    );

    // Wait for all animations to be processed
    const results = await Promise.all(animationPromises);

    // Count successful animations
    const successfulAnimations = results.filter(
      (result) => result.success
    ).length;
    const failedAnimations = results.length - successfulAnimations;

    console.log(
      `Animation setup complete: ${successfulAnimations} successful, ${failedAnimations} failed`
    );

    // Refresh ScrollTrigger after 300ms delay
    setTimeout(() => {
      ScrollTrigger.refresh();
      console.log(
        `ScrollTrigger refreshed after ${results.length} animations processed (300ms delay)`
      );
    }, 100);

    return results;
  }

  /**
   * Refresh all animations (useful after dynamic content changes)
   */
  refresh() {
    ScrollTrigger.refresh();
  }

  /**
   * Add new animation type
   */
  addAnimationType(name, setupFunction) {
    const configs = this.getAnimationConfigs();
    configs[name] = setupFunction.bind(this);
  }
}
function animateHero() {
  const heroSection = document.querySelector(".main_hero_section");
  const darkOverlay = document.querySelector(".hero_dark_overlay");
  const heroVideo = document.querySelector(".main_hero_section video");
  const navLogos = document.querySelectorAll(".nav_link_logo");

  if (!heroSection) {
    console.warn("Hero section not found");
    return;
  }

  // Create a unified timeline for all hero animations
  const heroTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: heroSection,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;

        if (progress >= 0.2) {
          // Fade out when progress reaches 20%
          navLogos.forEach((navLogo) => {
            gsap.to(navLogo, {
              opacity: 0,
              duration: 0.3,
              ease: "power2.out",
            });
          });
        } else {
          // Fade back in when progress is below 20%
          navLogos.forEach((navLogo) => {
            gsap.to(navLogo, {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          });
        }
      },
    },
  });

  // Add dark overlay animation if element exists
  if (darkOverlay) {
    heroTimeline.to(
      darkOverlay,
      {
        opacity: 0.95,
        ease: "none",
      },
      0
    ); // Start at time 0
  } else {
    console.warn("Hero dark overlay element not found");
  }

  // Add video translation animation if element exists
  if (heroVideo) {
    heroTimeline.to(
      heroVideo,
      {
        yPercent: -7.5,
        ease: "none",
      },
      0
    ); // Start at time 0 (same time as overlay)
  } else {
    console.warn("Hero video element not found");
  }

  console.log("Hero timeline animation initialized with available elements");
}

function animateScrollerHeadings() {
  const headings = document.querySelectorAll(".story_scroller h2");

  headings.forEach((heading) => {
    const split = new SplitText(heading, {
      type: "words",
      wordsClass: "word",
    });

    gsap.set(split.words, {
      opacity: 0.3,
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: heading,
        start: "top 90%",
        end: "top center",
        scrub: true,
        toggleActions: "play none none reverse",
      },
    });

    split.words.forEach((word, index) => {
      timeline.to(
        word,
        {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        index * 0.1
      );
    });
  });
}

function animateStoryScaling() {
  const storySections = document.querySelectorAll(".story_scroller");

  for (let i = 1; i < storySections.length; i++) {
    const currentSection = storySections[i];
    const previousSection = storySections[i - 1];

    ScrollTrigger.create({
      trigger: currentSection,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      animation: gsap.to(previousSection, {
        scale: 0.5,
        transformOrigin: "center center",
        ease: "none",
      }),
    });
  }
}

function initStorylineToggle() {
  const toggleButton = document.querySelector('[data-element="storyline-toggle"]');
  const wrapper = document.querySelector('[data-element="storyline-wrapper"]');

  if (!toggleButton) {
    console.warn('Storyline toggle button not found');
    return;
  }

  if (!wrapper) {
    console.warn('Storyline wrapper not found');
    return;
  }

  toggleButton.addEventListener('click', () => {
    // Toggle class on button
    toggleButton.classList.toggle('is-expanded');

    // Toggle class on wrapper
    wrapper.classList.toggle('is-expanded');

    // Refresh ScrollTrigger after DOM update
    setTimeout(() => {
      ScrollTrigger.refresh();
      console.log('ScrollTrigger refreshed after storyline toggle');
    }, 50);

    console.log('Storyline toggled:', wrapper.classList.contains('is-expanded') ? 'expanded' : 'collapsed');
  });

  console.log('Storyline toggle initialized');
}

function initNavbarAnimation() {
  const navKnob = document.querySelector(".nav_link_knob");
  const navMain = document.querySelector(".nav_main");
  const navWrap = document.querySelector(".nav_wrap");

  if (!navKnob || !navMain || !navWrap) {
    console.warn("Navbar elements not found:", {
      knob: !!navKnob,
      navMain: !!navMain,
      wrap: !!navWrap,
    });
    return;
  }

  // Store the default margin-top value
  const computedStyle = window.getComputedStyle(navMain);
  const defaultMarginTop = computedStyle.marginTop;

  console.log("Default nav_main margin-top:", defaultMarginTop);

  // Set initial state
  let isOpen = false;

  function openNavbar() {
    if (!isOpen) {
      navKnob.classList.add("is-opened");
      navWrap.classList.add("is-opened");
      gsap.to(navMain, {
        marginTop: "0px",
        duration: 0.5,
        ease: "power2.out",
      });
      isOpen = true;
      console.log("Navbar opened");
    }
  }

  function closeNavbar() {
    if (isOpen) {
      navKnob.classList.remove("is-opened");
      navWrap.classList.remove("is-opened");
      gsap.to(navMain, {
        marginTop: defaultMarginTop,
        duration: 0.5,
        ease: "power2.out",
      });
      isOpen = false;
      console.log("Navbar closed");
    }
  }

  function toggleNavbar() {
    if (!isOpen) {
      openNavbar();
    } else {
      closeNavbar();
    }
  }

  // Add click event listener
  navKnob.addEventListener("click", toggleNavbar);

  // Add hover event listeners
  navKnob.addEventListener("mouseenter", openNavbar);

  // Close navbar when leaving nav_wrap (only if it's open)
  navWrap.addEventListener("mouseleave", closeNavbar);

  console.log("Navbar animation initialized");

  // Return public methods for external control
  return {
    open: openNavbar,
    close: closeNavbar,
    toggle: toggleNavbar,
    isOpen: () => isOpen,
  };
}

// function initFooterAnimation() {
//   const footerSection = document.querySelector(".footer_section");
//   const navKnob = document.querySelector(".nav_link_knob");
//   const navLogo = document.querySelector(".nav_link_logo");
//   const navWrap = document.querySelector(".nav_wrap");

//   if (!footerSection) {
//     console.warn("Footer section not found");
//     return;
//   }

//   if (!navKnob) {
//     console.warn("Nav knob not found");
//     return;
//   }

//   if (!navLogo) {
//     console.warn("Nav logo not found");
//     return;
//   }
//   console.log(footerSection);
//   ScrollTrigger.create({
//     trigger: footerSection,
//     // start: "bottom bottom-=10",   // fire 1px earlier
//     start: "top top",
//     invalidateOnRefresh: true,
//     // markers: true,
//     onEnter: () => {
//       // Only trigger on desktop
//       if (!isMobile()) {
//         if (navWrap && !navWrap.classList.contains("is-opened")) {
//           navKnob.click(); // Triggers the existing navbar animation
//         }
//       }
//       // Fade in the logo
//       gsap.to(navLogo, {
//         opacity: 1,
//         duration: 0.5,
//         ease: "power2.out",
//       });
//     },
//     onEnterBack: () => {},
//     onLeaveBack: () => {
//       console.log("Footer going out of the view");
//       if (!isMobile()) {
//         console.log("Footer going out of the view");
//         if (navWrap && navWrap.classList.contains("is-opened")) {
//           navKnob.click(); // Triggers the existing navbar animation
//         }
//       }
//       // Check if navbar is open and close it
//       gsap.to(navLogo, {
//         opacity: 0,
//         duration: 0.5,
//         ease: "power2.out",
//       });
//     },
//   });

//   console.log("Footer animation initialized");
// }

function initFooterAnimation() {
  const footerSection = document.querySelector(".footer_section");
  const navKnob = document.querySelector(".nav_link_knob");
  const navLogos = document.querySelectorAll(".nav_link_logo");
  const navWrap = document.querySelector(".nav_wrap");
  const footerHeading = document.querySelector(
    ".footer_section [data-scroll-animation] h2"
  );

  if (!footerSection) {
    console.warn("Footer section not found");
    return;
  }

  if (!navKnob) {
    console.warn("Nav knob not found");
    return;
  }

  if (!navLogos) {
    console.warn("Nav logo not found");
    return;
  }

  if (!footerHeading) {
    console.warn("Footer heading with data-scroll-animation not found");
    return;
  }

  let headingAnimation = null;
  let isAnimationComplete = false;

  // Function to navigate to the next page
  function navigateToNextPage() {
    // Find the current active nav link
    const currentNavLink = document.querySelector(".nav_link.w--current");

    if (!currentNavLink) {
      console.warn("No current nav link found with w--current class");
      return;
    }

    // Find the parent container with all nav links
    const navLinksWrap = currentNavLink.closest(".nav_links_wrap");

    if (!navLinksWrap) {
      console.warn("Nav links wrap not found");
      return;
    }

    // Get all nav links
    const allNavLinks = navLinksWrap.querySelectorAll(".nav_link");

    // Find the index of the current link
    const currentIndex = Array.from(allNavLinks).indexOf(currentNavLink);

    if (currentIndex === -1) {
      console.warn("Current nav link not found in the list");
      return;
    }

    // Get the next link (or wrap to first if we're at the end)
    const nextIndex = (currentIndex + 1) % allNavLinks.length;
    const nextNavLink = allNavLinks[nextIndex];

    if (nextNavLink && nextNavLink.href && nextNavLink.href !== "#") {
      console.log(`Navigating from index ${currentIndex} to ${nextIndex}`);
      console.log(`Current page: ${currentNavLink.href}`);
      console.log(`Next page: ${nextNavLink.href}`);

      // Click the next nav link
      nextNavLink.click();
    } else {
      console.warn("Next nav link not found or has no valid href");
      if (nextNavLink) {
        console.log("Next link href:", nextNavLink.href);
      }
    }
  }

  // Function to setup heading animation
  function setupHeadingAnimation() {
    // Apply initial styles to heading
    gsap.set(footerHeading, {
      "--line-width": "0%",
    });

    // Create the animation timeline
    headingAnimation = gsap.timeline({
      paused: true,
      onComplete: () => {
        isAnimationComplete = true;
        navigateToNextPage();
      },
    });

    // Animate the heading itself
    const totalAnimationDuration = 10; // Total 10 seconds

    headingAnimation.to(footerHeading, {
      "--line-width": "100%",
      duration: totalAnimationDuration,
      ease: "linear",
    });

    console.log(
      `Footer heading animation setup complete with ${totalAnimationDuration}s duration`
    );
  }

  // Function to start heading animation
  function startHeadingAnimation() {
    if (headingAnimation && !isAnimationComplete) {
      headingAnimation.restart();
      console.log("Footer heading animation started");
    }
  }

  // Function to reset heading animation
  function resetHeadingAnimation() {
    if (headingAnimation) {
      headingAnimation.pause();
      headingAnimation.progress(0);
      isAnimationComplete = false;

      gsap.set(footerHeading, {
        "--line-width": "0%",
      });

      console.log("Footer heading animation reset");
    }
  }

  // Setup the heading animation initially
  setupHeadingAnimation();

  // ScrollTrigger for footer section
  ScrollTrigger.create({
    trigger: footerSection,
    start: "top top+=10",
    // markers: true,
    invalidateOnRefresh: true,
    onEnter: () => {
      console.log("footer entered")
      // Desktop behavior: open navbar then start animation
      
        // Mobile behavior: start animation immediately (no navbar interaction)
        startHeadingAnimation();

      // Fade in the logo (both desktop and mobile)
      navLogos.forEach((navLogo) => {
        gsap.to(navLogo, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    },
    onEnterBack: () => {
      // Reset animation when scrolling back up into footer
      resetHeadingAnimation();
    },
    onLeaveBack: () => {
      console.log("Footer going out of the view");

      // Fade out logo and reset animation
      navLogos.forEach((navLogo) => {
        gsap.to(navLogo, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      resetHeadingAnimation();
    },
    onLeave: () => {
      // Reset animation when leaving footer (scrolling down past it)
      resetHeadingAnimation();
    },
  });

  console.log("Footer animation initialized with heading animation");

  // Return public methods for external control
  return {
    startAnimation: startHeadingAnimation,
    resetAnimation: resetHeadingAnimation,
    isComplete: () => isAnimationComplete,
    cleanup: () => {
      if (headingAnimation) {
        headingAnimation.kill();
      }
    },
  };
}

document.addEventListener("DOMContentLoaded", function () {
  ScrollTrigger.defaults({ scroller: getScrollContainer() });

  // Initialize the animations
  animateStoryScaling();

  // Initialize the animation manager
  const scrollAnimationManager = new ScrollAnimationManager();

  // Initialize the scroll manager
  const scrollManager = new DesktopScrollManager();

  // Export for use in other scripts
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DesktopScrollManager;
  }

  // Make available globally
  window.DesktopScrollManager = DesktopScrollManager;
  window.scrollManager = scrollManager;
  animateHero();

  const navbarController = initNavbarAnimation();
  // ScrollTrigger.refresh();
  const footerController = initFooterAnimation();
  initStorylineToggle();

  // Font loading check
  // if (document.fonts) {
  //   document.fonts.ready.then(() => {
  //     setTimeout(() => ScrollTrigger.refresh(), 10000);
  //   });
  // }
});
