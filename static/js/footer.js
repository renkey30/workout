/**
 * Footer Component - Injects the site-wide footer with quick links
 * Ensures responsive design across all viewport sizes
 */

function injectFooter() {
    console.log('Injecting footer');
    
    // Remove any existing footer first
    const existingFooter = document.querySelector('.footer');
    if (existingFooter) {
        console.log('Removing existing footer');
        existingFooter.remove();
    }
    
    const footer = document.createElement('footer');
    footer.className = 'footer py-4 mt-auto';
    footer.style.backgroundColor = '#000000';
    
    footer.innerHTML = `
        <div class="container">
            <div class="mb-4">
                <h5 class="text-primary mb-4 responsive-title">
                    <i class="bi bi-link-45deg"></i>
                    Quick Links
                </h5>
                <div class="quick-links-container">
                    <a href="/home" class="quick-link">
                        <i class="bi bi-house-heart-fill"></i>
                        Home
                    </a>
                    <a href="/food_log/food_log.html" class="quick-link">
                        <i class="bi bi-journal-check"></i>
                        Food Log
                    </a>
                    <a href="/workouts/workout_input.html" class="quick-link">
                        <i class="bi bi-activity"></i>
                        Workouts
                    </a>
                    <a href="/forum/forum.html" class="quick-link">
                        <i class="bi bi-people-fill"></i>
                        Forum
                    </a>
                </div>
            </div>

            <div class="text-white-50 text-center">
                <small>&copy; ${new Date().getFullYear()} FitFlow. All rights reserved.</small>
            </div>
        </div>
    `;

    // Add responsive styles
    const existingStyle = document.querySelector('#footer-styles');
    if (existingStyle) {
        existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'footer-styles';
    style.textContent = `
        .footer {
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
            width: 100%;
            min-height: fit-content;
        }

        .responsive-title {
            font-size: clamp(1.5rem, 4vw, 2rem);
            font-weight: 600;
            text-align: center;
        }

        .quick-links-container {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: clamp(1rem, 3vw, 5rem);
            padding: 0 1rem;
        }

        .quick-link {
            color: var(--white);
            text-decoration: none;
            font-size: clamp(1rem, 3vw, 1.5rem);
            font-weight: 500;
            white-space: nowrap;
            transition: color 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .quick-link:hover {
            color: var(--primary-blue);
        }

        .quick-link i {
            font-size: 1.2em;
        }

        @media (max-width: 768px) {
            .quick-links-container {
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }
            
            .quick-link {
                justify-content: center;
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(footer);
    console.log('Footer injected with responsive design');
}

// Initialize footer
document.addEventListener('DOMContentLoaded', injectFooter);
