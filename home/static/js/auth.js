toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "timeOut": "3000"
};

// Default profile picture path
const DEFAULT_PROFILE_PIC = 'static/img/default-avatar.svg';

// Guest user data
const GUEST_USER = {
    id: 'guest',
    username: 'Guest',
    email: null,
    profilePic: DEFAULT_PROFILE_PIC,
    isGuest: true
};

// Initialize system
document.addEventListener('DOMContentLoaded', function() {
    updateUIForLoginState();
});

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUIForLoginState();
        $('#loginModal').modal('hide');
        toastr.success('Welcome back, ' + username + '!');
    } else {
        toastr.error('Invalid username or password');
    }
}

// Handle Register
function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        toastr.error('Passwords do not match');
        return;
    }
    
    // Create new user
    createUser(username, email, password);
    $('#registerModal').modal('hide');
}

// Create new user
function createUser(username, email, password) {
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password,
        profilePic: DEFAULT_PROFILE_PIC,
        dateJoined: new Date().toISOString(),
        workouts: [],
        meals: [],
        posts: [],
        settings: {
            theme: 'light',
            notifications: true,
            privacyLevel: 'public'
        },
        stats: {
            totalWorkouts: 0,
            totalExercises: 0,
            totalDuration: 0,
            streakDays: 0,
            lastWorkout: null
        }
    };

    try {
        // Get existing users or initialize empty array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        toastr.success('Welcome to Health Tracker, ' + username + '!');
    } catch (error) {
        console.error('Error creating user:', error);
        toastr.error('Error creating account. Please try again.');
    }
}

// Update UI based on login state
function updateUIForLoginState() {
    const currentUser = getCurrentUser();
    const userProfileDiv = document.getElementById('userProfile');
    
    if (currentUser) {
        userProfileDiv.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
                    <img src="${currentUser.profilePic}" alt="Profile" class="rounded-circle" width="24" height="24">
                    ${currentUser.username}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
            </div>`;
    } else {
        userProfileDiv.innerHTML = `
            <button class="btn btn-outline-light me-2" onclick="$('#loginModal').modal('show')">
                <i class="bi bi-person-fill me-1"></i>Login
            </button>
            <button class="btn btn-light" onclick="$('#registerModal').modal('show')">
                <i class="bi bi-person-plus-fill me-1"></i>Register
            </button>`;
    }
}

// Utility Functions
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch {
        return null;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    updateUIForLoginState();
    toastr.success('Logged out successfully');
}

// Modal navigation
function switchToRegister() {
    $('#loginModal').modal('hide');
    $('#registerModal').modal('show');
}

function switchToLogin() {
    $('#registerModal').modal('hide');
    $('#loginModal').modal('show');
}
