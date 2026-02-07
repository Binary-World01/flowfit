// ===== UI Helper Functions =====

// Show loading overlay
function showLoading(message = 'Loading...') {
    const loadingScreen = document.getElementById('loadingScreen') || document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }

    if (loadingText) {
        loadingText.textContent = message;
    }
}

// Hide loading overlay
function hideLoading() {
    const loadingScreen = document.getElementById('loadingScreen') || document.getElementById('loadingOverlay');

    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}

// Show toast notification
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) {
        console.log('Toast:', message);
        return;
    }

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    // Auto hide after duration
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// Format date/time
function formatDateTime(date) {
    if (!date) return 'Unknown';

    const d = new Date(date);
    return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date only
function formatDate(date) {
    if (!date) return 'Unknown';

    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

// Animate number counting up
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Smooth scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!');
        }).catch(() => {
            showToast('Failed to copy');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
    }
}

// Check if mobile device
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Vibrate device (for achievements, etc.)
function vibrate(pattern = [200]) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// Play sound effect
function playSound(soundId) {
    const audio = document.getElementById(soundId);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format large numbers (1000 -> 1K)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Get greeting based on time
function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Good Morning';
    } else if (hour < 18) {
        return 'Good Afternoon';
    } else {
        return 'Good Evening';
    }
}

// Update greeting in UI
function updateGreeting() {
    const userName = window.currentUser?.name || 'User';
    const greetingEl = document.querySelector('.welcome-card h2');

    if (greetingEl) {
        greetingEl.innerHTML = `${getGreeting()}, <span id="userName">${userName}</span>! 👋`;
    }
}

// Handle errors gracefully
function handleError(error, userMessage = 'An error occurred') {
    console.error('Error:', error);
    showToast(userMessage);

    // Log to analytics/error tracking service if available
    if (window.analytics) {
        window.analytics.track('Error', {
            message: error.message,
            stack: error.stack
        });
    }
}

// Check online/offline status
window.addEventListener('online', () => {
    showToast('Back online! 🌐');
});

window.addEventListener('offline', () => {
    showToast('You\'re offline. Some features may not work.');
});

// Initialize UI helpers on load
document.addEventListener('DOMContentLoaded', () => {
    // Update greeting
    if (window.currentUser) {
        updateGreeting();
    }

    // Set up global error handler
    window.addEventListener('error', (event) => {
        handleError(event.error, 'Something went wrong');
    });
});
