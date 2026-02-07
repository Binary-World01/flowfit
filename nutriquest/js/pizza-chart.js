// 🍕 Pizza Chart Logic (Macro Distribution)

// Update the conic gradient chart on the dashboard
function updatePizzaChart(totals) {
    const chart = document.getElementById('macroChart');
    if (!chart) return;

    // 1. Calculate Calories from Macros
    const proteinCals = (totals.protein || 0) * 4;
    const carbsCals = (totals.carbs || 0) * 4;
    const fatCals = (totals.fats || 0) * 9;

    // Total calories from macros (might differ slightly from total calories logged if alcohol etc exists, but good enough for distribution)
    const totalMacroCals = proteinCals + carbsCals + fatCals;

    // Handle empty state
    if (totalMacroCals === 0) {
        chart.style.background = `conic-gradient(
            #e5e7eb 0% 100%
        )`;
        return;
    }

    // 2. Calculate Percentages
    const proteinPct = (proteinCals / totalMacroCals) * 100;
    const fatPct = (fatCals / totalMacroCals) * 100;
    const carbsPct = (carbsCals / totalMacroCals) * 100;

    // 3. Construct Gradient String
    // Order: Protein (Pink) -> Fat (Yellow) -> Carbs (Green)
    // Stops:
    // P: 0% -> proteinPct%
    // F: proteinPct% -> (proteinPct + fatPct)%
    // C: (proteinPct + fatPct)% -> 100%

    const pEnd = proteinPct;
    const fEnd = proteinPct + fatPct;

    // Colors matching Dashboard Legend
    const colorProtein = '#F472B6'; // Pink
    const colorFat = '#FBBF24';     // Yellow
    const colorCarbs = '#34D399';   // Green

    const gradient = `conic-gradient(
        ${colorProtein} 0% ${pEnd}%,
        ${colorFat} ${pEnd}% ${fEnd}%,
        ${colorCarbs} ${fEnd}% 100%
    )`;

    // 4. Apply Style
    chart.style.background = gradient;

    console.log('🍕 Chart Updated:', { proteinPct, fatPct, carbsPct });
}

// Expose to window
window.updatePizzaChart = updatePizzaChart;
