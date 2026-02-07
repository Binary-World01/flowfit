// Dark Mode System - Auto-loads on every page
(function () {
    'use strict';

    // Get saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';

    // Apply theme immediately (before page renders)
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    console.log('🌙 Theme loaded:', savedTheme);
})();

// Theme toggle function (called from toggle button)
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');

    if (isDark) {
        // Switch to light
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        console.log('☀️ Switched to light mode');
    } else {
        // Switch to dark
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        console.log('🌙 Switched to dark mode');
    }

    // Update toggle button states if they exist
    updateThemeToggleUI();
}

// Update toggle button UI
function updateThemeToggleUI() {
    const isDark = document.documentElement.classList.contains('dark');
    const toggleBtns = document.querySelectorAll('[data-theme-toggle]');

    toggleBtns.forEach(btn => {
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        }

        // Update aria label
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    updateThemeToggleUI();

    // Add click handlers to all theme toggle buttons
    const toggleBtns = document.querySelectorAll('[data-theme-toggle]');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });

    console.log('🎨 Dark mode system initialized');
});
