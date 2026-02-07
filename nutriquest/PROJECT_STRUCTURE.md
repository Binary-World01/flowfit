# 🥗 NutriQuest - Complete Project Structure

## 📁 Project Files (Clean & Organized!)

### ✅ **HTML Pages (6 Total)**

```
index.html              → Redirects to welcome.html (entry point)
welcome.html            → Landing/Onboarding page
dashboard.html          → Main dashboard (nutrition summary)
scanner.html            → Food scanner with camera
achievements.html       → Badges and gamification
profile.html            → User settings & biometrics
insights.html           → Weekly analytics & charts
```

### 🎨 **CSS (None! Using Tailwind CDN)**

The old CSS files have been **deleted**. All styling now comes from:
- **Tailwind CSS** (loaded via CDN in each HTML file)
- **Custom inline styles** where needed

### 💻 **JavaScript Files (9 Total - Ready for functionality)**

```
js/
├── app.js              → Main app logic
├── auth.js             → Authentication handling
├── camera.js           → Camera/scanner functionality
├── config.js           → API keys and configuration
├── demo-data.js        → Demo mode sample data
├── firebase-init.js    → Firebase initialization
├── gamification.js     → Achievements & badges logic
├── nutrition.js        → Nutrition calculations
└── ui.js               → UI interactions
```

### 📄 **Other Files**

```
manifest.json           → PWA manifest
README.md               → Project overview
UI_REDESIGN_README.md   → UI redesign documentation
```

---

## 🔗 **Page Navigation Map**

### **1. index.html** (Entry Point)
- **What it does:** Redirects to `welcome.html`
- **Links to:** `welcome.html` (automatic)

### **2. welcome.html** (Onboarding)
- **What it does:** Landing page with setup wizard
- **Links to:** `dashboard.html` (via "Start Your Journey" button)
- **Features:**
  - Hero section
  - Name input
  - Goal selection (Weight Loss, Build Muscle, Stay Healthy)
  - Call-to-action button

### **3. dashboard.html** (Main Dashboard)
- **What it does:** Shows daily nutrition summary
- **Links to:**
  - `scanner.html` (Scan Meal button)
  - `insights.html` (via navigation)
  - `achievements.html` (via navigation)
  - `profile.html` (via navigation)
- **Features:**
  - 12-day streak display
  - Circular progress (calories)
  - Macro cards (Protein, Carbs, Fats)
  - Recent meals sidebar
  - Quick action buttons

### **4. scanner.html** (Food Scanner)
- **What it does:** Camera interface for scanning food
- **Links to:**
  - `dashboard.html` (via navigation)
  - All other pages (via header nav)
- **Features:**
  - Live camera feed
  - Scan frame overlay
  - AI detection badge
  - Nutrition results display
  - Upload/capture controls

### **5. achievements.html** (Badges & Gamification)
- **What it does:** Shows unlocked/locked badges
- **Links to:**
  - `dashboard.html` (via navigation)
  - `scanner.html` (via navigation)
  - `insights.html` (via navigation)
- **Features:**
  - Progress overview (achievements, streak, points)
  - Badge grid with status
  - Beautiful gradient cards

### **6. profile.html** (Settings & Biometrics)
- **What it does:** User profile and nutrition goals
- **Links to:**
  - `dashboard.html` (via navigation)
  - All other pages (via header nav)
- **Features:**
  - Age, gender, height, weight inputs
  - Goal calculator (BMR, protein recommendations)
  - Activity level slider
  - AI-powered guidance

### **7. insights.html** (Analytics)
- **What it does:** Weekly nutrition trends
- **Links to:**
  - `dashboard.html` (via navigation)
  - `achievements.html` (via navigation)
- **Features:**
  - Animated bar chart (7 days)
  - Stats grid (avg calories, protein, meals)
  - Meal history timeline
  - AI insights banner

---

## 🎨 **Design System**

### **Colors**
```
Primary Green:    #13ec1a
Background Light: #f6f8f6
Background Dark:  #102211
Surface Light:    #ffffff
Surface Dark:     #1a331b
```

### **Typography**
```
Font: Space Grotesk (Google Fonts)
Weights: 300, 400, 500, 600, 700
```

### **Icons**
```
Material Symbols Outlined (Google Fonts)
```

### **Styling Framework**
```
Tailwind CSS v3 (CDN)
- All pages load Tailwind from CDN
- No custom CSS files needed
- Dark mode support included
- Responsive by default
```

---

## 🚀 **How to Use**

### **1. Start the Server**
```bash
cd c:\Users\Parth\OneDrive\Desktop\Mumalth\nutriquest
python -m http.server 8000
```

### **2. Open in Browser**
```
http://localhost:8000
```
This will redirect to `welcome.html` automatically!

### **3. Navigate the App**
- **Welcome** → Click "Start Your Journey" → **Dashboard**
- **Dashboard** → Click navigation links → **Scanner**, **Insights**, **Achievements**, **Profile**
- All pages have consistent header with working links

---

## 🔧 **Next Steps to Make it Functional**

### **1. Connect JavaScript**
The HTML pages reference JS files but they're not yet functional:
- `js/camera.js` → Make scanner work
- `js/nutrition.js` → Calculate macros
- `js/gamification.js` → Track achievements
- `js/auth.js` → Add user accounts

### **2. Add API Keys**
Edit `js/config.js`:
```javascript
const API_KEYS = {
    clarifai: 'YOUR_CLARIFAI_KEY',  // For food recognition
    usda: 'YOUR_USDA_KEY',          // For nutrition data
    firebase: { /* ... */ }          // For authentication
}
```

### **3. Enable Camera**
The scanner page needs camera permissions and capture logic in `js/camera.js`.

### **4. Make Charts Interactive**
The insights page charts are currently static HTML/CSS. Add Chart.js or similar for real data.

---

## 📊 **File Status**

| File | Status | Purpose |
|------|--------|---------|
| ✅ index.html | DONE | Entry point redirect |
| ✅ welcome.html | DONE | Onboarding UI complete |
| ✅ dashboard.html | DONE | Dashboard UI complete |
| ✅ scanner.html | DONE | Scanner UI complete |
| ✅ achievements.html | DONE | Achievements UI complete |
| ✅ profile.html | DONE | Profile UI complete |
| ✅ insights.html | DONE | Insights UI complete |
| ⏳ js/*.js | READY | Need API integration |
| ✅ All CSS | DELETED | Using Tailwind only |

---

## 🎯 **Summary**

**What's Complete:**
- ✅ All 6 pages with modern Tailwind CSS design
- ✅ Fully responsive layouts
- ✅ Dark mode support
- ✅ Navigation between all pages
- ✅ Consistent header/design system
- ✅ Animations and transitions

**What's Next:**
- ⏳ Wire up JavaScript functionality
- ⏳ Add real API integrations
- ⏳ Enable camera capture
- ⏳ Connect Firebase authentication

**Your UI is 100% done - now just add the backend! 🚀**
