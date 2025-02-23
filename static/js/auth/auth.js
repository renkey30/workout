/**
 * Authentication handling and UI updates for user login/logout states
 */

console.log('Auth.js loaded');

// Initial CSS injection for stable positioning
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    #userProfile {
        visibility: visible;
        opacity: 1;
    }
`;
document.head.appendChild(styleSheet);

// Cache for user data
let cachedUserData = null;
let authInitialized = false;

// Update the DEFAULT_AUTH_BUTTONS template
const DEFAULT_AUTH_BUTTONS = `
    <div class="auth-buttons-container">
        <button class="btn btn-outline-light" onclick="showLoginModal()">
            <i class="bi bi-box-arrow-in-right"></i>
            Login
        </button>
        <button class="btn btn-light" onclick="showRegisterModal()">
            <i class="bi bi-person-plus-fill"></i>
            Register
        </button>
    </div>
`;

// Profile template - adjusted margin and spacing
const PROFILE_TEMPLATE = `
    <div class="profile-container">
        <div class="profile-info">
            <img src="%photoURL%" 
                 alt="Profile" 
                 class="profile-image"
                 onerror="this.src='${DEFAULT_PROFILE_PIC}'; this.onerror=null;">
            <span class="profile-name">
                %displayName%
            </span>
        </div>
        <button class="btn btn-outline-light" onclick="handleLogout()">
            <i class="bi bi-box-arrow-right"></i>
            Logout
        </button>
    </div>
`;

// Add loading state class to userProfile initially
document.addEventListener('DOMContentLoaded', () => {
    const userProfileDiv = document.getElementById('userProfile');
    if (userProfileDiv) {
        userProfileDiv.classList.add('auth-loading');
    }
});

// Show default auth state (login/register buttons)
function showDefaultAuthState() {
    console.log('Showing default auth state');
    const userProfileDiv = document.getElementById('userProfile');
    if (userProfileDiv) {
        userProfileDiv.style.visibility = 'visible';
        userProfileDiv.style.opacity = '1';
        userProfileDiv.innerHTML = DEFAULT_AUTH_BUTTONS;
    }
}

// Render profile UI
function renderProfile(profileData) {
    console.log('Rendering profile:', profileData);
    const userProfileDiv = document.getElementById('userProfile');
    if (!userProfileDiv) return;

    let html = PROFILE_TEMPLATE;
    html = html.replace(/%photoURL%/g, profileData.photoURL || DEFAULT_PROFILE_PIC);
    html = html.replace(/%displayName%/g, profileData.displayName || profileData.email.split('@')[0]);
    html = html.replace(/%email%/g, profileData.email);

    userProfileDiv.innerHTML = html;
    requestAnimationFrame(() => {
        userProfileDiv.classList.add('visible');
    });
}

// Update cache with new profile data
function updateProfileCache(profileData) {
    console.log('Updating profile cache:', profileData);
    localStorage.setItem(CACHE_KEYS.PROFILE, JSON.stringify(profileData));
    localStorage.setItem(CACHE_KEYS.AUTH_STATE, 'logged_in');
    localStorage.setItem(CACHE_KEYS.LAST_UPDATE, Date.now().toString());
}

// Clear cache
function clearProfileCache() {
    console.log('Clearing profile cache');
    localStorage.removeItem(CACHE_KEYS.PROFILE);
    localStorage.removeItem(CACHE_KEYS.AUTH_STATE);
    localStorage.removeItem(CACHE_KEYS.LAST_UPDATE);
}

// Initialize from cache immediately
function initializeFromCache() {
    try {
        const cachedProfile = localStorage.getItem(CACHE_KEYS.PROFILE);
        const cachedAuthState = localStorage.getItem(CACHE_KEYS.AUTH_STATE);
        
        if (cachedProfile && cachedAuthState === 'logged_in') {
            const profileData = JSON.parse(cachedProfile);
            console.log('Found valid cache:', profileData);
            renderProfile(profileData);
            return true;
        }
    } catch (error) {
        console.error('Error reading cache:', error);
    }
    
    console.log('No valid cache found');
    showDefaultAuthState();
    return false;
}

// Firebase Auth State Observer
firebase.auth().onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'No user logged in');
    
    if (!authInitialized) {
        authInitialized = true;
    }

    if (user) {
        // Pre-fetch user data and update cache
        firebase.firestore().collection('users').doc(user.uid).get()
            .then(doc => {
                const userData = doc.data() || {};
                cachedUserData = userData;
                
                // Update cache with user profile
                const profileData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || userData.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || userData.photoURL || DEFAULT_PROFILE_PIC
                };
                updateProfileCache(profileData);
                renderProfile(profileData);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                // Still cache basic user info even if Firestore fails
                const profileData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || DEFAULT_PROFILE_PIC
                };
                updateProfileCache(profileData);
                renderProfile(profileData);
            });
    } else {
        cachedUserData = null;
        clearProfileCache();
        showDefaultAuthState();
    }
});

// Handle Login - removed duplicate welcome message
function handleLogin(event) {
    event.preventDefault();
    console.log('Login process started');
    
    try {
        // Check if Firebase is initialized
        if (!firebase.apps.length) {
            console.error('Firebase not initialized');
            toastr.error('System error: Firebase not initialized');
            return;
        }

        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        console.log('Form elements found:', {
            emailFound: !!emailInput,
            passwordFound: !!passwordInput
        });

        if (!emailInput || !passwordInput) {
            console.error('Form elements not found');
            toastr.error('Error: Form elements not found');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        console.log('Login form values collected:', { 
            email, 
            hasPassword: !!password 
        });
        
        if (!email || !password) {
            console.error('Missing login fields');
            toastr.error('Email and password are required');
            return;
        }
        
        console.log('Starting Firebase authentication');
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Login successful:', {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email
                });
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (loginModal) {
                    loginModal.hide();
                }
                // Removed duplicate toastr.success message here
            })
            .catch((error) => {
                console.error('Login error:', {
                    code: error.code,
                    message: error.message
                });
                
                let errorMessage = 'An error occurred during login';
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This account has been disabled';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many failed attempts. Please try again later';
                        break;
                }
                toastr.error(errorMessage);
            });
    } catch (error) {
        console.error('Unexpected error during login:', error);
        toastr.error('An unexpected error occurred');
    }
    hideLoginModal();
}

// Handle Register
function handleRegister(event) {
    event.preventDefault();
    console.log('Registration process started');
    
    try {
        const emailInput = document.getElementById('registerEmail');
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('registerConfirmPassword');
        const usernameInput = document.getElementById('registerUsername');

        console.log('Form elements found:', {
            emailFound: !!emailInput,
            passwordFound: !!passwordInput,
            confirmPasswordFound: !!confirmPasswordInput,
            usernameFound: !!usernameInput
        });

        if (!emailInput || !passwordInput || !confirmPasswordInput || !usernameInput) {
            console.error('Form elements not found');
            toastr.error('Error: Form elements not found');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const username = usernameInput.value.trim();

        console.log('Registration form values collected:', {
            email,
            username,
            hasPassword: !!password,
            hasConfirmPassword: !!confirmPassword
        });

        if (!email || !password || !confirmPassword || !username) {
            console.error('Missing required fields');
            toastr.error('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            console.error('Password mismatch');
            toastr.error('Passwords do not match');
            return;
        }

        console.log('Starting Firebase registration');
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('User created:', userCredential.user.email);
                return userCredential.user.updateProfile({
                    displayName: username,
                    photoURL: DEFAULT_PROFILE_PIC
                });
            })
            .then(() => {
                console.log('Profile updated with username:', username);
                const user = firebase.auth().currentUser;
                return firebase.firestore().collection('users').doc(user.uid).set({
                    username: username,
                    email: email,
                    profilePic: DEFAULT_PROFILE_PIC,
                    dateJoined: firebase.firestore.FieldValue.serverTimestamp(),
                    stats: {
                        totalWorkouts: 0,
                        totalExercises: 0,
                        totalDuration: 0,
                        streakDays: 0,
                        lastWorkout: null
                    }
                });
            })
            .then(() => {
                console.log('User document created in Firestore');
                const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                if (registerModal) {
                    registerModal.hide();
                }
                toastr.success('Welcome to FitFlow!');
            })
            .catch((error) => {
                console.error('Registration error:', {
                    code: error.code,
                    message: error.message
                });
                toastr.error(error.message);
            });
    } catch (error) {
        console.error('Unexpected error during registration:', error);
        toastr.error('An unexpected error occurred');
    }
    hideRegisterModal();
}

// Update UI based on login state
function updateUIForLoginState(user) {
    console.log('Updating UI for login state:', user ? 'logged in' : 'logged out');
    const userProfileDiv = document.getElementById('userProfile');
    if (!userProfileDiv) return;

    if (user) {
        // User is logged in, update profile display
        const profileData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };
        renderProfile(profileData);
    } else {
        // User is logged out
        console.log('Restoring login/register buttons');
        userProfileDiv.innerHTML = DEFAULT_AUTH_BUTTONS;
    }
    
    // Show the div after changes are made
    requestAnimationFrame(() => {
        userProfileDiv.classList.remove('auth-loading');
        userProfileDiv.style.visibility = 'visible';
    });
}

// Logout function
function handleLogout() {
    console.log('Handling logout');
    
    // Clear cache first
    clearProfileCache();
    
    // Update UI immediately
    const userProfileDiv = document.getElementById('userProfile');
    if (userProfileDiv) {
        userProfileDiv.innerHTML = DEFAULT_AUTH_BUTTONS;
        userProfileDiv.style.visibility = 'visible';
    }
    
    // Then sign out from Firebase
    firebase.auth().signOut()
        .then(() => {
            console.log('Successfully logged out');
            toastr.success('Successfully logged out');
            // Double check the buttons are visible
            if (userProfileDiv) {
                userProfileDiv.innerHTML = DEFAULT_AUTH_BUTTONS;
                userProfileDiv.style.visibility = 'visible';
            }
        })
        .catch((error) => {
            console.error('Error logging out:', error);
            toastr.error('Error logging out');
        });
}

// Initialize immediately from cache
initializeFromCache();

// Ensure proper button event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Debug log
    console.log('Setting up auth event listeners');

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Export functions for use in other files
window.showDefaultAuthState = showDefaultAuthState;
window.renderProfile = renderProfile;
window.updateProfileCache = updateProfileCache;
window.clearProfileCache = clearProfileCache;
window.initializeFromCache = initializeFromCache;

/**
 * Auth Manager - Handles authentication state management and UI transitions
 */

class AuthUIManager {
    constructor() {
        this.currentState = 'loading';
        this.container = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        this.container = document.createElement('div');
        this.container.className = 'nav-auth-wrapper';
        this.container.innerHTML = `
            <div class="nav-auth-container">
                <div class="auth-state auth-loading">
                    <div class="placeholder-content">
                        <div class="placeholder"></div>
                    </div>
                </div>
                <div class="auth-state auth-buttons hidden">
                    <div class="auth-buttons-container">
                        <button class="auth-button btn-outline-light" onclick="showLoginModal()">
                            <i class="bi bi-box-arrow-in-right"></i>
                            Login
                        </button>
                        <button class="auth-button btn-light" onclick="showRegisterModal()">
                            <i class="bi bi-person-plus-fill"></i>
                            Register
                        </button>
                    </div>
                </div>
                <div class="auth-state auth-profile hidden">
                    <div class="profile-container">
                        <!-- Profile content will be injected here -->
                    </div>
                </div>
            </div>
        `;

        // Insert after navbar brand
        const navbarBrand = document.querySelector('.navbar-brand');
        navbarBrand?.parentNode?.insertBefore(this.container, navbarBrand.nextSibling);
        
        this.initialized = true;
        
        // Initialize state from cache
        this.initializeFromCache();
    }

    setState(state, data = null) {
        if (!this.container) return;
        
        const states = ['loading', 'buttons', 'profile'];
        states.forEach(s => {
            const el = this.container.querySelector(`.auth-${s}`);
            el?.classList.toggle('hidden', s !== state);
        });

        if (state === 'profile' && data) {
            this.updateProfile(data);
        }

        this.currentState = state;
    }

    updateProfile(userData) {
        const profileContainer = this.container.querySelector('.auth-profile .profile-container');
        if (!profileContainer) return;

        profileContainer.innerHTML = `
            <div class="profile-info">
                <img src="${userData.photoURL || DEFAULT_PROFILE_PIC}" 
                     alt="Profile"
                     class="profile-image"
                     onerror="this.src='${DEFAULT_PROFILE_PIC}'">
                <span class="profile-name">${userData.displayName || userData.email}</span>
            </div>
            <button class="auth-button btn-outline-light logout-button" onclick="handleLogout()">
                <i class="bi bi-box-arrow-right"></i>
                <span>Logout</span>
            </button>
        `;
    }

    // ... rest of the implementation
}

// Initialize the manager
const authUI = new AuthUIManager();
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Auth UI');
    authUI.initialize();
});
