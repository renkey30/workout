/**
 * Navbar component - Handles navigation, authentication UI, and user profile display
 */

// Track if we've received initial auth state
let initialAuthStateReceived = false;

// Global logout function
window.handleLogout = function() {
    console.log('Logout requested');
    
    // Clear cache first
    localStorage.removeItem(CACHE_KEYS.PROFILE);
    localStorage.removeItem(CACHE_KEYS.AUTH_STATE);
    
    // Sign out of Firebase
    firebase.auth().signOut()
        .then(() => {
            console.log('Signed out successfully');
            showDefaultAuthState();
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
};

function loadFirebaseScripts() {
    const scripts = [
        'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js',
        'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'
    ];

    return Promise.all(scripts.map(src => {
        if (!document.querySelector(`script[src="${src}"]`)) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }
        return Promise.resolve();
    }));
}

function initializeFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyCWIMlaQZociNFirdOt1rlrJo9wZumZuDg",
        authDomain: "fitflow-17f89.firebaseapp.com",
        projectId: "fitflow-17f89",
        storageBucket: "fitflow-17f89.firebasestorage.app",
        messagingSenderId: "935181187616",
        appId: "1:935181187616:web:66776ab4bfc3c200a71a45",
        measurementId: "G-8GDRP0Q67K"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Load auth.js if not already loaded
    if (!document.querySelector('script[src*="auth.js"]')) {
        const authScript = document.createElement('script');
        authScript.src = '/static/js/auth/auth.js';
        document.body.appendChild(authScript);
    }
}

function injectNavbarStyles() {
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --primary-blue: #3b82f6;      
            --secondary-blue: #2563eb;    
            --accent-blue: #60a5fa;       
            --dark-blue: #1e40af;         
            --text-dark: #111827;         
            --text-gray: #374151;         
            --background-light: #f9fafb;  
            --white: #ffffff;
            --pure-black: #000000;
            --dark-background: #121212;
            --glass-bg: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
            --navbar-height: 68px;
        }

        body {
            padding-top: var(--navbar-height);
        }

        /* Reset navbar specific styles */
        .navbar {
            height: var(--navbar-height);
            min-height: var(--navbar-height);
            background: var(--pure-black);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1030;
            padding: 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .navbar .container {
            display: flex;
            align-items: center;
            height: 100%;
            width: 100%;
            max-width: 1600px; /* Prevent stretching on ultra-wide screens */
            padding: 0 2rem;
            margin: 0 auto;
            gap: 2rem; /* Consistent spacing between elements */
            justify-content: space-between; /* Ensure consistent spacing */
        }

        .navbar-brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--white);
            font-size: 1.8rem;
            font-weight: 700;
            text-decoration: none;
            letter-spacing: -0.5px;
            padding: 0;
            margin: 0;
            flex-shrink: 0; /* Prevent logo from shrinking */
        }

        .navbar-collapse {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: space-between; /* Distribute space evenly */
        }

        .navbar-nav {
            display: flex;
            align-items: center;
            gap: 2rem;
            margin: 0;
            padding: 0;
            list-style: none;
            flex-grow: 0; /* Prevent nav from stretching */
        }

        .nav-link {
            color: rgba(255, 255, 255, 0.8) !important;
            font-size: 1.2rem;
            font-weight: 500;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 1rem;
            transition: color 0.2s ease;
            white-space: nowrap;
        }

        .nav-link:hover {
            color: rgba(255, 255, 255, 1) !important;
        }

        .nav-link.active {
            color: var(--primary-blue) !important;
            font-weight: 600;
        }

        .nav-link i {
            opacity: 1 !important;
            color: var(--primary-blue) !important;
        }

        #userProfile {
            display: flex;
            align-items: center;
            margin-left: auto;
            gap: 1rem;
            min-width: 200px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        /* Fix profile picture size */
        #userProfile img.rounded-circle {
            width: 24px !important;  /* Force smaller size */
            height: 24px !important;
            object-fit: cover;
        }

        .auth-buttons-container {
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
        }

        /* Profile dropdown styles */
        .profile-dropdown {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            background: transparent;
            border: 1px solid var(--glass-border);
        }

        .profile-dropdown:hover {
            background: var(--glass-bg);
        }

        /* Mobile navigation */
        @media (max-width: 991px) {
            .navbar .container {
                padding: 0 1rem;
            }

            .navbar-collapse {
                position: fixed;
                top: var(--navbar-height);
                left: 0;
                right: 0;
                background: var(--pure-black);
                padding: 1rem;
                flex-direction: column;
                align-items: stretch;
                height: auto;
                max-height: calc(100vh - var(--navbar-height));
                overflow-y: auto;
            }

            .navbar-nav {
                flex-direction: column;
                gap: 0.5rem;
                width: 100%;
            }

            .nav-link {
                justify-content: flex-start;
                width: 100%;
            }

            #userProfile {
                width: 100%;
                justify-content: center;
                margin-top: 1rem;
            }

            .auth-buttons-container {
                flex-direction: column;
                gap: 0.5rem;
            }
        }

        /* Ensure icons maintain color */
        .nav-link i,
        .navbar-brand i {
            color: var(--primary-blue);
            font-size: 1.4rem;
        }
    `;
    document.head.appendChild(style);
}

function checkAndShowCachedProfile(userProfileDiv) {
    if (!userProfileDiv) return false;

    const cachedProfile = localStorage.getItem(CACHE_KEYS.PROFILE);
    const cachedAuthState = localStorage.getItem(CACHE_KEYS.AUTH_STATE);
    
    if (cachedProfile && cachedAuthState === 'logged_in') {
        try {
            const profileData = JSON.parse(cachedProfile);
            userProfileDiv.innerHTML = `
                <div class="d-flex align-items-center gap-3" style="margin-left: auto; justify-content: flex-end; min-width: 100%;">
                    <div class="d-flex align-items-center gap-3 text-white" 
                         role="button" 
                         id="userDropdown" 
                         data-bs-toggle="dropdown"
                         style="cursor: pointer; margin-left: 50px;">
                        <img src="${profileData.photoURL || DEFAULT_PROFILE_PIC}" 
                             alt="Profile" 
                             class="rounded-circle"
                             style="width: 32px; height: 32px;"
                             onerror="this.src='${DEFAULT_PROFILE_PIC}'; this.onerror=null;">
                        <span style="font-weight: 700; font-size: 1.2rem; letter-spacing: -0.5px;">
                            ${profileData.displayName || profileData.email}
                        </span>
                    </div>
                    <button class="btn" onclick="handleLogout()" style="margin-right: 0;">
                        <i class="bi bi-box-arrow-right"></i>
                        <span>Logout</span>
                    </button>
                </div>
            `;
            // Show the div after logged-in content is set
            requestAnimationFrame(() => {
                userProfileDiv.classList.add('visible');
            });
            return true;
        } catch (error) {
            console.error('Error showing cached profile:', error);
            return false;
        }
    }
    return false;
}

function determineActivePage() {
    const path = window.location.pathname;
    if (path.includes('food_log')) return 'food_log';
    if (path.includes('forum')) return 'forum';
    if (path.includes('workout')) return 'workout';
    return 'home';
}

function injectNavbar(activePage) {
    console.log('Injecting navbar with active page:', activePage);
    
    // Ensure Bootstrap Icons are loaded
    if (!document.querySelector('link[href*="bootstrap-icons"]')) {
        const iconsLink = document.createElement('link');
        iconsLink.rel = 'stylesheet';
        iconsLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
        document.head.appendChild(iconsLink);
    }
    
    loadFirebaseScripts()
        .then(() => {
            console.log('Firebase scripts loaded');
            return new Promise((resolve) => {
                initializeFirebase();
                injectNavbarStyles();

                // Load constants script if not already loaded
                if (!document.querySelector('script[src*="constants.js"]')) {
                    const constantsScript = document.createElement('script');
                    constantsScript.src = '/static/js/auth/constants.js';
                    constantsScript.onload = () => {
                        console.log('Constants script loaded');
                        resolve();
                    };
                    constantsScript.onerror = (error) => {
                        console.error('Error loading constants script:', error);
                        resolve();
                    };
                    document.body.appendChild(constantsScript);
                } else {
                    resolve();
                }
            });
        })
        .then(() => {
            return new Promise((resolve) => {
                // Load auth modals script if not already loaded
                if (!document.querySelector('script[src*="modals.js"]')) {
                    const modalsScript = document.createElement('script');
                    modalsScript.src = '/static/js/auth/modals.js';
                    modalsScript.onload = () => {
                        console.log('Modals script loaded');
                        // Inject modals after script is loaded
                        if (typeof injectAuthModals === 'function') {
                            injectAuthModals();
                        }
                        resolve();
                    };
                    modalsScript.onerror = (error) => {
                        console.error('Error loading modals script:', error);
                        resolve();
                    };
                    document.body.appendChild(modalsScript);
                } else {
                    // If script already exists, ensure modals are injected
                    if (typeof injectAuthModals === 'function') {
                        injectAuthModals();
                    }
                    resolve();
                }
            });
        })
        .then(() => {
            const navbar = document.createElement('nav');
            navbar.className = 'navbar navbar-expand-lg fixed-top';
            navbar.innerHTML = `
                <div class="container">
                    <a class="navbar-brand" href="../home/index.html">
                        <i class="bi bi-lightning-charge-fill text-primary"></i>
                        FitFlow
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="../home/index.html">
                                    <i class="bi bi-house-heart-fill text-primary"></i>
                                    Home
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${activePage === 'workout' ? 'active' : ''}" href="/workouts/workout_input.html">
                                    <i class="bi bi-activity text-primary"></i>
                                    Workouts
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${activePage === 'food_log' ? 'active' : ''}" href="/food_log/food_log.html">
                                    <i class="bi bi-journal-check text-primary"></i>
                                    Food Log
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${activePage === 'forum' ? 'active' : ''}" href="/forum/forum.html">
                                    <i class="bi bi-people-fill text-primary"></i>
                                    Forum
                                </a>
                            </li>
                        </ul>
                        <div id="userProfile">
                            <!-- Auth content will be injected here -->
                        </div>
                    </div>
                </div>`;

            document.body.insertBefore(navbar, document.body.firstChild);

            // Try to show cached profile immediately
            const userProfileDiv = document.getElementById('userProfile');
            if (userProfileDiv) {
                const cachedProfile = localStorage.getItem(CACHE_KEYS.PROFILE);
                const cachedAuthState = localStorage.getItem(CACHE_KEYS.AUTH_STATE);
                
                console.log('Checking cached auth state:', cachedAuthState);
                
                if (cachedProfile && cachedAuthState === 'logged_in') {
                    try {
                        const profileData = JSON.parse(cachedProfile);
                        userProfileDiv.innerHTML = `
                            <div class="d-flex align-items-center gap-3" style="margin-left: auto; justify-content: flex-end; min-width: 100%;">
                                <div class="d-flex align-items-center gap-3 text-white" 
                                     role="button" 
                                     id="userDropdown" 
                                     data-bs-toggle="dropdown"
                                     style="cursor: pointer; margin-left: 50px;">
                                    <img src="${profileData.photoURL || DEFAULT_PROFILE_PIC}" 
                                         alt="Profile" 
                                         class="rounded-circle"
                                         style="width: 32px; height: 32px;"
                                         onerror="this.src='${DEFAULT_PROFILE_PIC}'; this.onerror=null;">
                                    <span style="font-weight: 700; font-size: 1.2rem; letter-spacing: -0.5px;">
                                        ${profileData.displayName || profileData.email}
                                    </span>
                                </div>
                                <button class="btn" onclick="handleLogout()" style="margin-right: 0;">
                                    <i class="bi bi-box-arrow-right"></i>
                                    <span>Logout</span>
                                </button>
                            </div>
                        `;
                    } catch (error) {
                        console.error('Error showing cached profile:', error);
                        clearProfileCache();
                    }
                } else {
                    // Show default auth buttons if no cached profile
                    userProfileDiv.innerHTML = DEFAULT_AUTH_BUTTONS;
                    userProfileDiv.classList.add('visible');
                }

                // Set up auth state listener to update if needed
                firebase.auth().onAuthStateChanged((user) => {
                    console.log('Auth state updated:', user ? 'logged in' : 'logged out');
                    if (user) {
                        // Only update UI if it's different from what's showing
                        if (!cachedProfile || cachedAuthState !== 'logged_in') {
                            userProfileDiv.innerHTML = `
                                <div class="d-flex align-items-center gap-3" style="margin-left: auto; justify-content: flex-end; min-width: 100%;">
                                    <div class="d-flex align-items-center gap-3 text-white" 
                                         role="button" 
                                         id="userDropdown" 
                                         data-bs-toggle="dropdown"
                                         style="cursor: pointer; margin-left: 50px;">
                                        <img src="${user.photoURL || DEFAULT_PROFILE_PIC}" 
                                             alt="Profile" 
                                             class="rounded-circle"
                                             style="width: 32px; height: 32px;"
                                             onerror="this.src='${DEFAULT_PROFILE_PIC}'; this.onerror=null;">
                                        <span style="font-weight: 700; font-size: 1.2rem; letter-spacing: -0.5px;">
                                            ${user.displayName || user.email}
                                        </span>
                                    </div>
                                    <button class="btn" onclick="handleLogout()" style="margin-right: 0;">
                                        <i class="bi bi-box-arrow-right"></i>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            `;
                        }
                    } else if (cachedAuthState === 'logged_in') {
                        // Only update if we thought we were logged in
                        userProfileDiv.innerHTML = DEFAULT_AUTH_BUTTONS;
                        clearProfileCache();
                    }
                    userProfileDiv.classList.add('visible');
                });
            }

            // Add this style block to ensure icon colors
            const style = document.createElement('style');
            style.textContent = `
                .nav-link .bi {
                    color: var(--primary-blue) !important;
                    margin-right: 0.5rem;
                }
                .navbar-brand .bi {
                    color: var(--primary-blue) !important;
                }
                #userProfile .btn i {
                    margin-right: 0.5rem;
                }
            `;
            document.head.appendChild(style);
        })
        .catch(error => {
            console.error('Error in navbar injection:', error);
        });
}

function clearProfileCache() {
    localStorage.removeItem(CACHE_KEYS.PROFILE);
    localStorage.removeItem(CACHE_KEYS.AUTH_STATE);
}

// Update the profile HTML template
function renderProfile(profileData) {
    console.log('Rendering profile:', profileData);
    const userProfileDiv = document.getElementById('userProfile');
    if (!userProfileDiv) return;

    userProfileDiv.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <div class="profile-dropdown">
                <img src="${profileData.photoURL || DEFAULT_PROFILE_PIC}" 
                     alt="Profile" 
                     class="rounded-circle"
                     onerror="this.src='${DEFAULT_PROFILE_PIC}'">
                <span class="text-white">${profileData.displayName || profileData.email}</span>
            </div>
            <button class="btn btn-outline-light btn-sm" onclick="handleLogout()">
                <i class="bi bi-box-arrow-right"></i>
            </button>
        </div>
    `;
    
    requestAnimationFrame(() => {
        userProfileDiv.classList.add('visible');
    });
}
