/**
 * Initializes Lenis smooth scroll only on desktop devices (>991px) 
 * and excludes touch devices even in desktop mode
 * Compatible with GSAP animations
 */
gsap.registerPlugin(ScrollTrigger, SplitText);

class DesktopScrollManager {
  constructor() {
    this.lenis = null;
    this.isDesktop = false;
    this.isTouchDevice = false;
    this.resizeTimeout = null;
    
    this.init();
  }

  /**
   * Detects if the current device is a touch device
   * Uses multiple detection methods for better accuracy
   */
  detectTouchDevice() {
    // Method 1: Check for touch events support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Method 2: Check user agent for mobile/tablet indicators
    const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent);
    
    // Method 3: Check for coarse pointer (typically touch)
    const hasCoarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    
    // Method 4: Check for hover capability (desktop typically has hover)
    const canHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
    
    // Device is considered touch if it has touch support OR mobile user agent OR coarse pointer OR can't hover
    return hasTouch || mobileUserAgent || hasCoarsePointer || !canHover;
  }

  /**
   * Checks if current viewport is desktop size (>991px)
   */
  isDesktopSize() {
    return window.innerWidth > 991;
  }

  /**
   * Determines if Lenis should be active based on device and screen size
   */
  shouldEnableScroll() {
    this.isTouchDevice = this.detectTouchDevice();
    this.isDesktop = this.isDesktopSize();
    
    // Enable only if desktop size AND not a touch device
    return this.isDesktop && !this.isTouchDevice;
  }

  /**
   * Initializes Lenis smooth scroll
   */
  initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis is not loaded. Please include Lenis library.');
      return;
    }

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // GSAP ScrollTrigger integration
    if (typeof gsap !== 'undefined' && gsap.registerPlugin && typeof ScrollTrigger !== 'undefined') {
      this.lenis.on('scroll', ScrollTrigger.update);
      
      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });
      
      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback animation loop if GSAP is not available
      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    console.log('Lenis smooth scroll initialized for desktop');
  }

  /**
   * Destroys Lenis instance
   */
  destroyLenis() {
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
      console.log('Lenis smooth scroll destroyed');
    }
  }

  /**
   * Handles window resize with debouncing
   */
  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      const shouldEnable = this.shouldEnableScroll();
      
      if (shouldEnable && !this.lenis) {
        this.initLenis();
      } else if (!shouldEnable && this.lenis) {
        this.destroyLenis();
      }
    }, 250);
  }

  /**
   * Main initialization function
   */
  init() {
    // Initial check and setup
    if (this.shouldEnableScroll()) {
      this.initLenis();
    }

    // Listen for resize events
    window.addEventListener('resize', () => this.handleResize());
    
    // Listen for orientation change (mobile/tablet)
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.handleResize(), 100);
    });

    console.log(`Desktop Scroll Manager initialized:
    - Screen width: ${window.innerWidth}px
    - Is desktop size: ${this.isDesktop}
    - Is touch device: ${this.isTouchDevice}
    - Lenis enabled: ${!!this.lenis}`);
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
}


/**
 * Generalized ScrollTrigger Animation System
 * Uses data attributes to define animations automatically
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
      'text-reveal': this.setupTextReveal.bind(this),
      'fade-in': this.setupFadeIn.bind(this),
      'slide-up': this.setupSlideUp.bind(this),
      'slide-left': this.setupSlideLeft.bind(this),
      'slide-right': this.setupSlideRight.bind(this),
      'scale-in': this.setupScaleIn.bind(this),
      'rotate-in': this.setupRotateIn.bind(this),
      'stagger-children': this.setupStaggerChildren.bind(this)
    };
  }

  /**
   * Parse data attributes and extract animation settings
   */
  parseAnimationData(element) {
    const dataset = element.dataset;
    const config = {
      type: dataset.scrollAnimation || 'fade-in',
      trigger: dataset.scrollTrigger || 'top 80%',
      end: dataset.scrollEnd || 'bottom 20%',
      scrub: dataset.scrollScrub === 'true',
      duration: parseFloat(dataset.scrollDuration) || 1,
      delay: parseFloat(dataset.scrollDelay) || 0,
      stagger: parseFloat(dataset.scrollStagger) || 0.1,
      ease: dataset.scrollEase || 'power2.out',
      toggleActions: dataset.scrollToggle || 'play none none reverse',
      splitType: dataset.scrollSplit || 'words', // for text animations
      once: dataset.scrollOnce === 'true'
    };
    
    return config;
  }

  /**
   * Text reveal animation (like your original heading animation)
   */
  setupTextReveal(element, config) {
    const split = new SplitText(element, {
      type: config.splitType,
      wordsClass: "scroll-word",
      charsClass: "scroll-char",
      linesClass: "scroll-line"
    });
    
    const targets = config.splitType === 'words' ? split.words : 
                   config.splitType === 'chars' ? split.chars : split.lines;
    
    gsap.set(targets, { opacity: 0.3 });
    
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: config.trigger,
        end: config.end,
        scrub: config.scrub || 1,
        toggleActions: config.toggleActions,
        once: config.once
      }
    });
    
    targets.forEach((target, index) => {
      timeline.to(target, {
        opacity: 1,
        duration: config.duration,
        ease: config.ease
      }, index * config.stagger);
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
      scrollTrigger: {
        trigger: element,
        start: config.trigger,
        end: config.end,
        scrub: config.scrub,
        toggleActions: config.toggleActions,
        once: config.once
      }
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
      scrollTrigger: {
        trigger: element,
        start: config.trigger,
        end: config.end,
        scrub: config.scrub,
        toggleActions: config.toggleActions,
        once: config.once
      }
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
      scrollTrigger: {
        trigger: element,
        start: config.trigger,
        end: config.end,
        scrub: config.scrub,
        toggleActions: config.toggleActions,
        once: config.once
      }
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
      scrollTrigger: {
        trigger: element,
        start: config.trigger,
        end: config.end,
        scrub: config.scrub,
        toggleActions: config.toggleActions,
        once: config.once
      }
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
      scrollTrigger: {
        trigger: element,
        start: config.trigger,
        end: config.end,
        scrub: config.scrub,
        toggleActions: config.toggleActions,
        once: config.once
      }
    });
  }

  /**
   * Rotate in animation
   */
  setupRotateIn(element, config) {
    gsap.set(element, { rotation: 180, opacity: 0, transformOrigin: "center center" });
    
    gsap.to(element, {
      rotation: 0,
      opacity: 1,
      duration: config.duration,
      delay: config.delay,
      ease: config.ease,
      scrollTrigger: {
        trigger: element,
        start: config.trigger,
        end: config.end,
        scrub: config.scrub,
        toggleActions: config.toggleActions,
        once: config.once
      }
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
      scrollTrigger: {
        trigger: element,
        start: config.trigger,
        end: config.end,
        scrub: config.scrub,
        toggleActions: config.toggleActions,
        once: config.once
      }
    });
  }

  /**
   * Initialize all animations
   */
  initAnimations() {
    const animationConfigs = this.getAnimationConfigs();
    const elementsWithAnimations = document.querySelectorAll('[data-scroll-animation]');
    
    elementsWithAnimations.forEach((element, index) => {
      const config = this.parseAnimationData(element);
      const animationSetup = animationConfigs[config.type];
      
      if (animationSetup) {
        try {
          animationSetup(element, config);
          this.animations.set(`animation-${index}`, { element, config });
          console.log(`Applied ${config.type} animation to:`, element);
        } catch (error) {
          console.warn(`Failed to apply ${config.type} animation:`, error);
        }
      } else {
        console.warn(`Unknown animation type: ${config.type}`);
      }
    });
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



function animateScrollerHeadings() {
  // Find all h2 elements inside story_scroller containers
  const headings = document.querySelectorAll('.story_scroller h2');
  
  headings.forEach((heading) => {
    // Split text into words
    const split = new SplitText(heading, {
      type: "words",
      wordsClass: "word"
    });
    
    // Set initial state for all words
    gsap.set(split.words, {
      opacity: 0.3
    });
    
    // Create a timeline for sequential word animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: heading,
        start: "top 90%",
        end: "top center",
        scrub: true,
        toggleActions: "play none none reverse"
      }
    });
    
    // Add each word to the timeline sequentially
    split.words.forEach((word, index) => {
      timeline.to(word, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      }, index * 0.1); // Stagger each word by 0.1 seconds
    });
  });
}

function animateStoryScaling() {
  // Find all story sections
  const storySections = document.querySelectorAll('.story_scroller');
  
  // Skip the first section and animate from the second one onwards
  for (let i = 1; i < storySections.length; i++) {
    const currentSection = storySections[i];
    const previousSection = storySections[i - 1];
    
    // Create ScrollTrigger for each section (except the first)
    ScrollTrigger.create({
      trigger: currentSection,
      start: "top bottom", // When current section enters viewport from bottom
      end: "bottom top",   // When current section exits viewport from top
      scrub: true,           // Smooth scrubbing animation
      animation: gsap.to(previousSection, 
        {
          scale: 0.5,
          transformOrigin: "center center",
          ease: "none"
        }
      ),
    });
  }
}

// Initialize the animations
// animateScrollerHeadings();
animateStoryScaling();
// Initialize the animation manager
const scrollAnimationManager = new ScrollAnimationManager();

// Initialize the scroll manager
const scrollManager = new DesktopScrollManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesktopScrollManager;
}

// Make available globally
window.DesktopScrollManager = DesktopScrollManager;
window.scrollManager = scrollManager;