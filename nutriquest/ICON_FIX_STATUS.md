# Quick Fix Script - Replace Material Icons in All Files

## Problem:
Material Icons not loading - the lighter config I used was wrong

## Solution:
Replace this line in ALL HTML files:
```html
<!-- THIS IS BROKEN: -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols_Outlined:opsz,wght@20,400&display=block"

<!-- REPLACE WITH THIS WORKING VERSION: -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
```

## Files to Fix:
1. ✅ dashboard.html - FIXED
2. ⏳ welcome.html
3. ⏳ scanner.html
4. ⏳ achievements.html
5. ⏳ profile.html
6. ⏳ insights.html
7. ⏳ index.html (if it uses icons)

Running automatic fix now...
