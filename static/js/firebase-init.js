console.log('firebase-init.js loaded');

/**
 * Firebase initialization configuration
 * This ensures consistent Firebase setup across all pages
 */

const firebaseConfig = {
    apiKey: "AIzaSyCWIMlaQZociNFirdOt1rlrJo9wZumZuDg",
    authDomain: "fitflow-17f89.firebaseapp.com",
    projectId: "fitflow-17f89",
    storageBucket: "fitflow-17f89.firebasestorage.app",
    messagingSenderId: "935181187616",
    appId: "1:935181187616:web:66776ab4bfc3c200a71a45",
    measurementId: "G-8GDRP0Q67K"
};

// Initialize Firebase only if it hasn't been initialized yet
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

console.log('Firebase initialized');

// Add auth state observer for debugging
firebase.auth().onAuthStateChanged((user) => {
    console.log('Firebase Auth State Changed:', user ? 'User Logged In' : 'No User');
}, (error) => {
    console.error('Firebase Auth Error:', error);
});
