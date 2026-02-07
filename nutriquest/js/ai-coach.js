// ===== AI Coach Logic (DeepSeek) =====

// DOM Elements
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const generatePlanBtn = document.getElementById('generatePlanBtn');

// State
let isGenerating = false;
let userProfile = null;
let currentPlan = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Wait for Auth & Load Profile
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            await loadUserProfile(user.uid);
            await checkExistingPlan(user.uid);
        } else {
            // Redirect if not logged in
            window.location.href = 'login.html';
        }
    });

    // 2. Chat Event Listener
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (msg && !isGenerating) {
            handleUserMessage(msg);
        }
    });

    // 3. Plan Generation Listener
    generatePlanBtn.addEventListener('click', () => {
        if (!isGenerating) {
            generateFullPlan();
        }
    });

    // 4. Input Auto-resize
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});

// ===== Logic Functions =====

async function loadUserProfile(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            userProfile = doc.data();

            // Update UI
            if (document.getElementById('userGoalDisplay')) {
                document.getElementById('userGoalDisplay').textContent = userProfile.goal ? userProfile.goal.replace('_', ' ') : 'General Health';
            }
            if (document.getElementById('planGoalDisplay')) {
                document.getElementById('planGoalDisplay').textContent = userProfile.goal ? userProfile.goal.replace('_', ' ') : 'Health';
            }
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

async function checkExistingPlan(uid) {
    // Save tokens: Check Firestore first!
    try {
        const doc = await db.collection('users').doc(uid).collection('ai_plans').doc('current').get();
        if (doc.exists) {
            console.log("✅ Loaded existing plan (Token Save Mode)");
            console.log("✅ Loaded existing plan (Token Save Mode)");
            currentPlan = doc.data(); // Save for Chat Context
            renderPlan(doc.data());
        }
    } catch (error) {
        console.error("Error checking plan:", error);
    }
}

async function handleUserMessage(msg) {
    // UI: Add User Bubble
    addMessageBubble(msg, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    isGenerating = true;

    // UI: Add Loading Bubble
    const loadingId = addLoadingBubble();

    try {
        // Construct Context-Aware Prompt
        const systemContext = `You are a professional Nutritionist and Fitness Coach. 
        User Profile: Age ${userProfile.age || 'Unknown'}, Weight ${userProfile.weight || '?'}kg, Goal: ${userProfile.goal || 'General Health'}.
        
        Current Plan Context:
        ${currentPlan ? JSON.stringify(currentPlan) : "No active plan yet."}
        
        Keep answers concise, motivating, and scientifically accurate. Use formatting involved.`;

        const response = await callGeminiAPI([
            { role: "system", content: systemContext },
            { role: "user", content: msg }
        ]);

        // Remove Loading
        removeMessageBubble(loadingId);

        // UI: Add AI Bubble
        addMessageBubble(response, 'ai');

    } catch (error) {
        removeMessageBubble(loadingId);

        // Catch 402 (DeepSeek) AND 429/Quota (Gemini)
        if (error.message.includes("Insufficient Balance") || error.message.includes("429") || error.message.includes("Quota")) {
            addMessageBubble("⚠️ **Demo Mode Active**\n\nI see your new API key has a quota limit (Error 429). Switching to offline mode:\n\n*Focus on consistency! Eat whole foods, sleep 8 hours, and move your body daily.*", 'ai');
        } else {
            const errorMsg = "⚠️ Connection error: " + error.message;
            addMessageBubble(errorMsg, 'ai');
        }
        console.error(error);
    } finally {
        isGenerating = false;
    }
}

async function generateFullPlan() {
    // UI Switch
    document.getElementById('planEmpty').classList.add('hidden');
    document.getElementById('planLoading').classList.remove('hidden');
    document.getElementById('planLoading').classList.add('flex');

    try {
        // Capture User Inputs
        const links = {
            youtube: document.getElementById('linkYoutube').value.trim(),
            pinterest: document.getElementById('linkPinterest').value.trim(),
            instagram: document.getElementById('linkInstagram').value.trim(),
        };
        const dietFocus = document.getElementById('dietaryFocus').value.trim();

        // Construct Enhanced Prompt
        let preferencesContext = "";
        if (dietFocus) preferencesContext += `\nDietary Focus: ${dietFocus}`;
        if (links.youtube) preferencesContext += `\nUser Inspiration (YouTube): ${links.youtube} (Incorporate this style)`;
        if (links.pinterest) preferencesContext += `\nUser Recipes (Pinterest): ${links.pinterest} (Use these ideas)`;
        if (links.instagram) preferencesContext += `\nUser Fitness (Instagram): ${links.instagram} (Follow this vibe)`;

        const systemPrompt = `Generate a dedicated 7-Day Workout & Diet Plan. 
        User: Age ${userProfile.age}, Weight ${userProfile.weight}kg, Goal: ${userProfile.goal}.
        ${preferencesContext}
        
        RETURN JSON ONLY in this exact format.
        IMPORTANT: The 'schedule' field must be a single string with newlines escaped as \\n. Do not use actual line breaks in the JSON.
        {
            "calories": "2400",
            "protein": "160g",
            "frequency": "5 days/week",
            "focus": "Strength",
            "schedule": "### Day 1...\\n- Exercise...",
            "resources": [
                {"title": "Workout Inspiration", "url": "${links.youtube || '#'}", "type": "youtube"},
                {"title": "Recipe Ideas", "url": "${links.pinterest || '#'}", "type": "pinterest"}
            ]
        }`;

        const responseString = await callGeminiAPI([
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate my plan now." }
        ]);

        console.log("🤖 Raw AI Plan Response:", responseString);

        // Parse JSON (Robust extraction for Markdown code blocks)
        let jsonStr = responseString.replace(/```json|```/g, '').trim();

        // Find first '{' and last '}' to handle potential preambles/postscripts
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }

        const planData = JSON.parse(jsonStr);

        // Inject original user links explicitly to ensure they are saved even if AI hallucinates
        planData.userLinks = links;
        planData.dietFocus = dietFocus;

        // Save to Firestore (Caching)
        await db.collection('users').doc(auth.currentUser.uid).collection('ai_plans').doc('current').set({
            ...planData,
            generatedAt: new Date()
        });

        renderPlan(planData);
        currentPlan = planData; // Update global context

    } catch (error) {
        if (error instanceof SyntaxError || error.message.includes("Insufficient Balance") || error.message.includes("API Key Missing") || error.message.includes("429") || error.message.includes("Quota")) {
            console.warn("⚠️ API/Parsing Error (" + error.message + "), switching to DEMO MODE");
            const mockPlan = getMockPlan();

            // Save mock plan to Firestore so it persists
            try {
                await db.collection('users').doc(auth.currentUser.uid).collection('ai_plans').doc('current').set({
                    ...mockPlan,
                    generatedAt: new Date(),
                    isDemo: true
                });
            } catch (e) {
                console.log("Could not save demo plan (Firestore rules?)", e);
            }

            renderPlan(mockPlan);
            currentPlan = mockPlan; // Update global context for demo

            // Only alert if it's NOT a syntax error (syntax error = silent fallback usually better, but let's notify)
            if (error instanceof SyntaxError) {
                // Toast or small notification preferred, for now just log
                console.log("Switched to demo due to JSON parse error.");
            } else {
                alert("⚠️ " + error.message + "\n\n💡 Switched to DEMO MODE so you can test the UI!");
            }
        } else {
            console.error("Plan Generation Error:", error);
            alert(error.message || "Failed to generate plan. Please try again later.");
            document.getElementById('planEmpty').classList.remove('hidden');
        }
    } finally {
        document.getElementById('planLoading').classList.add('hidden');
        document.getElementById('planLoading').classList.remove('flex');
    }
}

// ===== Mock Data (Fallback) =====
function getMockPlan() {
    return {
        calories: "2200",
        protein: "150g",
        frequency: "4 days/week",
        focus: "Balanced Demo",
        schedule: `### 🏋️‍♀️ Your Demo Plan
*Note: This is a sample plan because the AI API is out of credits.*

**Monday: Full Body Strength**
- Squats: 3 sets x 12 reps
- Push-ups: 3 sets x 10 reps
- Rows: 3 sets x 12 reps

**Tuesday: Active Recovery**
- 30 min brisk walk
- Yoga / Stretching

**Wednesday: HIIT Cardio**
- 20 mins interval training
- Core circuit

**Thursday: Rest Day**

**Friday: Lower Body Focus**
- Lunges: 3 sets x 12 reps
- Glute bridges: 3 sets x 15 reps

**Dietary Focus:**
Focus on whole foods, lean proteins, and plenty of vegetables. Hydrate well!`,
        resources: [
            { title: "Demo Workout", url: "https://youtube.com", type: "youtube" },
            { title: "Demo Recipe", url: "https://pinterest.com", type: "pinterest" }
        ],
        userLinks: { youtube: "", pinterest: "", instagram: "" }
    };
}

async function callGeminiAPI(messages) {
    // Check Config
    const apiKey = window.geminiApiKey;
    if (!apiKey) {
        throw new Error("API Key Missing");
    }

    // Convert OpenAI-style messages to Gemini format
    // Gemini 1.5 Flash supports system instructions, but for simplicity via REST, 
    // we'll combine system + user into a single prompt or use the generateContent structure.

    let fullPrompt = "";
    messages.forEach(msg => {
        fullPrompt += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: fullPrompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096
            }
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API Error (${response.status})`);
    }

    const data = await response.json();

    // Safety check for response structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error("Gemini returned an empty response. Please try again.");
    }

    return data.candidates[0].content.parts[0].text;
}

// ===== UI Helper Functions =====

function addMessageBubble(text, sender) {
    const div = document.createElement('div');
    const isUser = sender === 'user';

    // Markdown parsing for AI
    const content = isUser ? text : marked.parse(text);

    div.className = `message-bubble p-4 text-sm leading-relaxed ${isUser ? 'user-bubble ml-auto rounded-l-2xl' : 'ai-bubble mr-auto rounded-r-2xl'}`;
    div.innerHTML = content;

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingBubble() {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'message-bubble ai-bubble mr-auto rounded-r-2xl p-4 flex gap-2 items-center';
    div.innerHTML = `
        <div class="size-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div class="size-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        <div class="size-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

function removeMessageBubble(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function renderPlan(data) {
    document.getElementById('planEmpty').classList.add('hidden');
    document.getElementById('planContent').classList.remove('hidden');

    // Stats
    document.getElementById('planCalories').textContent = data.calories + (String(data.calories).includes('kcal') ? '' : ' kcal');
    document.getElementById('planProtein').textContent = data.protein + (String(data.protein).includes('g') ? '' : 'g');
    document.getElementById('planFrequency').textContent = data.frequency;
    document.getElementById('planFocus').textContent = data.focus;

    // Body (Markdown)
    document.getElementById('planBody').innerHTML = marked.parse(data.schedule);

    // Render Links
    const linksContainer = document.getElementById('planLinks');
    if (linksContainer && data.userLinks) {
        let linksHtml = '';
        if (data.userLinks.youtube) linksHtml += createLinkCard(data.userLinks.youtube, 'youtube', 'Workout Inspiration');
        if (data.userLinks.pinterest) linksHtml += createLinkCard(data.userLinks.pinterest, 'pinterest', 'Recipe Board');
        if (data.userLinks.instagram) linksHtml += createLinkCard(data.userLinks.instagram, 'instagram', 'Fitness Post');

        linksContainer.innerHTML = linksHtml;
        linksContainer.parentElement.classList.toggle('hidden', linksHtml === '');
    }
}

function createLinkCard(url, type, label) {
    let icon = 'link';
    let color = 'text-gray-500';
    if (type === 'youtube') { icon = 'play_circle'; color = 'text-red-500'; }
    if (type === 'pinterest') { icon = 'push_pin'; color = 'text-red-700'; }
    if (type === 'instagram') { icon = 'photo_camera'; color = 'text-pink-600'; }

    return `
        <a href="${url}" target="_blank" class="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
            <span class="material-symbols-outlined ${color} text-2xl">${icon}</span>
            <div class="flex-1 min-w-0">
                <div class="text-xs text-gray-400 font-bold uppercase">${label}</div>
                <div class="text-sm font-medium truncate text-primary underline">${url}</div>
            </div>
            <span class="material-symbols-outlined text-gray-400">open_in_new</span>
        </a>
    `;
}

function regeneratePlan() {
    if (confirm("Regenerating will overwrite your current plan. Continue?")) {
        document.getElementById('planContent').classList.add('hidden');
        generateFullPlan();
    }
}
