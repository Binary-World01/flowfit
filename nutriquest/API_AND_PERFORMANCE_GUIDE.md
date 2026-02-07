# 🚀 NutriQuest: API Integration & Performance Guide

## 1. Recommended API Stack
To transition from "Mock Data" to a production-ready app, integrate these specific APIs.

### 🍎 Food Recognition (Visual)
*   **Current:** `Simulated / Mock`
*   **Recommendation:** **OpenAI GPT-4o (Vision)** or **Google Gemini Flash**
*   **Why:** You already have the OpenAI key in `config.js`. It offers the highest accuracy to handle complex mixed meals (e.g., "Chicken Curry with Rice").
*   **Alternative (Speed):** **LogMeal API** (Specialized for food, faster but costs money).

### 🥗 Nutrition Database (Data)
*   **Current:** `Mock Database`
*   **Recommendation:** **CalorieNinjas** (Easiest & Free Tier) or **USDA FoodData Central** (Official).
*   **CalorieNinjas:** returns JSON directly from text (e.g. "300g chicken").
    *   *Endpoint:* `https://api.calorieninjas.com/v1/nutrition?query=...`
*   **Nutritionix:** Best for "Natural Language" processing.

### 🤖 AI Coach
*   **Current:** **DeepSeek** (Excellent Choice)
*   **Optimization:** Keep using DeepSeek for logic. It's cheaper and faster than GPT-4 for text generation.
*   **Status:** ✅ **Integrated**

---

## 2. Quick Integration Steps

### Step A: Activate Actual Nutrition Data
Replace the `getMockNutritionData` in `nutrition.js` with **CalorieNinjas** (Free tier is generous).

```javascript
async function getNutrition(query) {
    const apiKey = 'YOUR_API_KEY'; // Get from https://calorieninjas.com
    const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${query}`, {
        headers: { 'X-Api-Key': apiKey }
    });
    return await response.json();
}
```

### Step B: Enable "Real" Vision
In `scanner.js`, switch from the `FOOD_DATASET` matching to sending the image to OpenAI/Gemini.
*   *Tip:* Send a resized image (max 512x512) to save tokens and speed up the response.

---

## 3. Performance Optimization ⚡

### 💾 1. Aggressive Caching (The "Offline-First" Strategy)
You are already storing AI Plans in Firestore (`users/{uid}/ai_plans/current`). Expand this:
*   **Cache Food Scans:** If a user scans "Apple" today, save the nutrition data in a local map. Next time they scan "Apple", load it instantly from memory, don't hit the API.
*   **Firestore Persistence:** Enable `firebase.firestore().enablePersistence()` in `firebase-init.js`. This makes the app work **completely offline** using cached data.

### 🖼️ 2. Image Handling
*   **Problem:** Uploading 4K images from modern phones takes forever.
*   **Solution:** You are already using `<canvas>` to resize in `camera.js`. Ensure you set `quality` to `0.6` (60%) instead of `0.85`. It creates files 5x smaller with no visible difference for AI.

### 📦 3. Lazy Loading
*   **Current:** All JS is loaded in `<head>` or at end of `<body>`.
*   **Fix:** Add `defer` to your script tags: `<script src="js/scanner.js" defer></script>`.
*   **Logic:** Only load `scanner.js` when the user actually visits the Scanner page, not on the Dashboard.

### 🚀 4. Service Worker (PWA)
*   Create a `service-worker.js` to cache the UI shell (`index.html`, `css/styles.css`).
*   This makes the app load in **< 100ms** on repeat visits.

## 📝 Next Steps Checklist
- [ ] Sign up for **CalorieNinjas** (Free API Key).
- [ ] Update `nutrition.js` to use `fetch()` instead of `mockData`.
- [ ] Lower image capture quality to `0.6` in `camera.js`.
- [ ] Add `defer` to script tags in HTML files.
