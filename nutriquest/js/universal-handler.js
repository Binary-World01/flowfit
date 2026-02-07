// ===== UNIVERSAL BUTTON HANDLER =====
// Makes ALL buttons work across all pages

console.log('🚀 NutriQuest Universal Handler Loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ DOM Ready - Initializing buttons');

    // Force all links and buttons to be clickable
    const allInteractive = document.querySelectorAll('a, button, [role="button"], [onclick]');
    allInteractive.forEach(el => {
        el.style.cursor = 'pointer';
        el.style.pointerEvents = 'auto';
    });

    // 1. WELCOME PAGE BUTTONS - Using IDs for reliability
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    if (loginBtn) {
        console.log('✅ Login button found!');
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔵 Login clicked - Redirecting to login page');
            window.location.href = 'login.html';
        });
    } else {
        console.warn('⚠️ Login button NOT found');
    }

    if (signupBtn) {
        console.log('✅ Signup button found!');
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔵 Signup clicked - Redirecting to signup page');
            window.location.href = 'signup.html';
        });
    } else {
        console.warn('⚠️ Signup button NOT found');
    }

    // 2. GOAL SELECTION (Main Quest)
    const goalButtons = document.querySelectorAll('[type="radio"], .goal-option, [name="goal"]');
    goalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Goal selected:', btn.value || btn.textContent);
        });
    });

    // 3. DASHBOARD BUTTONS - Handled by app.js showScreen() directly

    // 4. RECENT MEALS - Make clickable
    const mealItems = document.querySelectorAll('.cursor-pointer, [class*="meal"]');
    mealItems.forEach(meal => {
        meal.style.cursor = 'pointer';
        meal.addEventListener('click', () => {
            console.log('Meal clicked:', meal.textContent.substr(0, 30));
        });
    });

    // 5. ADD MEAL BUTTON - Redirect to Log Screen
    const addMealBtns = Array.from(document.querySelectorAll('button')).filter(b =>
        b.textContent.includes('Add Meal') || b.textContent.toLowerCase().includes('add log'));

    addMealBtns.forEach(btn => {
        // Only add listener if it doesn't already have an onclick
        if (!btn.getAttribute('onclick')) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Add Meal/Log clicked -> Opening Log Screen');
                if (typeof showScreen === 'function') {
                    showScreen('log');
                } else {
                    window.location.href = 'dashboard.html#log';
                }
            });
        }
    });

    // 6. SCANNER PAGE BUTTONS
    const captureBtn = document.getElementById('captureBtn') ||
        Array.from(document.querySelectorAll('button')).find(b =>
            b.textContent.includes('Capture'));

    /* HANDLED BY camera.js NOW
    if (captureBtn) {
        captureBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Capture clicked');
            alert('📸 Camera capture requires API integration. Coming soon!');
        });
    }
    */

    const uploadBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Upload'));

    // DISABLED - scanner.js handles uploads with GPT-4
    /*
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Upload clicked');
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = () => {
                alert('Image upload selected! API integration needed for processing.');
            };
            input.click();
        });
    }
    */

    const cancelBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Cancel'));

    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Cancel clicked');
            window.location.href = 'dashboard.html';
        });
    }

    // 7. PROFILE SAVE BUTTON
    const saveProfileBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Save Profile'));

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Save Profile clicked');
            alert('✅ Profile saved! (Demo mode)');
        });
    }

    // 8. Time period selectors (Daily/Weekly/Monthly)
    const timeBtns = Array.from(document.querySelectorAll('button')).filter(b =>
        b.textContent.match(/Daily|Weekly|Monthly/));
    timeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Time period:', btn.textContent);
            // Remove active from all
            timeBtns.forEach(b => b.classList.remove('bg-primary', 'text-white'));
            // Add to clicked
            btn.classList.add('bg-primary', 'text-white');
        });
    });

    // 9. View All links
    const viewAllLinks = Array.from(document.querySelectorAll('a')).filter(a =>
        a.textContent.includes('View All'));
    viewAllLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('View All clicked');
            alert('Full list view coming soon!');
        });
    });

    // 10. Ensure ALL buttons show pointer cursor
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
        if (!el.style.cursor) {
            el.style.cursor = 'pointer';
        }
    });

    console.log('✅ All buttons initialized and clickable!');
});

// Make sure icons don't block clicks
window.addEventListener('load', () => {
    document.querySelectorAll('.material-symbols-outlined, span, i').forEach(icon => {
        icon.style.pointerEvents = 'none'; // Icons shouldn't block parent clicks
    });
});

console.log('📦 Universal Handler Ready');
