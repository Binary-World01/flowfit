# FlowFit AI Integration Guide

## Overview

FlowFit AI is now fully integrated into the Health & Fitness Tracking Web App, providing intelligent food recognition, nutrition analysis, and personalized health coaching powered by OpenAI's GPT-4o.

## Architecture

### Edge Functions

#### 1. `recognize-food`
**Purpose**: AI-powered food recognition from images

**Input**:
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "userContext": {
    "dietary_preferences": ["vegetarian"],
    "activity_level": "medium",
    "target_weight": 70
  }
}
```

**Output**:
```json
{
  "foods": [
    {
      "name": "Grilled Chicken Breast",
      "quantity": "150g",
      "calories": 165,
      "protein": 31,
      "carbohydrates": 0,
      "fats": 3.6,
      "confidence": 0.92
    }
  ],
  "total_nutrition": {
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fats": 3.6
  },
  "insights": {
    "quality_score": 88,
    "tips": [
      "Excellent protein source!",
      "Add vegetables for fiber"
    ],
    "meal_type_suggestion": "lunch"
  }
}
```

**Features**:
- Multimodal image analysis using GPT-4o vision
- Identifies 3-10 food items per image
- Estimates portion sizes
- Calculates nutritional information
- Provides meal quality scoring (0-100)
- Personalized tips based on user profile

#### 2. `ai-health-coach`
**Purpose**: Conversational AI health coaching

**Input**:
```json
{
  "message": "What should I eat for breakfast?",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Output**:
```json
{
  "message": "Based on your protein goals, here are some great breakfast options:\n\n1. Greek yogurt with berries and nuts (25g protein)\n2. Scrambled eggs with whole wheat toast (20g protein)\n3. Protein smoothie with banana and peanut butter (30g protein)\n\nWhich sounds good to you?"
}
```

**Features**:
- Context-aware responses using user data
- Accesses profile, meals, workouts, goals
- Friendly, supportive coaching style
- Personalized recommendations
- Non-judgmental guidance

## Setup Instructions

### 1. Configure OpenAI API Key

Add your OpenAI API key to Supabase Edge Function secrets:

```bash
# Using Supabase CLI
supabase secrets set LLM_API_KEY=your_openai_api_key_here

# Or use the Supabase Dashboard:
# Project Settings → Edge Functions → Secrets → Add Secret
# Name: LLM_API_KEY
# Value: your_openai_api_key_here
```

### 2. Verify Edge Functions Deployment

Check that both Edge Functions are deployed:

```bash
# List deployed functions
supabase functions list

# Should show:
# - recognize-food
# - ai-health-coach
```

### 3. Test Food Recognition

```typescript
// Example usage in frontend
const recognizeFood = async (imageFile: File) => {
  const reader = new FileReader();
  reader.readAsDataURL(imageFile);
  
  reader.onload = async () => {
    const base64Image = reader.result as string;
    
    const { data, error } = await supabase.functions.invoke('recognize-food', {
      body: { imageBase64: base64Image },
    });
    
    if (error) {
      console.error('Recognition error:', error);
      return;
    }
    
    console.log('Recognized foods:', data.foods);
    console.log('Quality score:', data.insights.quality_score);
  };
};
```

### 4. Test AI Health Coach

```typescript
// Example usage in frontend
const chatWithAI = async (message: string) => {
  const { data, error } = await supabase.functions.invoke('ai-health-coach', {
    body: {
      message: message,
      conversationHistory: previousMessages,
    },
  });
  
  if (error) {
    console.error('AI Coach error:', error);
    return;
  }
  
  console.log('AI response:', data.message);
};
```

## User Experience Flow

### Food Recognition Flow

1. **User uploads food image**
   - Click "Log Meal" button
   - Select image from camera or gallery
   - Image size validated (max 1MB)

2. **AI analyzes image**
   - Loading indicator shows "Analyzing your food image with AI..."
   - Image converted to base64
   - Sent to `recognize-food` Edge Function

3. **Results displayed**
   - AI recognition results shown in alert box
   - Each food item listed with nutrition
   - Quality score displayed (0-100)
   - Actionable tips provided

4. **Form auto-filled**
   - Meal name populated with food items
   - Calories, protein, carbs, fats filled in
   - User can adjust if needed

5. **Meal saved**
   - User confirms or adjusts portions
   - Meal logged to database
   - Image uploaded to storage (optional)

### AI Coach Flow

1. **User opens AI Assistant**
   - Sees welcome message from FlowFit AI
   - Quick suggestion buttons displayed

2. **User asks question**
   - Types message or clicks suggestion
   - Message sent to `ai-health-coach` Edge Function

3. **AI processes request**
   - Fetches user profile and recent data
   - Analyzes context (meals, workouts, goals)
   - Generates personalized response

4. **Response displayed**
   - AI message appears in chat
   - Formatted with emojis and structure
   - Actionable advice provided

5. **Conversation continues**
   - History maintained for context
   - Follow-up questions answered
   - Recommendations refined

## FlowFit AI Personality

### Tone & Style
- **Friendly**: Warm, approachable, supportive
- **Scientific**: Evidence-based, accurate
- **Non-judgmental**: No shaming about food choices
- **Motivating**: Celebrates progress, encourages consistency
- **Accessible**: Avoids complex jargon

### Response Structure
1. **Direct answer** - Address the question immediately
2. **Context** - Explain why/how
3. **Actionable steps** - What to do next
4. **One question** - Engage user (max 1 per response)

### Example Responses

**Good Response**:
```
Great question! 🍳

Looking at your breakfast logs, I notice you're averaging 8g protein - that's quite low for your goals.

Here's why protein matters:
- Keeps you full longer
- Supports muscle recovery
- Stabilizes blood sugar

Try these high-protein breakfasts:
1. Greek yogurt (15g) + berries + nuts
2. 2 eggs (12g) + whole wheat toast
3. Protein smoothie (25g) with banana

Which sounds most appealing to you?
```

**Bad Response** (avoid):
```
You need to eat more protein. Your current intake is insufficient. Protein is essential for muscle protein synthesis and satiety regulation. I recommend consuming 0.8-1.2g/kg body weight daily. Please adjust your macronutrient ratios accordingly.
```

## Regional Food Intelligence

### Indian/South Asian Cuisine

FlowFit AI has specialized knowledge of:
- **Regional dishes**: Biryani, dosa, thali, curries
- **Street food**: Pani puri, vada pav, samosa, chaat
- **Home-cooked meals**: Dal, sabzi, roti, rice
- **Sweets**: Gulab jamun, jalebi, barfi
- **Cooking styles**: Tandoori, fried, steamed

### Recognition Examples

**Thali Recognition**:
```
🍽️ Traditional Thali Detected!

1. Chapati (2) - 240 cal | 8g protein
2. Rajma Curry - 180 cal | 8g protein
3. Jeera Rice - 210 cal | 4g protein
4. Raita - 60 cal | 3g protein
5. Salad - 25 cal | 1g protein
6. Pickle - 15 cal | 0g protein

**Total**: 730 calories | 24g protein

✅ Balanced meal! Quality Score: 85/100

💡 Traditional thalis are naturally balanced - great choice!
```

**Street Food Recognition**:
```
🌮 Street Food Detected!

1. Pani Puri (6 pieces) - 180 cal
2. Sev Puri - 220 cal
3. Dahi Puri - 150 cal

**Total**: 550 calories | 8g protein

⚠️ Quality Score: 55/100

💡 Tips:
- High in carbs and sodium
- Low in protein
- Enjoy occasionally!
- Balance with protein-rich dinner
```

## Error Handling

### Image Quality Issues

```typescript
// Low confidence detection
if (food.confidence < 0.7) {
  return {
    message: "I'm not quite sure about this item. Can you help me identify it?",
    suggestions: ["Describe the food", "Take another photo", "Enter manually"]
  };
}
```

### API Errors

```typescript
// Handle API failures gracefully
try {
  const response = await supabase.functions.invoke('recognize-food', {...});
} catch (error) {
  toast({
    title: 'Recognition failed',
    description: 'Could not analyze the image. Please enter details manually.',
    variant: 'destructive',
  });
}
```

### Unrecognizable Foods

```
🤔 I'm not quite sure what this is. Can you help me out?

Is this:
1. A regional dish I should learn about?
2. A homemade recipe?
3. Something else?

Please describe it, and I'll:
- Log it manually with your estimates
- Add it to my database for future recognition
- Find the closest match for nutrition info
```

## Privacy & Security

### Data Handling
- **Images**: Processed and deleted immediately (not stored)
- **Conversations**: Stored only for context (last 6 messages)
- **User data**: Encrypted and isolated with RLS
- **API keys**: Stored securely in Supabase secrets

### Disclaimers
Always include:
```
⚠️ Disclaimer: This is nutritional guidance, not medical advice. 
Consult healthcare professionals for medical concerns.
```

## Performance Optimization

### Image Processing
- **Max size**: 1MB (enforced client-side)
- **Compression**: Auto-compress if needed
- **Format**: JPEG, PNG, WEBP supported

### API Calls
- **Caching**: Cache common food items
- **Batching**: Process multiple items in one call
- **Timeouts**: 30s max for recognition

### Response Times
- **Food recognition**: 2-5 seconds
- **AI coach**: 1-3 seconds
- **Image upload**: 1-2 seconds

## Monitoring & Analytics

### Track These Metrics
- Recognition accuracy (user confirmations)
- Average confidence scores
- Most recognized foods
- User satisfaction ratings
- API usage and costs

### Logging
```typescript
// Log recognition events
console.log('Food recognition:', {
  userId: user.id,
  foodsDetected: data.foods.length,
  avgConfidence: avgConfidence,
  qualityScore: data.insights.quality_score,
});
```

## Future Enhancements

### Planned Features
1. **Voice input**: "Log 2 scrambled eggs for breakfast"
2. **Recipe recognition**: Identify complex dishes
3. **Barcode scanning**: Packaged food recognition
4. **Meal prep planning**: AI-generated weekly plans
5. **Budget optimization**: Suggest cheaper alternatives
6. **Social features**: Share meals with friends

### AI Improvements
1. **Fine-tuning**: Train on user corrections
2. **Regional expansion**: More cuisines
3. **Portion accuracy**: Better size estimation
4. **Ingredient detection**: Identify hidden ingredients
5. **Allergen warnings**: Flag potential allergens

## Troubleshooting

### Common Issues

**Issue**: "LLM API key not configured"
**Solution**: Add `LLM_API_KEY` to Supabase secrets

**Issue**: "Failed to parse LLM response"
**Solution**: Check OpenAI API status and model availability

**Issue**: "Recognition taking too long"
**Solution**: Reduce image size or check network connection

**Issue**: "Low confidence scores"
**Solution**: Improve lighting, focus, and image quality

## Support

For issues or questions:
1. Check Supabase Edge Function logs
2. Verify OpenAI API key is valid
3. Test with sample images
4. Review error messages in browser console

---

**FlowFit AI** - Making nutrition tracking effortless through intelligent food recognition and personalized coaching.
