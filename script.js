document.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");

    const heroSignupBtn = document.getElementById("heroSignupBtn");

    const loginModal = document.getElementById("loginModal");
    const signupModal = document.getElementById("signupModal");

    const closeButtons = document.querySelectorAll(".modal-close");

    function openModal(modal) {
        modal.classList.remove("hidden");
    }

    function closeModal(modal) {
        modal.classList.add("hidden");
    }

    // Top navbar buttons
    if (loginBtn) loginBtn.addEventListener("click", () => openModal(loginModal));
    if (signupBtn) signupBtn.addEventListener("click", () => openModal(signupModal));

    // HERO "Create an account" button
    if (heroSignupBtn) heroSignupBtn.addEventListener("click", () => openModal(signupModal));

    // Close buttons (X)
    closeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const modal = btn.closest(".modal");
            closeModal(modal);
        });
    });

    // Escape closes any open modal
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeModal(loginModal);
            closeModal(signupModal);
        }
    });

    // Switch from signup → login
    const swapToLogin = document.getElementById("swapToLogin");
    if (swapToLogin) {
        swapToLogin.addEventListener("click", () => {
            closeModal(signupModal);
            openModal(loginModal);
        });
    }

    // Switch from login → signup
    const swapToSignup = document.getElementById("swapToSignup");
    if (swapToSignup) {
        swapToSignup.addEventListener("click", () => {
            closeModal(loginModal);
            openModal(signupModal);
        });
    }

    // --- Authentication and per-user saved games ---
    const gameSelect = document.getElementById('gameSelect');
    const addGameBtn = document.getElementById('addGameBtn');
    const savedGamesContainer = document.getElementById('savedGames');
    const savedCountSpan = document.getElementById('savedCount');

    function getUsers() {
        try { return JSON.parse(localStorage.getItem('users') || '[]'); }
        catch (e) { return []; }
    }

    function setUsers(u) { localStorage.setItem('users', JSON.stringify(u)); }

    function getCurrentUserKey() { return localStorage.getItem('currentUser') || null; }

    function setCurrentUserKey(key) { if (key) localStorage.setItem('currentUser', key); else localStorage.removeItem('currentUser'); }

    function findUser(key) {
        if (!key) return null;
        const users = getUsers();
        return users.find(u => u.username === key || u.email === key) || null;
    }

    function saveUser(user) {
        const users = getUsers();
        const idx = users.findIndex(u => u.email === user.email || u.username === user.username);
        if (idx >= 0) users[idx] = user; else users.push(user);
        setUsers(users);
    }

    function getSavedGames() {
        const key = getCurrentUserKey();
        const user = findUser(key);
        if (user) return user.profileGames || [];
        try { return JSON.parse(localStorage.getItem('profileGames') || '[]'); }
        catch (e) { return []; }
    }

    function setSavedGames(list) {
        const key = getCurrentUserKey();
        const users = getUsers();
        if (key) {
            const idx = users.findIndex(u => u.username === key || u.email === key);
            if (idx >= 0) {
                users[idx].profileGames = list;
                setUsers(users);
            }
        } else {
            localStorage.setItem('profileGames', JSON.stringify(list));
        }
        if (savedCountSpan) savedCountSpan.textContent = list.length;
    }

    function renderSavedGames() {
        if (!savedGamesContainer) return;
        const saved = getSavedGames();
        savedGamesContainer.innerHTML = '';
        if (saved.length === 0) {
            savedGamesContainer.innerHTML = '<p>No saved games yet.</p>';
            if (savedCountSpan) savedCountSpan.textContent = 0;
            return;
        }
        saved.forEach(g => {
            const div = document.createElement('div');
            div.className = 'saved-game';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.gap = '8px';
            div.style.marginBottom = '8px';
            div.innerHTML = `<img src="${g.main_image_url || ''}" alt="${g.name}" style="width:64px;height:64px;object-fit:cover;margin-right:8px;"><strong style="color:white;">${g.name}</strong> <button class="remove-game-btn" data-name="${g.name}" style="margin-left:12px;">Remove</button>`;
            savedGamesContainer.appendChild(div);
        });
        if (savedCountSpan) savedCountSpan.textContent = saved.length;
    }

    function populateSelect(games) {
        if (!gameSelect) return;
        gameSelect.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Choose a game...';
        gameSelect.appendChild(defaultOpt);
        games.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.name;
            opt.textContent = g.name;
            gameSelect.appendChild(opt);
        });
    }

    // Auth UI update
    function updateAuthUI() {
        const key = getCurrentUserKey();
        const user = findUser(key);
        if (user) {
            if (loginBtn) {
                loginBtn.textContent = user.username || user.email;
                loginBtn.onclick = () => { window.location.href = 'profile.html'; };
            }
            if (signupBtn) {
                signupBtn.textContent = 'Log out';
                signupBtn.onclick = () => {
                    setCurrentUserKey(null);
                    updateAuthUI();
                    renderSavedGames();
                };
            }
        } else {
            if (loginBtn) { loginBtn.textContent = 'Log in'; loginBtn.onclick = () => openModal(loginModal); }
            if (signupBtn) { signupBtn.textContent = 'Sign Up'; signupBtn.onclick = () => openModal(signupModal); }
        }
    }

    // Signup handler
    const createAccountBtn = document.getElementById('createAccountBtn');
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', () => {
            const username = document.getElementById('signup-username')?.value?.trim();
            const email = document.getElementById('signup-email')?.value?.trim();
            const password = document.getElementById('signup-password')?.value || '';
            const confirm = document.getElementById('signup-confirm')?.value || '';
            if (!username || !email || !password) { alert('Please fill username, email and password'); return; }
            if (password !== confirm) { alert('Passwords do not match'); return; }
            const users = getUsers();
            if (users.find(u => u.email === email || u.username === username)) { alert('User already exists'); return; }
            const user = { username, email, password, profileGames: [] };
            users.push(user);
            setUsers(users);
            setCurrentUserKey(username);
            closeModal(signupModal);
            updateAuthUI();
            renderSavedGames();
        });
    }

    // Login handler
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', () => {
            const email = document.getElementById('login-email')?.value?.trim();
            const password = document.getElementById('login-password')?.value || '';
            if (!email || !password) { alert('Please enter credentials'); return; }
            const users = getUsers();
            const user = users.find(u => (u.email === email || u.username === email) && u.password === password);
            if (!user) { alert('Invalid credentials'); return; }
            setCurrentUserKey(user.username || user.email);
            closeModal(loginModal);
            updateAuthUI();
            renderSavedGames();
        });
    }

    // Fake Google sign-in (simulated for local/static demo)
    document.querySelectorAll('.google-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const email = prompt('Enter your Google email to continue with Google:', 'user@gmail.com');
            if (!email) return;
            const name = prompt('Enter display name (optional):', email.split('@')[0]) || email.split('@')[0];
            let users = getUsers();
            let user = users.find(u => u.email === email);
            if (!user) {
                user = { username: name, email, password: '', profileGames: [], provider: 'google' };
                users.push(user);
                setUsers(users);
            }
            setCurrentUserKey(user.username || user.email);
            closeModal(loginModal);
            closeModal(signupModal);
            updateAuthUI();
            renderSavedGames();
            alert('Signed in with Google as ' + (user.username || user.email));
        });
    });

    // Global function to add a game by name (callable from details page)
    window.addGameByName = function(name) {
        if (!name) return;
        const currentKey = getCurrentUserKey();
        if (!currentKey) {
            openModal(loginModal);
            return;
        }
        return fetch('games.json')
            .then(r => r.json())
            .then(games => {
                const gameObj = games.find(g => g.name === name);
                if (!gameObj) { alert('Game not found'); return; }
                const existing = getSavedGames();
                if (existing.find(x => x.name === name)) { alert('Already in your list'); return; }
                existing.push(gameObj);
                setSavedGames(existing);
                renderSavedGames();
                alert('Added to your list');
            })
            .catch(() => alert('Failed to add game'));
    };

    // Wire up profile page add/remove and select
    if (gameSelect || addGameBtn || savedGamesContainer) {
        fetch('games.json')
            .then(r => r.json())
            .then(games => {
                populateSelect(games);
                renderSavedGames();

                if (addGameBtn) {
                    addGameBtn.addEventListener('click', () => {
                        const selected = gameSelect.value;
                        if (!selected) return;
                        const existing = getSavedGames();
                        if (existing.find(x => x.name === selected)) return;
                        const gameObj = games.find(x => x.name === selected);
                        if (!gameObj) return;
                        // ensure logged in
                        const key = getCurrentUserKey();
                        if (!key) { openModal(loginModal); return; }
                        existing.push(gameObj);
                        setSavedGames(existing);
                        renderSavedGames();
                    });
                }

                if (savedGamesContainer) {
                    savedGamesContainer.addEventListener('click', (e) => {
                        if (e.target.classList.contains('remove-game-btn')) {
                            const name = e.target.dataset.name;
                            let saved = getSavedGames();
                            saved = saved.filter(s => s.name !== name);
                            setSavedGames(saved);
                            renderSavedGames();
                        }
                    });
                }
            })
            .catch(() => {
                if (gameSelect) gameSelect.innerHTML = '<option value="">Failed to load games</option>';
            });
    }

    // initialize auth UI
    updateAuthUI();

});