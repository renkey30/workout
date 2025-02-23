/**
 * Auth Modals - Handles the login and registration modal dialogs
 * Provides universal authentication UI components that can be used across all pages
 * Contains the HTML templates and injection logic for auth-related modals
 */

console.log('Auth modals script loaded');

// Auth modals HTML template
const AUTH_MODALS = `
<!-- Login Modal -->
<div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="loginModalLabel">Login</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="loginForm" onsubmit="handleLogin(event)">
                    <div class="mb-3">
                        <label for="loginEmail" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="loginEmail" autocomplete="email" required>
                    </div>
                    <div class="mb-3">
                        <label for="loginPassword" class="form-label">Password</label>
                        <input type="password" class="form-control" id="loginPassword" autocomplete="current-password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Register Modal -->
<div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="registerModalLabel">Register</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="registerForm" onsubmit="handleRegister(event)">
                    <div class="mb-3">
                        <label for="registerEmail" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="registerEmail" autocomplete="email" required>
                    </div>
                    <div class="mb-3">
                        <label for="registerPassword" class="form-label">Password</label>
                        <input type="password" class="form-control" id="registerPassword" autocomplete="new-password" required>
                    </div>
                    <div class="mb-3">
                        <label for="confirmPassword" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirmPassword" autocomplete="new-password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Register</button>
                </form>
            </div>
        </div>
    </div>
</div>
`;

// Function to inject auth modals into the document
function injectAuthModals() {
    // Check if modals already exist
    if (document.getElementById('loginModal')) {
        return;
    }

    document.body.insertAdjacentHTML('beforeend', AUTH_MODALS);
    
    // Initialize Bootstrap modals
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));

    // Store modal instances globally
    window.loginModal = loginModal;
    window.registerModal = registerModal;
}

// Modal show/hide functions
function showLoginModal() {
    if (window.loginModal) {
        window.loginModal.show();
    } else {
        console.error('Login modal not initialized');
    }
}

function showRegisterModal() {
    if (window.registerModal) {
        window.registerModal.show();
    } else {
        console.error('Register modal not initialized');
    }
}

function hideLoginModal() {
    if (window.loginModal) {
        window.loginModal.hide();
    }
}

function hideRegisterModal() {
    if (window.registerModal) {
        window.registerModal.hide();
    }
}

// Export functions for use in other files
window.injectAuthModals = injectAuthModals;
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.hideLoginModal = hideLoginModal;
window.hideRegisterModal = hideRegisterModal;

// Initialize modals when the script loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing auth modals');
    injectAuthModals();
});
