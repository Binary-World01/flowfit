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

        if (!xpVal) return; // Not on dashboard

        // Fetch User XP
        const doc = await firebase.firestore().collection('users_public').doc(uid).get();
        const xp = doc.exists ? (doc.data().points || 0) : 0;

        const stats = calculateLevel(xp);

        // Animate Numbers
        xpVal.textContent = stats.xp.toLocaleString();
        levelVal.textContent = stats.level;
        badge.textContent = stats.level;
        next.textContent = ((stats.level * 1000)).toLocaleString(); // Total XP needed for next level ? or generic 1000? 
        // Logic above says (currentLevelXP / 1000). So "Next Level at X Total XP" or "X XP Remaining".
        // Let's show "Next Level Goal" (e.g. 2000 if current is 1500)
        next.textContent = (stats.level * 1000).toLocaleString();

        // Animate Bar
        setTimeout(() => {
            bar.style.width = `${stats.progressPercent}%`;
        }, 100);

        // Update title if exists
        // (Added subtitle in HTML 'Rookie Scorer')
        // const titleEl = document.querySelector('.bg-gradient-to-r p.text-xs.opacity-80');
        // if(titleEl) titleEl.textContent = stats.title;

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
