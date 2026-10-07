"use strict";

document.addEventListener('DOMContentLoaded', () => {

    // 1. Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                header.style.background = 'rgba(18, 19, 22, 0.95)';
            } else {
                header.style.boxShadow = 'none';
                header.style.background = 'rgba(18, 19, 22, 0.8)';
            }
        });
    }

    // 2. Intersection Observer for Scroll Animations (Anti-Gravity Motion)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animElements = document.querySelectorAll('.card, .section-title, .section-subtitle, .cta-container, .feature-block, .step-card, .faq-item, .simulator-card');
    animElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // 3. FAQ Toggle Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const answer = item.querySelector('.faq-answer');
                if (answer) {
                    const isVisible = answer.style.display === 'block';
                    answer.style.display = isVisible ? 'none' : 'block';
                    question.style.color = isVisible ? 'var(--text-primary)' : 'var(--primary)';
                }
            });
            const answer = item.querySelector('.faq-answer');
            if (answer) answer.style.display = 'none';
        }
    });

    // 4. Smooth scrolling for internal anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            let targetEl = null;
            try { targetEl = document.querySelector(targetId); } catch (err) { targetEl = null; }
            if (targetEl) {
                e.preventDefault();
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
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');

            const type = thumb.getAttribute('data-type');
            const src = thumb.getAttribute('data-src');
            const videoIframe = document.getElementById('mainMediaVideo');

            if (type === 'video') {
                if (videoIframe) {
                    videoIframe.style.display = 'block';
                    const iframeSrc = videoIframe.src;
                    if (!iframeSrc.includes('autoplay=1')) {
                        videoIframe.src = iframeSrc + (iframeSrc.includes('?') ? '&' : '?') + 'autoplay=1';
                    }
                }
                if (mainMediaPlaceholder) mainMediaPlaceholder.style.display = 'none';
                if (mainMediaImage) mainMediaImage.style.display = 'none';
            } else if (type === 'image') {
                if (videoIframe) {
                    videoIframe.style.display = 'none';
                    const iframeSrc = videoIframe.src;
                    videoIframe.src = iframeSrc.replace('&autoplay=1', '').replace('?autoplay=1', '');
                }
                if (mainMediaPlaceholder) mainMediaPlaceholder.style.display = 'none';
                if (mainMediaImage) {
                    mainMediaImage.style.display = 'block';
                    mainMediaImage.src = BASE_URL + src;
                }
            }
        });
    });

    if (mainMediaPlaceholder) {
        mainMediaPlaceholder.addEventListener('click', () => {
            const videoThumb = document.querySelector('.thumb[data-type="video"]');
            if (videoThumb) videoThumb.click();
        });
    }

    // 6. Interactive Roulette Simulator (Fase 3: Simulador en Vivo)
    const wheelCanvas = document.getElementById('wheelCanvas');
    const spinWheelBtn = document.getElementById('spinWheelBtn');
    const wheelResultBox = document.getElementById('wheelResultBox');

    if (wheelCanvas && spinWheelBtn) {
        const ctx = wheelCanvas.getContext('2d');
        const sectors = [
            { label: 'Premio Estrella', color: '#8b5cf6' },
            { label: 'Merchandising', color: '#10b981' },
            { label: 'Descuento 20%', color: '#0ea5e9' },
            { label: 'Gira de Nuevo', color: '#475569' },
            { label: 'Pack Sorpresa', color: '#f59e0b' },
            { label: 'Premio Premium', color: '#ec4899' }
        ];

        const numSectors = sectors.length;
        const arc = (2 * Math.PI) / numSectors;
        const size = wheelCanvas.width;
        const radius = size / 2;

        function drawWheel() {
            ctx.clearRect(0, 0, size, size);

            sectors.forEach((sector, i) => {
                const angle = i * arc;

                // Slice
                ctx.beginPath();
                ctx.fillStyle = sector.color;
                ctx.moveTo(radius, radius);
                ctx.arc(radius, radius, radius - 4, angle, angle + arc);
                ctx.lineTo(radius, radius);
                ctx.fill();

                // Slice Border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Text
                ctx.save();
                ctx.translate(radius, radius);
                ctx.rotate(angle + arc / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px Geist, sans-serif';
                ctx.shadowColor = 'rgba(0,0,0,0.6)';
                ctx.shadowBlur = 4;
                ctx.fillText(sector.label, radius - 20, 4);
                ctx.restore();
            });

            // Outer decorative ring
            ctx.beginPath();
            ctx.arc(radius, radius, radius - 2, 0, 2 * Math.PI);
            ctx.strokeStyle = '#25D366';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        drawWheel();

        let isSpinning = false;
        let currentRotation = 0;

        spinWheelBtn.addEventListener('click', () => {
            if (isSpinning) return;
            isSpinning = true;
            spinWheelBtn.disabled = true;
            spinWheelBtn.innerText = 'Girando ruleta...';

            if (wheelResultBox) {
                wheelResultBox.innerHTML = '<span class="text-secondary" style="font-size: 0.85rem;">Calculando resultado con física táctil...</span>';
            }

            // Pick random additional rotation between 5 and 8 full turns (1800 - 2880 deg)
            const extraDegrees = Math.floor(1800 + Math.random() * 1080);
            currentRotation += extraDegrees;

            wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;

            setTimeout(() => {
                isSpinning = false;
                spinWheelBtn.disabled = false;
                spinWheelBtn.innerText = '¡GIRAR OTRA VEZ!';

                // The pointer is at top (270 degrees in canvas space or top 0)
                // Total effective rotation modulo 360:
                const actualDeg = currentRotation % 360;
                // Since pointer is at top (offset by 270 deg or 90 deg counter):
                const pointerAngle = (360 - actualDeg + 270) % 360;
                const winningIndex = Math.floor(pointerAngle / (360 / numSectors)) % numSectors;
                const winningPrize = sectors[winningIndex].label;

                if (wheelResultBox) {
                    wheelResultBox.innerHTML = `
                        <div class="result-badge">
                            🎉 ¡Resultado: ${winningPrize}! Así de adictivo es en tu stand.
                        </div>
                    `;
                }
            }, 4000);
        });
    }

    // 7. Fast Quote Contact Form (4 Campos Clave)
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    function showFormStatus(msg, ok) {
        if (!formStatus) return;
        formStatus.textContent = msg;
        formStatus.style.color = ok ? 'var(--primary)' : '#f87171';
        formStatus.style.display = 'block';
    }

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Enviando solicitud...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            const formKey = "96c0b266757e4417dab8d571fb17ada6";
            const endpoint = `https://formsubmit.co/ajax/${formKey}`;

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showFormStatus('¡Solicitud enviada! Revisaré los detalles de tu evento y te responderé por WhatsApp o correo en horario de atención (8:00 a. m. a 6:00 p. m.).', true);
                    contactForm.reset();
                } else {
                    throw new Error('Error al enviar la solicitud');
                }
            } catch (error) {
                console.error('Submission Error:', error);
                showFormStatus('Hubo un problema temporal con el formulario. Escríbeme directamente por WhatsApp y te atiendo.', false);
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

});

/* ===== Aviso de cookies y carga condicional de Google Tag Manager ===== */
(function () {
    var GTM_ID = 'GTM-NKSKHJJS';
    var KEY = 'totemin_cookies';

    function getChoice() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function setChoice(v) {
        try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento: se vuelve a preguntar */ }
    }
    function loadGTM() {
        if (window.__gtmLoaded) return;
        window.__gtmLoaded = true;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
        document.head.appendChild(s);
    }
    function showBanner() {
        var box = document.createElement('div');
        box.className = 'cookie-banner';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-label', 'Aviso de cookies');
        box.innerHTML =
            '<p>Uso cookies de analítica (Google Tag Manager) solo si lo aceptas, para medir las visitas del sitio. ' +
            'Más información en la <a href="/privacidad#cookies">Política de Privacidad</a>.</p>' +
            '<div class="cookie-actions">' +
            '<button type="button" class="cookie-btn cookie-btn-secondary" data-choice="rejected">Rechazar</button>' +
            '<button type="button" class="cookie-btn cookie-btn-primary" data-choice="accepted">Aceptar</button>' +
            '</div>';
        box.addEventListener('click', function (e) {
            var c = e.target && e.target.getAttribute && e.target.getAttribute('data-choice');
            if (!c) return;
            setChoice(c);
            if (c === 'accepted') loadGTM();
            box.remove();
        });
        document.body.appendChild(box);
    }

    function init() {
        var c = getChoice();
        if (c === 'accepted') loadGTM();
        else if (c !== 'rejected') showBanner();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

/* ===== Cotizador guiado (WhatsApp / correo) ===== */
(function () {
    var form = document.getElementById('cotizadorForm');
    if (!form) return;

    var WA = '51960963900';
    var FORM_KEY = '96c0b266757e4417dab8d571fb17ada6';
    var TOTAL = 8;
    var step = 1;
    var steps = form.querySelectorAll('.cot-step');
    var label = document.getElementById('cotStepLabel');
    var fill = document.getElementById('cotBarFill');
    var back = document.getElementById('cotBack');
    var next = document.getElementById('cotNext');
    var err = document.getElementById('cotError');
    var status = document.getElementById('cotStatus');
    var wa = document.getElementById('cotWhatsapp');
    var mail = document.getElementById('cotCorreo');

    function chipsOf(name) { return form.querySelector('.cot-chips[data-name="' + name + '"]'); }
    function selected(name) {
        var box = chipsOf(name);
        return Array.prototype.map.call(box.querySelectorAll('.cot-chip[aria-pressed="true"]'), function (c) { return c.getAttribute('data-value'); });
    }
    function val(id) { return (document.getElementById(id).value || '').trim(); }

    form.addEventListener('click', function (e) {
        var chip = e.target.closest ? e.target.closest('.cot-chip') : null;
        if (!chip) return;
        var box = chip.parentNode;
        if (box.getAttribute('data-multi')) {
            chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        } else {
            Array.prototype.forEach.call(box.querySelectorAll('.cot-chip'), function (c) { c.setAttribute('aria-pressed', 'false'); });
            chip.setAttribute('aria-pressed', 'true');
        }
        err.hidden = true;
    });

    // Preselección desde las páginas de cada juego: /?juego=ruleta#cotizador
    try {
        var q = new URLSearchParams(window.location.search).get('juego');
        if (q) {
            var pre = chipsOf('juegos').querySelector('.cot-chip[data-key="' + q + '"]');
            if (pre) pre.setAttribute('aria-pressed', 'true');
        }
    } catch (e) { /* sin URLSearchParams */ }

    function summary() {
        var lines = [
            'Hola totemIn, quiero cotizar un evento.',
            'Empresa: ' + val('cotEmpresa'),
            'Juego(s): ' + selected('juegos').join(', '),
            'Equipo: ' + selected('equipo').join(', ') + ' · Pantalla: ' + selected('pantalla').join(', '),
            'Equipos: ' + val('cotEquipos') + ' · Días de evento: ' + val('cotDias'),
            'Licencia: ' + selected('licencia').join(', '),
            'Materiales de marca: ' + selected('materiales').join(', '),
            'Fecha estimada: ' + val('cotFecha'),
            'Contacto: ' + val('cotContacto')
        ];
        return lines.join('\n');
    }

    function valid(n) {
        if (n === 1 && selected('juegos').length === 0) return 'Elige al menos un juego.';
        if (n === 2 && selected('equipo').length === 0) return 'Elige el tipo de equipo.';
        if (n === 3 && selected('pantalla').length === 0) return 'Elige el tipo de pantalla.';
        if (n === 5 && selected('licencia').length === 0) return 'Elige una opción de licencia.';
        if (n === 6 && selected('materiales').length === 0) return 'Cuéntame si ya tienes tus materiales.';
        if (n === 7 && (!val('cotEmpresa') || !val('cotFecha') || !val('cotContacto'))) return 'Completa los tres datos.';
        return '';
    }

    function render() {
        Array.prototype.forEach.call(steps, function (s) { s.hidden = Number(s.getAttribute('data-step')) !== step; });
        label.textContent = 'Paso ' + step + ' de ' + TOTAL;
        fill.style.width = (step / TOTAL * 100) + '%';
        back.hidden = step === 1;
        next.hidden = step === TOTAL;
        if (step === TOTAL) {
            var text = summary();
            document.getElementById('cotResumen').textContent = text;
            wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
        }
        err.hidden = true;
        status.hidden = true;
        if (window.__gtmLoaded && window.dataLayer) window.dataLayer.push({ event: 'cotizador_paso', paso: step });
    }

    next.addEventListener('click', function () {
        var m = valid(step);
        if (m) { err.textContent = m; err.hidden = false; return; }
        if (step < TOTAL) { step++; render(); }
    });
    back.addEventListener('click', function () { if (step > 1) { step--; render(); } });

    function needConsent(e) {
        if (!document.getElementById('cotConsent').checked) {
            if (e) e.preventDefault();
            err.textContent = 'Acepta el uso de tus datos para poder enviar la solicitud.';
            err.hidden = false;
            return true;
        }
        err.hidden = true;
        return false;
    }
    wa.addEventListener('click', function (e) {
        if (needConsent(e)) return;
        if (window.__gtmLoaded && window.dataLayer) window.dataLayer.push({ event: 'cotizador_enviado', canal: 'whatsapp' });
    });
    mail.addEventListener('click', function () {
        if (needConsent(null)) return;
        mail.disabled = true;
        status.hidden = true;
        var fd = new FormData();
        fd.append('_subject', 'Nueva solicitud de cotización (cotizador totemIn)');
        fd.append('empresa', val('cotEmpresa'));
        fd.append('resumen', summary());
        fd.append('consent_datos', 'Acepto');
        fetch('https://formsubmit.co/ajax/' + FORM_KEY, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } })
            .then(function (r) {
                if (!r.ok) throw new Error('fallo');
                status.textContent = '¡Solicitud enviada! Te responderé en horario de atención (8:00 a. m. a 6:00 p. m.).';
                status.hidden = false;
                if (window.__gtmLoaded && window.dataLayer) window.dataLayer.push({ event: 'cotizador_enviado', canal: 'correo' });
            })
            .catch(function () {
                err.textContent = 'No se pudo enviar por correo. Usa el botón de WhatsApp.';
                err.hidden = false;
            })
            .then(function () { mail.disabled = false; });
    });

    render();
})();
