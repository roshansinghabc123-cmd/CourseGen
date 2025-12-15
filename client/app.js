// Dynamic API URL: Use relative path if on same origin (Production/Monolith), else localhost (Python Dev)
const API_URL = (window.location.port === '5173')
    ? 'http://localhost:5001/api'
    : '/api';

// Mock Auth State
let user = null;

function login() {
    user = {
        name: 'Demo User',
        email: 'demo@example.com'
    };
    updateUI();
}

function logout() {
    user = null;
    updateUI();
}

function updateUI() {
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');

    if (user) {
        loginBtn.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userName.textContent = user.name;
    } else {
        loginBtn.classList.remove('hidden');
        userInfo.classList.add('hidden');
    }
}

async function generateCourse() {
    const topic = document.getElementById('topic-input').value;
    const generateBtn = document.getElementById('generate-btn');

    if (!topic) return alert('Please enter a topic');

    if (!user) {
        // Auto-login for demo purposes if not logged in
        login();
    }

    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const courseContent = document.getElementById('course-content');

    loading.classList.remove('hidden');
    results.classList.add('hidden');

    try {
        console.log("Generating course for topic:", topic);

        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        const response = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Mock Auth Header
                'Authorization': 'Bearer mock-access-token'
            },
            body: JSON.stringify({ topic })
        });

        const data = await response.json();
        console.log("API Response:", data);

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to generate course');
        }

        // Render Interactive Course Data
        const course = data.data;

        let html = `
            <header class="course-header">
                <span class="badge ${course.difficulty}">${course.difficulty}</span>
                <h2>${course.title}</h2>
                <p class="description">${course.description}</p>
                <div class="tags">
                    ${course.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            </header>
            <div class="modules-container">
        `;



        const modulesHtml = course.modules.map(module => `
            <div class="module-card">
                <div class="module-header">
                    <h4>${module.title}</h4>
                </div>
                <ul class="lesson-list">
                    ${module.lessons && module.lessons.length > 0
                ? module.lessons.map(lesson => `
                            <li class="lesson-item" onclick="loadLesson('${lesson._id || lesson.id}')">
                                <span class="icon">📄</span>
                                <span class="title">${lesson.title}</span>
                                <span class="arrow">→</span>
                            </li>
                        `).join('')
                : '<li class="lesson-item">No lessons</li>'
            }
                </ul>
            </div>
        `).join('');

        html += modulesHtml;
        html += `</div>`;

        html += `
        <div id="lesson-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal" onclick="closeModal()">&times;</span>
                <div id="lesson-content-area">
                    <div class="loading-spinner">Generating content... this may take a moment.</div>
                </div>
            </div>
        </div>`;

        // alert("Final HTML Length: " + html.length);

        courseContent.innerHTML = html; // Using courseContent as resultDiv
        results.classList.remove('hidden'); // Using results as resultDiv.classList.add('visible')

    } catch (error) {
        console.error('Error:', error);

        let errorMessage = error.message;
        if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
            errorMessage = 'AI service is busy (Rate Limit). Please try again in a minute.';
        } else if (errorMessage.includes('500')) {
            errorMessage = 'Server error. We are retrying, but if this persists, please try again later.';
        }

        alert(`Failed to generate course: ${errorMessage}`);
    } finally {
        loading.classList.add('hidden');
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Course';
    }
}

// Fetch and Display Lesson Details
async function loadLesson(lessonId) {
    const modal = document.getElementById('lesson-modal');
    const contentArea = document.getElementById('lesson-content-area');

    modal.style.display = 'block';
    contentArea.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>AI is writing this lesson...</p></div>';

    try {
        const token = 'mock-access-token';
        // Note: The backend checks for lesson enrichment and auto-generates if needed
        const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!data.success) throw new Error(data.error);

        renderLessonContent(data.data);

    } catch (error) {
        console.error('Load Lesson Error:', error);

        let errorMessage = error.message;
        let retryButton = '';

        if (errorMessage.includes('Failed to generate lesson')) {
            retryButton = `<button onclick="loadLesson('${lessonId}')" class="retry-btn">Retry Generation</button>`;
        }

        contentArea.innerHTML = `
            <div class="error-state">
                <p>Failed to load lesson: ${errorMessage}</p>
                ${retryButton}
            </div>`;
    }
}

function renderLessonContent(lesson) {
    const contentArea = document.getElementById('lesson-content-area');

    let html = `
        <div class="lesson-view">
            <h1>${lesson.title}</h1>
            
            <div class="objectives-box">
                <h3>🎯 Learning Objectives</h3>
                <ul>
                    ${lesson.objectives.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
            </div>
            
            <div class="content-blocks">
    `;

    if (lesson.content && lesson.content.length > 0) {
        lesson.content.forEach(block => {
            switch (block.type) {
                case 'heading':
                    html += `<h3 class="content-heading">${block.text}</h3>`;
                    break;
                case 'paragraph':
                    html += `<p class="content-text">${block.text}</p>`;
                    break;
                case 'code':
                    html += `
                        <div class="code-block">
                            <div class="code-header">${block.language || 'Code'}</div>
                            <pre><code>${block.text}</code></pre>
                        </div>`;
                    break;
                case 'list':
                    html += `
                        <ul class="content-list">
                            ${block.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>`;
                    break;
                case 'video':
                    html += `
                        <div class="video-block">
                            <h4>📺 Recommended Video</h4>
                            <div class="video-placeholder">
                                <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(block.query)}" target="_blank">
                                    Search YouTube for: "${block.query}"
                                </a>
                            </div>
                        </div>`;
                    break;
                case 'mcq':
                    html += `
                        <div class="quiz-block">
                            <h4>❓ Quick Quiz</h4>
                            <p class="question">${block.question}</p>
                            <div class="options">
                                ${block.options.map((opt, i) => `
                                    <div class="option" onclick="checkAnswer(this, ${block.answer}, ${i})">
                                        ${opt}
                                    </div>
                                `).join('')}
                            </div>
                            <p class="explanation hidden">${block.explanation}</p>
                        </div>`;
                    break;
            }
        });
    }

    html += `
            </div>
        </div>
    `;

    contentArea.innerHTML = html;
}

function closeModal() {
    document.getElementById('lesson-modal').style.display = 'none';
}

// Simple Quiz Logic
window.checkAnswer = function (element, correctIndex, selectedIndex) {
    const parent = element.parentElement;
    const allOptions = parent.querySelectorAll('.option');
    const explanation = parent.parentElement.querySelector('.explanation');

    allOptions.forEach(opt => opt.classList.add('disabled'));

    if (selectedIndex === correctIndex) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
        allOptions[correctIndex].classList.add('correct');
    }

    explanation.classList.remove('hidden');
};

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('lesson-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


// Init
document.addEventListener('DOMContentLoaded', () => {
    console.log("App Initialized");

    // Attach Event Listeners
    const genBtn = document.getElementById('generate-btn');
    if (genBtn) {
        genBtn.addEventListener('click', generateCourse);
    }

    login(); // Auto-login for convenience
});
