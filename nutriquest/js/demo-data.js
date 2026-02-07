// ===== Add Demo Data for Testing =====
// This file adds some sample meals to localStorage for demo purposes

function addDemoMeals() {
    const now = new Date();

    // Clear existing demo meals
    localStorage.removeItem('demoMeals');

    const demoMeals = [
        {
            id: 'meal_1',
            userId: 'demo-user-123',
            timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30),
            foodName: 'Oatmeal with Banana',
            calories: 255,
            protein: 6,
            carbs: 54,
            fats: 3,
            fiber: 7
        },
        {
            id: 'meal_2',
            userId: 'demo-user-123',
            timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 15),
            foodName: 'Chicken Breast with Rice',
            calories: 450,
            protein: 45,
            carbs: 50,
            fats: 8,
            fiber: 2
        },
        {
            id: 'meal_3',
            userId: 'demo-user-123',
            timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0),
            foodName: 'Grilled Salmon with Vegetables',
            calories: 380,
            protein: 35,
            carbs: 20,
            fats: 18,
            fiber: 6
        }
    ];

    localStorage.setItem('demoMeals', JSON.stringify(demoMeals));
    console.log('✅ Demo meals added to localStorage');
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDemoMeals);
} else {
    addDemoMeals();
}
