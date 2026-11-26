document.addEventListener('DOMContentLoaded', function () {
    initThemeToggle();
    initNavigation();
    initStarfield();
});

function initThemeToggle() {
    const root = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-toggle-icon');
    const themeLabel = document.getElementById('theme-toggle-label');

    const sunSvg =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="4"/>' +
        '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>' +
        '</svg>';
    const moonSvg =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
        '</svg>';

    function syncThemeButton() {
        const isLight = root.getAttribute('data-theme') === 'blue-light';
        themeIcon.innerHTML = isLight ? moonSvg : sunSvg;
        themeLabel.textContent = isLight ? 'Dark' : 'Light';
        themeToggle.setAttribute('aria-label', isLight ? 'Switch to gold-dark theme' : 'Switch to blue-light theme');
        themeToggle.setAttribute('aria-pressed', String(isLight));
    }

    syncThemeButton();

    themeToggle.addEventListener('click', function () {
        const nextTheme = root.getAttribute('data-theme') === 'blue-light' ? 'gold-dark' : 'blue-light';
        root.setAttribute('data-theme', nextTheme);
        try {
            localStorage.setItem('theme', nextTheme);
        } catch (e) {}
        syncThemeButton();
    });
}

function initNavigation() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');

    hamburgerMenu.addEventListener('click', function () {
        const isExpanded = this.classList.toggle('active');
        navLinks.classList.toggle('active');
        this.setAttribute('aria-expanded', isExpanded);
    });

    document.querySelectorAll('.nav-links li a').forEach(function (link) {
        link.addEventListener('click', function () {
            hamburgerMenu.classList.remove('active');
            navLinks.classList.remove('active');
            hamburgerMenu.setAttribute('aria-expanded', 'false');
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetSelector = this.getAttribute('href');
            if (targetSelector === '#') return;
            const target = document.querySelector(targetSelector);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const scrollTopButton = document.getElementById('scroll-top');

    window.addEventListener('scroll', function () {
        scrollTopButton.classList.toggle('visible', window.scrollY > 300);
    });

    scrollTopButton.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initStarfield() {
    const header = document.getElementById('site-header');
    const canvas = document.getElementById('stars-canvas');
    if (!header || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const FIELD_STAR_COUNT = 115;
    const CLUSTER_STAR_COUNT = 240;
    const CLUSTER_DURATION = 15;
    const CLUSTER_COOLDOWN = 6;
    const SUPERNOVA_INTERVAL = 10;
    const SUPERNOVA_DURATION = 3.8;

    const COLORED_STAR_PALETTE = [
        '168, 200, 255', // O/B blue-white
        '255, 230, 168', // G-type warm yellow
        '255, 133, 119'  // M / LRD muted red
    ];

    const CLUSTER_PALETTE = [
        '255, 250, 240',
        '255, 245, 224',
        '190, 218, 255',
        '255, 218, 162'
    ];

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resizeCanvas() {
        const rect = header.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = Math.max(rect.width, 1);
        height = Math.max(rect.height, 1);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createFieldStars() {
        const stars = [];
        for (let i = 0; i < FIELD_STAR_COUNT; i++) {
            const isColored = Math.random() < 0.2;
            const color = isColored
                ? COLORED_STAR_PALETTE[Math.floor(Math.random() * COLORED_STAR_PALETTE.length)]
                : '255, 255, 255';
            stars.push({
                x: Math.random(),
                y: Math.random(),
                radius: Math.random() * 1.1 + 0.55,
                baseAlpha: Math.random() * 0.55 + 0.3,
                speed: Math.random() * 1.4 + 0.5,
                phase: Math.random() * Math.PI * 2,
                color: color,
                isLrd: false
            });
        }

        // Two subtle "Little Red Dots" with a faint diffuse halo
        for (let i = 0; i < 2; i++) {
            stars.push({
                x: 0.45 + Math.random() * 0.48,
                y: 0.15 + Math.random() * 0.7,
                radius: 1.6,
                baseAlpha: 0.78,
                speed: 0.8 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
                color: '255, 108, 94',
                isLrd: true
            });
        }
        return stars;
    }

    function pickSkySpot() {
        const isDesktop = width > 768;
        return {
            x: isDesktop ? 0.52 + Math.random() * 0.4 : 0.15 + Math.random() * 0.7,
            y: 0.18 + Math.random() * 0.64
        };
    }

    function createCluster(startTime) {
        const center = pickSkySpot();
        const coreScale = 0.045 + Math.random() * 0.02;
        const stars = [];

        // Projected 2D Plummer sphere radial distribution: R = a * sqrt(u / (1 - u))
        for (let i = 0; i < CLUSTER_STAR_COUNT; i++) {
            const u = Math.random() * 0.94;
            const r = coreScale * Math.sqrt(u / (1 - u));
            const angle = Math.random() * Math.PI * 2;
            stars.push({
                dx: Math.cos(angle) * r,
                dy: Math.sin(angle) * r,
                radius: Math.random() * 0.9 + 0.4,
                alpha: Math.random() * 0.55 + 0.25,
                speed: Math.random() * 1.6 + 0.7,
                phase: Math.random() * Math.PI * 2,
                color: CLUSTER_PALETTE[Math.floor(Math.random() * CLUSTER_PALETTE.length)]
            });
        }

        return {
            cx: center.x,
            cy: center.y,
            startTime: startTime,
            duration: CLUSTER_DURATION,
            stars: stars
        };
    }

    function createSupernova(startTime, customSpot) {
        const spot = customSpot || pickSkySpot();
        const isGold = Math.random() < 0.6;
        return {
            x: spot.x,
            y: spot.y,
            startTime: startTime,
            duration: SUPERNOVA_DURATION,
            maxRadius: 45 + Math.random() * 23,
            ringColor: isGold ? '255, 224, 158' : '185, 225, 255'
        };
    }

    function drawFieldStars(stars, time) {
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            const twinkle = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase));
            const alpha = s.baseAlpha * twinkle;
            const px = s.x * width;
            const py = s.y * height;

            if (s.isLrd) {
                const halo = ctx.createRadialGradient(px, py, 0, px, py, s.radius * 4.5);
                halo.addColorStop(0, `rgba(${s.color}, ${alpha})`);
                halo.addColorStop(0.4, `rgba(${s.color}, ${alpha * 0.35})`);
                halo.addColorStop(1, `rgba(${s.color}, 0)`);
                ctx.fillStyle = halo;
                ctx.beginPath();
                ctx.arc(px, py, s.radius * 4.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, s.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawCluster(cluster, time) {
        if (!cluster) return false;
        const age = time - cluster.startTime;
        if (age < 0) return true;
        if (age >= cluster.duration) return false;

        const fadeIn = 3;
        const fadeOut = 3;
        let envelope = 1;
        if (age < fadeIn) {
            envelope = age / fadeIn;
        } else if (age > cluster.duration - fadeOut) {
            envelope = (cluster.duration - age) / fadeOut;
        }
        envelope = Math.max(0, Math.min(1, envelope));

        const scale = Math.min(width, height);
        const cx = cluster.cx * width;
        const cy = cluster.cy * height;

        // Faint unresolved core glow
        const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.14);
        coreGlow.addColorStop(0, `rgba(255, 238, 200, ${0.09 * envelope})`);
        coreGlow.addColorStop(1, 'rgba(255, 238, 200, 0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, scale * 0.14, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < cluster.stars.length; i++) {
            const s = cluster.stars[i];
            const px = cx + s.dx * scale;
            const py = cy + s.dy * scale;
            if (px < -4 || px > width + 4 || py < -4 || py > height + 4) continue;

            const twinkle = 0.65 + 0.35 * Math.sin(time * s.speed + s.phase);
            const alpha = s.alpha * envelope * twinkle;
            ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, s.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        return true;
    }

    function drawSupernova(sn, time) {
        const age = time - sn.startTime;
        if (age < 0 || age >= sn.duration) return false;

        const progress = age / sn.duration;
        const px = sn.x * width;
        const py = sn.y * height;

        // Sedov-Taylor shock expansion: R(t) ~ t^(2/5)
        const shockRadius = Math.max(2, sn.maxRadius * Math.pow(progress, 0.4));
        const shockAlpha = Math.pow(1 - progress, 1.8) * 0.45;

        // Soft trailing shock shell
        const innerRadius = Math.max(0, shockRadius * 0.55);
        const shell = ctx.createRadialGradient(px, py, innerRadius, px, py, shockRadius);
        shell.addColorStop(0, `rgba(${sn.ringColor}, 0)`);
        shell.addColorStop(0.75, `rgba(${sn.ringColor}, ${shockAlpha * 0.14})`);
        shell.addColorStop(1, `rgba(${sn.ringColor}, ${shockAlpha * 0.45})`);
        ctx.fillStyle = shell;
        ctx.beginPath();
        ctx.arc(px, py, shockRadius, 0, Math.PI * 2);
        ctx.fill();

        // Faint shock front
        ctx.strokeStyle = `rgba(${sn.ringColor}, ${shockAlpha})`;
        ctx.lineWidth = Math.max(0.6, 1.5 * (1 - progress));
        ctx.beginPath();
        ctx.arc(px, py, shockRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Wider, longer-lasting inner glow (fast rise, slow fade)
        const flashEnvelope = Math.min(1, age / 0.18) * Math.exp(-age / 1.05);
        if (flashEnvelope > 0.01) {
            const flashRadius = 26 * Math.sqrt(flashEnvelope) + 5;
            const flash = ctx.createRadialGradient(px, py, 0, px, py, flashRadius);
            flash.addColorStop(0, `rgba(255, 255, 255, ${flashEnvelope * 0.85})`);
            flash.addColorStop(0.4, `rgba(${sn.ringColor}, ${flashEnvelope * 0.45})`);
            flash.addColorStop(1, `rgba(${sn.ringColor}, 0)`);
            ctx.fillStyle = flash;
            ctx.beginPath();
            ctx.arc(px, py, flashRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        return true;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fieldStars = createFieldStars();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
        const staticCluster = createCluster(0);
        ctx.clearRect(0, 0, width, height);
        drawFieldStars(fieldStars, 0);
        drawCluster(staticCluster, CLUSTER_DURATION / 2);
        return;
    }

    let simTime = 0;
    let lastTimestamp = null;
    let activeCluster = createCluster(2);
    let nextClusterTime = 2 + CLUSTER_DURATION + CLUSTER_COOLDOWN;
    let nextSupernovaTime = 3;
    const supernovae = [];
    let isVisible = true;
    let rafId = null;

    function renderFrame(timestamp) {
        if (!isVisible || document.hidden) {
            rafId = null;
            lastTimestamp = null;
            return;
        }

        if (lastTimestamp !== null) {
            const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
            simTime += dt;
        }
        lastTimestamp = timestamp;

        if (!activeCluster && simTime >= nextClusterTime) {
            activeCluster = createCluster(simTime);
            nextClusterTime = simTime + CLUSTER_DURATION + CLUSTER_COOLDOWN;
        }

        if (simTime >= nextSupernovaTime) {
            supernovae.push(createSupernova(simTime));
            nextSupernovaTime = simTime + SUPERNOVA_INTERVAL;
        }

        ctx.clearRect(0, 0, width, height);
        drawFieldStars(fieldStars, simTime);

        if (activeCluster && !drawCluster(activeCluster, simTime)) {
            activeCluster = null;
        }

        for (let i = supernovae.length - 1; i >= 0; i--) {
            if (!drawSupernova(supernovae[i], simTime)) {
                supernovae.splice(i, 1);
            }
        }

        rafId = requestAnimationFrame(renderFrame);
    }

    function startLoop() {
        if (rafId === null && isVisible && !document.hidden) {
            lastTimestamp = null;
            rafId = requestAnimationFrame(renderFrame);
        }
    }

    // Easter egg: clicking open sky in the header triggers a supernova there
    header.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;

        const rect = header.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / Math.max(rect.width, 1);
        const clickY = (e.clientY - rect.top) / Math.max(rect.height, 1);
        supernovae.push(createSupernova(simTime, { x: clickX, y: clickY }));
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
            if (isVisible) {
                startLoop();
            }
        }, { threshold: 0 });
        observer.observe(header);
    }

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            startLoop();
        }
    });

    startLoop();
}
