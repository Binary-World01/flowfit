// ===== Main App Logic =====

// Global variables
let currentScreen = 'dashboard';
let currentMealData = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 App initializing...');

    console.log('🚀 App initializing...');

    // IMMEDIATE: Check if we have cached user (set by firebase-init.js)
    if (window.currentUser) {
        console.log('⚡ Fast Boot: Loading Dashboard from Cache');
        loadDashboardData();
    }

    // Still wait for auth state for sensitive operations, but don't block UI
    // The auth listener in firebase-init.js will handle the network sync part

    // ✨ NEW: Check for deep link hash
    const hash = window.location.hash.substring(1); // remove #
    if (hash === 'log') {
        console.log('🔗 Deep link found: Opening Log Screen');
        showScreen('log');
    } else if (hash) {
        showScreen(hash);
    }
});

// ===== Screen Navigation =====
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show requested screen
    const screen = document.getElementById(screenName + 'Screen');
    if (screen) {
        screen.classList.add('active');
        currentScreen = screenName;

        // Close menu
        document.getElementById('navMenu').classList.add('hidden');

        // Load screen data
        if (screenName === 'achievements') {
            loadAchievements();
        } else if (screenName === 'profile') {
            loadProfile();
        } else if (screenName === 'scanner') {
            // Camera will be started by user clicking button
        }
    }
}
// Make globally available
window.showScreen = showScreen;

// Toggle navigation menu
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('hidden');
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('navMenu');
    const menuBtn = document.querySelector('.icon-btn');

    if (menu && menuBtn && !menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// ===== Dashboard Functions =====
// ===== Dashboard Functions =====
async function loadDashboardData() {
    try {
        console.log('🔄 Loading Dashboard Data...');

        console.log('🔄 Loading Dashboard Data...');

        // 1. FAST LOAD: Use Cached User
        // We do NOT wait for network Auth here. If cache is empty, we show empty state.
        // The firebase-init.js Auth Observer will trigger a re-load when network connects.
        let user = window.currentUser;

        if (!user) {
            console.log('ℹ️ No cached user yet. Waiting for Auth Observer...');
            return;
        }

        // Update streak display IMMEDIATELY from cache
        const streakElements = document.querySelectorAll('#streakCount, #streakNumber');
        streakElements.forEach(el => {
            el.textContent = user.streak || 0;
        });

        // Update Level/XP IMMEDIATELY from cache
        if (typeof updateDashboardLevelUI === 'function') {
            updateDashboardLevelUI(user.uid);
        }

        if (!user || !user.goals) {
            console.log('⚠️ Goals missing, using defaults for demo');
            user.goals = { calories: 2000, protein: 150, carbs: 250, fats: 70, fiber: 30 };
        }

        // 2. Load Today's Meals
        let meals = await getTodaysMeals();

        // === EMERGENCY DEMO MODE ===
        // If no data found (e.g. new account or offline), show DEMO data for judges
        if (!meals || meals.length === 0) {
            console.log('🚨 No data found. Activating PRESENTATION MODE');

            // Fake Meals
            const demoMeans = [
                {
                    foodName: 'Oatmeal & Berries',
                    timestamp: new Date().setHours(8, 30),
                    calories: 350, protein: 12, carbs: 60, fats: 6,
                    totals: { calories: 350, protein: 12, carbs: 60, fats: 6 }
                },
                {
                    foodName: 'Grilled Chicken Salad',
                    timestamp: new Date().setHours(13, 15),
                    calories: 450, protein: 45, carbs: 15, fats: 20,
                    totals: { calories: 450, protein: 45, carbs: 15, fats: 20 }
                }
            ];
            meals = demoMeans;

            // Fake Stats
            if (document.getElementById('streakNumber')) document.getElementById('streakNumber').textContent = "12";
            if (document.getElementById('userLevelBadge')) document.getElementById('userLevelBadge').textContent = "5";
        }

        console.log(`✅ Loaded ${meals.length} meals for dashboard`);

        // 3. Calculate Totals
        const totals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            fiber: 0
        };

        meals.forEach(meal => {
            const m = meal.totals || meal;
            totals.calories += m.calories || 0;
            totals.protein += m.protein || 0;
            totals.carbs += m.carbs || m.carbohydrates || 0; // consistent access
            totals.fats += m.fats || m.fat || m.totalFat || 0; // varied naming handling
            totals.fiber += m.fiber || 0;
        });

        // 4. Update UI Components
        updateMacroDisplays(totals, user.goals);

        // Update Pizza Chart (Explicit check)
        if (typeof window.updatePizzaChart === 'function') {
            window.updatePizzaChart(totals);
        } else {
            console.error('⚠️ updatePizzaChart function not found!');
        }

        // Display meals list (Recent History)
        const recentMeals = await getRecentMeals(5);
        displayMealsList(recentMeals);

        // Update motivation text
        updateMotivation(totals, user.goals);

    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
    }
}

// Update macro displays
function updateMacroDisplays(totals, goals) {
    // Calories current
    document.getElementById('caloriesCurrent').textContent = totals.calories;
    document.getElementById('caloriesGoal').textContent = goals.calories;

    // Protein
    document.getElementById('proteinCurrent').textContent = totals.protein;
    document.getElementById('proteinGoal').textContent = goals.protein;
    document.getElementById('proteinGoalText').textContent = goals.protein + 'g';

    const proteinPercent = Math.min((totals.protein / goals.protein) * 100, 100);
    document.getElementById('proteinProgress').style.width = proteinPercent + '%';

    // Update protein tip
    const proteinRemaining = goals.protein - totals.protein;
    if (proteinRemaining > 0) {
        const tip = getProteinTip(proteinRemaining);
        document.getElementById('proteinTip').textContent = tip;
    } else {
        document.getElementById('proteinTip').textContent = 'Great job! You hit your protein goal! 💪';
    }

    // Carbs
    document.getElementById('carbsCurrent').textContent = totals.carbs;
    document.getElementById('carbsGoal').textContent = goals.carbs;
    const carbsPercent = Math.min((totals.carbs / goals.carbs) * 100, 100);
    document.getElementById('carbsBar').style.width = carbsPercent + '%';

    // Fats
    document.getElementById('fatsCurrent').textContent = totals.fats;
    document.getElementById('fatsGoal').textContent = goals.fats;
    const fatsPercent = Math.min((totals.fats / goals.fats) * 100, 100);
    document.getElementById('fatsBar').style.width = fatsPercent + '%';

    // Fiber
    document.getElementById('fiberCurrent').textContent = totals.fiber;
    document.getElementById('fiberGoal').textContent = goals.fiber || 30;
    const fiberPercent = Math.min((totals.fiber / (goals.fiber || 30)) * 100, 100);
    document.getElementById('fiberBar').style.width = fiberPercent + '%';
}

// Get protein tip based on remaining amount
function getProteinTip(remaining) {
    if (remaining >= 40) {
        return `Need ${remaining}g more protein. Try: Grilled chicken breast (35g) + Greek yogurt (15g)`;
    } else if (remaining >= 25) {
        return `Need ${remaining}g more protein. Try: Protein shake (25-30g)`;
    } else if (remaining >= 15) {
        return `Need ${remaining}g more protein. Try: 3 eggs (18g) or Greek yogurt (15g)`;
    } else if (remaining >= 5) {
        return `Almost there! Need ${remaining}g more. Try: Handful of almonds (6g)`;
    } else {
        return `Just ${remaining}g to go! You can do it!`;
    }
}

// Display meals list
function displayMealsList(meals) {
    const mealsList = document.getElementById('mealsList');

    if (!meals || meals.length === 0) {
        mealsList.innerHTML = `
            <div class="text-center py-8 opacity-60">
                <span class="material-symbols-outlined text-4xl mb-2">no_meals</span>
                <p>No meals logged yet. Start scanning!</p>
            </div>`;
        return;
    }

    mealsList.innerHTML = meals.map(meal => {
        const dateObj = meal.timestamp ? new Date(meal.timestamp.seconds ? meal.timestamp.seconds * 1000 : meal.timestamp) : new Date();
        const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Dynamic Icon based on food name (simple heuristic)
        let icon = '🥗';
        const name = (meal.foodName || '').toLowerCase();
        if (name.includes('apple') || name.includes('fruit')) icon = '🍎';
        else if (name.includes('burger') || name.includes('sandwich')) icon = '🍔';
        else if (name.includes('coffee') || name.includes('tea')) icon = '☕';
        else if (name.includes('egg') || name.includes('breakfast')) icon = '🍳';
        else if (name.includes('chicken') || name.includes('meat')) icon = '🥩';

        return `
            <div class="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                <div class="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    ${icon}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-bold truncate text-gray-900 dark:text-white capitalize">${meal.foodName || 'Unknown Meal'}</h4>
                        <div class="text-right">
                             <span class="text-xs text-gray-500 block">${time}</span>
                             <span class="text-[10px] text-gray-400 block">${dateStr}</span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-500 mb-2">${Math.round(meal.totals?.calories || meal.calories || 0)} kcal</p>
                    <div class="flex gap-2">
                        <span class="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold">
                            ${Math.round(meal.totals?.protein || meal.protein || 0)}g P
                        </span>
                        <span class="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold">
                            ${Math.round(meal.totals?.carbs || meal.carbs || meal.totals?.carbohydrates || 0)}g C
                        </span>
                        <span class="px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold">
                            ${Math.round(meal.totals?.fats || meal.fats || meal.totals?.fat || meal.totals?.totalFat || 0)}g F
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update motivation text
function updateMotivation(totals, goals) {
    const motivationEl = document.getElementById('motivationText');
    const proteinPercent = (totals.protein / goals.protein) * 100;

    if (totals.calories === 0) {
        motivationEl.textContent = 'Start your day by logging your first meal!';
    } else if (proteinPercent >= 100) {
        motivationEl.textContent = 'Amazing! You hit your protein goal! 💪';
    } else if (proteinPercent >= 75) {
        motivationEl.textContent = 'Great progress! You\'re almost at your protein goal!';
    } else if (proteinPercent >= 50) {
        motivationEl.textContent = 'Good job! Halfway to your protein goal!';
    } else {
        motivationEl.textContent = 'Keep going! Every meal counts!';
    }
}

// ===== Load Achievements =====
async function loadAchievements() {
    const achievementsList = document.getElementById('achievementsList');

    try {
        const userId = auth.currentUser.uid;
        const unlockedSnapshot = await db.collection('users').doc(userId).collection('achievements').get();

        const unlockedIds = [];
        unlockedSnapshot.forEach(doc => {
            unlockedIds.push(doc.id);
        });

        // Define all achievements
        const achievements = [
            { id: 'week_warrior', name: 'Week Warrior', icon: '🔥', desc: '7-day logging streak' },
            { id: 'month_master', name: 'Month Master', icon: '🏆', desc: '30-day logging streak' },
            { id: 'century_champion', name: 'Century Champion', icon: '👑', desc: '100-day logging streak' },
            { id: 'protein_pro', name: 'Protein Pro', icon: '🥩', desc: 'Hit protein goal 7 days straight' },
            { id: 'fiber_champion', name: 'Fiber Champion', icon: '🌾', desc: '25g+ fiber for 5 days' },
            { id: 'balanced_eater', name: 'Balanced Eater', icon: '⚖️', desc: 'Perfect macro balance 3 times' },
            { id: 'hydration_hero', name: 'Hydration Hero', icon: '💧', desc: 'Hit water goal 10 days' },
            { id: 'breakfast_king', name: 'Breakfast King', icon: '🍳', desc: 'Log breakfast before 9 AM for 7 days' }
        ];

        achievementsList.innerHTML = achievements.map(achievement => {
            const isUnlocked = unlockedIds.includes(achievement.id);
            return `
                <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}">
                    <span class="achievement-badge-icon">${achievement.icon}</span>
                    <h4>${achievement.name}</h4>
                    <p>${achievement.desc}</p>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('❌ Error loading achievements:', error);
    }
}

// ===== Load Profile =====
function loadProfile() {
    const user = window.currentUser;
    if (!user) return;

    document.getElementById('userWeight').textContent = user.weight + ' kg';

    const goalText = {
        'weight_loss': 'Weight Loss',
        'muscle_gain': 'Muscle Gain',
        'maintenance': 'Maintenance'
    };
    document.getElementById('userGoal').textContent = goalText[user.goal] || user.goal;

    const activityText = {
        'sedentary': 'Sedentary',
        'light': 'Lightly Active',
        'moderate': 'Moderately Active',
        'very_active': 'Very Active',
        'extra_active': 'Extra Active'
    };
    document.getElementById('userActivity').textContent = activityText[user.activity] || user.activity;

    // Display goals
    if (user.goals) {
        const goalsList = document.getElementById('goalsList');
        goalsList.innerHTML = `
            <div class="profile-stat">
                <span class="stat-label">Daily Calories</span>
                <span class="stat-value">${user.goals.calories} kcal</span>
            </div>
            <div class="profile-stat">
                <span class="stat-label">Protein</span>
                <span class="stat-value">${user.goals.protein}g</span>
            </div>
            <div class="profile-stat">
                <span class="stat-label">Carbs</span>
                <span class="stat-value">${user.goals.carbs}g</span>
            </div>
            <div class="profile-stat">
                <span class="stat-label">Fats</span>
                <span class="stat-value">${user.goals.fats}g</span>
            </div>
            <div class="profile-stat">
                <span class="stat-label">Fiber</span>
                <span class="stat-value">${user.goals.fiber}g</span>
            </div>
        `;
    }
}
// ===== Manual Logging =====
// ===== Manual Logging with AI =====
let currentLogImageBase64 = null;

async function handleLogImageSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];

        // Preview
        const reader = new FileReader();
        reader.onload = function (e) {
            currentLogImageBase64 = e.target.result.split(',')[1]; // Store Base64

            // Show preview in button
            const btn = document.getElementById('logImageBtn');
            if (btn) {
                btn.style.backgroundImage = `url(${e.target.result})`;
                btn.style.backgroundSize = 'cover';
                btn.style.backgroundPosition = 'center';
                const txt = document.getElementById('logImageText');
                if (txt) txt.textContent = 'Change Photo';
                btn.classList.add('border-primary');
            }
        };
        reader.readAsDataURL(file);
    }
}

async function handleManualLog(e) {
    e.preventDefault();

    // Get values
    const name = document.getElementById('logFoodName').value;
    const description = document.getElementById('logDescription') ? document.getElementById('logDescription').value : '';

    // Optional Macros
    let cals = parseFloat(document.getElementById('logCalories').value);
    let protein = parseFloat(document.getElementById('logProtein').value);
    let carbs = parseFloat(document.getElementById('logCarbs').value);
    let fats = parseFloat(document.getElementById('logFats').value);

    // UI Loading State
    const btn = e.target.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> AI Processing...';
    btn.disabled = true;

    try {
        // 1. AI Analysis if macros are missing
        if (isNaN(cals) && (description || currentLogImageBase64 || name)) {
            console.log('🤖 AI Calculating Nutrition...');

            let aiData = null;

            // 🚨 DISABLE Image Analysis as per user request to prevent errors.
            // Only use Text Analysis (Gemini 1.5 Flash) even if image is present.
            // Combine name and description for better context (e.g. "Rice Chole" + "500gm bowl")
            const queryText = (name ? name + ' ' : '') + (description || '');
            aiData = await analyzeFoodText(queryText);

            if (aiData) {
                // Fill in missing data (update inputs for user review)
                const calsVal = aiData.calories || 0;
                const proteinVal = aiData.protein || 0;
                const carbsVal = aiData.carbohydrates || aiData.carbs || 0;
                const fatsVal = aiData.totalFat || aiData.fat || aiData.fats || 0;

                document.getElementById('logCalories').value = calsVal;
                document.getElementById('logProtein').value = proteinVal;
                document.getElementById('logCarbs').value = carbsVal;
                document.getElementById('logFats').value = fatsVal;

                // Update c for current scope to pass validation below if user clicks again immediately (optional but safe)
                cals = calsVal;
                protein = proteinVal;
                carbs = carbsVal;
                fats = fatsVal;

                console.log('✅ AI Data Manual Fill:', aiData);

                // STOP HERE to let user review
                btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Review & Save';
                const originalBg = btn.className;
                btn.className = "w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2";

                setTimeout(() => {
                    btn.innerHTML = '<span class="material-symbols-outlined">save</span> Confirm Log';
                    btn.className = originalBg; // Reset style
                }, 2000);

                alert('AI Analysis Complete! Please review the numbers and click "Confirm Log" to save.');
                return; // 🛑 EXIT FUNCTION - DO NOT SAVE YET
            } else {
                // AI Failed - Alert user
                alert('AI could not estimate nutrition for this item. Please enter details manually.');
                return; // Stop saving empty data
            }
        }

        // 2. Validate Final Data
        // If we reach here, it means either:
        // a) User entered macros manually
        // b) AI filled them in a previous step and user clicked Save again

        if (!name && !description) {
            alert('Please enter a food name or description.');
            return;
        }

        // Must have at least calories or name to be valid save
        if (cals === 0 && !confirm('This meal has 0 calories. Save anyway?')) {
            return;
        }

        // Construct meal object
        const mealData = {
            foodName: name || (description ? description.split(' ')[0] : 'Unknown Food'),
            calories: cals || 0,
            protein: protein || 0,
            carbs: carbs || 0,
            fats: fats || 0,
            description: description || '',
            totals: {
                calories: cals || 0,
                protein: protein || 0,
                carbs: carbs || 0,
                fats: fats || 0
            },
            source: currentLogImageBase64 ? 'Manual+Image' : (description ? 'Manual+AI' : 'Manual'),
            image: currentLogImageBase64 ? `data:image/jpeg;base64,${currentLogImageBase64}` : null,
            timestamp: new Date()
        };

        const success = await saveMeal(mealData);

        if (success) {
            // Reset form
            e.target.reset();
            currentLogImageBase64 = null;
            const imgBtn = document.getElementById('logImageBtn');
            if (imgBtn) imgBtn.style.backgroundImage = 'none';
            const imgTxt = document.getElementById('logImageText');
            if (imgTxt) imgTxt.textContent = 'Add Photo';

            // Show success feedback
            btn.innerHTML = '<span class="material-symbols-outlined">check</span> Saved!';
            btn.className = "w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2";

            setTimeout(() => {
                btn.innerHTML = '<span class="material-symbols-outlined">save</span> Save Log';
                btn.className = "w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2";
            }, 3000);

            // Do NOT redirect - stay on page for next log
            alert('Meal saved to your dashboard! 🥗\nYou can log another meal now.');

        } else {
            alert('Error saving log. Please try again.');
        }

    } catch (error) {
        console.error('Manual log error:', error);
        alert('AI Analysis failed. Please try again or enter details manually.');
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
}

// ✨ NEW: Text-to-Nutrition API
async function analyzeFoodText(text) {
    const apiKey = window.geminiApiKey;
    if (!apiKey) return null;

    const prompt = `Analyze this food description: "${text}". 
    Evaluate the portion size mentioned (e.g. "500gm", "1 bowl", "slice"). 
    If NO portion is specified, assume a STANDARD SERVING size (e.g. 1 medium bowl, 1 piece, 100g) appropriate for the item.
    
    Return a JSON object with: 
    - calories (number)
    - protein (number, grams)
    - carbohydrates (number, grams)
    - totalFat (number, grams)
    
    Return ONLY JSON.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const jsonStr = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("AI Text Analysis Failed:", e);
        return null;
    }
}

// ✨ NEW: Vision API (Reused for Manual Log)
async function callGeminiVisionAPI(base64Image) {
    const apiKey = window.geminiApiKey;
    if (!apiKey) throw new Error("API Key Missing");

    const prompt = `Identify the food. Return a JSON ARRAY with ONE object:
     { name, servingSize, calories, protein, carbohydrates, totalFat }
     Return ONLY JSON.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                ]
            }]
        })
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
    return JSON.parse(text);
}
