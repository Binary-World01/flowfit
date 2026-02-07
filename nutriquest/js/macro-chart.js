// Update Macro "Vitality Ring" Visualization
function updateMacroChart(macros) {
    const chart = document.getElementById('macroChart');
    if (!chart) return;

    // Safety defaults
    const protein = macros.protein || 0;
    const fat = macros.fat || 0;
    const carbs = macros.carbs || 0;

    const total = protein + fat + carbs;

    // Default neutral state
    if (total === 0) {
        chart.style.background = `conic-gradient(#f3f4f6 0% 100%)`;
        return;
    }

    // Calculate Percentages
    const pProtein = (protein / total) * 100;
    const pFat = (fat / total) * 100;
    const pCarbs = (carbs / total) * 100;

    // Stops
    const stop1 = pProtein;
    const stop2 = pProtein + pFat;

    // COLORS (Vibrant, Neon-Health Style)
    const cProtein = '#F472B6'; // Pink/Red (Muscle)
    const cFat = '#FBBF24';     // Amber/Gold (Energy)
    const cCarbs = '#34D399';   // Emerald/Teal (Fuel)

    // Apply Sleek Conic Gradient
    chart.style.background = `conic-gradient(
        ${cProtein} 0% ${stop1}%, 
        ${cFat} ${stop1}% ${stop2}%, 
        ${cCarbs} ${stop2}% 100%
    )`;

    // Reset any previous pizza styles
    chart.style.backgroundBlendMode = 'normal';
    chart.style.backgroundSize = 'auto';
}

// Global hook
document.addEventListener('dashboardDataLoaded', (e) => {
    if (e.detail && e.detail.macros) {
        updateMacroChart(e.detail.macros);
    }
});

// Expose global
window.updateMacroChart = updateMacroChart;

// Backwards compatibility if app.js calls the old name
window.updatePizzaChart = updateMacroChart;
