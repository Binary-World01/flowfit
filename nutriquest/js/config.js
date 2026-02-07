// ===== Firebase Configuration =====
// NutriQuest Firebase Project
const firebaseConfig = {
    apiKey: "AIzaSyDjdEzSqntAq-KjNLxW_gCemGM3t4VFDJo",
    authDomain: "nutriquest-6c628.firebaseapp.com",
    projectId: "nutriquest-6c628",
    storageBucket: "nutriquest-6c628.firebasestorage.app",
    messagingSenderId: "1790280584",
    appId: "1:1790280584:web:d080106bde6f7853f5f03d"
};

// OpenAI API Key for GPT-4 Vision (WORKING!)
window.openaiApiKey = "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";

// Gemini API Key (Replaces DeepSeek)
window.geminiApiKey = "AIzaSyAO2WDbGAJba73a8x00QzwFhuPlzCHEG-I";

// Check if Firebase is configured
const isFirebaseConfigured = true;

console.log('🔥 Firebase Config Loaded:', {
    projectId: firebaseConfig.projectId,
    configured: isFirebaseConfigured
});

console.log('🤖 OpenAI API Key loaded:', openaiApiKey ? '✅ Available' : '❌ Missing');
