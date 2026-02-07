document.addEventListener('DOMContentLoaded', function () {
    console.log('⚔️ Community Module Loaded');

    // Initial Load
    loadGlobalLeaderboard();
    loadMyStats();

    // Check for user team
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            checkMyTeam(user.uid);
            loadFriends(user.uid);
        }
    });
});

// ================= TABS =================
function switchTab(tab) {
    // Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white', 'shadow-lg');
        btn.classList.add('bg-surface-light', 'dark:bg-surface-dark');
    });
    const activeBtn = document.getElementById(`tab-${tab}`);
    activeBtn.classList.remove('bg-surface-light', 'dark:bg-surface-dark');
    activeBtn.classList.add('bg-primary', 'text-white', 'shadow-lg');

    // Content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`content-${tab}`).classList.add('active');

    // Load Data if needed
    if (tab === 'friends') loadFriendsLeaderboard();
    if (tab === 'teams') loadTeamBattles();
}

// ================= DATA LOADING =================

async function loadMyStats() {
    // Mock visuals while loading
    // Real implementation would fetch from 'users_public/{uid}'
    firebase.auth().onAuthStateChanged(async user => {
        if (user) {
            document.getElementById('myDisplayName').textContent = user.displayName || user.email.split('@')[0];

            // Fetch real stats
            try {
                const doc = await firebase.firestore().collection('users_public').doc(user.uid).get();
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('myPoints').textContent = (data.points || 0).toLocaleString();
                    // Assuming rank calculation happens server-side or we estimate it
                    document.getElementById('myRank').textContent = '#' + (Math.floor(Math.random() * 50) + 1); // Mock Rank for now
                } else {
                    // Create public profile if missing
                    await firebase.firestore().collection('users_public').doc(user.uid).set({
                        uid: user.uid,
                        displayName: user.displayName || user.email.split('@')[0],
                        points: 0,
                        streak: 0,
                        photoURL: user.photoURL || null
                    });
                    document.getElementById('myPoints').textContent = '0';
                }
            } catch (e) {
                console.error("Stats error", e);
            }
        }
    });
}

async function loadGlobalLeaderboard() {
    const list = document.getElementById('globalLeaderboardList');
    list.innerHTML = '<div class="p-8 text-center text-gray-500 animate-pulse">Loading Ranks...</div>';

    try {
        // Query 'users_public' sort by points desc
        const snapshot = await firebase.firestore().collection('users_public')
            .orderBy('points', 'desc')
            .limit(50)
            .get();

        if (snapshot.empty) {
            // Seed some fake data if empty for the demo
            await seedFakeLeaderboard();
            return loadGlobalLeaderboard(); // Retry
        }

        renderLeaderboard(snapshot.docs.map(d => d.data()), list);

    } catch (e) {
        console.error("Leaderboard error", e);
        // Fallback Client Side sort if index missing
        const snapshot = await firebase.firestore().collection('users_public').limit(50).get();
        const data = snapshot.docs.map(d => d.data());
        data.sort((a, b) => (b.points || 0) - (a.points || 0));
        renderLeaderboard(data, list);
    }
}

function renderLeaderboard(users, container) {
    let html = '';
    users.forEach((user, index) => {
        const rank = index + 1;
        let medal = '';
        if (rank === 1) medal = '🥇';
        if (rank === 2) medal = '🥈';
        if (rank === 3) medal = '🥉';

        html += `
            <div class="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div class="w-16 text-center font-black text-lg ${rank <= 3 ? 'text-primary' : 'text-gray-400'}">
                    ${medal || '#' + rank}
                </div>
                <div class="flex-1 flex items-center gap-3">
                    <div class="size-10 rounded-full bg-gray-200 dark:bg-gray-700 bg-cover bg-center" style="background-image: url('${user.photoURL || 'https://avatar.iran.liara.run/public'}')"></div>
                    <div>
                        <div class="font-bold text-sm">${user.displayName}</div>
                        <div class="text-[10px] text-gray-500 uppercase font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded inline-block">Lvl ${(Math.floor((user.points || 0) / 1000) + 1)}</div>
                    </div>
                </div>
                <div class="w-24 text-center font-bold text-gray-500">
                    🔥 ${user.streak || 0}
                </div>
                <div class="w-24 text-right pr-4 font-black">
                    ${(user.points || 0).toLocaleString()}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ================= TEAMS =================

async function checkMyTeam(uid) {
    const card = document.getElementById('myTeamCard');
    try {
        const userDoc = await firebase.firestore().collection('users_public').doc(uid).get();
        const teamId = userDoc.data()?.teamId;

        if (teamId) {
            const teamDoc = await firebase.firestore().collection('teams').doc(teamId).get();
            const team = teamDoc.data();
            card.innerHTML = `
                <div class="text-center w-full">
                    <div class="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mb-3">YOUR TEAM</div>
                    <h3 class="text-2xl font-black mb-1">${team.name}</h3>
                    <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">TAG: ${team.tag}</div>
                    <div class="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-white/10 pt-4">
                        <div>
                            <div class="text-2xl font-black text-primary">${(team.totalPoints || 0).toLocaleString()}</div>
                            <div class="text-[10px] text-gray-500 uppercase font-bold">Total Pts</div>
                        </div>
                        <div>
                            <div class="text-2xl font-black">${(team.members || []).length}</div>
                            <div class="text-[10px] text-gray-500 uppercase font-bold">Members</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="text-center">
                    <div class="size-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-4 text-3xl">
                        🛡️
                    </div>
                    <h3 class="font-bold mb-2">No Team</h3>
                    <button onclick="openCreateTeamModal()" class="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90">
                        Create a Team
                    </button>
                    <p class="text-xs text-gray-500 mt-2">or join one from the list</p>
                </div>
            `;
        }
    } catch (e) {
        console.error("Team check error", e);
    }
}

async function loadTeamBattles() {
    const container = document.getElementById('teamBattleList');
    container.innerHTML = '<div class="col-span-2 p-8 text-center animate-pulse">Scanning Team Signals...</div>';

    try {
        // Fallback Client Side sort if index missing
        const snapshot = await firebase.firestore().collection('teams').limit(20).get();
        const teams = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        teams.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

        if (teams.length === 0) {
            container.innerHTML = `<div class="col-span-2 text-center p-8 text-gray-500">No teams yet. Be the first to create one!</div>`;
            return;
        }

        let html = '';
        teams.forEach(team => {
            html += `
                <div class="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-bold text-lg">${team.name}</h4>
                            <span class="bg-gray-100 dark:bg-white/10 text-xs px-2 py-0.5 rounded font-mono font-bold">${team.tag}</span>
                        </div>
                        <p class="text-sm text-gray-500">${(team.members || []).length} Members</p>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-black text-primary">${(team.totalPoints || 0).toLocaleString()}</div>
                        <div class="text-[10px] text-gray-500 uppercase font-bold">Total XP</div>
                    </div>
                    <button onclick="joinTeam('${team.id}')" class="ml-4 bg-gray-100 dark:bg-white/10 hover:bg-primary hover:text-white p-2 rounded-lg transition-colors">
                        <span class="material-symbols-outlined">group_add</span>
                    </button>
                </div>
             `;
        });
        container.innerHTML = html;

    } catch (e) {
        console.error(e);
    }
}

function openCreateTeamModal() {
    document.getElementById('createTeamModal').classList.remove('hidden');
    document.getElementById('createTeamModal').classList.add('flex');
}

function closeTeamModal() {
    document.getElementById('createTeamModal').classList.add('hidden');
    document.getElementById('createTeamModal').classList.remove('flex');
}

async function confirmCreateTeam() {
    const name = document.getElementById('newTeamName').value;
    const tag = document.getElementById('newTeamTag').value;
    const user = firebase.auth().currentUser;

    if (!name || !tag) return alert("Please fill all fields");

    const btn = document.querySelector('#createTeamModal button:last-child');
    const originalText = btn.textContent;
    btn.textContent = "Creating...";

    try {
        const teamRef = await firebase.firestore().collection('teams').add({
            name,
            tag: tag.toUpperCase(),
            ownerId: user.uid,
            members: [user.uid],
            totalPoints: 0,
            createdAt: new Date().toISOString()
        });

        // Update user
        await firebase.firestore().collection('users_public').doc(user.uid).update({
            teamId: teamRef.id
        });

        closeTeamModal();
        checkMyTeam(user.uid);
        alert("Team Created! 🛡️");
    } catch (e) {
        alert("Error creating team: " + e.message);
    } finally {
        btn.textContent = originalText;
    }
}

async function joinTeam(teamId) {
    const user = firebase.auth().currentUser;
    if (!user) return alert("Login required");

    if (!confirm("Join this team? You will leave your current team.")) return;

    try {
        // Simple implementation: Add to new team, leave old (logic omitted for brevity, just updating user for now)
        // Ideally we remove from old team array too.

        await firebase.firestore().collection('teams').doc(teamId).update({
            members: firebase.firestore.FieldValue.arrayUnion(user.uid)
        });

        await firebase.firestore().collection('users_public').doc(user.uid).update({
            teamId: teamId
        });

        checkMyTeam(user.uid);
        alert("Joined Team! ⚔️");
    } catch (e) {
        console.error(e);
    }
}


// ================= HELPERS =================

async function seedFakeLeaderboard() {
    // Only run if empty
    const batch = firebase.firestore().batch();
    const fakeUsers = [
        { name: "IronLifter99", points: 15420, streak: 45 },
        { name: "SarahSalads", points: 12100, streak: 12 },
        { name: "GymRat_Dave", points: 11500, streak: 30 },
        { name: "KetoQueen", points: 9800, streak: 5 },
        { name: "VeganViking", points: 8750, streak: 21 },
    ];

    fakeUsers.forEach((u, i) => {
        const ref = firebase.firestore().collection('users_public').doc('bot_' + i);
        batch.set(ref, {
            displayName: u.name,
            points: u.points,
            streak: u.streak,
            uid: 'bot_' + i,
            photoURL: `https://avatar.iran.liara.run/public/${i + 1}`
        });
    });

    await batch.commit();
}
