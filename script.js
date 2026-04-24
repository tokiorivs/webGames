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

    // 4. Media Viewer Logic (Dynamic Image/Video Switching)
    const BASE_URL = "https://pub-df6ac2b60b9047d88d95e2589d854e41.r2.dev/r2/";
    
    const mainMediaPlaceholder = document.getElementById('mainMediaPlaceholder');
    const mainMediaImage = document.getElementById('mainMediaImage');
    const thumbs = document.querySelectorAll('#thumbnailSlider .thumb');

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            // Remove active class from all thumbs
            thumbs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked thumb
            thumb.classList.add('active');

            const type = thumb.getAttribute('data-type');
            const src = thumb.getAttribute('data-src');

            if (type === 'video') {
                // Show placeholder for video (teaser)
                mainMediaPlaceholder.style.display = 'flex';
                mainMediaImage.style.display = 'none';
            } else if (type === 'image') {
                // Show image
                mainMediaPlaceholder.style.display = 'none';
                mainMediaImage.style.display = 'block';
                mainMediaImage.src = BASE_URL + src;
            }
        });
    });

});
