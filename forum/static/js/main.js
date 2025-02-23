
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });

    // Profile picture preview
    const profileInput = document.getElementById('profile-pic');
    const profilePreview = document.getElementById('profile-preview');

    if (profileInput && profilePreview) {
        profileInput.addEventListener('change', () => {
            const file = profileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Form validation
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const passwordInputs = form.querySelectorAll('input[type="password"]');
            if (passwordInputs.length > 1) {
                if (passwordInputs[0].value !== passwordInputs[1].value) {
                    e.preventDefault();
                    alert('Passwords do not match!');
                }
            }
        });
    });

    // Handle food log form submission
    const foodLogForm = document.querySelector('#food-log-form');
    if (foodLogForm) {
        foodLogForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.querySelector('#date').value;
            const food = document.querySelector('#food').value;
            const calories = document.querySelector('#calories').value;

            // Retrieve existing entries from localStorage
            const foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
            foodLog.push({ date, food, calories });
            localStorage.setItem('foodLog', JSON.stringify(foodLog));

            // Update UI
            displayFoodLog();
        });
    }

    // Handle workout input form submission
    const workoutForm = document.querySelector('#workout-form');
    if (workoutForm) {
        workoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.querySelector('#workout-date').value;
            const exercise = document.querySelector('#exercise').value;
            const duration = document.querySelector('#duration').value;
            const caloriesBurned = document.querySelector('#calories_burned').value;

            // Retrieve existing entries from localStorage
            const workoutLog = JSON.parse(localStorage.getItem('workoutLog')) || [];
            workoutLog.push({ date, exercise, duration, caloriesBurned });
            localStorage.setItem('workoutLog', JSON.stringify(workoutLog));

            // Update UI
            displayWorkoutLog();
        });
    }

    // Functions to display logs
    function displayFoodLog() {
        const foodEntries = document.querySelector('#food-entries');
        const foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
        foodEntries.innerHTML = foodLog.map(entry => `<li>${entry.date}: ${entry.food} - ${entry.calories} calories</li>`).join('');
    }

    function displayWorkoutLog() {
        const workoutEntries = document.querySelector('#workout-entries');
        const workoutLog = JSON.parse(localStorage.getItem('workoutLog')) || [];
        workoutEntries.innerHTML = workoutLog.map(entry => `<li>${entry.date}: ${entry.exercise} for ${entry.duration} mins - ${entry.caloriesBurned} calories burned</li>`).join('');
    }

    // Initial display
    displayFoodLog();
    displayWorkoutLog();
});
