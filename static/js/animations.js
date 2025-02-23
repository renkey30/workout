/**
 * Animated beam effects for the website
 * Creates two synchronized beams that adapt their color based on the background
 * Continuously monitors and updates beam colors using requestAnimationFrame
 */

function createBeamEffects() {
    // console.log('Creating beam effects');

    // Remove any existing beams
    document.querySelectorAll('.beam').forEach(el => el.remove());

    // Function to check if background is light
    function isLightBackground(element) {
        const bgColor = window.getComputedStyle(element).backgroundColor;
        const colors = bgColor.match(/\d+/g);
        if (!colors) return true;
        const brightness = (parseInt(colors[0]) + parseInt(colors[1]) + parseInt(colors[2])) / 3;
        // console.debug('Background brightness:', brightness);
        return brightness > 128;
    }
    
    // Function to update beam color based on background
    function updateBeamColor(beam) {
        const rect = beam.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const elementAtPoint = document.elementFromPoint(x, y);
        const currentColor = beam.style.backgroundColor;
        
        const shouldBeBlue = elementAtPoint && isLightBackground(elementAtPoint);
        const newColor = shouldBeBlue ? 'var(--primary-blue)' : 'var(--white)';
        
        if (currentColor !== newColor) {
            // console.debug(`Beam color changing from ${currentColor} to ${newColor} at position:`, {x, y});
            beam.style.backgroundColor = newColor;
        }
    }

    // Function to continuously update beam colors
    let lastUpdate = 0;
    const updateInterval = 50; // Check every 50ms

    function updateBeams(beams, timestamp) {
        if (timestamp - lastUpdate > updateInterval) {
            beams.forEach(updateBeamColor);
            lastUpdate = timestamp;
        }
        requestAnimationFrame((ts) => updateBeams(beams, ts));
    }
    
    // Common beam styles
    const commonStyles = `
        position: fixed;
        top: var(--navbar-height);
        width: 2px;
        height: 150px;
        pointer-events: none;
        z-index: 999999;
        animation: beamMove 2s linear infinite;
        transition: background-color 0.1s;
    `;
    
    // Create beams
    const beams = ['left', 'right'].map(side => {
        const beam = document.createElement('div');
        beam.className = 'beam ' + side;
        beam.style.cssText = `
            ${commonStyles}
            ${side}: 0;
        `;
        document.body.appendChild(beam);
        // console.debug(`Created ${side} beam:`, beam);
        return beam;
    });

    // Start continuous color updates
    updateBeams(beams, performance.now());

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes beamMove {
            0% {
                transform: translateY(calc(100vh - var(--navbar-height) - 150px));
            }
            50% {
                transform: translateY(0);
            }
            100% {
                transform: translateY(calc(100vh - var(--navbar-height) - 150px));
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createBeamEffects();
});
