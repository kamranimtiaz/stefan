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
      "fade-in": this.setupFadeIn.bind(this),
      "slide-up": this.setupSlideUp.bind(this),
      "slide-left": this.setupSlideLeft.bind(this),
      "slide-right": this.setupSlideRight.bind(this),
      "scale-in": this.setupScaleIn.bind(this),
      "rotate-in": this.setupRotateIn.bind(this),
      "stagger-children": this.setupStaggerChildren.bind(this),
      "horizontal-scroll": this.setupHorizontalScroll.bind(this),
    };
  }

  /**
   * Parse data attributes and extract animation settings
   */
  parseAnimationData(element) {
    const dataset = element.dataset;
    const config = {
      type: dataset.scrollAnimation || "fade-in",
      trigger: dataset.scrollTrigger || "top 80%",
      end: dataset.scrollEnd || "bottom 20%",
      scrub: dataset.scrollScrub === "true",
      duration: parseFloat(dataset.scrollDuration) || 1,
      delay: parseFloat(dataset.scrollDelay) || 0,
      stagger: parseFloat(dataset.scrollStagger) || 0.1,
      ease: dataset.scrollEase || "power2.out",
      toggleActions: dataset.scrollToggle || "play none none reverse",
      splitType: dataset.scrollSplit || "words",
      once: dataset.scrollOnce === "true",
      items: dataset.scrollItems || ".w-dyn-item",
      heightMultiplier: parseFloat(dataset.scrollHeightMultiplier) || 50,
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
        markers: true,
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
function animateHeroDarkOverlay() {
  const heroSection = document.querySelector(".main_hero_section");
  const darkOverlay = document.querySelector(".hero_dark_overlay");

  if (heroSection && darkOverlay) {
    gsap.to(darkOverlay, {
      opacity: 0.7,
      ease: "none",
      scrollTrigger: {
        trigger: heroSection,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    console.log("Hero dark overlay animation initialized");
  } else {
    console.warn("Hero section or dark overlay element not found");
  }
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
  animateHeroDarkOverlay();

  // Font loading check
  // if (document.fonts) {
  //   document.fonts.ready.then(() => {
  //     setTimeout(() => ScrollTrigger.refresh(), 10000);
  //   });
  // }
});
