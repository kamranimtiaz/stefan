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

    // Calculate scroll distance
    const visibleWidth = element.offsetWidth;
    const wrapperWidth = listContainer.scrollWidth;
    const totalScrollDistance = wrapperWidth - visibleWidth;

    // Guard: Check if horizontal scroll is actually needed
    // Only apply the effect if content width exceeds visible width
    if (totalScrollDistance <= 0) {
      console.log(`Horizontal scroll skipped - not enough content (visible: ${visibleWidth}px, wrapper: ${wrapperWidth}px)`);
      return;
    }

    // Calculate and set the scroller height
    const calculatedHeight = items.length * config.heightMultiplier;
    element.style.height = `${calculatedHeight}svh`;

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
/**
 * Initialize nav logo fade in/out animation based on scroll position
 * Works on all pages (not dependent on hero section)
 */
function initNavLogoAnimation() {
  const navLogos = document.querySelectorAll(".nav_link_logo");
  const pageMain = document.querySelector(".page_main");

  if (!pageMain) {
    console.warn("page_main not found, nav logo animation skipped");
    return;
  }

  if (!navLogos || navLogos.length === 0) {
    console.warn("No nav logos found, animation skipped");
    return;
  }

  console.log("Nav logo animation setup starting...");
  console.log("- pageMain found:", pageMain);
  console.log("- navLogos found:", navLogos.length, "elements");
  console.log("- Scroll container:", getScrollContainer());

  ScrollTrigger.create({
    trigger: pageMain,
    start: "top top",
    end: "bottom bottom",
    scroller: getScrollContainer(),
    onEnter: () => {
      console.log("Nav logo ScrollTrigger: onEnter fired");
    },
    onUpdate: (self) => {
      // Get current scroll position from the correct scroller
      const scrollContainer = getScrollContainer();
      let scrollY = 0;

      if (scrollContainer === window) {
        // Desktop: use window scroll position
        scrollY = window.pageYOffset || document.documentElement.scrollTop;
      } else {
        // Mobile: use page_main scroll position
        scrollY = scrollContainer.scrollTop || 0;
      }

      console.log("Nav logo animation - scrollY:", scrollY, "| threshold: 50px");

      if (scrollY > 50) {
        // Fade out when scrolled more than 50px
        console.log("Fading OUT nav logos (scrollY > 50)");
        navLogos.forEach((navLogo) => {
          gsap.to(navLogo, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              navLogo.style.pointerEvents = "none";
            },
          });
        });
      } else {
        // Fade back in when scrolled less than 50px
        console.log("Fading IN nav logos (scrollY <= 50)");
        navLogos.forEach((navLogo) => {
          gsap.to(navLogo, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              navLogo.style.pointerEvents = "auto";
            },
          });
        });
      }
    },
  });

  console.log("Nav logo ScrollTrigger created successfully");
}

function animateHero() {
  const heroSection = document.querySelector(".main_hero_section");
  const darkOverlay = document.querySelector(".hero_dark_overlay");
  const heroVideo = document.querySelector(".main_hero_section video");

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

  // Add video translation animation for all hero-bg elements
  const heroBgElements = document.querySelectorAll('[data-element="hero-bg"]');

  if (heroBgElements.length > 0) {
    heroBgElements.forEach((bgElement) => {
      const mediaElement = bgElement.querySelector('video, img');

      if (mediaElement) {
        heroTimeline.to(
          mediaElement,
          {
            yPercent: -10,
            ease: "none",
          },
          0
        ); // Start at time 0 (same time as overlay)
      }
    });
    console.log(`Applied animation to ${heroBgElements.length} hero-bg element(s)`);
  } else {
    console.warn("No hero-bg elements found with data-element='hero-bg'");
  }

  console.log("Hero timeline animation initialized with available elements");
}

function animateLifeTime() {
  const lifeSection = document.querySelector(".life_time_section");
  const lifeSubHeader = document.querySelector(".life_content_sub-header");
  const lifeLightOverlay = document.querySelector(".life_time_light_overlay");
  const lifeImage = document.querySelector(".life_image_wrap img");

  if (!lifeSection) {
    console.warn("Life time section not found");
    return;
  }

  // Create a unified timeline for life time animations
  const lifeTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: lifeSection,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });

  // Add sub-header opacity animation if element exists
  if (lifeSubHeader) {
    lifeTimeline.to(
      lifeSubHeader,
      {
        opacity: 0,
        ease: "none",
      },
      0
    ); // Start at time 0
  } else {
    console.warn("Life content sub-header element not found");
  }

  // Add light overlay opacity animation if element exists
  if (lifeLightOverlay) {
    lifeTimeline.to(
      lifeLightOverlay,
      {
        opacity: 1,
        duration: 0.95,
        ease: "none",
      },
      0
    ); // Start at time 0 (same time as sub-header)
  } else {
    console.warn("Life time light overlay element not found");
  }

  // Add image translation animation if element exists
  if (lifeImage) {
    lifeTimeline.to(
      lifeImage,
      {
        yPercent: -10,
        ease: "none",
      },
      0
    ); // Start at time 0 (same time as other animations)
  } else {
    console.warn("Life image element not found");
  }

  console.log("Life time timeline animation initialized with available elements");
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
  // Find all dropdown containers
  const dropdowns = document.querySelectorAll('[data-element="dropdown"]');

  if (!dropdowns || dropdowns.length === 0) {
    console.warn('No dropdown elements found');
    return;
  }

  console.log(`Found ${dropdowns.length} dropdown(s)`);

  // Initialize each dropdown
  dropdowns.forEach((dropdown, index) => {
    const toggleButton = dropdown.querySelector('[data-element="dropdown-toggle"]');
    const content = dropdown.querySelector('[data-element="dropdown-content"]');

    // Guard: Check if required elements exist
    if (!toggleButton) {
      console.warn(`Dropdown ${index}: toggle button [data-element="dropdown-toggle"] not found`);
      return;
    }

    if (!content) {
      console.warn(`Dropdown ${index}: content [data-element="dropdown-content"] not found`);
      return;
    }

    // Add click event listener to toggle button
    toggleButton.addEventListener('click', () => {
      // Toggle class on button
      toggleButton.classList.toggle('is-expanded');

      // Toggle class on content
      content.classList.toggle('is-expanded');

      // Refresh ScrollTrigger after DOM update
      setTimeout(() => {
        ScrollTrigger.refresh();
        console.log(`ScrollTrigger refreshed after dropdown ${index} toggle`);
      }, 50);

      console.log(`Dropdown ${index} toggled:`, content.classList.contains('is-expanded') ? 'expanded' : 'collapsed');
    });

    console.log(`Dropdown ${index} initialized`);
  });

  console.log('All dropdowns initialized');
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
    // Find div with data-next-page attribute
    const nextPageDiv = document.querySelector('div[data-next-page]');

    if (!nextPageDiv) {
      console.warn("Div with data-next-page attribute not found");
      return;
    }

    // Find the link inside the div
    const nextPageLink = nextPageDiv.querySelector('a');

    if (!nextPageLink) {
      console.warn("No link found inside div with data-next-page");
      return;
    }

    if (!nextPageLink.href || nextPageLink.href === "#") {
      console.warn("Next page link has no valid href");
      console.log("Link href:", nextPageLink.href);
      return;
    }

    console.log(`Next page: ${nextPageLink.href}`);

    // Click the link to trigger navigation (preserves any click handlers)
    nextPageLink.click();
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
        navLogo.style.pointerEvents = "auto";
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
          onComplete: () => {
            navLogo.style.pointerEvents = "none";
          },
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

function animateAdventureTrack() {
  // Run only on desktop
  if (isMobile()) {
    console.log("Adventure track animation skipped on mobile");
    return;
  }

  const adventureSection = document.querySelector("#adventure_section");
  const trackWrap = document.querySelector(".adventure_track-wrap");
  const trackDot = document.querySelector(".adventure_track-dot");
  const trackPath = document.querySelector("#track-path");
  const storylineWrapper = document.querySelector('[data-storyline-wrapper]');

  if (!adventureSection) {
    console.warn("Adventure section not found");
    return;
  }

  if (!trackWrap) {
    console.warn("Adventure track wrap not found");
    return;
  }

  if (!trackDot) {
    console.warn("Adventure track dot not found");
    return;
  }

  if (!trackPath) {
    console.warn("Adventure track path not found");
    return;
  }

  if (!storylineWrapper) {
    console.warn("Storyline wrapper not found");
    return;
  }

  // Register MotionPathPlugin
  gsap.registerPlugin(MotionPathPlugin);

  // Set initial state - hide track wrap and dot
  gsap.set(trackWrap, { opacity: 0, visibility: "hidden" });
  gsap.set(trackDot, { opacity: 0 });

  // Function to check if animation should run
  function shouldRunAnimation() {
    return storylineWrapper.classList.contains('is-expanded');
  }

  // Create timeline for the animation
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: adventureSection,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      // markers: true, // Uncomment for debugging
      onUpdate: () => {
        // Check if animation should be active
        if (!shouldRunAnimation()) {
          // Hide everything if storyline is not expanded
          gsap.set(trackWrap, { opacity: 0, visibility: "hidden" });
          gsap.set(trackDot, { opacity: 0 });
        }
      }
    }
  });

  // Fade in the track wrap at the start
  timeline.to(trackWrap, {
    opacity: 1,
    visibility: "visible",
    duration: 0.02,
    ease: "none"
  }, 0);

  // Add dot fade in at the start (only if storyline is expanded)
  timeline.to(trackDot, {
    opacity: 1,
    duration: 0.02,
    ease: "none"
  }, 0);

  // Animate dot along the path from bottom to top
  timeline.to(trackDot, {
    motionPath: {
      path: "#track-path",
      align: "#track-path",
      alignOrigin: [0.5, 0.5],
      autoRotate: false,
      start: 1, // Start from bottom (100% of path)
      end: 0    // End at top (0% of path)
    },
    duration: 0.96,
    ease: "none"
  }, 0.02);

  // Fade out the track wrap gradually from 96% to 100%
  timeline.to(trackWrap, {
    opacity: 0,
    duration: 0.04,
    ease: "power2.out"
  }, 0.96); // Start fading out at 96% of the timeline

  // Set visibility to hidden at the very end
  timeline.set(trackWrap, {
    visibility: "hidden"
  }, 1);

  console.log("Adventure track animation initialized with storyline check");

  // Return public methods for external control
  return {
    timeline: timeline,
    refresh: () => {
      ScrollTrigger.refresh();
    },
    cleanup: () => {
      timeline.kill();
    }
  };
}

/**
 * Initialize Handcraft Content-Visual Sync Animation
 * Syncs content sections with their corresponding visuals
 * Fades content in/out based on which visual is at screen center
 * Includes direction-aware transitions
 */
function initHandcraftAnimation() {
  // Get all content elements
  const contentElements = document.querySelectorAll('.handcraft_content');

  // Get only visual elements that are inside .handcraft_visual_wrap
  const visualElements = document.querySelectorAll('.handcraft_visual_wrap .handcraft_content_visual_wrap');

  // Guard: Check if elements exist
  if (!contentElements || contentElements.length === 0) {
    console.warn('No .handcraft_content elements found');
    return;
  }

  if (!visualElements || visualElements.length === 0) {
    console.warn('No .handcraft_content_visual_wrap elements found inside .handcraft_visual_wrap');
    return;
  }

  // Verify we have matching pairs
  if (contentElements.length !== visualElements.length) {
    console.warn(`Mismatch: ${contentElements.length} content elements but ${visualElements.length} visual elements`);
  }

  console.log(`Found ${contentElements.length} content sections and ${visualElements.length} visual sections`);

  // Set initial state - first content visible, others hidden
  contentElements.forEach((content, index) => {
    if (index === 0) {
      gsap.set(content, { opacity: 1, visibility: 'visible' });
    } else {
      gsap.set(content, { opacity: 0, visibility: 'hidden' });
    }
  });

  // Track current active index and animation state
  let currentIndex = 0;
  let targetIndex = 0;
  let activeTimeline = null;

  /**
   * Switch to a specific content section with direction-aware fade
   * @param {number} newIndex - The index of the content to show
   * @param {number} direction - 1 for scrolling down, -1 for scrolling up
   */
  function switchContent(newIndex, direction) {
    if (newIndex < 0 || newIndex >= contentElements.length) return;
    if (newIndex === targetIndex) return; // Already targeting this index

    // Kill any existing animation immediately
    if (activeTimeline) {
      activeTimeline.kill();
      activeTimeline = null;
    }

    // Update target index immediately
    targetIndex = newIndex;

    // Hide all content elements except the target
    contentElements.forEach((content, index) => {
      if (index !== newIndex) {
        gsap.set(content, { opacity: 0, visibility: 'hidden', y: 0 });
      }
    });

    const newContent = contentElements[newIndex];

    // Create timeline for showing new content
    activeTimeline = gsap.timeline({
      onComplete: () => {
        activeTimeline = null;
        currentIndex = newIndex;
      }
    });

    // Fade in new content with directional movement
    activeTimeline.fromTo(newContent,
      {
        opacity: 0,
        y: direction * 20, // Start from below if scrolling down, from above if scrolling up
        visibility: 'visible'
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      }
    );

    console.log(`Switched to content ${newIndex} (direction: ${direction > 0 ? 'down' : 'up'})`);
  }

  // Create ScrollTrigger for each visual element
  visualElements.forEach((visual, index) => {
    ScrollTrigger.create({
      trigger: visual,
      start: 'top center', // When top of visual hits center of screen
      end: 'bottom center', // When bottom of visual hits center of screen
      onEnter: () => {
        // Scrolling down - visual entering from bottom
        switchContent(index, 1);
      },
      onEnterBack: () => {
        // Scrolling up - visual entering from top
        switchContent(index, -1);
      },
      // markers: true, // Uncomment for debugging
    });

    console.log(`Created ScrollTrigger for visual ${index}`);
  });

  console.log('Handcraft content-visual sync animation initialized');

  // Return public methods for external control
  return {
    switchContent: (index) => switchContent(index, 1),
    getCurrentIndex: () => currentIndex,
    refresh: () => {
      ScrollTrigger.refresh();
    }
  };
}

/**
 * Initialize Venn Diagram Tab System
 * Handles tab switching via hover on desktop and click on mobile
 * Shows/hides corresponding panels with .is-opened class
 */
function initVennDiagramTabs() {
  // Find all tab links
  const tabLinks = document.querySelectorAll('[data-tab-link]');

  // Guard: Check if tab links exist
  if (!tabLinks || tabLinks.length === 0) {
    console.warn('No elements with data-tab-link found');
    return;
  }

  // Find all tab panels
  const tabPanels = document.querySelectorAll('[data-tab-panel]');

  // Guard: Check if tab panels exist
  if (!tabPanels || tabPanels.length === 0) {
    console.warn('No elements with data-tab-panel found');
    return;
  }

  console.log(`Found ${tabLinks.length} tab links and ${tabPanels.length} tab panels`);

  /**
   * Switch to a specific tab
   * @param {string} tabName - The name of the tab to switch to
   */
  function switchToTab(tabName) {
    // Hide all panels first
    tabPanels.forEach(panel => {
      panel.classList.remove('is-opened');
      panel.style.display = 'none';
    });

    // Find and show the target panel
    const targetPanel = document.querySelector(`[data-tab-panel="${tabName}"]`);
    if (targetPanel) {
      targetPanel.classList.add('is-opened');
      targetPanel.style.display = 'block';
      ScrollTrigger.refresh();
      console.log(`Switched to tab: ${tabName}`);
    } else {
      console.warn(`No panel found for tab: ${tabName}`);
    }
  }

  /**
   * Setup initial state - show default tab
   */
  function setupInitialState() {
    // Hide all panels initially
    tabPanels.forEach(panel => {
      panel.style.display = 'none';
      panel.classList.remove('is-opened');
    });

    // Show the default panel
    const defaultPanel = document.querySelector('[data-tab-panel="default"]');
    if (defaultPanel) {
      defaultPanel.classList.add('is-opened');
      defaultPanel.style.display = 'block';
      console.log('Default tab initialized');
    } else {
      console.warn('No default tab panel found');
    }
  }

  // Setup initial state
  setupInitialState();

  // Check if mobile
  const isMobileDevice = isMobile();

  // Attach event listeners based on device type
  tabLinks.forEach(link => {
    const tabName = link.getAttribute('data-tab-link');

    if (!tabName) {
      console.warn('Tab link found without data-tab-link value:', link);
      return;
    }

    if (isMobileDevice) {
      // Mobile: Use click/tap events
      link.addEventListener('click', (e) => {
        e.preventDefault();
        switchToTab(tabName);
      });

      link.addEventListener('touchstart', (e) => {
        e.preventDefault();
        switchToTab(tabName);
      }, { passive: false });

      console.log(`Mobile: Attached click events to tab link: ${tabName}`);
    } else {
      // Desktop: Use hover events
      link.addEventListener('mouseenter', () => {
        switchToTab(tabName);
      });

      console.log(`Desktop: Attached hover events to tab link: ${tabName}`);
    }
  });

  console.log(`Venn diagram tabs initialized for ${isMobileDevice ? 'mobile' : 'desktop'}`);

  // Return public methods for external control
  return {
    switchToTab: switchToTab,
    reset: setupInitialState,
    isMobile: isMobileDevice
  };
}

/**
 * Handle in-page anchor links for mobile devices with custom scroller
 * On desktop, Webflow's default handling works fine
 * On mobile, we need custom handling because of the .page_wrap scroller
 */
function initInPageLinkHandler() {
  // Only run on mobile devices
  if (!isMobile()) {
    console.log("In-page link handler: Skipped on desktop (using Webflow default)");
    return;
  }

  console.log("Initializing in-page link handler for mobile");

  /**
   * Scroll to a target element smoothly
   * @param {HTMLElement} targetElement - The element to scroll to
   * @param {number} offset - Optional offset from top (default: 0)
   */
  function scrollToElement(targetElement, offset = 0) {
    if (!targetElement) {
      console.warn("scrollToElement: Target element not found");
      return;
    }

    const scrollContainer = getScrollContainer();

    if (scrollContainer === window) {
      // Fallback to window scroll (shouldn't happen on mobile, but just in case)
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } else {
      // Mobile: scroll the .page_wrap container
      const containerRect = scrollContainer.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const currentScroll = scrollContainer.scrollTop;

      // Calculate target scroll position relative to the scroll container
      const targetPosition = currentScroll + (targetRect.top - containerRect.top) - offset;

      scrollContainer.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      console.log(`Scrolled to element:`, {
        target: targetElement,
        targetPosition,
        currentScroll,
        offset
      });
    }
  }

  /**
   * Parse hash from URL or href and return the target element
   * @param {string} hash - The hash string (e.g., "#section-id")
   * @returns {HTMLElement|null} - The target element or null
   */
  function getTargetFromHash(hash) {
    if (!hash || hash === '#') return null;

    // Remove the # if present
    const id = hash.replace('#', '');

    // Try to find by ID first
    let target = document.getElementById(id);

    // If not found by ID, try by name attribute (some anchors use name)
    if (!target) {
      target = document.querySelector(`[name="${id}"]`);
    }

    return target;
  }

  /**
   * Handle click on anchor links
   * @param {Event} e - The click event
   */
  function handleAnchorClick(e) {
    const link = e.currentTarget;
    const href = link.getAttribute('href');

    // Only handle in-page links (starting with #)
    if (!href || !href.startsWith('#')) {
      return;
    }

    // Get the target element
    const targetElement = getTargetFromHash(href);

    if (!targetElement) {
      console.warn(`In-page link target not found: ${href}`);
      return;
    }

    // Prevent default behavior
    e.preventDefault();

    // Scroll to the target
    scrollToElement(targetElement, 0); // 20px offset from top

    // Update URL hash without jumping
    if (history.pushState) {
      history.pushState(null, null, href);
    } else {
      // Fallback for older browsers
      location.hash = href;
    }
  }

  /**
   * Handle hash in URL on page load
   */
  function handleInitialHash() {
    const hash = window.location.hash;

    if (!hash || hash === '#') return;

    const targetElement = getTargetFromHash(hash);

    if (!targetElement) {
      console.warn(`Initial hash target not found: ${hash}`);
      return;
    }

    // Defer to next frame to ensure all animations are initialized
    requestAnimationFrame(() => {
      scrollToElement(targetElement, 0);
      console.log(`Scrolled to initial hash: ${hash}`);
    });
  }

  // Find all anchor links on the page
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  if (anchorLinks.length === 0) {
    console.log("No in-page anchor links found");
    return;
  }

  // Attach click handlers to all anchor links
  anchorLinks.forEach(link => {
    link.addEventListener('click', handleAnchorClick, { passive: false });
  });

  console.log(`Attached in-page link handlers to ${anchorLinks.length} links`);

  // Handle initial hash if present in URL
  handleInitialHash();

  // Handle hash changes (back/forward navigation)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    const targetElement = getTargetFromHash(hash);

    if (targetElement) {
      scrollToElement(targetElement, 0);
    }
  });

  // Return public methods
  return {
    scrollToElement,
    getTargetFromHash,
    refresh: () => {
      // Re-attach handlers to new links (useful after dynamic content)
      const newLinks = document.querySelectorAll('a[href^="#"]');
      newLinks.forEach(link => {
        // Remove old handler first (if exists)
        link.removeEventListener('click', handleAnchorClick);
        // Attach new handler
        link.addEventListener('click', handleAnchorClick, { passive: false });
      });
      console.log(`Refreshed in-page link handlers for ${newLinks.length} links`);
    }
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

  // Initialize in-page link handler (mobile only)
  const inPageLinkHandler = initInPageLinkHandler();

  // Make available globally for external use
  window.inPageLinkHandler = inPageLinkHandler;

  // Initialize nav logo animation (works on all pages)
  initNavLogoAnimation();

  // Initialize page-specific animations
  animateHero();
  animateLifeTime();

  const navbarController = initNavbarAnimation();
  // ScrollTrigger.refresh();
  const footerController = initFooterAnimation();
  initStorylineToggle();

  // Initialize Venn Diagram Tabs
  const vennDiagramController = initVennDiagramTabs();

  // Initialize Handcraft Animation
  initHandcraftAnimation();

  // Initialize Adventure Track Animation
  animateAdventureTrack();

  // Font loading check
  // if (document.fonts) {
  //   document.fonts.ready.then(() => {
  //     setTimeout(() => ScrollTrigger.refresh(), 10000);
  //   });
  // }
});
