// Profile page - Load user data from Firestore

// Load user biometrics from Firestore
async function loadUserBiometrics() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('⚠️ No user logged in');
            return;
        }

        console.log('📊 Loading biometrics for:', user.uid);

        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (!userDoc.exists) {
            console.warn('⚠️ User document not found');
            return;
        }

        const userData = userDoc.data();
        console.log('✅ Firestore user data:', userData);

        // Find and populate form fields
        const ageInput = document.querySelector('input[type="number"][placeholder="28"]');
        const genderSelect = document.querySelector('select');
        const heightInput = document.querySelector('input[type="number"][placeholder="180"]');
        const weightInput = document.querySelector('input[type="number"][placeholder="75"]');

        if (ageInput && userData.age) {
            ageInput.value = userData.age;
            console.log('✅ Age set to:', userData.age);
        }

        if (genderSelect && userData.gender) {
            // Convert to proper case: male -> Male
            const genderValue = userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1);
            genderSelect.value = genderValue;
            console.log('✅ Gender set to:', genderValue);
        }

        if (heightInput && userData.height) {
            heightInput.value = userData.height;
            console.log('✅ Height set to:', userData.height);
        }

        if (weightInput && userData.weight) {
            weightInput.value = userData.weight;
            console.log('✅ Weight set to:', userData.weight);
        }

        // Populate activity level if available
        if (userData.activity) {
            console.log('✅ Activity level:', userData.activity);
            // Activity level can be added to UI if needed
        }

        // Log additional metrics for reference
        if (userData.bmi) {
            console.log('📊 BMI:', userData.bmi);
        }

        if (userData.bmr) {
            console.log('📊 BMR:', userData.bmr);
        }

        if (userData.dailyCalories) {
            console.log('📊 Daily Calories:', userData.dailyCalories);
        }

        if (userData.goal) {
            console.log('🎯 Goal:', userData.goal);
        }

        console.log('✅ All biometrics loaded!');

    } catch (error) {
        console.error('❌ Error loading biometrics:', error);
    }
}

// Wait for auth to be ready
setTimeout(() => {
    if (auth && auth.currentUser) {
        loadUserBiometrics();
    } else {
        auth.onAuthStateChanged((user) => {
            if (user) {
                loadUserBiometrics();
            }
        });
    }
}, 500);
