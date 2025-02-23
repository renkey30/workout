/**
 * Shared constants for the entire application
 * All constants should be defined here and exported via window
 */

// Check if constants are already defined to avoid duplicate declarations
if (typeof window.DEFAULT_PROFILE_PIC === 'undefined') {
    // Default profile picture URL
    const DEFAULT_PROFILE_PIC = 'https://ui-avatars.com/api/?background=0D8ABC&color=fff';

    // Cache keys for local storage
    const CACHE_KEYS = {
        PROFILE: 'userProfile',
        AUTH_STATE: 'authState',
        LAST_UPDATE: 'lastUpdate'
    };

    // Auth UI constants with Bootstrap icons (matching navbar style)
    const DEFAULT_AUTH_BUTTONS = `
        <div class="d-flex align-items-center justify-content-between w-100">
            <button class="btn btn-outline-light me-2" onclick="showLoginModal()">
                <i class="bi bi-box-arrow-in-right text-white"></i>
                Login
            </button>
            <button class="btn btn-light" onclick="showRegisterModal()">
                <i class="bi bi-person-plus-fill text-primary"></i>
                Register
            </button>
        </div>
    `;

    // Profile UI template
    const PROFILE_TEMPLATE = `
        <div class="d-flex align-items-center gap-3">
            <img src="%photoURL%" alt="Profile" class="rounded-circle" width="32" height="32">
            <div class="d-flex flex-column">
                <span class="fw-bold text-white">%displayName%</span>
                <small class="text-white-50">%email%</small>
            </div>
            <button class="btn" onclick="handleLogout()">
                <i class="bi bi-box-arrow-right"></i>
                Logout
            </button>
        </div>
    `;

    // Export all constants to window for global access
    Object.assign(window, {
        DEFAULT_PROFILE_PIC,
        CACHE_KEYS,
        DEFAULT_AUTH_BUTTONS,
        PROFILE_TEMPLATE
    });
}
