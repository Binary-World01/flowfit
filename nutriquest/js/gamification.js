// ===== Gamification Functions =====

// Show achievement popup
function showAchievementPopup(achievement) {
    const popup = document.getElementById('achievementPopup');

    document.getElementById('achievementIcon').textContent = achievement.icon;
    document.getElementById('achievementName').textContent = achievement.name;
    document.getElementById('achievementDesc').textContent = achievement.desc;

    popup.classList.remove('hidden');
    popup.querySelector('.achievement-content').classList.add('achievement-unlock');

    // Play confetti animation
    createConfetti();
}

// Close achievement popup
function closeAchievementPopup() {
    document.getElementById('achievementPopup').classList.add('hidden');
}

// Create confetti effect
function createConfetti() {
    const colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#95E1D3', '#F38181'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Check protein achievement
async function checkProteinAchievement() {
    try {
        const userId = auth.currentUser.uid;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Get meals from last 7 days
        const mealsSnapshot = await db.collection('meals')
            .where('userId', '==', userId)
            .where('timestamp', '>=', sevenDaysAgo)
            .orderBy('timestamp', 'desc')
            .get();

        // Group by day and check protein
        const dailyProtein = {};
        mealsSnapshot.forEach(doc => {
            const meal = doc.data();
            const date = new Date(meal.timestamp.seconds * 1000).toDateString();

            if (!dailyProtein[date]) {
                dailyProtein[date] = 0;
            }
            dailyProtein[date] += meal.protein || 0;
        });

        // Check if 7 consecutive days hit protein goal
        const proteinGoal = window.currentUser.goals.protein;
        let consecutiveDays = 0;

        for (let i = 0; i < 7; i++) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toDateString();

            if (dailyProtein[dateStr] && dailyProtein[dateStr] >= proteinGoal) {
                consecutiveDays++;
            } else {
                break;
            }
        }

        if (consecutiveDays >= 7) {
            await unlockAchievement('protein_pro');
        }

    } catch (error) {
        console.error('❌ Error checking protein achievement:', error);
    }
}

// Check fiber achievement
async function checkFiberAchievement() {
    try {
        const userId = auth.currentUser.uid;
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        // Similar logic to protein achievement
        // Check if 5 days had 25g+ fiber

        // Simplified for demo - implement full logic as needed

    } catch (error) {
        console.error('❌ Error checking fiber achievement:', error);
    }
}

// Daily login bonus check
async function checkDailyBonus() {
    const userId = auth.currentUser.uid;
    const today = new Date().toDateString();
    const lastBonus = localStorage.getItem('lastDailyBonus');

    if (lastBonus !== today) {
        // Award daily bonus (could be points, badges, etc.)
        localStorage.setItem('lastDailyBonus', today);

        // Show motivational message
        const messages = [
            'Welcome back! Let\'s make today count! 💪',
            'New day, new opportunities to eat healthy! 🥗',
            'You\'re doing amazing! Keep going! 🌟',
            'Another day to level up your nutrition! 🚀',
            'Great to see you again! Let\'s track some meals! 📊'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setTimeout(() => showToast(randomMessage), 1000);
    }
}

// Call daily bonus check on app load
if (auth.currentUser) {
    checkDailyBonus();
}
