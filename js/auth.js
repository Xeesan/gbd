// ============================
// Authentication
// ============================
function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function handleLogin() {
    const uid = document.getElementById('login-id').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!uid || !password) {
        alert('Please enter both Unique ID and Password');
        return;
    }

    // Check if user exists
    const users = Storage.get('users', []);
    const user = users.find(u => u.uid === uid && u.password === password);

    if (user) {
        Storage.setUser(user);
        showApp();
    } else {
        alert('Invalid credentials. Please check your Unique ID and Password.');
    }
}

function handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!name || !password) {
        alert('Please enter both Full Name and Password');
        return;
    }

    if (password.length < 3) {
        alert('Password must be at least 3 characters');
        return;
    }

    const uid = generateUniqueId();
    const user = { name, password, uid, createdAt: new Date().toISOString() };

    // Save to users list
    const users = Storage.get('users', []);
    users.push(user);
    Storage.set('users', users);

    // Set as current user
    Storage.setUser(user);

    alert(`Account created! Your Unique ID is: ${uid}\nSave this ID to login later.`);
    showApp();
}

function handleLogout() {
    Storage.clearUser();
    showAuth();
}

function showAuth() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    // Reset forms
    document.getElementById('login-id').value = '';
    document.getElementById('login-password').value = '';
    showLogin();
}

function showApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    const user = Storage.getUser();
    if (user) {
        document.getElementById('sidebar-username').textContent = user.name;
        document.getElementById('sidebar-userid').textContent = 'ID: ' + user.uid;
    }

    updateHeaderDate();
    navigateTo('dashboard');

    // Show daily summary modal
    setTimeout(() => {
        showDailySummary();
    }, 500);
}

function requestNotifications() {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
    alert('Notifications enabled! You will receive routine & exam alerts.');
}
