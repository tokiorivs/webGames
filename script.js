"use strict";

document.addEventListener('DOMContentLoaded', () => {

    // 1. Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            header.style.background = 'hsla(222, 47%, 8%, 0.95)';
        } else {
            header.style.boxShadow = 'none';
            header.style.background = 'hsla(222, 47%, 8%, 0.8)';
        }
    });

    // 2. Intersection Observer for Scroll Animations (Anti-Gravity Motion)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: stop observing once it has appeared
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Get elements to animate
    const animElements = document.querySelectorAll('.card, .section-title, .section-subtitle, .cta-container');
    animElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // 3. Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

});
