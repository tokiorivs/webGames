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
    const animElements = document.querySelectorAll('.card, .section-title, .section-subtitle, .cta-container, .feature-block, .step-card, .faq-item');
    animElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // 3. FAQ Toggle Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Toggle active class (could add CSS for this)
            const answer = item.querySelector('.faq-answer');
            const isVisible = answer.style.display === 'block';
            answer.style.display = isVisible ? 'none' : 'block';
            question.style.color = isVisible ? 'var(--text-primary)' : 'var(--primary)';
        });
        // Hide answers by default
        item.querySelector('.faq-answer').style.display = 'none';
    });

    // 4. Smooth scrolling for nav links
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

    // 5. Media Viewer Logic (Dynamic Image/Video Switching)
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
            const videoIframe = document.getElementById('mainMediaVideo');

            if (type === 'video') {
                // Show video iframe and autoplay
                if (videoIframe) {
                    videoIframe.style.display = 'block';
                    const iframeSrc = videoIframe.src;
                    if (!iframeSrc.includes('autoplay=1')) {
                        videoIframe.src = iframeSrc + (iframeSrc.includes('?') ? '&' : '?') + 'autoplay=1';
                    }
                }
                mainMediaPlaceholder.style.display = 'none';
                mainMediaImage.style.display = 'none';
            } else if (type === 'image') {
                // Show image
                if (videoIframe) {
                    videoIframe.style.display = 'none';
                    // Stop video playback by resetting src
                    const iframeSrc = videoIframe.src;
                    videoIframe.src = iframeSrc.replace('&autoplay=1', '').replace('?autoplay=1', '');
                }
                mainMediaPlaceholder.style.display = 'none';
                mainMediaImage.style.display = 'block';
                mainMediaImage.src = BASE_URL + src;
            }
        });
    });

    if (mainMediaPlaceholder) {
        mainMediaPlaceholder.addEventListener('click', () => {
            const videoThumb = document.querySelector('.thumb[data-type="video"]');
            if (videoThumb) {
                videoThumb.click();
            }
        });
    }

    // 6. Contact Form Submission (Real Email Sending)
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Basic UI Feedback
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);

            // Masking/Service Configuration
            // Note: For extra spam protection, we are using a "Unique Key" 
            // provided by FormSubmit instead of the naked email address.
            const formKey = "96c0b266757e4417dab8d571fb17ada6";
            const endpoint = `https://formsubmit.co/ajax/${formKey}`;

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    alert('¡Gracias! Tu solicitud ha sido enviada. Nos pondremos en contacto contigo pronto.');
                    contactForm.reset();
                } else {
                    throw new Error('Error al enviar el formulario');
                }
            } catch (error) {
                console.error('Submission Error:', error);
                alert('Hubo un problema al enviar tu solicitud. Por favor, inténtalo de nuevo o contáctanos por WhatsApp.');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

});
