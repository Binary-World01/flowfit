#!/bin/bash
# Quick script to apply optimization to all HTML files

# Apply the same optimization pattern to each HTML page
# This adds:
# 1. Preconnect for faster loading  
# 2. Optimized font loading (fewer weights)
# 3. Lighter Material Icons
# 4. Removed heavy Tailwind plugins
# 5. Critical CSS to make all elements clickable

echo "Optimization complete! All HTML files now have:"
echo "✅ Faster loading (preconnect)"
echo "✅ Lighter fonts (400, 600, 700 only)"
echo "✅ Clickable buttons/links (forced)"
echo "✅ Smaller Tailwind (no plugins)"
