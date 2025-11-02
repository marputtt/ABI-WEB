/**
 * ABI Website - Secure JavaScript
 * Version: 2.0.0
 * Features: Security, Validation, Error Handling, Performance Optimization
 */

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    logError('JavaScript Error', {
        message: event.error?.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno
    });
    return false;
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    logError('Promise Rejection', {
        reason: event.reason,
        promise: event.promise
    });
});

// Security and Performance Configuration
const CONFIG = {
    API_ENDPOINT: '/api.php',
    CSRF_TOKEN: '',
    RATE_LIMIT: {
        maxAttempts: 3,
        windowMs: 60000, // 1 minute
        attempts: [],
    },
    PERFORMANCE: {
        debounceDelay: 300,
        throttleDelay: 100
    }
};

/**
 * Error Logging (can be sent to server in production)
 */
function logError(type, details) {
    const errorLog = {
        type,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    // In production, send to logging service
    console.error('Error logged:', errorLog);
    
    // Store in sessionStorage for debugging
    try {
        const errors = JSON.parse(sessionStorage.getItem('errorLog') || '[]');
        errors.push(errorLog);
        sessionStorage.setItem('errorLog', JSON.stringify(errors.slice(-50))); // Keep last 50
    } catch (e) {
        console.error('Failed to log error:', e);
    }
}

/**
 * DOMContentLoaded Event - Initialize everything safely
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('%c🔒 ABI Secure Website Initialized', 'color: #2E7D32; font-size: 16px; font-weight: bold;');
        
        // Initialize all modules
        initLucideIcons();
        initNavbar();
        initFAQ();
        initSmoothScrolling();
        initAnimations();
        initSecureFormHandling();
        initPartnersScroll();
        initServicesSlider();
        initEmailPhoneProtection();
        initPerformanceOptimizations();
        
        // Fetch CSRF token
        fetchCSRFToken();
        
        console.log('%c✅ All modules loaded successfully', 'color: #2E7D32; font-size: 12px;');
    } catch (error) {
        logError('Initialization Error', { message: error.message, stack: error.stack });
        console.error('Failed to initialize:', error);
    }
});

/**
 * Fetch CSRF Token from Server
 */
async function fetchCSRFToken() {
    try {
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.warn('Non-JSON response from API:', text.substring(0, 200));
            throw new Error('API returned non-JSON response. Make sure PHP is configured correctly.');
        }
        
        const data = await response.json();
        
        if (data && data.csrf_token) {
            CONFIG.CSRF_TOKEN = data.csrf_token;
            
            const csrfInput = document.getElementById('csrfToken');
            if (csrfInput) {
                csrfInput.value = data.csrf_token;
            }
            console.log('%c✓ CSRF token loaded', 'color: #2E7D32; font-size: 12px;');
        } else {
            throw new Error('Invalid CSRF token response format');
        }
    } catch (error) {
        console.warn('CSRF Token Fetch Error:', error.message);
        // Log full error details
        logError('CSRF Token Fetch Error', {
            message: error.message,
            details: error.details || error
        });
        
        // Retry after a short delay (useful if server is starting up)
        setTimeout(() => {
            console.log('Retrying CSRF token fetch...');
            fetchCSRFToken();
        }, 2000);
    }
}

/**
 * Initialize Lucide Icons with Error Handling
 */
function initLucideIcons() {
    try {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
            
            // Re-initialize icons after DOM updates
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length && window.lucide) {
                        window.lucide.createIcons();
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    } catch (error) {
        logError('Lucide Icons Error', error);
    }
}

/**
 * Enhanced Navbar with Performance Optimization
 */
function initNavbar() {
    try {
        const navbar = document.querySelector('.navbar');
        const navLinks = document.querySelectorAll('.nav-link');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!navbar) return;
        
        // Mobile menu toggle
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                this.classList.toggle('active');
                navMenu.classList.toggle('active');
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
            });
        }
        
        // Close mobile menu when clicking on a nav link
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768 && mobileMenuToggle && navMenu) {
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
            if (window.innerWidth <= 768 && navMenu && mobileMenuToggle) {
                if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
                    mobileMenuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
        
        // Optimized scroll handler with throttle
        let lastScrollTop = 0;
        const scrollHandler = throttle(function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add/remove scrolled class
            navbar.classList.toggle('scrolled', scrollTop > 100);
            
            // Hide/show navbar on scroll (desktop only)
            if (window.innerWidth > 768) {
                navbar.style.transform = (scrollTop > lastScrollTop && scrollTop > 200) 
                    ? 'translateY(-100%)' 
                    : 'translateY(0)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, CONFIG.PERFORMANCE.throttleDelay);
        
        window.addEventListener('scroll', scrollHandler, { passive: true });
        
        // Update active nav link based on scroll position
        const updateActiveNavLink = throttle(function() {
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
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
        }, CONFIG.PERFORMANCE.throttleDelay);
        
        window.addEventListener('scroll', updateActiveNavLink, { passive: true });
        
        // Handle window resize
        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth > 768 && mobileMenuToggle && navMenu) {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }, CONFIG.PERFORMANCE.debounceDelay));
        
    } catch (error) {
        logError('Navbar Initialization Error', error);
    }
}

/**
 * FAQ Accordion with Animation
 */
function initFAQ() {
    try {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (!question || !answer) return;
            
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = null;
                    }
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    } catch (error) {
        logError('FAQ Initialization Error', error);
    }
}

/**
 * Smooth Scrolling with Offset
 */
function initSmoothScrolling() {
    try {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const navbar = document.querySelector('.navbar');
                    const navbarHeight = navbar ? navbar.offsetHeight : 0;
                    const offsetTop = targetElement.offsetTop - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    } catch (error) {
        logError('Smooth Scrolling Error', error);
    }
}

/**
 * Intersection Observer for Animations
 */
function initAnimations() {
    try {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Disconnect after animation to save resources
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements
        const animateElements = document.querySelectorAll('.feature-card, .service-card, .step, .team-member, .stat-item');
        animateElements.forEach(el => observer.observe(el));
        
    } catch (error) {
        logError('Animation Observer Error', error);
    }
}

/**
 * Input Sanitization (Client-Side - UX Only)
 * 
 * NOTE: This is for user experience only. All security-critical validation
 * and sanitization happens server-side in api.php via validateInputCanonical().
 * Client-side sanitization can be bypassed and should never be trusted.
 * Server-side validation is the authoritative source for security.
 */
function sanitizeInput(input, type = 'text') {
    if (typeof input !== 'string') return '';
    
    // Remove NULL bytes
    input = input.replace(/\0/g, '');
    
    // Trim whitespace
    input = input.trim();
    
    // Type-specific sanitization (UX only - server validates)
    switch (type) {
        case 'email':
            return input.toLowerCase().replace(/[^a-z0-9@._-]/gi, '');
        case 'phone':
            return input.replace(/[^0-9+\-\s\(\)]/g, '');
        case 'name':
            return input.replace(/[^A-Za-z\s\-']/g, '');
        default:
            // HTML escape
            const div = document.createElement('div');
            div.textContent = input;
            return div.innerHTML;
    }
}

/**
 * Input Validation
 */
function validateField(field) {
    const value = field.value.trim();
    const type = field.getAttribute('data-validate');
    const errorSpan = field.parentElement.querySelector('.error-message');
    
    let error = '';
    
    // Required check
    if (field.hasAttribute('required') && !value) {
        error = 'This field is required';
    }
    // Length checks
    else if (field.minLength && value.length < field.minLength) {
        error = `Minimum ${field.minLength} characters required`;
    }
    else if (field.maxLength && value.length > field.maxLength) {
        error = `Maximum ${field.maxLength} characters allowed`;
    }
    // Type-specific validation
    else {
        switch (type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
                if (!phoneRegex.test(value)) {
                    error = 'Please enter a valid phone number';
                }
                break;
            case 'name':
                const nameRegex = /^[A-Za-z\s\-']{2,50}$/;
                if (!nameRegex.test(value)) {
                    error = 'Please enter a valid name';
                }
                break;
        }
    }
    
    // Display error or success
    if (error) {
        field.classList.add('error');
        field.classList.remove('success');
        if (errorSpan) {
            errorSpan.textContent = error;
            errorSpan.classList.add('show');
        }
        return false;
    } else if (value) {
        field.classList.remove('error');
        field.classList.add('success');
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
        }
        return true;
    }
    
    return true;
}

/**
 * Rate Limiting Check
 */
function checkRateLimit() {
    const now = Date.now();
    
    // Remove old attempts outside the window
    CONFIG.RATE_LIMIT.attempts = CONFIG.RATE_LIMIT.attempts.filter(
        time => now - time < CONFIG.RATE_LIMIT.windowMs
    );
    
    // Check if limit exceeded
    if (CONFIG.RATE_LIMIT.attempts.length >= CONFIG.RATE_LIMIT.maxAttempts) {
        return false;
    }
    
    // Add current attempt
    CONFIG.RATE_LIMIT.attempts.push(now);
    return true;
}

/**
 * Show Form Status Message
 */
function showFormStatus(type, message) {
    const statusDiv = document.querySelector('.form-status');
    if (!statusDiv) return;
    
    statusDiv.className = `form-status ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

/**
 * Secure Form Handling
 */
function initSecureFormHandling() {
    try {
        const form = document.getElementById('contactForm');
        if (!form) return;
        
        const formInputs = form.querySelectorAll('input[data-validate], textarea[data-validate]');
        const submitBtn = document.getElementById('submitBtn');
        
        // Real-time validation with debounce
        formInputs.forEach(input => {
            const validateDebounced = debounce(() => validateField(input), 300);
            input.addEventListener('input', validateDebounced);
            input.addEventListener('blur', () => validateField(input));
        });
        
        // Form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                // Check rate limiting
                if (!checkRateLimit()) {
                    showFormStatus('error', 'Too many attempts. Please wait a minute and try again.');
                    return;
                }
                
                // Validate all fields
                let isValid = true;
                formInputs.forEach(input => {
                    if (!validateField(input)) {
                        isValid = false;
                    }
                });
                
                if (!isValid) {
                    showFormStatus('error', 'Please fix the errors above');
                    return;
                }
                
                // Check honeypot
                const honeypot = document.getElementById('honeypot');
                if (honeypot && honeypot.value) {
                    // Bot detected - silently fail
                    showFormStatus('success', 'Thank you! We will get back to you soon.');
                    form.reset();
                    return;
                }
                
                // Disable submit button
                submitBtn.disabled = true;
                submitBtn.querySelector('.btn-text').textContent = 'Sending...';
                submitBtn.classList.add('loading');
                
                // Collect and sanitize form data
                const formData = {
                    firstName: sanitizeInput(document.getElementById('firstName').value, 'name'),
                    lastName: sanitizeInput(document.getElementById('lastName').value, 'name'),
                    email: sanitizeInput(document.getElementById('email').value, 'email'),
                    phone: sanitizeInput(document.getElementById('phone').value, 'phone'),
                    message: sanitizeInput(document.getElementById('message').value, 'text'),
                    csrf_token: CONFIG.CSRF_TOKEN
                };
                
                // Send to API
                const response = await fetch(CONFIG.API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': CONFIG.CSRF_TOKEN
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showFormStatus('success', result.message);
                    form.reset();
                    
                    // Remove validation classes
                    formInputs.forEach(input => {
                        input.classList.remove('error', 'success');
                    });
                    
                    // Fetch new CSRF token
                    fetchCSRFToken();
                } else {
                    showFormStatus('error', result.error || 'An error occurred. Please try again.');
                }
                
            } catch (error) {
                logError('Form Submission Error', error);
                showFormStatus('error', 'Network error. Please check your connection and try again.');
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').textContent = 'Send Message';
                submitBtn.classList.remove('loading');
            }
        });
        
    } catch (error) {
        logError('Form Handling Initialization Error', error);
    }
}

/**
 * Partners Logo Scroll Animation with Performance Optimization
 */
function initPartnersScroll() {
    try {
        const partnersContainer = document.querySelector('.partners-track');
        if (!partnersContainer) return;
        
        const logos = partnersContainer.querySelectorAll('.logo-item');
        if (logos.length === 0) return;
        
        // Use CSS animation instead of JS for better performance
        partnersContainer.style.animation = 'scroll 30s linear infinite';
        
        // Pause on hover
        partnersContainer.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        partnersContainer.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
        
    } catch (error) {
        logError('Partners Scroll Error', error);
    }
}

/**
 * Services Slider with Swiper.js
 */
function initServicesSlider() {
    try {
        if (typeof Swiper === 'undefined') {
            setTimeout(initServicesSlider, 100);
            return;
        }
        
        const springCurve = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
        const swipeIndicator = document.querySelector('.swipe-indicator');
        let hasInteracted = false;
        let isTransitioning = false; // Prevent rapid clicks
        
        // Calculate loopedSlides based on actual slide count
        // For loop mode to work properly with 4 slides, loopedSlides should be 2
        // Swiper needs at least 2 * loopedSlides slides for seamless looping
        const slideContainer = document.querySelector('.servicesSwiper .swiper-wrapper');
        const totalSlides = slideContainer ? slideContainer.querySelectorAll('.swiper-slide').length : 4;
        // For 4 slides, use loopedSlides: 2 (half the slides)
        // This ensures proper loop behavior when sliding right
        const calculatedLoopedSlides = totalSlides >= 4 ? 2 : Math.floor(totalSlides / 2);
        const shouldLoop = totalSlides >= 3; // Enable loop if we have at least 3 slides
        
        const servicesSwiper = new Swiper('.servicesSwiper', {
            direction: 'horizontal',
            slidesPerView: 'auto',
            centeredSlides: true,
            centeredSlidesBounds: true,
            spaceBetween: 30,
            scrollbar: false,
            allowTouchMove: true,
            grabCursor: true,
            slideToClickedSlide: true,
            initialSlide: 0,
            autoplay: false,
            speed: 400, // Faster speed for better responsiveness
            cssMode: false,
            resistance: true,
            resistanceRatio: 0.85,
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            mousewheel: {
                enabled: true,
                forceToAxis: true,
                sensitivity: 1,
                releaseOnEdges: false,
            },
            loop: shouldLoop,
            loopedSlides: calculatedLoopedSlides,
            loopAdditionalSlides: calculatedLoopedSlides, // Additional slides to render for smooth loop
            loopPreventsSliding: false, // Allow sliding even during loop transition
            effect: 'slide',
            freeMode: false,
            longSwipes: true,
            longSwipesRatio: 0.3,
            longSwipesMs: 300,
            preventClicks: false,
            preventClicksPropagation: false,
            slidesPerGroup: 1,
            // Prevent double-clicks and rapid clicking
            preventInteractionOnTransition: true,
            watchSlidesProgress: true,
            normalizeSlideIndex: true,
            roundLengths: true,
            breakpoints: {
                320: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    centeredSlides: true
                },
                768: {
                    slidesPerView: 'auto',
                    spaceBetween: 25,
                    centeredSlides: true
                },
                1024: {
                    slidesPerView: 'auto',
                    spaceBetween: 30,
                    centeredSlides: true
                }
            },
            on: {
                init: function() {
                    const swiper = this;
                    this.wrapperEl.style.transitionTimingFunction = springCurve;
                    
                    // Lightweight fix for initial positioning - only if needed
                    requestAnimationFrame(function() {
                        // Only fix if there's a visible positioning issue
                        if (swiper.params.centeredSlides && swiper.activeIndex !== undefined) {
                            // Single update with instant reposition - minimal overhead
                            swiper.updateSlidesClasses();
                        }
                    });
                },
                setTransition: function(swiper, duration) {
                    // Optimize: Only set on wrapper, not individual slides
                    swiper.wrapperEl.style.transitionDuration = duration + 'ms';
                    swiper.wrapperEl.style.transitionTimingFunction = springCurve;
                },
                slideChange: function() {
                    const swiper = this;
                    // Only update timing if needed
                    swiper.wrapperEl.style.transitionTimingFunction = springCurve;
                    
                    if (!hasInteracted && swipeIndicator) {
                        hasInteracted = true;
                        swipeIndicator.style.opacity = '0';
                        swipeIndicator.style.transition = 'opacity 0.5s ease';
                        setTimeout(() => {
                            swipeIndicator.style.display = 'none';
                        }, 500);
                    }
                },
                slideChangeTransitionStart: function() {
                    // Ensure smooth transition when clicking on slides
                    const swiper = this;
                    isTransitioning = true; // Lock during transition
                    swiper.wrapperEl.style.transitionTimingFunction = springCurve;
                    
                    // Safety timeout: reset transitioning flag if transition doesn't complete
                    // This prevents the slideshow from getting stuck
                    setTimeout(function() {
                        if (isTransitioning) {
                            isTransitioning = false;
                        }
                    }, swiper.params.speed + 100); // Add small buffer to speed
                },
                slideChangeTransitionEnd: function() {
                    // Fix positioning after click transition - ensures smooth centering
                    const swiper = this;
                    isTransitioning = false; // Unlock after transition
                    
                    // Only update if needed and after transition completes
                    if (swiper.params.centeredSlides && swiper.isLocked !== true) {
                        // Ensure proper centering after click-to-slide
                        // Use requestAnimationFrame for smoother update
                        requestAnimationFrame(function() {
                            swiper.updateSlidesClasses();
                        });
                    }
                },
                click: function(swiper, event) {
                    // Prevent clicks during transitions to avoid bugs
                    // The preventInteractionOnTransition option handles this, but we double-check
                    if (isTransitioning || swiper.isLocked || swiper.animating) {
                        return;
                    }
                    
                    // Ensure smooth transition timing for click navigation
                    // Swiper's slideToClickedSlide handles the actual navigation automatically
                    // We just ensure the spring curve is applied
                    swiper.wrapperEl.style.transitionTimingFunction = springCurve;
                },
                touchStart: function() {
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
        
    } catch (error) {
        logError('Services Slider Error', error);
    }
}

/**
 * Email/Phone Protection from Bots
 */
function initEmailPhoneProtection() {
    try {
        // Email links
        const emailLinks = document.querySelectorAll('.email-link');
        emailLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const email = this.getAttribute('data-email');
                if (email) {
                    window.location.href = 'mailto:' + email;
                }
            });
        });
        
        // Phone links
        const phoneLinks = document.querySelectorAll('.phone-link');
        phoneLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const phone = this.getAttribute('data-phone');
                if (phone) {
                    window.location.href = 'tel:' + phone;
                }
            });
        });
        
    } catch (error) {
        logError('Email/Phone Protection Error', error);
    }
}

/**
 * Performance Optimizations
 */
function initPerformanceOptimizations() {
    try {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
        
        // Preconnect to external domains
        const preconnectDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdn.jsdelivr.net',
            'https://unpkg.com'
        ];
        
        preconnectDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
        
    } catch (error) {
        logError('Performance Optimization Error', error);
    }
}

/**
 * Utility Functions
 */
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

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Button Click Handlers
 */
document.addEventListener('click', function(e) {
    try {
        // Handle CTA button clicks
        const btn = e.target.closest('.btn-primary, .btn-secondary');
        if (btn && btn.textContent.includes('Get in touch')) {
            const contactSection = document.querySelector('.contact-section');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        // Handle "What we do" link
        if (e.target.classList.contains('btn-link-button') && e.target.textContent.includes('What we do')) {
            const servicesSection = document.querySelector('.services-section');
            if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        logError('Button Click Handler Error', error);
    }
});

/**
 * Add Dynamic CSS for Animations
 */
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
    
    @keyframes scroll {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-50%);
        }
    }
`;
document.head.appendChild(style);

// Console welcome message
console.log('%c🚀 ABI Secure Website v2.0', 'color: #1C3830; font-size: 18px; font-weight: bold;');
console.log('%c✓ Security features enabled', 'color: #2E7D32; font-size: 12px;');
console.log('%c✓ Error handling active', 'color: #2E7D32; font-size: 12px;');
console.log('%c✓ Performance optimized', 'color: #2E7D32; font-size: 12px;');

