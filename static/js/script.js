document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const analyzeBtn = document.getElementById('analyzeBtn');

    if (loginForm) {
        initLogin();
    }

    if (analyzeBtn) {
        initDashboard();
    }
});

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const formSubtitle = document.getElementById('formSubtitle');

    // Toggle between Login and Signup
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            formSubtitle.textContent = 'Create a New Account';
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            formSubtitle.textContent = 'Secure Portal for Radiologists';
        });
    }

    // Login Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Verifying...';
        btn.disabled = true;

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = result.redirect;
            } else {
                alert(result.message || 'Login failed');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Connection Error');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    // Signup Submit
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = signupForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Creating...';
            btn.disabled = true;

            const formData = new FormData(signupForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    // Switch back to login form
                    signupForm.style.display = 'none';
                    loginForm.style.display = 'block';
                    document.getElementById('formSubtitle').textContent = 'Secure Portal for Radiologists';
                } else {
                    alert(result.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration failed:', error);
                alert('Connection Error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
}

function initDashboard() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const uploadContent = document.querySelector('.upload-content');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeBtn');

    // Result elements
    const resultCard = document.getElementById('resultCard');
    const emptyState = document.getElementById('emptyState');
    const loading = document.getElementById('loading');
    const resultContent = document.getElementById('resultContent');

    // Data fields
    const statusBadge = document.getElementById('statusBadge');
    const confidenceText = document.getElementById('confidenceText');
    const confidenceStroke = document.getElementById('confidenceStroke');
    const conditionText = document.getElementById('conditionText');
    const pathogenText = document.getElementById('pathogenText');
    const causesText = document.getElementById('causesText');
    const antibioticsList = document.getElementById('antibioticsList');
    const ayurvedicList = document.getElementById('ayurvedicList');

    let currentFile = null;

    // Drag and Drop
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
    });

    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please upload an image file (JPG, PNG).');
            return;
        }

        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            uploadContent.style.display = 'none';
            previewContainer.style.display = 'block';
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    function resetUpload() {
        currentFile = null;
        fileInput.value = '';
        imagePreview.src = '';
        uploadContent.style.display = 'flex';
        previewContainer.style.display = 'none';
        analyzeBtn.disabled = true;

        resultCard.style.display = 'block';
        emptyState.style.display = 'block';
        resultContent.style.display = 'none';
    }

    // Prediction
    analyzeBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        resultCard.style.display = 'block';
        emptyState.style.display = 'none';
        resultContent.style.display = 'none';
        loading.style.display = 'block';
        analyzeBtn.disabled = true;

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Prediction failed');

            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during analysis. Please try again.');
            loading.style.display = 'none';
            emptyState.style.display = 'block';
        } finally {
            analyzeBtn.disabled = false;
        }
    });

    function displayResults(data) {
        loading.style.display = 'none';
        resultContent.style.display = 'block';

        // Update Badge
        statusBadge.className = 'status-badge ' + (data.is_diseased ? 'pneumonia' : 'normal');
        statusBadge.innerHTML = data.is_diseased ?
            '<i class="fa-solid fa-triangle-exclamation"></i> PNEUMONIA DETECTED' :
            '<i class="fa-solid fa-circle-check"></i> NORMAL (HEALTHY)';

        // Update Chart
        const percentage = Math.round(data.confidence * 100);
        confidenceText.textContent = percentage + '%';
        confidenceStroke.setAttribute('stroke-dasharray', `${percentage}, 100`);
        confidenceStroke.style.stroke = data.is_diseased ? '#F44336' : '#4CAF50';

        // Update Details
        conditionText.textContent = data.details.disease_name;
        pathogenText.textContent = data.details.pathogen_type;
        causesText.textContent = data.details.causes;

        // Populate Lists
        if (data.details.treatments) {
            antibioticsList.innerHTML = data.details.treatments.antibiotics.map(item => `<li>${item}</li>`).join('');
            ayurvedicList.innerHTML = data.details.treatments.ayurvedic.map(item => `<li>${item}</li>`).join('');
        }
    }
}
