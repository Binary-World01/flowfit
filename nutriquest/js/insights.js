// ... (Top of file remains similar, focusing on renderChart logic)
document.addEventListener('DOMContentLoaded', function () {
    console.log('📊 Insights Module Loaded');

    // Global State
    window.allMeals = [];
    window.currentTimeFrame = 'weekly'; // daily, weekly, monthly

    // Auth Listener
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log('👤 User authenticated:', user.uid);
            fetchMealHistory(user.uid);
        } else {
            console.log('⚠️ No user logged in');
            showLoginMessage();
        }
    });
});

function showLoginMessage() {
    const container = document.querySelector('.meal-history-list');
    if (container) {
        container.innerHTML = `
            <div class="text-center p-8 text-gray-500">
                <span class="material-symbols-outlined text-4xl mb-2">lock</span>
                <p>Please log in to view your history.</p>
            </div>
        `;
    }
}

async function fetchMealHistory(userId) {
    // ... (Same Fetch Logic as before)
    try {
        const mealListContainer = document.querySelector('.meal-history-list');
        if (mealListContainer) {
            mealListContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-8 text-primary animate-pulse">
                    <span class="material-symbols-outlined text-3xl mb-2">sync</span>
                    <p>Loading your meals...</p>
                </div>
            `;
        }

        const snapshot = await firebase.firestore()
            .collection('meals')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(200)
            .get();

        if (snapshot.empty) {
            renderEmptyState();
            // Still render empty chart
            switchTimeFrame('weekly');
            return;
        }

        window.allMeals = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : (new Date(data.timestamp || Date.now()));
            window.allMeals.push({ id: doc.id, ...data, timestamp });
        });

        // Initial Render
        switchTimeFrame('weekly');

    } catch (error) {
        console.error('Error fetching meals:', error);
        if (error.message.includes('requires an index')) {
            console.warn('⚠️ Missing Index, falling back to client-side sort');
            const snapshot = await firebase.firestore().collection('meals').where('userId', '==', userId).limit(200).get();
            window.allMeals = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : (new Date(data.timestamp || Date.now()));
                window.allMeals.push({ id: doc.id, ...data, timestamp });
            });
            window.allMeals.sort((a, b) => b.timestamp - a.timestamp);
            switchTimeFrame('weekly');
        } else {
            renderErrorState(error.message);
        }
    }
}

// ===== Timeframe Logic =====
window.switchTimeFrame = function (timeFrame) {
    window.currentTimeFrame = timeFrame;

    // 1. Update Buttons UI
    document.querySelectorAll('.time-filter-btn').forEach(btn => {
        btn.className = "time-filter-btn px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors";
    });

    const activeBtnId = `btn${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}`;
    const activeBtn = document.getElementById(activeBtnId);
    if (activeBtn) {
        activeBtn.className = "time-filter-btn px-4 py-2 text-sm font-bold rounded-lg bg-primary text-white shadow-sm";
    }

    // 2. Filter Data for List
    const filteredMeals = filterMeals(window.allMeals, timeFrame);

    // 3. Update UI
    renderMealList(filteredMeals);
    updateStats(filteredMeals, timeFrame);

    // 4. Render Chart (Pass ALL meals, chart logic handles grouping differently)
    renderChart(window.allMeals, timeFrame);
}

function filterMeals(meals, timeFrame) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return meals.filter(meal => {
        const mealDate = new Date(meal.timestamp);

        if (timeFrame === 'daily') {
            return mealDate >= todayStart;
        } else if (timeFrame === 'weekly') {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 6);
            weekAgo.setHours(0, 0, 0, 0);
            return mealDate >= weekAgo;
        } else if (timeFrame === 'monthly') {
            const monthAgo = new Date(now);
            monthAgo.setDate(now.getDate() - 29); // Last 30 days
            monthAgo.setHours(0, 0, 0, 0);
            return mealDate >= monthAgo;
        }
        return true;
    });
}

function updateStats(meals, timeFrame) {
    const totalCals = meals.reduce((sum, m) => sum + (m.totals?.calories || m.calories || 0), 0);
    const totalPro = meals.reduce((sum, m) => sum + (m.totals?.protein || m.protein || 0), 0);

    let daysCount = 1;
    if (timeFrame === 'weekly') daysCount = 7;
    if (timeFrame === 'monthly') daysCount = 30;

    const isDaily = timeFrame === 'daily';
    const displayCals = isDaily ? totalCals : Math.round(totalCals / daysCount);
    const displayPro = isDaily ? totalPro : Math.round(totalPro / daysCount);

    const calLabel = document.querySelector('.stats-calories-label') || document.querySelector('#dailyCaloriesVal').parentElement.previousElementSibling.querySelector('.font-medium');
    if (calLabel) calLabel.textContent = isDaily ? "Total Calories" : "Avg Calories";

    const proLabel = document.querySelector('.stats-protein-label') || document.querySelector('#dailyProteinVal').parentElement.previousElementSibling.querySelector('.font-medium');
    if (proLabel) proLabel.textContent = isDaily ? "Total Protein" : "Avg Protein";

    const calEl = document.getElementById('dailyCaloriesVal');
    const proEl = document.getElementById('dailyProteinVal');

    if (calEl) calEl.textContent = Math.round(displayCals).toLocaleString();
    if (proEl) proEl.textContent = Math.round(displayPro).toLocaleString();

    const titleEl = document.querySelector('h1.text-4xl');
    if (titleEl) titleEl.textContent = `${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Insights 📊`;
}

// ===== DYNAMIC CHART LOGIC (The New Part) =====
function renderChart(meals, timeFrame) {
    const chartBars = document.getElementById('chartBars');
    if (!chartBars) return;

    chartBars.innerHTML = ''; // Clear existing bars

    const dataPoints = getChartDataPoints(meals, timeFrame);

    // Find absolute max for Y-axis scaling logic
    // But UI line says "Goal: 2000". So let's scale relative to Goal (2000) = 66% height?
    // The previous CSS used `--target-height`.
    // Let's assume 3000 is 100% height (since goal 2000 is usually 2/3rds up).
    const MAX_CHART_VAL = 3000;
    const GOAL_VAL = 2000;

    dataPoints.forEach(point => {
        const heightPct = Math.min((point.value / MAX_CHART_VAL) * 100, 100);

        const barDiv = document.createElement('div');
        barDiv.className = 'relative flex flex-col items-center flex-1 h-full justify-end group cursor-pointer z-10';

        // Tooltip logic
        const tooltipHTML = `
            <div class="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black dark:bg-white text-white dark:text-black text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-30 shadow-lg">
                ${point.value.toLocaleString()} kcal<br>
                <span class="text-[10px] opacity-75">${point.subtext || ''}</span>
            </div>
        `;

        // Bar Color Logic
        const isGoalMet = point.value >= GOAL_VAL;
        const barColorClass = point.isToday ? 'bg-primary' : 'bg-primary';
        // We can create a "ring" effect for today if needed
        const barRingClass = point.isToday ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark' : '';

        barDiv.innerHTML = `
            <div class="w-full max-w-[40px] bg-primary/20 dark:bg-primary/10 rounded-t-lg relative h-full flex items-end overflow-hidden hover:bg-primary/30 transition-colors ${barRingClass}">
                <div class="w-full ${barColorClass} rounded-t-sm relative" style="height: ${heightPct}%; transition: height 1s ease-out;"></div>
            </div>
            ${tooltipHTML}
            <span class="mt-3 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate w-full text-center">${point.label}</span>
        `;

        chartBars.appendChild(barDiv);

        // Force reflow for animation if needed, but native transition should work on mount if handled via CSS or requestedAnimationFrame
        // For simplicity we set height inline.
    });
}

function getChartDataPoints(meals, timeFrame) {
    const points = [];
    const now = new Date();

    if (timeFrame === 'daily') {
        // Breakdown by Meal Type for TODAY
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayMeals = meals.filter(m => new Date(m.timestamp) >= todayStart);

        const categories = {
            'Breakfast': 0,
            'Lunch': 0,
            'Dinner': 0,
            'Snack': 0
        };

        todayMeals.forEach(meal => {
            // Simple heuristic based on time
            const hour = new Date(meal.timestamp).getHours();
            let cat = 'Snack';
            if (hour >= 5 && hour < 11) cat = 'Breakfast';
            else if (hour >= 11 && hour < 16) cat = 'Lunch';
            else if (hour >= 16 && hour < 22) cat = 'Dinner';

            // Or use stored meal type if available? (Don't think we store it consistently yet)
            categories[cat] += (meal.totals?.calories || meal.calories || 0);
        });

        Object.keys(categories).forEach(cat => {
            points.push({
                label: cat,
                value: categories[cat],
                isToday: false, // In daily view, all bars are "today" parts
                subtext: ''
            });
        });

    } else if (timeFrame === 'weekly') {
        // Last 7 days (including today)
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dStr = d.toLocaleDateString();
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            // Filter meals for this day
            const dailyCals = meals.reduce((sum, m) => {
                const mDate = new Date(m.timestamp).toLocaleDateString();
                return mDate === dStr ? sum + (m.totals?.calories || m.calories || 0) : sum;
            }, 0);

            points.push({
                label: i === 0 ? 'Today' : dayName,
                value: dailyCals,
                isToday: i === 0,
                subtext: dStr
            });
        }
    } else if (timeFrame === 'monthly') {
        // Last 4 Weeks (approx last 28 days)
        for (let i = 3; i >= 0; i--) {
            // Define Week Range
            const end = new Date(now);
            end.setDate(now.getDate() - (i * 7));
            const start = new Date(end);
            start.setDate(end.getDate() - 6);

            const startStr = start.toLocaleDateString();
            const endStr = end.toLocaleDateString();

            // Sum cals
            const weeklyCals = meals.reduce((sum, m) => {
                const mTime = new Date(m.timestamp).getTime();
                return (mTime >= start.getTime() && mTime <= end.setHours(23, 59, 59, 999))
                    ? sum + (m.totals?.calories || m.calories || 0)
                    : sum;
            }, 0);

            // Average per day for the chart? Or Total?
            // "Goal: 2000" implies Daily Average.
            // If we show Total Weekly (e.g. 14,000), it will break the chart scale of 3000.
            // So we MUST show Avg Daily Cal for that week.
            const avgDaily = Math.round(weeklyCals / 7);

            points.push({
                label: i === 0 ? 'This Week' : `Week -${i}`,
                value: avgDaily,
                isToday: i === 0,
                subtext: 'Avg / Day'
            });
        }
    }

    return points;
}


// ===== Render List Helper (Same as before) =====
function renderMealList(meals) {
    const mealListContainer = document.querySelector('.meal-history-list');
    if (!mealListContainer) return;
    mealListContainer.innerHTML = '';

    if (meals.length === 0) {
        mealListContainer.innerHTML = `
            <div class="text-center p-8 text-gray-500">
                <p>No meals found for this period.</p>
            </div>`;
        return;
    }

    // Group by Date ... (Rest of rendering logic)
    const grouped = {};
    meals.forEach(meal => {
        if (!meal || !meal.timestamp) return;
        const date = new Date(meal.timestamp).toLocaleDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(meal);
    });

    Object.keys(grouped).forEach(date => {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 first:mt-0 px-2';
        const isToday = new Date().toLocaleDateString() === date;
        dateHeader.textContent = isToday ? 'Today' : date;
        mealListContainer.appendChild(dateHeader);

        grouped[date].forEach(meal => {
            // ... Individual Meal Render Code (Compact) ...
            try {
                const time = new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                let mainItemName = meal.foodName || (meal.foods && meal.foods[0]?.name) || 'Unknown';
                const count = meal.foods?.length || 1;

                const emoji = getEmojiForFood(mainItemName);
                let iconContent = emoji;
                if (meal.imageUrl) iconContent = `<img src="${meal.imageUrl}" class="w-full h-full object-cover">`;

                const div = document.createElement('div');
                div.className = 'flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer mb-2 border-l-4 border-primary';

                const cals = Math.round(meal.totals?.calories || meal.calories || 0);
                const pro = Math.round(meal.totals?.protein || meal.protein || 0);
                const carbs = Math.round(meal.totals?.carbs || meal.carbs || 0);

                div.innerHTML = `
                    <div class="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-2xl shrink-0">${iconContent}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="font-bold truncate text-sm capitalize">${mainItemName}${count > 1 ? ` (+${count - 1})` : ''}</h4>
                            <span class="text-xs text-gray-500">${time}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <p class="text-xs text-gray-500">${cals} kcal</p>
                            <div class="flex gap-2">
                                <span class="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold">${pro}g P</span>
                                <span class="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold">${carbs}g C</span>
                            </div>
                        </div>
                    </div>
                `;
                mealListContainer.appendChild(div);
            } catch (e) { }
        });
    });
}

function getEmojiForFood(name) {
    if (!name) return '🍽️';
    name = name.toLowerCase();
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    if (name.includes('salad')) return '🥗';
    if (name.includes('fruit') || name.includes('apple')) return '🍎';
    if (name.includes('egg')) return '🍳';
    if (name.includes('coffee')) return '☕';
    return '🍽️';
}

function renderEmptyState() {
    const c = document.querySelector('.meal-history-list');
    if (c) c.innerHTML = `<div class="text-center p-8 text-gray-500"><p>No meals logged yet.</p></div>`;
}
function renderErrorState(msg) {
    const c = document.querySelector('.meal-history-list');
    if (c) c.innerHTML = `<div class="text-center p-8 text-red-500"><p>${msg}</p></div>`;
}
