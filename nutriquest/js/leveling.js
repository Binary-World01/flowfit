// Leveling System Logic

function calculateLevel(xp) {
    // Simple Linear: 1000 XP per level
    // Level 1: 0-999
    // Level 2: 1000-1999
    // etc.
    if (!xp) xp = 0;
    const level = Math.floor(xp / 1000) + 1;
    const currentLevelXP = xp % 1000;
    const nextLevelXP = 1000;
    const progressPercent = (currentLevelXP / nextLevelXP) * 100;

    return {
        level,
        xp,
        currentLevelXP,
        nextLevelXP,
        progressPercent,
        title: getLevelTitle(level)
    };
}

function getLevelTitle(level) {
    if (level <= 1) return "Rookie Scorer";
    if (level <= 5) return "Healthy Apprentince";
    if (level <= 10) return "Nutrition Warrior";
    if (level <= 20) return "Fitness Elite";
    if (level <= 50) return "Legendary Eater";
    return "God of Nutrition";
}

async function updateDashboardLevelUI(uid) {
    try {
        const xpVal = document.getElementById('userXPVal');
        const levelVal = document.getElementById('userLevelVal');
        const badge = document.getElementById('userLevelBadge');
        const bar = document.getElementById('xpProgressBar');
        const next = document.getElementById('nextLevelXP');
        const titleEl = document.getElementById('userTitle');

        if (!xpVal) return;

        // 1. Try Local Cache FIRST (Offline Support)
        let xp = 0;
        if (window.currentUser && window.currentUser.points) {
            xp = window.currentUser.points;
            console.log('⚡ Leveling: Using cached XP:', xp);
        } else {
            // Fallback to network only if cache missing
            // (But usually cache is loaded by now)
            try {
                const doc = await firebase.firestore().collection('users').doc(uid).get();
                if (doc.exists) xp = doc.data().points || 0;
            } catch (err) {
                console.warn('⚠️ Could not fetch XP (offline)', err);
            }
        }

        const stats = calculateLevel(xp);

        // Animate
        xpVal.textContent = stats.xp.toLocaleString();
        levelVal.textContent = stats.level;
        if (badge) badge.textContent = stats.level;

        // Next Level Calculation
        // e.g. Level 1 (0-1000), Next is 1000. Level 2 (1000-2000), Next is 2000.
        const nextGoal = stats.level * 1000;
        if (next) next.textContent = nextGoal.toLocaleString();

        if (bar) {
            // Progress within current level
            // If I have 1500 XP (Level 2). Range is 1000-2000. Progress is 500/1000 = 50%.
            const relativeXP = stats.xp - ((stats.level - 1) * 1000);
            const percent = Math.min((relativeXP / 1000) * 100, 100);

            setTimeout(() => {
                bar.style.width = `${percent}%`;
            }, 100);
        }

        if (titleEl) titleEl.textContent = stats.title;

    } catch (e) {
        console.error("Level UI Error", e);
    }
}

// Auto-run if on dashboard
document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user && window.location.pathname.includes('dashboard.html')) {
            updateDashboardLevelUI(user.uid);
        }
    });
});
