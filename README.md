# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-8e1n7cjlf3ep

# FlowFit AI - Health & Fitness Tracking Web App

A comprehensive, AI-driven health and fitness tracking platform powered by **FlowFit AI** - an intelligent food recognition and nutrition analysis assistant that makes nutrition tracking effortless, accurate, and personalized.

## 🌟 FlowFit AI Features

### 🔍 Image-Based Food Recognition
- **Smart Food Detection**: Upload food images and automatically identify multiple items
- **Portion Estimation**: AI estimates portion sizes using visual cues
- **5000+ Food Database**: Recognizes Western, Indian, Chinese, Japanese, Thai, Mexican cuisines
- **Confidence Scoring**: Flags items below 70% confidence for user verification
- **Multi-Food Detection**: Identifies 3-10 items per image

### 🧠 AI-Powered Nutrition Analysis
- **Instant Macro Breakdown**: Automatic calculation of calories, protein, carbs, and fats
- **Meal Quality Scoring**: 0-100 score based on nutritional balance
- **Smart Recommendations**: Personalized tips based on your goals and data
- **Nutrient Gap Identification**: Alerts for deficiencies and imbalances
- **Real-Time Feedback**: Immediate insights on how meals fit your daily goals

### 🤖 FlowFit AI Health Coach
- **Conversational Assistant**: Natural language chat interface
- **Context-Aware**: Accesses your complete health data for personalized advice
- **Proactive Insights**: Daily summaries, pattern recognition, and progress analysis
- **Goal-Based Coaching**: Tailored recommendations for weight loss, muscle gain, or maintenance
- **Non-Judgmental Support**: Encouraging, scientific, and accessible guidance

### 🔗 Fitness Platform Integration
- **Google Fit**: Sync steps, calories, workouts, heart rate, sleep
- **Apple Health**: Sync nutrition, workouts, biometrics
- **Fitbit**: Connect wearable devices for activity tracking
- **Strava**: Import running and cycling activities
- **Samsung Health**: Cross-platform health data sync (coming soon)
- **Smart Adjustments**: Auto-adjust calorie goals based on activity

### 🌍 Regional Food Intelligence
- **Indian/South Asian Cuisine Expert**: 500+ regional dishes recognized
- **Thali Composition**: Understands mixed dishes and traditional meals
- **Street Food Recognition**: Pani puri, vada pav, samosa, chaat, and more
- **Context-Aware Nutrition**: Accounts for cooking styles and regional variations

## Core Features

### 🔐 User Authentication
- Secure username/password authentication
- Comprehensive profile setup questionnaire
- Role-based access control

### 📊 Dashboard
- Real-time health metrics overview
- Calorie, water, sleep, and step tracking
- Workout streak display
- Quick action buttons

### 🍽️ Nutrition Tracking
- **AI Food Recognition**: Upload images for instant analysis
- **Manual Logging**: Detailed nutritional data entry
- **Meal History**: Filter by date and meal type
- **Quality Insights**: AI-powered meal quality scoring
- **Smart Tips**: Actionable recommendations for better nutrition

### 💪 Workout Tracking
- Multiple workout types (home workout, calisthenics, bodyweight, cardio)
- Duration and calorie tracking
- Completion status
- Exercise history

### ❤️ Health Metrics
- Weight tracking with automatic BMI calculation
- Daily step counter
- Water intake logging
- Sleep duration and quality
- Heart rate, respiratory rate, blood glucose, blood pressure

### 📅 Daily Planner
- AI-generated meal plans
- Workout scheduling
- Water and sleep goals
- Personalized recommendations

### 🎯 Goals & Progress
- Custom fitness goal creation
- Progress tracking with visual indicators
- Active and completed goals management

### 📈 Analytics
- 30-day activity overview
- Average calorie consumption
- Weight progress tracking
- AI-powered insights

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation

### Backend
- **Supabase** for backend services
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Storage for food images
  - Edge Functions for AI processing

### AI Integration
- **Large Language Model API** (OpenAI GPT-4o)
- **Computer Vision**: Multimodal image analysis
- **Natural Language Processing**: Conversational coaching
- **Personalization Engine**: Adaptive learning

### Design
- Health-focused color scheme with primary green (#4CAF50)
- Responsive design (desktop-first with mobile adaptation)
- Card-based layout with soft shadows
- Accessible and user-friendly interface

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account
- OpenAI API key (for FlowFit AI features)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Supabase credentials are configured in `.env`
   - Add your `LLM_API_KEY` in Supabase Edge Function secrets

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Build for production:
   ```bash
   pnpm build
   ```

## Usage

### First Time Setup

1. **Register an Account**
   - Navigate to the login page
   - Create a username and password
   - Complete the profile setup questionnaire

2. **Complete Your Profile**
   - Enter basic information (age, height, weight, gender)
   - Set fitness goals (target weight, timeline)
   - Select lifestyle type and activity level
   - Choose dietary preferences
   - Add any health conditions

3. **Start Tracking with FlowFit AI**
   - Take a photo of your meal
   - Let AI recognize and analyze the food
   - Review and confirm the results
   - Get instant nutritional insights

### Daily Workflow with FlowFit AI

1. **Morning**
   - Check your daily plan
   - Take a photo of breakfast - AI recognizes it instantly
   - Update sleep metrics from last night
   - Chat with FlowFit AI for breakfast recommendations

2. **Throughout the Day**
   - Snap photos of meals and snacks
   - AI automatically logs nutrition
   - Track water intake
   - Record workouts
   - Get real-time feedback from FlowFit AI

3. **Evening**
   - Review daily progress on dashboard
   - Check analytics for trends
   - Ask FlowFit AI for tips and motivation
   - Plan for tomorrow

## FlowFit AI Capabilities

### Food Recognition Example
```
User: [Uploads image of thali]

FlowFit AI:
🍽️ Traditional Thali Detected!

1. Chapati (2) - 240 cal | 8g protein
2. Rajma Curry - 180 cal | 8g protein
3. Jeera Rice - 210 cal | 4g protein
4. Raita - 60 cal | 3g protein
5. Salad - 25 cal | 1g protein
6. Pickle - 15 cal | 0g protein

**Total**: 730 calories | 24g protein | 110g carbs | 18g fat

✅ Balanced meal! Quality Score: 85/100

💡 Tips:
- Great protein from dal and raita
- Traditional thalis are naturally balanced
- Add more veggies for extra fiber

Is this accurate? [Confirm] [Adjust Portions]
```

### AI Coach Example
```
User: "I'm always hungry by 11am even after breakfast"

FlowFit AI:
That's a common issue! Let me help you fix this 🍳

Looking at your recent breakfasts, I notice:
- Mostly carb-focused (toast, cereal, juice)
- Low protein (5-8g average)
- Minimal healthy fats

**Why you're hungry**: Carbs digest quickly without protein/fat.

**Solutions**:
1. Add protein: Eggs (12g), Greek yogurt (15g), or paneer (18g)
2. Include healthy fats: Nuts, avocado, or nut butter
3. Try: 2 eggs + whole wheat toast + avocado = 4-5 hours fullness

Want me to suggest some quick high-protein breakfast ideas?
```

## Security & Privacy

- Secure authentication with Supabase Auth
- Row Level Security (RLS) policies
- Food images processed and deleted immediately
- Encrypted nutrition data
- User controls all data sharing
- No medical diagnosis provided

## Important Notes

### Disclaimers
- **Not Medical Advice**: Provides lifestyle guidance only, not medical diagnosis
- **Consult Professionals**: Always consult healthcare professionals for medical advice
- **AI Limitations**: FlowFit AI is for general guidance only
- **Data Accuracy**: Depends on user input and image quality

### First User
- The first registered user automatically becomes an admin
- Admin role provides full access to all features

### Image Upload
- Food images must be under 1MB
- Supported formats: JPEG, PNG, GIF, WEBP
- Images are analyzed and deleted (not stored permanently)

## Future Enhancements

### Planned Features
- Real-time wearable device integration
- Advanced analytics with charts
- Social features and community
- Medication reminders with push notifications
- Export data to PDF/CSV
- Multi-language support
- Voice input for meal logging

### AI Enhancements
- Improved food recognition accuracy
- Recipe suggestions based on available ingredients
- Predictive analytics for goal achievement
- Personalized meal prep plans
- Budget-friendly alternatives

## Contributing

This is a demonstration project showcasing FlowFit AI - an intelligent health and fitness tracking application built with modern web technologies and advanced AI capabilities.

## License

© 2025 FlowFit AI - Health & Fitness Tracking Web App

## Support

For issues or questions, please refer to the application documentation or contact support.

---

**Built with ❤️ using React, TypeScript, Supabase, OpenAI, and shadcn/ui**

**Powered by FlowFit AI** - Making nutrition tracking effortless through intelligent food recognition and personalized coaching.

## Features

### 🔐 User Authentication
- Secure username/password authentication
- Profile setup with comprehensive health questionnaire
- Role-based access control

### 📊 Dashboard
- Real-time overview of daily health metrics
- Calorie tracking with progress bars
- Water intake monitoring
- Sleep tracking
- Step counter
- Workout streak display

### 🍽️ Nutrition Tracking
- Manual meal logging with detailed nutritional information
- Food image upload capability
- Calorie and macronutrient tracking (protein, carbs, fats)
- Meal history with filtering by date
- Daily nutrition summary

### 💪 Workout Tracking
- Log various workout types (home workout, calisthenics, bodyweight, cardio)
- Track duration and calories burned
- Workout completion status
- Exercise history and analytics

### ❤️ Health Metrics
- Weight tracking with automatic BMI calculation
- Daily step counter
- Water intake logging
- Sleep duration and quality tracking
- Heart rate monitoring
- Respiratory rate tracking
- Blood glucose logging
- Blood pressure tracking

### 📅 Daily Planner
- AI-generated daily meal plans
- Workout scheduling
- Water and sleep goals
- Personalized recommendations
- Progress tracking

### 🎯 Goals & Progress
- Set custom fitness goals
- Track progress toward targets
- Goal completion status
- Active and completed goals view

### 📈 Analytics
- 30-day activity overview
- Average calorie consumption
- Average workout duration
- Weight progress tracking
- AI-powered insights

### 🤖 AI Health Assistant
- Conversational chat interface
- Health and fitness guidance
- Personalized recommendations
- Lifestyle advice (non-diagnostic)

### 👤 Profile Management
- Update personal information
- Set fitness goals
- Manage dietary preferences
- Track health conditions
- Lifestyle and activity level settings

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation

### Backend
- **Supabase** for backend services
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Storage for food images
  - Real-time capabilities

### Design
- Health-focused color scheme with primary green (#4CAF50)
- Responsive design (desktop-first with mobile adaptation)
- Card-based layout with soft shadows
- Accessible and user-friendly interface

## Database Schema

### Tables
- **profiles** - User profile information and preferences
- **meals** - Meal logging with nutritional data
- **workouts** - Workout tracking and history
- **health_metrics** - Daily health measurements
- **medications** - Medication tracking
- **medication_logs** - Medication adherence logs
- **daily_plans** - AI-generated daily plans
- **goals** - User fitness goals
- **streaks** - Activity streak tracking

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Supabase credentials are already configured in `.env`

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Build for production:
   ```bash
   pnpm build
   ```

## Usage

### First Time Setup

1. **Register an Account**
   - Navigate to the login page
   - Click "Register" tab
   - Create a username and password
   - Complete the profile setup questionnaire

2. **Complete Your Profile**
   - Enter basic information (age, height, weight, gender)
   - Set your fitness goals (target weight, timeline)
   - Select lifestyle type and activity level
   - Choose dietary preferences
   - Add any health conditions

3. **Start Tracking**
   - Log your first meal
   - Record a workout
   - Update daily health metrics
   - Generate a daily plan

### Daily Workflow

1. **Morning**
   - Check your daily plan
   - Log breakfast
   - Update sleep metrics from last night

2. **Throughout the Day**
   - Log meals and snacks
   - Track water intake
   - Record workouts
   - Update step count

3. **Evening**
   - Review daily progress on dashboard
   - Check analytics for trends
   - Chat with AI assistant for tips
   - Plan for tomorrow

## Key Features Explained

### Nutrition Tracking
- Upload food images for visual logging
- Manual entry with detailed macros
- Track meal timing and consistency
- View nutritional breakdown by meal type

### Workout Planning
- Choose from multiple workout types
- Log duration and intensity
- Track calories burned
- Mark workouts as complete

### Health Monitoring
- Comprehensive vital signs tracking
- Automatic BMI calculation
- Trend analysis over time
- Correlate metrics with activities

### AI Assistant
- Ask health and fitness questions
- Get personalized recommendations
- Receive lifestyle guidance
- Context-aware responses (demo mode)

### Daily Planner
- AI-generated meal suggestions
- Workout scheduling
- Hydration reminders
- Sleep recommendations

## Security & Privacy

- Secure authentication with Supabase Auth
- Row Level Security (RLS) policies
- User data isolation
- No medical diagnosis provided
- Lifestyle guidance only

## Important Notes

### Disclaimers
- **Not Medical Advice**: This app provides lifestyle guidance only, not medical diagnosis or treatment
- **Consult Professionals**: Always consult healthcare professionals for medical advice
- **Data Accuracy**: User-entered data accuracy depends on user input
- **AI Limitations**: AI assistant is for general guidance only

### First User
- The first registered user automatically becomes an admin
- Admin role provides full access to all features

### Image Upload
- Food images must be under 1MB
- Supported formats: JPEG, PNG, GIF, WEBP
- Images are stored securely in Supabase Storage

## Future Enhancements

### Planned Features
- Integration with wearable devices (Google Fit, Apple Health)
- Real-time AI food recognition from images
- Advanced analytics with charts and graphs
- Social features and community support
- Medication reminders with notifications
- Export data to PDF/CSV
- Multi-language support
- Dark mode enhancements

### AI Integration
- Connect to Large Language Model API for advanced AI assistant
- Implement computer vision for automatic food recognition
- Personalized meal and workout recommendations based on ML models
- Predictive analytics for goal achievement

## Contributing

This is a demonstration project showcasing a comprehensive health and fitness tracking application built with modern web technologies.

## License

© 2025 AI Health & Fitness Tracking Web App

## Support

For issues or questions, please refer to the application documentation or contact support.

---

**Built with ❤️ using React, TypeScript, Supabase, and shadcn/ui**
