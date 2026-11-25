document.addEventListener('DOMContentLoaded', function () {
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

    const starsContainer = document.getElementById('stars');
    const starsCount = 100;
    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const size = Math.random() * 2 + 1;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.opacity = Math.random() * 0.8 + 0.2;
        star.style.animation = `twinkle ${Math.random() * 5 + 2}s infinite`;
        starsContainer.appendChild(star);
    }

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
});
