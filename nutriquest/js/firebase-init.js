// ===== Initialize Firebase =====
let db, auth, storage;

try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Initialize services
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();

    // Enable offline persistence for WhatsApp-style sync
    db.enablePersistence({ synchronizeTabs: true })
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Persistence failed: Multiple tabs open');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Persistence not available in this browser');
            }
        });

    console.log('✅ Firebase initialized successfully');
    console.log('🔥 Project:', firebaseConfig.projectId);
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// ===== IMMEDIATE: Load Local Cache (Offline First) =====
const cachedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
if (cachedUser) {
    console.log('⚡ Offline: Loaded user from cache');
    window.currentUser = cachedUser;

    // Update UI immediately (Before Firebase loads)
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = cachedUser.displayName || cachedUser.name || 'User';
    }
}

// ===== Auth State Observer =====
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('✅ Firebase Auth connected:', user.email);

        // 1. Sync Cache with Auth User (Minimal)
        if (!window.currentUser) {
            window.currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            };
        }

        // 2. Fetch Latest Full Profile (Background Sync)
        await loadUserData(user.uid);

        // 3. Load Page Specific Data
        if (window.location.pathname.includes('dashboard.html')) {
            if (typeof loadDashboardData === 'function') {
                await loadDashboardData();
            }
        }
    } else {
        console.log('ℹ️ No Firebase user connected');

        // Only redirect if we ALSO have no local cache (True Logout)
        if (!localStorage.getItem('currentUser')) {
            const protectedPages = ['dashboard.html', 'scanner.html', 'profile.html', 'insights.html', 'achievements.html'];
            const currentPage = window.location.pathname.split('/').pop();

            if (protectedPages.includes(currentPage)) {
                console.log('🔒 Protected page - redirecting to login');
                window.location.href = 'login.html';
            }
        } else {
            console.log('⚡ Staying on page in/offline mode (Cache present)');
        }
    }
});

// ===== Load User Data =====
async function loadUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();

        if (userDoc.exists) {
            const userData = userDoc.data();

            // 1. Update Global State
            window.currentUser = {
                uid: userId,
                ...userData
            };

            // 2. Save to LocalStorage (Cache for next cold start)
            localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
            console.log('💾 User profile cached to localStorage');

            // 3. Update UI
            if (document.getElementById('userName')) {
                document.getElementById('userName').textContent = userData.displayName || userData.name || 'User';
            }

            // 4. Load Daily Data
            if (typeof loadDashboardData === 'function') {
                await loadDashboardData();
            }

            console.log('✅ User data synced from Firestore');
        } else {
            console.log('⚠️ User profile not found');
        }
    } catch (error) {
        console.error('❌ Error loading user data:', error);
    }
}

// ===== Database Helper Functions =====

// Save meal to database (OFFLINE-FIRST: localStorage + Firebase)
async function saveMeal(mealData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error('❌ No user logged in');
            return false;
        }

        const meal = {
            id: 'meal_' + Date.now(),
            userId: user.uid,
            timestamp: new Date(),
            ...mealData,
            // Include photo if available
            photo: mealData.image || null,
            photoKey: mealData.photoKey || window.currentPhotoKey || null
        };

        // STEP 1: Save to localStorage first (instant UI feedback)
        const mealsKey = 'meals_' + user.uid;
        const existingMeals = JSON.parse(localStorage.getItem(mealsKey) || '[]');
        existingMeals.push(meal);
        localStorage.setItem(mealsKey, JSON.stringify(existingMeals));
        localStorage.setItem(meal.id, JSON.stringify(meal)); // Store individual meal by ID for easier updates
        console.log('✅ Saved to localStorage (instant):', meal.id);

        // ===== GAMEFICATION UPDATE (Optimistic) =====
        const todayStr = new Date().toDateString();
        const currentStreak = window.currentUser.streak || 0;
        const lastLog = window.currentUser.lastLogDate || '';

        // 1. Calculate New Streak
        let newStreak = calculateNewStreak(currentStreak, lastLog);

        // 2. Add XP (50 per meal)
        let newPoints = (window.currentUser.points || 0) + 50;

        // 3. Prepare User Updates
        const userUpdates = {
            streak: newStreak,
            lastLogDate: todayStr,
            points: newPoints,
            totalMeals: (window.currentUser.totalMeals || 0) + 1
        };

        // 4. Update Local State Immediately
        window.currentUser = { ...window.currentUser, ...userUpdates };
        localStorage.setItem('currentUser', JSON.stringify(window.currentUser));

        // 5. Trigger UI updates if on dashboard
        if (document.getElementById('streakNumber')) document.getElementById('streakNumber').textContent = newStreak;
        if (typeof updateDashboardLevelUI === 'function') updateDashboardLevelUI(user.uid);

        // 6. Check Achievements (Async)
        checkAchievements(user, newStreak);

        // STEP 2: Sync to Firestore in background
        const batch = db.batch();

        // A. Save Meal
        const mealRef = db.collection('meals').doc(meal.id);
        batch.set(mealRef, {
            ...meal,
            synced: true,
            syncedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // B. Update User Stats
        const userRef = db.collection('users').doc(user.uid);
        batch.update(userRef, userUpdates);

        batch.commit()
            .then(() => console.log('✅ Synced Meal + Stats to Firestore'))
            .catch(err => console.warn('⚠️ Firestore sync failed (offline?), will retry later:', err));

        return true;
    } catch (error) {
        console.error('❌ Error saving meal:', error);
        return false;
    }
}

// Get today's meals (OFFLINE-FIRST: localStorage + Firestore sync)
async function getTodaysMeals() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('ℹ️ No user logged in, using empty meals');
            return [];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Load from localStorage FIRST (instant)
        const localMeals = JSON.parse(localStorage.getItem('meals_' + user.uid) || '[]');
        const todaysLocalMeals = localMeals.filter(meal => {
            const mealDate = new Date(meal.timestamp);
            mealDate.setHours(0, 0, 0, 0);
            return mealDate.getTime() === today.getTime();
        });
        console.log('✅ Loaded', todaysLocalMeals.length, 'meals from localStorage');

        // 2. Sync from Firestore in background (ROBUST: Fetch recent history & filter client-side)
        // This avoids timezone issues and missing indexes with `where(timestamp, >=, today)`
        try {
            const snapshot = await db.collection('meals')
                .where('userId', '==', user.uid)
                .orderBy('timestamp', 'desc')
                .limit(50) // Fetch last 50, plenty for a day
                .get();

            if (!snapshot.empty) {
                const firestoreMeals = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : (new Date(doc.data().timestamp || Date.now()))
                }));

                // merge with localStorage (Preserve history, update today)
                const allLocal = JSON.parse(localStorage.getItem('meals_' + user.uid) || '[]');

                // key by ID for easier merge
                const mealMap = new Map();
                allLocal.forEach(m => mealMap.set(m.id, m));
                firestoreMeals.forEach(m => mealMap.set(m.id, m)); // Server overwrites local for these IDs

                const mergedMeals = Array.from(mealMap.values());

                localStorage.setItem('meals_' + user.uid, JSON.stringify(mergedMeals));
                console.log('☁️ Synced', firestoreMeals.length, 'recent meals from Firestore (Merged with cache)');

                // NOW filter for today
                const syncedTodayMeals = firestoreMeals.filter(meal => {
                    const mealDate = new Date(meal.timestamp);
                    mealDate.setHours(0, 0, 0, 0);
                    return mealDate.getTime() === today.getTime();
                });

                return syncedTodayMeals;
            }
        } catch (firestoreError) {
            console.warn('⚠️ Firestore sync failed (offline or index missing)', firestoreError);

            // Fallback: If index missing, just fetch EVERYTHING (bad for scale, good for fix) or without order
            if (firestoreError.message.includes('requires an index') || firestoreError.code === 'failed-precondition') {
                console.log('⚠️ Missing Index, falling back to simple fetch');
                const snapshot = await db.collection('meals').where('userId', '==', user.uid).limit(50).get();
                const meals = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : (new Date(doc.data().timestamp || Date.now()))
                }));
                // Filter client side
                return meals.filter(meal => {
                    const mealDate = new Date(meal.timestamp);
                    mealDate.setHours(0, 0, 0, 0);
                    return mealDate.getTime() === today.getTime();
                });
            }
        }

        return todaysLocalMeals;
    } catch (error) {
        console.error('❌ Error getting meals:', error);
        return [];
    }
}

// Get recent meals (GLOBAL HISTORY)
async function getRecentMeals(limit = 5) {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        // 1. Sync from Firestore first for accuracy
        try {
            const snapshot = await db.collection('meals')
                .where('userId', '==', user.uid)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            if (!snapshot.empty) {
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate()
                }));
            }
        } catch (error) {
            console.warn('⚠️ Firestore sync failed, falling back to local', error);
        }

        // 2. Fallback to localStorage if offline
        const localMeals = JSON.parse(localStorage.getItem('meals_' + user.uid) || '[]');
        return localMeals
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);

    } catch (error) {
        console.error('❌ Error getting recent meals:', error);
        return [];
    }
}

// Update user profile
async function updateUserProfile(updates) {
    try {
        const userId = auth.currentUser.uid;

        // 1. Optimistic Local Update
        window.currentUser = { ...window.currentUser, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(window.currentUser));

        // 2. Background Sync
        await db.collection('users').doc(userId).update(updates);

        console.log('✅ Profile updated (Local + Cloud)');
        return true;
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        return false;
    }
}

// Helper: Calculate Streak based on history
function calculateNewStreak(currentStreak, lastLogDateStr) {
    const today = new Date().toDateString();

    if (lastLogDateStr === today) {
        return currentStreak; // Already logged today, streak unchanged
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastLogDateStr === yesterdayStr) {
        return (currentStreak || 0) + 1; // Increment!
    } else {
        return 1; // Broken streak, restart (or start new)
    }
}

// CHECK for achievements logic (Moved inside saveMeal mainly)
// But we keep this for specific checks
async function checkAchievements(user, newStreak) {
    if (newStreak === 7) unlockAchievement('week_warrior');
    if (newStreak === 30) unlockAchievement('month_master');
    if (newStreak === 100) unlockAchievement('century_champion');
}

// Check and unlock achievement (DEMO MODE)
async function unlockAchievement(achievementId) {
    try {
        // Check if already unlocked
        const unlockedAchievements = JSON.parse(localStorage.getItem('demoAchievements') || '[]');

        if (!unlockedAchievements.includes(achievementId)) {
            // Achievement not yet unlocked
            unlockedAchievements.push(achievementId);
            localStorage.setItem('demoAchievements', JSON.stringify(unlockedAchievements));

            // Show achievement popup
            if (typeof showAchievementPopup === 'function') {
                const achievements = {
                    'week_warrior': { name: 'Week Warrior', icon: '🔥', desc: '7-day streak!', points: 500 },
                    'month_master': { name: 'Month Master', icon: '🏆', desc: '30-day streak!', points: 2000 },
                    'century_champion': { name: 'Century Champion', icon: '👑', desc: '100-day streak!', points: 5000 },
                    'protein_pro': { name: 'Protein Pro', icon: '🥩', desc: 'Hit protein goal 7 days!', points: 300 },
                    'fiber_champion': { name: 'Fiber Champion', icon: '🌾', desc: '25g+ fiber for 5 days!', points: 300 }
                };

                const ach = achievements[achievementId];
                showAchievementPopup(ach);

                // SYNC TO PUBLIC LEADERBOARD
                const user = auth.currentUser;
                if (user && ach && ach.points) {
                    db.collection('users_public').doc(user.uid).set({
                        points: firebase.firestore.FieldValue.increment(ach.points),
                        uid: user.uid,
                        displayName: user.displayName || 'Player',
                        photoURL: user.photoURL || null
                    }, { merge: true }).catch(console.error);
                }
            }

            console.log('✅ Achievement unlocked:', achievementId);
        }
    } catch (error) {
        console.error('❌ Error unlocking achievement:', error);
    }
}
