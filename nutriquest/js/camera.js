// ===== Camera & Food Scanning Functions =====

let stream = null;
let isCameraActive = false;

document.addEventListener('DOMContentLoaded', () => {
    const captureBtn = document.getElementById('captureBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // 1. Capture/Action Button Handler
    captureBtn?.addEventListener('click', async () => {
        if (!isCameraActive) {
            await startCamera();
        } else {
            await capturePhoto();
        }
    });

    // 2. Cancel Button Handler
    cancelBtn?.addEventListener('click', () => {
        stopCamera();
        resetUI();
    });
});

// Start camera with proper error handling
async function startCamera() {
    const video = document.getElementById('cameraFeed');
    const captureBtn = document.getElementById('captureBtn');
    const foodImage = document.getElementById('foodImage');

    // UI Updates
    foodImage.classList.add('hidden');
    video.classList.remove('hidden');
    document.querySelector('.nutrition-results')?.remove(); // Clear previous results

    try {
        // Try environment camera first
        const constraints = {
            video: {
                facingMode: 'environment', // Back camera
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };

        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e) {
            console.warn('Back camera failed, trying any camera...', e);
            // Fallback to any camera
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        video.srcObject = stream;

        // Wait for video to actually play to update state
        video.onloadedmetadata = () => {
            video.play();
            isCameraActive = true;
            captureBtn.innerHTML = '<span class="material-symbols-outlined">photo_camera</span> Capture Photo';
            captureBtn.classList.add('animate-pulse'); // Visual cue
        };

    } catch (error) {
        console.error('❌ Camera error:', error);

        let msg = 'Unable to access camera.';
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            msg += ' Camera requires HTTPS.';
        } else {
            msg += ' Check permissions.';
        }

        alert(msg);
        resetUI();
    }
}

// Capture photo and trigger analysis
async function capturePhoto() {
    const video = document.getElementById('cameraFeed');
    const foodImage = document.getElementById('foodImage');
    const captureBtn = document.getElementById('captureBtn');

    if (!video.videoWidth) return; // Camera not ready

    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Flip if using front camera (optional, skipped for now to keep simple)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.85);

    // Stop Camera
    stopCamera();

    // UI Updates
    video.classList.add('hidden');
    foodImage.src = imageData;
    foodImage.classList.remove('hidden');

    captureBtn.innerHTML = '<span class="material-symbols-outlined">restart_alt</span> Retake';
    captureBtn.classList.remove('animate-pulse');

    // Trigger Analysis from scanner.js
    if (window.analyzeFoodImage) {
        window.analyzeFoodImage(foodImage, 'scanned_food');
    } else {
        console.error('scanner.js not loaded!');
        alert('Scanner logic missing. Please reload.');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    isCameraActive = false;
}

function resetUI() {
    const captureBtn = document.getElementById('captureBtn');
    const foodImage = document.getElementById('foodImage');
    const video = document.getElementById('cameraFeed');

    foodImage.classList.add('hidden');
    video.classList.remove('hidden');
    captureBtn.innerHTML = '<span class="material-symbols-outlined">photo_camera</span> Capture & Analyze';
    captureBtn.classList.remove('animate-pulse');
}
