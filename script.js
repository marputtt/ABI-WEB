// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    initLucideIcons();
    // Initialize all functionality
    initNavbar();
    initFAQ();
    initSmoothScrolling();
    initAnimations();
    initFormHandling();
    initPartnersScroll();
    initServicesSlider();
    initTeamSlider();
});

// Initialize Lucide Icons
function initLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
    
    // Re-initialize icons after DOM updates
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                if (window.lucide && typeof window.lucide.createIcons === 'function') {
                    window.lucide.createIcons();
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Navbar Functionality
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
    
    // Close mobile menu when clicking on a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                // Small delay to allow scroll animation to start
                setTimeout(() => {
                    mobileMenuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }, 100);
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Navbar scroll effect
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class for styling
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll (disabled for better UX on mobile)
        if (window.innerWidth > 768) {
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            // Always show navbar on mobile
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Update active nav link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Update active link on scroll
    window.addEventListener('scroll', throttle(updateActiveNavLink, 100));
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Reset mobile menu on desktop
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// FAQ Accordion Functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items first
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }
            });
            
            // If this item wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                // Set max-height to the actual scroll height for smooth animation
                if (answer) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            }
        });
    });
}

// Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Don't prevent default for empty hash
            if (targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const offsetTop = targetElement.offsetTop - navbarHeight - 20; // Account for navbar + padding
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Intersection Observer for Animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .service-card, .step, .team-member, .stat-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Form Handling
function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Add loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                submitBtn.classList.add('loading');
                
                // Simulate form submission (replace with actual form handling)
                setTimeout(() => {
                    submitBtn.textContent = 'Sent!';
                    submitBtn.classList.remove('loading');
                    
                    // Reset form after 2 seconds
                    setTimeout(() => {
                        form.reset();
                        submitBtn.textContent = originalText;
                    }, 2000);
                }, 1500);
            }
        });
    });
}

// Partners Logo Scroll Animation
function initPartnersScroll() {
    const partnersContainer = document.querySelector('.partners-track');
    if (!partnersContainer) return;
    
    const logos = partnersContainer.querySelectorAll('.logo-item');
    if (logos.length === 0) return;
    
    // Clone logos for infinite scroll effect
    const originals = Array.from(logos);
    originals.forEach(logo => {
        const clone = logo.cloneNode(true);
        partnersContainer.appendChild(clone);
    });
    
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Adjust speed as needed
    
    function scrollLogos() {
        const resetPoint = partnersContainer.scrollWidth / 2;
        if (resetPoint === 0) {
            requestAnimationFrame(scrollLogos);
            return;
        }
        
        scrollPosition += scrollSpeed;
        partnersContainer.style.transform = `translateX(-${scrollPosition}px)`;
        
        // Reset position when we've scrolled past the original logos
        if (scrollPosition >= resetPoint) {
            scrollPosition = 0;
        }
        
        requestAnimationFrame(scrollLogos);
    }
    
    // Start scrolling
    scrollLogos();
}

// Spring Physics Helper Function
// Converts spring physics (stiffness, damping, mass) to easing curve
function springEasing(stiffness = 200, damping = 40, mass = 1) {
    // Calculate spring parameters
    const w0 = Math.sqrt(stiffness / mass);
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));
    
    // Return optimized cubic-bezier for this spring
    // This approximates the spring motion
    if (zeta < 1) {
        // Underdamped (bouncy)
        return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    } else if (zeta === 1) {
        // Critically damped
        return 'cubic-bezier(0.36, 0, 0.66, -0.56)';
    } else {
        // Overdamped (no bounce)
        return 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
}

// Position navigation arrows relative to active slide
function positionNavigationArrows(swiper) {
    const prevBtn = document.querySelector('.services-nav-prev');
    const nextBtn = document.querySelector('.services-nav-next');
    
    if (!prevBtn || !nextBtn || !swiper.slides || swiper.slides.length === 0) return;
    
    // Get the active slide
    const activeSlide = swiper.slides[swiper.activeIndex];
    if (!activeSlide) return;
    
    // Get the bounding rectangles
    const slideRect = activeSlide.getBoundingClientRect();
    const containerRect = swiper.el.getBoundingClientRect();
    
    // Calculate positions relative to container
    const slideLeftRelative = slideRect.left - containerRect.left;
    const slideRightRelative = slideRect.right - containerRect.left;
    
    // Position arrows with offset from slide edges
    const arrowOffset = 85; // Distance from card edge
    const arrowWidth = window.innerWidth <= 480 ? 40 : (window.innerWidth <= 768 ? 44 : 56);
    
    // Set positions - both use left positioning for smooth transitions
    prevBtn.style.right = 'auto';
    prevBtn.style.left = `${slideLeftRelative - arrowOffset}px`;
    
    nextBtn.style.right = 'auto';
    nextBtn.style.left = `${slideRightRelative + arrowOffset - arrowWidth}px`;
    
    // Ensure spring animation is applied
    prevBtn.style.transitionTimingFunction = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    nextBtn.style.transitionTimingFunction = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
}

// Services Slider - Using Swiper.js to match Framer design exactly
function initServicesSlider() {
    // Wait for Swiper to be loaded
    if (typeof Swiper === 'undefined') {
        setTimeout(initServicesSlider, 100);
        return;
    }
    
    // Get spring easing for stiffness: 200, damping: 40, mass: 1
    const springCurve = springEasing(200, 40, 1);
    
    // Get swipe indicator
    const swipeIndicator = document.querySelector('.swipe-indicator');
    let hasInteracted = false;
    
    const servicesSwiper = new Swiper('.servicesSwiper', {
        // Direction: horizontal (left sliding)
        direction: 'horizontal',
        
        // Show multiple slides at once
        slidesPerView: 'auto',
        
        // Center the active slide - CRITICAL for stopping in middle
        centeredSlides: true,
        
        // Slides should center on the active one
        centeredSlidesBounds: true,
        
        // Gap between slides (matching screenshot)
        spaceBetween: 30,
        
        // Disable internal scrollbar
        scrollbar: false,
        
        // Enable dragging
        allowTouchMove: true,
        grabCursor: true,
        
        // Click on slide to make it active
        slideToClickedSlide: true,
        
        // Start from first slide
        initialSlide: 0,
        
        // No autoplay
        autoplay: false,
        
        // Speed for spring physics (duration in ms)
        speed: 600,
        
        // Spring physics easing - converts stiffness/damping/mass to cubic-bezier
        // stiffness: 200, damping: 40, mass: 1
        // This creates a bouncy, natural spring effect
        cssMode: false,
        
        // Resistance ratio for better feel
        resistance: true,
        resistanceRatio: 0.85,
        
        // Enable keyboard control
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        
        // Enable mousewheel control
        mousewheel: {
            enabled: true,
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: false,
        },
        
        // Loop through slides
        loop: true,
        loopedSlides: 4,
        
        // Effects
        effect: 'slide',
        
        // Enable free mode for smoother physics
        freeMode: false,
        
        // Momentum settings for spring-like behavior
        longSwipes: true,
        longSwipesRatio: 0.3,
        longSwipesMs: 300,
        
        // Prevent clicks during transition
        preventClicks: false,
        preventClicksPropagation: false,
        
        // Smooth transitions
        slidesPerGroup: 1,
        
        // Watch slides progress for opacity animation
        watchSlidesProgress: true,
        
        // Normalize slide index
        normalizeSlideIndex: true,
        
        // Round lengths for pixel-perfect positioning
        roundLengths: true,
        
        // Responsive breakpoints
        breakpoints: {
            // when window width is >= 320px
            320: {
                slidesPerView: 1,
                spaceBetween: 20,
                centeredSlides: true
            },
            // when window width is >= 768px
            768: {
                slidesPerView: 'auto',
                spaceBetween: 25,
                centeredSlides: true
            },
            // when window width is >= 1024px
            1024: {
                slidesPerView: 'auto',
                spaceBetween: 30,
                centeredSlides: true
            }
        },
        
        // Event handlers for spring animation
        on: {
            init: function() {
                // Apply spring physics on initialization
                const swiper = this;
                swiper.wrapperEl.style.transitionTimingFunction = springCurve;
            },
            setTransition: function(swiper, duration) {
                // Apply spring easing to all transitions
                swiper.wrapperEl.style.transitionDuration = duration + 'ms';
                swiper.wrapperEl.style.transitionTimingFunction = springCurve;
                
                // Also apply to slides
                swiper.slides.forEach(slide => {
                    slide.style.transitionTimingFunction = springCurve;
                });
            },
            slideChange: function() {
                // Ensure slide is perfectly centered after change
                const swiper = this;
                swiper.wrapperEl.style.transitionTimingFunction = springCurve;
                
                // Hide swipe indicator after first interaction
                if (!hasInteracted && swipeIndicator) {
                    hasInteracted = true;
                    swipeIndicator.style.opacity = '0';
                    swipeIndicator.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => {
                        swipeIndicator.style.display = 'none';
                    }, 500);
                }
                
                // Add smooth scaling animation to cards
                swiper.slides.forEach((slide, index) => {
                    const card = slide.querySelector('.service-card');
                    if (card) {
                        card.style.transitionTimingFunction = springCurve;
                    }
                });
            },
            transitionEnd: function() {
                // Ensure final position is perfect
                const swiper = this;
                swiper.update();
            },
            touchStart: function() {
                // Hide swipe indicator on first touch
                if (!hasInteracted && swipeIndicator) {
                    hasInteracted = true;
                    swipeIndicator.style.opacity = '0';
                    swipeIndicator.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => {
                        swipeIndicator.style.display = 'none';
                    }, 500);
                }
            }
        }
    });
}

// Team Grid - No slider, show all members at once
function initTeamSlider() {
    // Team members are now displayed using CSS Grid
    // All members are visible at once, no slider functionality needed
    // This function is kept for compatibility but does nothing
    return;
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Button click handlers
document.addEventListener('click', function(e) {
    // Handle CTA button clicks (both primary and secondary)
    const btn = e.target.closest('.btn-primary, .btn-secondary');
    if (btn && btn.textContent.includes('Get in touch')) {
        // Scroll to contact section
        const contactSection = document.querySelector('.contact-section');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Handle "What we do" link clicks
    if (e.target.classList.contains('btn-link-button') && e.target.textContent.includes('What we do')) {
        // Scroll to services section
        const servicesSection = document.querySelector('.services-section');
        if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Feature card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Service card animations
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .feature-card, .service-card, .step, .team-member, .stat-item {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .feature-card.animate-in, 
    .service-card.animate-in, 
    .step.animate-in, 
    .team-member.animate-in, 
    .stat-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    .team-slider {
        overflow: hidden;
    }
    
    .team-member {
        transition: all 0.3s ease;
    }
    
    .team-member:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .stat-item {
        transition: all 0.3s ease;
    }
    
    .stat-item:hover {
        transform: scale(1.05);
    }
    
    .step-image {
        transition: all 0.3s ease;
    }
    
    .step-image:hover {
        transform: scale(1.02);
    }
    
    .contact-form input:focus,
    .contact-form textarea:focus {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(31, 81, 76, 0.3);
    }
    
    .btn-link:hover {
        transform: translateX(4px);
    }
`;
document.head.appendChild(style);

// Console welcome message
console.log('%c🚀 ABI Website Loaded Successfully!', 'color: #1F514C; font-size: 16px; font-weight: bold;');
console.log('%cStrategic Energy & Resource Solutions Across Indonesia', 'color: #636363; font-size: 12px;');
console.log('%cBuilt with modern web technologies', 'color: #636363; font-size: 10px;');
