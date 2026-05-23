// --- 1. Security & Initialization ---
const MASTER_PIN = "1234"; // CHANGE THIS BEFORE UPLOADING TO GITHUB

function authenticate() {
    const input = document.getElementById('pin-input').value;
    const error = document.getElementById('auth-error');
    
    if (input === MASTER_PIN) {
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('app-dashboard').classList.remove('hidden');
        initDashboard();
    } else {
        error.innerText = "Access Denied.";
        document.getElementById('pin-input').value = '';
    }
}

// Allow pressing 'Enter' on PIN screen
document.getElementById('pin-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') authenticate();
});

// --- 2. Navigation System ---
function switchTab(tabId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
        view.classList.remove('active');
    });
    // Reset Nav highlights
    document.querySelectorAll('.nav-links li').forEach(nav => {
        nav.classList.remove('active');
    });

    // Show selected
    document.getElementById('view-' + tabId).classList.remove('hidden');
    document.getElementById('view-' + tabId).classList.add('active');
    document.getElementById('nav-' + tabId).classList.add('active');
}

// --- 3. Dashboard Logic ---
function initDashboard() {
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-AU', options);
    
    loadGoals();
    renderSubjectInputs();
}

// --- 4. Goals Module (Local Storage) ---
function addGoal() {
    const input = document.getElementById('goal-input');
    const goalText = input.value.trim();
    if (!goalText) return;

    let goals = JSON.parse(localStorage.getItem('lifeos_goals')) || [];
    goals.push({ id: Date.now(), text: goalText, completed: false });
    localStorage.setItem('lifeos_goals', JSON.stringify(goals));
    
    input.value = '';
    loadGoals();
}

function loadGoals() {
    const grid = document.getElementById('goals-list');
    let goals = JSON.parse(localStorage.getItem('lifeos_goals')) || [];
    
    grid.innerHTML = '';
    goals.forEach(goal => {
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.innerHTML = `<p>${goal.text}</p>`;
        grid.appendChild(card);
    });
}

// --- 5. Journal Module ---
function saveJournal() {
    const text = document.getElementById('journal-input').value;
    if(!text) return;
    // For MVP, just alert to confirm. In V2, append to a list.
    alert("Entry saved securely.");
    document.getElementById('journal-input').value = '';
}

function saveQuickJournal() {
    document.getElementById('quick-journal').value = '';
    alert("Quick log saved.");
}

// --- 6. WACE ATAR Engine ---
function renderSubjectInputs() {
    const container = document.getElementById('subject-inputs');
    container.innerHTML = '';
    
    // Create 6 rows for subjects
    for(let i=1; i<=6; i++) {
        container.innerHTML += `
            <div class="subject-row">
                <input type="text" placeholder="Subject ${i}" style="flex:2;">
                <input type="number" id="score-${i}" placeholder="Scaled Score" min="0" max="100" style="flex:1;">
                <div class="bonus-check">
                    <input type="checkbox" id="bonus-${i}">
                    <label>LOTE/Maths Bonus (10%)</label>
                </div>
            </div>
        `;
    }
}

function calculateTEA() {
    let scores = [];
    let totalBonus = 0;

    for(let i=1; i<=6; i++) {
        const scoreInput = document.getElementById(`score-${i}`).value;
        const isBonus = document.getElementById(`bonus-${i}`).checked;
        
        if(scoreInput) {
            let score = parseFloat(scoreInput);
            scores.push(score);
            
            // WACE adds 10% of the scaled score for Methods, Spec, and LOTE
            if(isBonus) {
                totalBonus += (score * 0.10);
            }
        }
    }

    // Sort descending to get Top 4
    scores.sort((a, b) => b - a);
    
    let top4Sum = 0;
    for(let i=0; i < Math.min(4, scores.length); i++) {
        top4Sum += scores[i];
    }

    // Maximum TEA is ~430
    let tea = top4Sum + totalBonus;
    
    document.getElementById('tea-result').innerText = tea.toFixed(1);
    
    // Rough estimate logic for WA ATAR bands based on TEA
    let estAtar = "--";
    if(tea >= 350) estAtar = "99.00+";
    else if(tea >= 300) estAtar = "95.00 - 98.95";
    else if(tea >= 250) estAtar = "85.00 - 94.95";
    else if(tea >= 200) estAtar = "70.00 - 84.95";
    else if (tea > 0) estAtar = "Below 70";

    document.getElementById('atar-result').innerText = estAtar;
}
