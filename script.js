"use strict";

document.addEventListener('DOMContentLoaded', () => {

    // 1. Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                header.style.background = 'rgba(10, 16, 25, 0.95)';
            } else {
                header.style.boxShadow = 'none';
                header.style.background = 'rgba(10, 16, 25, 0.8)';
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

    const animElements = document.querySelectorAll('.card, .section-title, .section-subtitle, .cta-container, .feature-block, .step-card, .faq-item');
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
                    mainMediaImage.src = (src && src.charAt(0) === '/') ? src : BASE_URL + src;
                    mainMediaImage.alt = thumb.getAttribute('data-alt') || mainMediaImage.alt;
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

/* ===== Menú de juegos y menú móvil ===== */
(function () {
    function init() {
        var header = document.querySelector('.header');
        var toggle = document.querySelector('.nav-toggle');
        var dds = document.querySelectorAll('.nav-dropdown');

        function closeDropdowns(except) {
            Array.prototype.forEach.call(dds, function (d) {
                if (d === except) return;
                d.classList.remove('open');
                var b = d.querySelector('.nav-dd-btn');
                if (b) b.setAttribute('aria-expanded', 'false');
            });
        }
        Array.prototype.forEach.call(dds, function (d) {
            var btn = d.querySelector('.nav-dd-btn');
            if (!btn) return;
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var open = !d.classList.contains('open');
                closeDropdowns(d);
                d.classList.toggle('open', open);
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        });
        document.addEventListener('click', function () { closeDropdowns(null); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeDropdowns(null);
                if (header && header.classList.contains('nav-open')) {
                    header.classList.remove('nav-open');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
        if (toggle && header) {
            toggle.addEventListener('click', function (e) {
                e.stopPropagation();
                var open = !header.classList.contains('nav-open');
                header.classList.toggle('nav-open', open);
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
            });
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

/* ===== CTA móvil fijo ===== */
(function () {
    var skip = /\/(privacidad|terminos-y-condiciones|libro-de-reclamaciones)(\/|$)/.test(window.location.pathname);
    if (skip) return;
    function init() {
        var a = document.createElement('a');
        a.className = 'mobile-cta';
        a.href = '/#cotizador';
        a.textContent = 'Cotizar mi evento';
        document.body.appendChild(a);
        var target = document.getElementById('cotizador');
        if (target && 'IntersectionObserver' in window) {
            a.href = '#cotizador';
            new IntersectionObserver(function (entries) {
                a.classList.toggle('is-hidden', entries[0].isIntersecting);
            }, { threshold: 0.15 }).observe(target);
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

/* ===== Partículas 3D del hero ===== */
(function () {
    var hero = document.querySelector('.hero-garage');
    if (!hero || !window.requestAnimationFrame) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canvas = document.createElement('canvas');
    canvas.className = 'hero-particles';
    canvas.setAttribute('aria-hidden', 'true');
    hero.insertBefore(canvas, hero.firstChild);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var COLORS = [['155,240,11', 0.55], ['127,166,214', 0.35], ['255,255,255', 0.10]];
    var W = 0, H = 0, dpr = 1, parts = [], running = false, visible = true, raf = 0, last = 0;
    var px = 0.5, pm = 0.5; // posición del puntero (0..1) y su suavizado

    function pickColor() {
        var r = Math.random(), acc = 0;
        for (var i = 0; i < COLORS.length; i++) { acc += COLORS[i][1]; if (r <= acc) return COLORS[i][0]; }
        return COLORS[0][0];
    }
    function make(initial) {
        var k = Math.random();
        return {
            x: Math.random() * 2.6 - 1.3,
            y: initial ? Math.random() * 2.5 - 1.25 : 1.25,
            z: Math.random(),
            s: 0.4 + Math.random() * 0.9,
            c: pickColor(),
            kind: k < 0.58 ? 0 : (k < 0.7 ? 1 : 2),
            g: Math.floor(Math.random() * 4),                 // símbolo: 0 triángulo, 1 círculo, 2 equis, 3 cuadrado
            ph: Math.random() * 6.283,
            v: 0.5 + Math.random() * 0.8
        };
    }
    function resize() {
        var r = hero.getBoundingClientRect();
        W = Math.max(1, r.width); H = Math.max(1, r.height);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var n = Math.round(Math.min(150, Math.max(52, (W * H) / 8500)));
        while (parts.length < n) parts.push(make(true));
        parts.length = n;
        if (!running) draw(0);
    }

    function project(p, t) {
        var persp = 0.45 + (1 - p.z) * 0.95;                       // cerca = grande, lejos = pequeño
        var sway = Math.sin(t * 0.0006 * p.v + p.ph) * 0.05;
        var sx = W / 2 + (p.x + sway) * W * 0.5 * persp + (pm - 0.5) * 70 * (1 - p.z);
        var sy = H / 2 + p.y * H * 0.5 * persp;
        return { x: sx, y: sy, p: persp };
    }

    // Símbolos genéricos de mando de consola: triángulo, círculo, equis y cuadrado (solo contorno)
    function drawGlyph(g, x, y, l, ang, color, lw) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (g === 0) {                       // triángulo
            ctx.moveTo(0, -l); ctx.lineTo(l * 0.9, l * 0.7); ctx.lineTo(-l * 0.9, l * 0.7); ctx.closePath();
        } else if (g === 1) {                // círculo
            ctx.arc(0, 0, l * 0.85, 0, 6.283);
        } else if (g === 2) {                // equis
            ctx.moveTo(-l * 0.8, -l * 0.8); ctx.lineTo(l * 0.8, l * 0.8); ctx.moveTo(l * 0.8, -l * 0.8); ctx.lineTo(-l * 0.8, l * 0.8);
        } else {                             // cuadrado
            ctx.rect(-l * 0.75, -l * 0.75, l * 1.5, l * 1.5);
        }
        ctx.stroke();
        ctx.restore();
    }

    function draw(t) {
        ctx.clearRect(0, 0, W, H);
        var pts = [], i, j;
        for (i = 0; i < parts.length; i++) {
            var q = parts[i], pr = project(q, t);
            pr.q = q;
            pts.push(pr);
        }
        // líneas finas entre partículas cercanas (efecto red)
        ctx.lineWidth = 1;
        for (i = 0; i < pts.length; i++) {
            if (pts[i].q.z > 0.7) continue;
            for (j = i + 1; j < pts.length; j++) {
                if (pts[j].q.z > 0.7) continue;
                var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
                if (d < 110) {
                    ctx.strokeStyle = 'rgba(' + pts[i].q.c + ',' + ((1 - d / 110) * 0.26).toFixed(3) + ')';
                    ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
                }
            }
        }
        // partículas
        for (i = 0; i < pts.length; i++) {
            var o = pts[i], p = o.q;
            var side = Math.min(1, Math.max(0, (o.x / W - 0.1) / 0.5));       // menos densidad visual sobre el texto (izquierda)
            var a = (0.38 + 0.57 * (1 - p.z)) * (0.55 + 0.45 * side);
            var r = (1.5 + p.s * 2.1) * o.p;
            var streak = (1 - p.z) * 34 * p.v;
            ctx.fillStyle = 'rgba(' + p.c + ',' + a.toFixed(3) + ')';
            ctx.strokeStyle = 'rgba(' + p.c + ',' + (a * 0.55).toFixed(3) + ')';
            ctx.lineWidth = Math.max(0.6, r * 0.55);
            ctx.beginPath(); ctx.moveTo(o.x, o.y + 1); ctx.lineTo(o.x, o.y + streak); ctx.stroke();   // estela hacia abajo
            if (p.kind === 0) {
                ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, 6.283); ctx.fill();
                if (p.z < 0.5) { ctx.fillStyle = 'rgba(' + p.c + ',' + (a * 0.2).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(o.x, o.y, r * 3.2, 0, 6.283); ctx.fill(); }
            } else if (p.kind === 1) {
                ctx.fillRect(o.x - r, o.y - r, r * 2, r * 2);
            } else {
                drawGlyph(p.g, o.x, o.y, r * 2.4, t * 0.0004 * p.v + p.ph, 'rgba(' + p.c + ',' + a.toFixed(3) + ')', Math.max(1, r * 0.5));
            }
        }
    }

    function step(t) {
        raf = 0;
        if (!running) return;
        var dt = Math.min(48, t - last || 16); last = t;
        pm += (px - pm) * 0.04;
        for (var i = 0; i < parts.length; i++) {
            var q = parts[i];
            q.y -= dt * 0.00017 * q.v * (0.35 + (1 - q.z) * 0.9);       // sube más rápido lo cercano (parallax)
            if (q.y < -1.3) { var n = make(false); n.x = q.x * 0.3 + (Math.random() * 2.6 - 1.3) * 0.7; parts[i] = n; }
        }
        draw(t);
        raf = requestAnimationFrame(step);
    }
    function start() { if (running || reduce || !visible || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(step); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0.02 }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); px = (e.clientX - r.left) / r.width; }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero); else window.addEventListener('resize', resize);

    resize();
    draw(0);
    start();
})();
