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
        end: "center center",
        scrub: 1,
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


// Initialize the animation
animateScrollerHeadings();

// Initialize the scroll manager
const scrollManager = new DesktopScrollManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesktopScrollManager;
}

// Make available globally
window.DesktopScrollManager = DesktopScrollManager;
window.scrollManager = scrollManager;