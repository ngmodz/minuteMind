// Animation utilities for MinuteMind
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupButtonRipples();
        this.setupProgressAnimations();
        this.setupFloatingElements();
    }

    // Intersection Observer for scroll animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = element.dataset.delay || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animate');
                    }, parseInt(delay));
                    
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right').forEach(el => {
            observer.observe(el);
        });

        // Observe cards with delays
        document.querySelectorAll('[data-delay]').forEach(el => {
            observer.observe(el);
        });
    }

    // Setup hover effects for cards and buttons
    setupHoverEffects() {
        document.querySelectorAll('.hover-lift').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-8px) scale(1.02)';
                element.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0) scale(1)';
                element.style.boxShadow = '';
            });
        });

        // Feature cards special hover effect
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.feature-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(5deg)';
                }
            });

            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.feature-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    // Button ripple effect
    setupButtonRipples() {
        document.querySelectorAll('.cta-button, .submit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                    animation: ripple 0.6s ease-out;
                `;

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }

    // Animate progress bars and rings
    setupProgressAnimations() {
        const animateProgressBar = (bar, targetProgress) => {
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.transition = 'width 1.5s ease-out';
                bar.style.width = targetProgress + '%';
            }, 100);
        };

        const animateProgressRing = (ring, targetProgress) => {
            const circumference = 2 * Math.PI * 50; // radius = 50
            const offset = circumference - (targetProgress / 100) * circumference;
            
            ring.style.strokeDasharray = circumference;
            ring.style.strokeDashoffset = circumference;
            
            setTimeout(() => {
                ring.style.transition = 'stroke-dashoffset 2s ease-out';
                ring.style.strokeDashoffset = offset;
            }, 500);
        };

        // Animate when elements come into view
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const progress = element.dataset.progress || 0;
                    
                    if (element.classList.contains('progress-bar')) {
                        animateProgressBar(element, progress);
                    } else if (element.classList.contains('progress-fill')) {
                        animateProgressRing(element, progress);
                    }
                    
                    progressObserver.unobserve(element);
                }
            });
        });

        document.querySelectorAll('.progress-bar, .progress-fill').forEach(el => {
            progressObserver.observe(el);
        });
    }

    // Floating background elements
    setupFloatingElements() {
        document.querySelectorAll('.floating-element').forEach(element => {
            const animateFloat = () => {
                const x = Math.random() * 20 - 10; // -10 to 10
                const y = Math.random() * 20 - 10; // -10 to 10
                const rotate = Math.random() * 20 - 10; // -10 to 10 degrees
                
                element.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
                
                setTimeout(animateFloat, 3000 + Math.random() * 2000); // 3-5 seconds
            };
            
            // Start animation with initial delay
            setTimeout(animateFloat, Math.random() * 2000);
        });

        // Floating cards animation
        document.querySelectorAll('.floating-card').forEach((card, index) => {
            const delay = card.dataset.delay || index * 200;
            
            setTimeout(() => {
                card.classList.add('animate');
                
                // Add continuous floating animation
                const floatAnimation = () => {
                    const y = Math.sin(Date.now() * 0.001 + index) * 10;
                    card.style.transform = `translateY(${y}px)`;
                    requestAnimationFrame(floatAnimation);
                };
                
                setTimeout(floatAnimation, 1000);
            }, parseInt(delay));
        });
    }

    // Counter animation for numbers
    static animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                return;
            }
            
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        };
        
        updateCounter();
    }

    // Text typing animation
    static typeText(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const typeNextChar = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeNextChar, speed);
            }
        };
        
        typeNextChar();
    }

    // Stagger animation for multiple elements
    static staggerAnimation(elements, animationClass, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
            }, index * delay);
        });
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimationManager();
});

// CSS animations keyframes (to be added to CSS)
const animationStyles = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideLeft {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideRight {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes float {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-20px);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

@keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0, 0, 0);
    }
    40%, 43% {
        transform: translate3d(0, -10px, 0);
    }
    70% {
        transform: translate3d(0, -5px, 0);
    }
    90% {
        transform: translate3d(0, -2px, 0);
    }
}

.fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease-out;
}

.fade-in.animate {
    opacity: 1;
    transform: translateY(0);
}

.slide-up {
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s ease-out;
}

.slide-up.animate {
    opacity: 1;
    transform: translateY(0);
}

.slide-left {
    opacity: 0;
    transform: translateX(50px);
    transition: all 0.8s ease-out;
}

.slide-left.animate {
    opacity: 1;
    transform: translateX(0);
}

.slide-right {
    opacity: 0;
    transform: translateX(-50px);
    transition: all 0.8s ease-out;
}

.slide-right.animate {
    opacity: 1;
    transform: translateX(0);
}

.hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-card {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-card.animate {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.floating-element {
    animation: float 6s ease-in-out infinite;
    animation-delay: var(--delay, 0s);
    transition: transform 2s ease-in-out;
}
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

export { AnimationManager };