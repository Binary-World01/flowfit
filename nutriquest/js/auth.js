// ===== Authentication Functions =====

// Show login form
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('onboardingForm').classList.add('hidden');
}

// Show signup form
function showSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('onboardingForm').classList.add('hidden');
}

// Login user
async function loginUser() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Please enter email and password');
        return;
    }

    showLoading('Logging in...');

    try {
        await auth.signInWithEmailAndPassword(email, password);
        hideLoading();
        showToast('Welcome back!');
        // Redirect handled by auth state observer
    } catch (error) {
        hideLoading();
        console.error('Login error:', error);

        let message = 'Login failed. Please try again.';
        if (error.code === 'auth/user-not-found') {
            message = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Incorrect password.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Invalid email address.';
        }

        showToast(message);
    }
}

// Signup user
async function signupUser() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!name || !email || !password) {
        showToast('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters');
        return;
    }

    showLoading('Creating account...');

    try {
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;

        // Create user profile in Firestore
        await db.collection('users').doc(userId).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            streak: 0,
            lastLogDate: null
        });

        hideLoading();
        showToast('Account created! Let\'s set up your profile.');

        // Show onboarding form
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('onboardingForm').classList.remove('hidden');

    } catch (error) {
        hideLoading();
        console.error('Signup error:', error);

        let message = 'Signup failed. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'This email is already registered.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Invalid email address.';
        } else if (error.code === 'auth/weak-password') {
            message = 'Password is too weak.';
        }

        showToast(message);
    }
}

// Complete onboarding
async function completeOnboarding() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseInt(document.getElementById('age').value);
    const goal = document.getElementById('goal').value;
    const activity = document.getElementById('activity').value;

    if (!weight || !height || !age) {
        showToast('Please fill in all fields');
        return;
    }

    showLoading('Setting up your profile...');

    try {
        const userId = auth.currentUser.uid;

        // Calculate nutrition goals
        const goals = calculateNutritionGoals(weight, height, age, goal, activity);

        // Update user profile
        await db.collection('users').doc(userId).update({
            weight: weight,
            height: height,
            age: age,
            goal: goal,
            activity: activity,
            goals: goals,
            onboardingCompleted: true
        });

        hideLoading();
        showToast('Profile setup complete! Welcome to NutriQuest! 🎉');

        // Redirect to main app
        window.location.href = 'index.html';

    } catch (error) {
        hideLoading();
        console.error('Onboarding error:', error);
        showToast('Error saving profile. Please try again.');
    }
}

// Calculate nutrition goals
function calculateNutritionGoals(weight, height, age, goal, activity) {
    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    // Assuming male for simplicity (can add gender selection)
    const BMR = 10 * weight + 6.25 * height - 5 * age + 5;

    // Activity multipliers
    const activityMultipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'very_active': 1.725,
        'extra_active': 1.9
    };

    // Calculate TDEE (Total Daily Energy Expenditure)
    let calories = Math.round(BMR * activityMultipliers[activity]);

    // Adjust based on goal
    if (goal === 'weight_loss') {
        calories = Math.round(calories * 0.85); // 15% deficit
    } else if (goal === 'muscle_gain') {
        calories = Math.round(calories * 1.1); // 10% surplus
    }

    // Calculate macros
    let protein, carbs, fats;

    if (goal === 'muscle_gain') {
        protein = Math.round(weight * 2.2); // 2.2g per kg
        fats = Math.round((calories * 0.25) / 9); // 25% of calories
        carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);
    } else if (goal === 'weight_loss') {
        protein = Math.round(weight * 2.0); // 2.0g per kg (preserve muscle)
        fats = Math.round((calories * 0.30) / 9); // 30% of calories
        carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);
    } else {
        protein = Math.round(weight * 1.6); // 1.6g per kg
        fats = Math.round((calories * 0.25) / 9); // 25% of calories
        carbs = Math.round((calories - (protein * 4) - (fats * 9)) / 4);
    }

    return {
        calories: calories,
        protein: protein,
        carbs: carbs,
        fats: fats,
        fiber: 30, // Recommended daily fiber
        water: Math.round(weight * 0.033 * 1000) // 33ml per kg in ml
    };
}

// Logout user
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut().then(() => {
            showToast('Logged out successfully');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Logout error:', error);
            showToast('Error logging out');
        });
    }
}

// Listen for Enter key on login form
if (document.getElementById('loginPassword')) {
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginUser();
        }
    });
}

if (document.getElementById('signupPassword')) {
    document.getElementById('signupPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            signupUser();
        }
    });
}
