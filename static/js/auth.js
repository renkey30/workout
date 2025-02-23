/**
 * Centralized Authentication System
 * Handles user authentication, profile management, and UI updates
 */

// Constants
const DEFAULT_PROFILE_PIC = '/static/img/default-avatar.svg';
const AUTH_CACHE_KEY = 'auth_state';

// Configure notifications
toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "timeOut": "3000"
};

// Initialize Firebase Auth
function initAuth() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyCWIMlaQZociNFirdOt1rlrJo9wZumZuDg",
        authDomain: "fitflow-17f89.firebaseapp.com",
        projectId: "fitflow-17f89",
        storageBucket: "fitflow-17f89.firebasestorage.app",
        messagingSenderId: "935181187616",
        appId: "1:935181187616:web:66776ab4bfc3c200a71a45",
        measurementId: "G-8GDRP0Q67K"
    };

    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Auth state observer
    firebase.auth().onAuthStateChanged(handleAuthStateChanged);
}

// Handle auth state changes
function handleAuthStateChanged(user) {
    console.log('Auth state changed:', user ? 'logged in' : 'logged out');
    updateUIForLoginState(user);
}

// Login handling
function handleLogin(event) {
    event.preventDefault();
    console.log('Login attempt started');

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((result) => {
            console.log('Login successful');
            hideLoginModal();
            toastr.success('Welcome back!');
        })
        .catch((error) => {
            console.error('Login error:', error);
            toastr.error(getAuthErrorMessage(error.code));
        });
}

// Registration handling
function handleRegister(event) {
    event.preventDefault();
    console.log('Registration attempt started');

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const username = document.getElementById('registerUsername').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((result) => {
            return result.user.updateProfile({
                displayName: username,
                photoURL: DEFAULT_PROFILE_PIC
            });
        })
        .then(() => {
            console.log('Registration successful');
            hideRegisterModal();
            toastr.success('Welcome to FitFlow!');
        })
        .catch((error) => {
            console.error('Registration error:', error);
            toastr.error(getAuthErrorMessage(error.code));
        });
}

// UI Updates
function updateUIForLoginState(user) {
    const userProfileDiv = document.getElementById('userProfile');
    if (!userProfileDiv) return;

    if (user) {
        userProfileDiv.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <img src="${user.photoURL || DEFAULT_PROFILE_PIC}" 
                         alt="Profile" 
                         class="rounded-circle" 
                         width="24" 
                         height="24">
                    ${user.displayName || user.email}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#" onclick="handleLogout()">Logout</a></li>
                </ul>
            </div>`;
    } else {
        userProfileDiv.innerHTML = `
            <button class="btn btn-outline-light me-2" onclick="showLoginModal()">
                <i class="bi bi-box-arrow-in-right"></i> Login
            </button>
            <button class="btn btn-light" onclick="showRegisterModal()">
                <i class="bi bi-person-plus-fill"></i> Register
            </button>`;
    }
}

// Modal Management
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
}

function showRegisterModal() {
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
}

function hideLoginModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    if (modal) modal.hide();
}

function hideRegisterModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    if (modal) modal.hide();
}

// Logout handling
function handleLogout() {
    firebase.auth().signOut()
        .then(() => {
            console.log('Logout successful');
            toastr.success('Logged out successfully');
        })
        .catch((error) => {
            console.error('Logout error:', error);
            toastr.error('Error during logout');
        });
}

// Error message handling
function getAuthErrorMessage(code) {
    const messages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/operation-not-allowed': 'Operation not allowed',
        'auth/too-many-requests': 'Too many attempts. Please try again later'
    };
    return messages[code] || 'An error occurred';
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', initAuth);
