// ===== Nutrition API & Calculations =====

// Get nutrition information for food
// TODO: Replace with actual USDA or Nutritionix API call
async function getNutritionInfo(foodName) {
    try {
        showLoading('Getting nutrition data...');

        // PLACEHOLDER: Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // REAL API CALL
        const nutritionData = await getRealNutritionData(foodName);

        hideLoading();

        // Store current meal data
        currentMealData = {
            foodName: foodName,
            ...nutritionData,
            portionMultiplier: 1
        };

        // Display nutrition card
        displayNutrition(currentMealData);

    } catch (error) {
        hideLoading();
        console.error(' ❌ Nutrition API error:', error);
        showToast('Error getting nutrition data. Please try again.');
    }
}

// TODO: Integrate real nutrition API
/*
// Example: USDA FoodData Central API
async function getNutritionFromUSDA(foodName) {
    const API_KEY = 'YOUR_USDA_API_KEY';
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&api_key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.foods && data.foods.length > 0) {
            const food = data.foods[0];
            const nutrients = {};
            
            food.foodNutrients.forEach(nutrient => {
                const name = nutrient.nutrientName.toLowerCase();
                if (name.includes('energy')) nutrients.calories = nutrient.value;
                if (name.includes('protein')) nutrients.protein = nutrient.value;
                if (name.includes('carbohydrate')) nutrients.carbs = nutrient.value;
                if (name.includes('fat')) nutrients.fats = nutrient.value;
                if (name.includes('fiber')) nutrients.fiber = nutrient.value;
            });
            
            return nutrients;
        }
        
        throw new Error('Food not found');
        
    } catch (error) {
        throw error;
    }
}

// Example: Nutritionix API (better for branded foods)
async function getNutritionFromNutritionix(foodName) {
    const APP_ID = 'YOUR_APP_ID';
    const APP_KEY = 'YOUR_APP_KEY';
    
    const url = 'https://trackapi.nutritionix.com/v2/natural/nutrients';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-app-id': APP_ID,
                'x-app-key': APP_KEY
            },
            body: JSON.stringify({
                query: foodName
            })
        });
        
        const data = await response.json();
        
        if (data.foods && data.foods.length > 0) {
            const food = data.foods[0];
            return {
                calories: food.nf_calories,
                protein: food.nf_protein,
                carbs: food.nf_total_carbohydrate,
                fats: food.nf_total_fat,
                fiber: food.nf_dietary_fiber
            };
        }
        
        throw new Error('Food not found');
        
    } catch (error) {
        throw error;
    }
}
*/

// Real CalorieNinjas API Integration
async function getRealNutritionData(query) {
    const apiKey = 'cxDnqiXe7EQBng5ggVWCRQe23HmfSuanUE0HIOyu'; // User provided key
    try {
        const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
            headers: { 'X-Api-Key': apiKey }
        });

        if (!response.ok) throw new Error('API Request Failed');

        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const item = data.items[0];
            return {
                foodName: item.name,
                calories: item.calories,
                protein: item.protein_g,
                carbs: item.carbohydrates_total_g,
                fats: item.fat_total_g,
                fiber: item.fiber_g,
                sugar: item.sugar_g
            };
        }
        return null;
    } catch (error) {
        console.error('API Error:', error);
        return getMockNutritionData(query); // Fallback if API fails
    }
}

// Mock nutrition data (Fallback)
function getMockNutritionData(foodName) {
    const database = {
        'chicken breast': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
        'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
        'broccoli': { calories: 55, protein: 3.7, carbs: 11, fats: 0.6, fiber: 2.4 },
        'eggs': { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 },
        'banana': { calories: 105, protein: 1.3, carbs: 27, fats: 0.4, fiber: 3.1 },
        'greek yogurt': { calories: 100, protein: 17, carbs: 6, fats: 0.7, fiber: 0 },
        'oatmeal': { calories: 150, protein: 5, carbs: 27, fats: 3, fiber: 4 },
        'salmon': { calories: 206, protein: 22, carbs: 0, fats: 13, fiber: 0 },
        'sweet potato': { calories: 112, protein: 2, carbs: 26, fats: 0.1, fiber: 4 },
        'almonds': { calories: 164, protein: 6, carbs: 6, fats: 14, fiber: 3.5 },
        'dal': { calories: 150, protein: 9, carbs: 27, fats: 0.5, fiber: 8 },
        'roti': { calories: 70, protein: 2.5, carbs: 15, fats: 0.4, fiber: 2 },
        'paneer': { calories: 265, protein: 18, carbs: 3.6, fats: 20, fiber: 0 },
        'biryani': { calories: 290, protein: 8, carbs: 45, fats: 8, fiber: 2 }
    };

    const normalized = foodName.toLowerCase();

    // Try to find exact match
    if (database[normalized]) {
        return database[normalized];
    }

    // Try to find partial match
    for (const [key, value] of Object.entries(database)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }

    // Default fallback
    return { calories: 200, protein: 10, carbs: 30, fats: 5, fiber: 2 };
}

// Display nutrition information
function displayNutrition(mealData) {
    document.getElementById('foodName').textContent = mealData.foodName;
    document.getElementById('foodCalories').textContent = Math.round(mealData.calories * mealData.portionMultiplier);
    document.getElementById('foodProtein').textContent = Math.round(mealData.protein * mealData.portionMultiplier);
    document.getElementById('foodCarbs').textContent = Math.round(mealData.carbs * mealData.portionMultiplier);
    document.getElementById('foodFats').textContent = Math.round(mealData.fats * mealData.portionMultiplier);

    // Show nutrition card
    document.getElementById('nutritionCard').classList.remove('hidden');

    // Scroll to nutrition card
    document.getElementById('nutritionCard').scrollIntoView({ behavior: 'smooth' });
}

// Adjust portions when user changes portion size
function adjustPortions() {
    if (!currentMealData) return;

    const portionSize = parseFloat(document.getElementById('portionSize').value);
    currentMealData.portionMultiplier = portionSize;

    // Update displayed values
    displayNutrition(currentMealData);
}

// Save food to log
async function saveFood() {
    if (!currentMealData) {
        showToast('No food data to save');
        return;
    }

    showLoading('Saving meal...');

    try {
        // Prepare meal data
        const mealToSave = {
            foodName: currentMealData.foodName,
            calories: Math.round(currentMealData.calories * currentMealData.portionMultiplier),
            protein: Math.round(currentMealData.protein * currentMealData.portionMultiplier),
            carbs: Math.round(currentMealData.carbs * currentMealData.portionMultiplier),
            fats: Math.round(currentMealData.fats * currentMealData.portionMultiplier),
            fiber: Math.round((currentMealData.fiber || 0) * currentMealData.portionMultiplier),
            portionSize: currentMealData.portionMultiplier,
            imageUrl: currentImageData || null
        };

        // Save to database
        const success = await saveMeal(mealToSave);

        if (success) {
            // Update streak
            const newStreak = await updateStreak();

            // Update streak displays
            document.querySelectorAll('#streakCount, #streakNumber').forEach(el => {
                el.textContent = newStreak;
            });

            hideLoading();
            showToast('Meal logged successfully! 🎉');

            // Switch to dashboard
            showScreen('dashboard');

            // Reload dashboard data
            await loadDashboardData();

            // Reset scan screen
            document.getElementById('scanResults').classList.add('hidden');
            document.getElementById('nutritionCard').classList.add('hidden');
            currentImageData = null;
            currentMealData = null;
        } else {
            hideLoading();
            showToast('Error saving meal. Please try again.');
        }

    } catch (error) {
        hideLoading();
        console.error('❌ Error saving food:', error);
        showToast('Error saving meal. Please try again.');
    }
}
