(function () {
    const validThemes = ['gold-dark', 'blue-light'];
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && validThemes.includes(savedTheme)) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    } catch (e) {}
})();
