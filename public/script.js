const app = document.getElementById('app');

const defaultPreferences = ['trend', 'today', 'classes', 'volume', 'dow', 'atRisk', 'absences', 'heatmap', 'sixMonth', 'topStudents', 'classRadar'];


const translations = {
    'en': {
        'signIn': 'Please sign in to continue',
        'username': 'Username',
        'password': 'Password',
        'signInBtn': 'Sign In',
        'invalidCreds': 'Invalid credentials',
        'welcome': 'Welcome',
        'logout': 'Logout',
        'globalInsights': 'Global Insights',
        'globalInsightsDesc': 'Overview of attendance across all classes',
        'classesOverview': 'Classes Overview',
        'classesOverviewDesc': 'Manage your classes and student rosters',
        'newClass': 'New Class',
        'createClassTitle': 'Create New Class',
        'className': 'Class Name',
        'cancel': 'Cancel',
        'create': 'Create',
        'students': 'Students',
        'created': 'Created',
        'classView': 'Class View',
        'addStudent': 'Add Student',
        'import': 'Import',
        'export': 'Export',
        'downloadCsv': 'Download CSV',
        'downloadExcel': 'Download Excel',
        'downloadPdf': 'Download PDF',
        'history': 'History',
        'notify': 'Notify',
        'addStudentTitle': 'Add Student',
        'studentName': 'Student Name',
        'email': 'Parent/Student Email',
        'contact': 'Contact Number',
        'add': 'Add',
        'editStudent': 'Edit Student',
        'delete': 'Delete',
        'save': 'Save',
        'editClass': 'Edit Class Name',
        'notifyParents': 'Notify Parents',
        'notifyDesc': 'The following actions will be executed based on the recorded absences for Today',
        'emails': 'Emails',
        'sms': 'SMS',
        'voiceCalls': 'Voice Calls',
        'sendAlerts': 'Send Alerts',
        'bulkImport': 'Bulk Import Students',
        'bulkImportDesc': 'Please upload an Excel file (.xlsx, .xls) containing your student roster.',
        'chooseExcel': 'Choose Excel File',
        'classInsights': 'Class Insights',
        'present': 'Present',
        'absent': 'Absent',
        'attendanceReport': 'Attendance Report',
        'noData': 'No data to export',
        'preparingExcel': 'Preparing Excel...',
        'preparingPdf': 'Preparing PDF...',
        'preparingCsv': 'Preparing CSV...',
        'failedExport': 'Failed to export',
        'language': 'Language',
        'classPlaceHolder': 'e.g. Mathematics 101',
        'loading': 'Loading...',
        'studentAddError': 'Failed to add student',
        'classDeleted': 'Class deleted',
        'classDeleteFail': 'Failed to delete class',
        'classDeleteConfirm': 'Are you sure you want to delete this class? This cannot be undone.',
        'studentDeleted': 'Student deleted',
        'studentDeleteFail': 'Failed to delete student',
        'studentDeleteConfirm': 'Are you sure you want to delete this student?'
    },
    'mr': {
        'signIn': 'कृपया पुढे जाण्यासाठी साइन इन करा',
        'username': 'वापरकर्तानाव',
        'password': 'पासवर्ड',
        'signInBtn': 'साइन इन',
        'invalidCreds': 'अवैध क्रेडेन्शियल्स',
        'welcome': 'स्वागत आहे',
        'logout': 'लॉग आउट',
        'globalInsights': 'जागतिक अंतर्दृष्टी',
        'globalInsightsDesc': 'सर्व वर्गांमधील उपस्थितीचा आढावा',
        'classesOverview': 'वर्गांचा आढावा',
        'classesOverviewDesc': 'आपले वर्ग आणि विद्यार्थ्यांची यादी व्यवस्थापित करा',
        'newClass': 'नवीन वर्ग',
        'createClassTitle': 'नवीन वर्ग तयार करा',
        'className': 'वर्गाचे नाव',
        'cancel': 'रद्द करा',
        'create': 'तयार करा',
        'students': 'विद्यार्थी',
        'created': 'तयार केले',
        'classView': 'वर्ग दृश्य',
        'addStudent': 'विद्यार्थी जोडा',
        'import': 'आयात करा',
        'export': 'निर्यात करा',
        'downloadCsv': 'CSV डाउनलोड करा',
        'downloadExcel': 'Excel डाउनलोड करा',
        'downloadPdf': 'PDF डाउनलोड करा',
        'history': 'इतिहास',
        'notify': 'सूचित करा',
        'addStudentTitle': 'विद्यार्थी जोडा',
        'studentName': 'विद्यार्थ्याचे नाव',
        'email': 'पालक/विद्यार्थ्यांचा ईमेल',
        'contact': 'संपर्क क्रमांक',
        'add': 'जोडा',
        'editStudent': 'विद्यार्थी संपादित करा',
        'delete': 'हटवा',
        'save': 'जतन करा',
        'editClass': 'वर्गाचे नाव संपादित करा',
        'notifyParents': 'पालकांना सूचित करा',
        'notifyDesc': 'आजच्या अनुपस्थितीवर आधारित खालील कृती केल्या जातील',
        'emails': 'ईमेल्स',
        'sms': 'एसएमएस',
        'voiceCalls': 'व्हॉइस कॉल्स',
        'sendAlerts': 'अलर्ट पाठवा',
        'bulkImport': 'विद्यार्थ्यांची मोठ्या प्रमाणावर आयात',
        'bulkImportDesc': 'कृपया आपल्या विद्यार्थ्यांची यादी असलेली Excel फाइल (.xlsx, .xls) अपलोड करा.',
        'chooseExcel': 'Excel फाइल निवडा',
        'classInsights': 'वर्गाची अंतर्दृष्टी',
        'present': 'उपस्थित',
        'absent': 'अनुपस्थित',
        'attendanceReport': 'उपस्थिती अहवाल',
        'noData': 'निर्यात करण्यासाठी डेटा नाही',
        'preparingExcel': 'Excel तयार करत आहे...',
        'preparingPdf': 'PDF तयार करत आहे...',
        'preparingCsv': 'CSV तयार करत आहे...',
        'failedExport': 'निर्यात करण्यात अयशस्वी',
        'language': 'भाषा',
        'classPlaceHolder': 'उदा. गणित 101',
        'loading': 'लोड करत आहे...',
        'studentAddError': 'विद्यार्थी जोडण्यात अयशस्वी',
        'classDeleted': 'वर्ग हटवला',
        'classDeleteFail': 'वर्ग हटवण्यात अयशस्वी',
        'classDeleteConfirm': 'आपली खात्री आहे की आपण हा वर्ग हटवू इच्छिता? हे पूर्ववत केले जाऊ शकत नाही.',
        'studentDeleted': 'विद्यार्थी हटवला',
        'studentDeleteFail': 'विद्यार्थी हटवण्यात अयशस्वी',
        'studentDeleteConfirm': 'आपली खात्री आहे की आपण या विद्यार्थ्याला हटवू इच्छिता?'
    },
    'hi': {
        'signIn': 'कृपया जारी रखने के लिए साइन इन करें',
        'username': 'उपयोगकर्ता नाम',
        'password': 'पासवर्ड',
        'signInBtn': 'साइन इन करें',
        'invalidCreds': 'अमान्य क्रेडेंशियल्स',
        'welcome': 'स्वागत है',
        'logout': 'लॉग आउट',
        'globalInsights': 'वैश्विक अंतर्दृष्टि',
        'globalInsightsDesc': 'सभी कक्षाओं में उपस्थिति का अवलोकन',
        'classesOverview': 'कक्षाओं का अवलोकन',
        'classesOverviewDesc': 'अपनी कक्षाओं और छात्र रोस्टर का प्रबंधन करें',
        'newClass': 'नई कक्षा',
        'createClassTitle': 'नई कक्षा बनाएं',
        'className': 'कक्षा का नाम',
        'cancel': 'रद्द करें',
        'create': 'बनाएं',
        'students': 'छात्र',
        'created': 'बनाया गया',
        'classView': 'कक्षा दृश्य',
        'addStudent': 'छात्र जोड़ें',
        'import': 'आयात करें',
        'export': 'निर्यात करें',
        'downloadCsv': 'CSV डाउनलोड करें',
        'downloadExcel': 'Excel डाउनलोड करें',
        'downloadPdf': 'PDF डाउनलोड करें',
        'history': 'इतिहास',
        'notify': 'सूचित करें',
        'addStudentTitle': 'छात्र जोड़ें',
        'studentName': 'छात्र का नाम',
        'email': 'माता-पिता/छात्र ईमेल',
        'contact': 'संपर्क नंबर',
        'add': 'जोड़ें',
        'editStudent': 'छात्र संपादित करें',
        'delete': 'हटाएं',
        'save': 'सहेजें',
        'editClass': 'कक्षा का नाम संपादित करें',
        'notifyParents': 'माता-पिता को सूचित करें',
        'notifyDesc': 'आज की अनुपस्थिति के आधार पर निम्नलिखित कार्य किए जाएंगे',
        'emails': 'ईमेल',
        'sms': 'एसएमएस',
        'voiceCalls': 'वॉयस कॉल',
        'sendAlerts': 'अलर्ट भेजें',
        'bulkImport': 'छात्रों का थोक आयात',
        'bulkImportDesc': 'कृपया अपने छात्र रोस्टर वाली Excel फ़ाइल (.xlsx, .xls) अपलोड करें।',
        'chooseExcel': 'Excel फ़ाइल चुनें',
        'classInsights': 'कक्षा की अंतर्दृष्टि',
        'present': 'उपस्थित',
        'absent': 'अनुपस्थित',
        'attendanceReport': 'उपस्थिति रिपोर्ट',
        'noData': 'निर्यात करने के लिए कोई डेटा नहीं',
        'preparingExcel': 'Excel तैयार कर रहा है...',
        'preparingPdf': 'PDF तैयार कर रहा है...',
        'preparingCsv': 'CSV तैयार कर रहा है...',
        'failedExport': 'निर्यात करने में विफल',
        'language': 'भाषा',
        'classPlaceHolder': 'उदा. गणित 101',
        'loading': 'लोड हो रहा है...',
        'studentAddError': 'छात्र को जोड़ने में विफल',
        'classDeleted': 'कक्षा हटाई गई',
        'classDeleteFail': 'कक्षा को हटाने में विफल',
        'classDeleteConfirm': 'क्या आप वाकई इस कक्षा को हटाना चाहते हैं? इसे पूर्ववत नहीं किया जा सकता।',
        'studentDeleted': 'छात्र हटाया गया',
        'studentDeleteFail': 'छात्र को हटाने में विफल',
        'studentDeleteConfirm': 'क्या आप वाकई इस छात्र को हटाना चाहते हैं?'
    }
};

function t(key) {
    const lang = state.language || 'en';
    return (translations[lang] && translations[lang][key]) || translations['en'][key] || key;
}

function changeLanguage(lang) {
    state.language = lang;
    localStorage.setItem('language', lang);
    render();
}


const state = {
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null,
    preferences: JSON.parse(localStorage.getItem('preferences')) || defaultPreferences,
    currentPath: '/',
    language: localStorage.getItem('language') || 'en',
    classes: [],
    currentClass: null,
    currentStudents: [],
    
    currentMonth: new Date().toISOString().substring(0, 7),
    todayDate: new Date().toISOString().split('T')[0]
};

// --- API Wrapper ---
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(endpoint, options);
    if (res.status === 401) {
        logout();
        throw new Error('Unauthorized');
    }
    return res.json();
}

// --- Routing ---
function navigate(path) {
    state.currentPath = path;
    render();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('preferences');
    state.token = null;
    state.username = null;
    state.preferences = defaultPreferences;
    navigate('/login');
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="material-symbols-rounded">${type === 'success' ? 'check_circle' : 'error'}</span> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Views ---
function render() {
    app.innerHTML = '';
    
    if (!state.token && state.currentPath !== '/login') {
        navigate('/login');
        return;
    }
    
    if (state.currentPath === '/login') {
        app.innerHTML = renderLogin();
        bindLogin();
    } else if (state.currentPath === '/' || state.currentPath === '/app') {
        app.innerHTML = renderNavbar() + renderDashboard();
        bindDashboard();
    } else if (state.currentPath.startsWith('/class/')) {
        const classId = state.currentPath.split('/')[2];
        app.innerHTML = renderNavbar() + renderClassView();
        bindClassView(classId);
    }
}

// --- Login View ---
function renderLogin() {
    return `
        <div class="auth-container animate-fade-in">
            <div style="position: absolute; top: 16px; right: 16px; z-index: 100;">
                <select class="input-control" style="background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border: 1px solid var(--border-color); padding: 8px 32px 8px 12px; border-radius: var(--radius-md); font-weight: 500;" onchange="changeLanguage(this.value)">
                    <option value="en" ${state.language === 'en' ? 'selected' : ''}>English</option>
                    <option value="mr" ${state.language === 'mr' ? 'selected' : ''}>मराठी</option>
                    <option value="hi" ${state.language === 'hi' ? 'selected' : ''}>हिन्दी</option>
                </select>
            </div>
            <div class="auth-card">
                <h1>AttendAI</h1>
                <p class="text-muted mb-4">${t("signIn")}</p>
                <form id="loginForm">
                    <div class="input-group text-left">
                        <label>${t("username")}</label>
                        <input type="text" id="username" class="input-control" value="user1" required>
                    </div>
                    <div class="input-group text-left">
                        <label>${t("password")}</label>
                        <input type="password" id="password" class="input-control" value="user1" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top: 16px;">${t("signInBtn")}</button>
                    <p id="loginError" class="text-danger mt-2" style="display:none;"></p>
                </form>
            </div>
        </div>
    `;
}

function bindLogin() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: u, password: p })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                const prefs = data.preferences || defaultPreferences;
                localStorage.setItem('preferences', JSON.stringify(prefs));
                state.token = data.token;
                state.username = data.username;
                state.preferences = prefs;
                navigate('/');
            } else {
                document.getElementById('loginError').textContent = t('invalidCreds');
                document.getElementById('loginError').style.display = 'block';
            }
        } catch (err) {
            console.error(err);
        }
    });
}

// --- Navbar ---
function renderNavbar() {
    return `
        <nav class="navbar">
            <div class="navbar-brand cursor-pointer" onclick="navigate('/')">
                <span class="material-symbols-rounded">school</span> Attend<span>AI</span>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-muted text-sm">${t("welcome")}, <strong>${state.username}</strong></span>
                <button class="btn-icon" onclick="logout()" title="${t("logout")}"><span class="material-symbols-rounded">logout</span></button>
            </div>
        </nav>
    `;
}

// --- Dashboard View ---
function renderDashboard() {
    return `
        <div class="container animate-fade-in">
            <div class="header-actions">
                <div>
                    <h2>${t("classesOverview")}</h2>
                    <p class="text-muted">${t("classesOverviewDesc")}</p>
                </div>
                <button class="btn btn-primary" onclick="openCreateClassModal()">
                    <span class="material-symbols-rounded">add</span> ${t("newClass")}
                </button>
            </div>
            <div class="grid" id="classesGrid" style="margin-bottom: 48px;">
                <!-- Loading -->
            </div>

            <div class="header-actions">
                <div>
                    <h2>${t("globalInsights")}</h2>
                    <p class="text-muted">${t("globalInsightsDesc")}</p>
                </div>
                <button class="btn btn-outline" onclick="openCustomizeModal()">
                    <span class="material-symbols-rounded">tune</span> Customize
                </button>
            </div>
            
            <div id="globalDashboardContainer">
                <!-- Loading Skeleton -->
                <div class="skeleton-card" style="padding: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                    <div class="skeleton skeleton-chart" style="height: 60px; margin-bottom: 24px;"></div>
                    <div style="display:flex; gap:16px;">
                        <div class="skeleton skeleton-cell" style="flex:1;"></div>
                        <div class="skeleton skeleton-cell" style="flex:1;"></div>
                        <div class="skeleton skeleton-cell" style="flex:1;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Customize Dashboard Modal -->
        <div class="modal-overlay" id="customizeModal">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">Customize Dashboard</h3>
                    <button class="btn-icon" onclick="closeModal('customizeModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div class="modal-body" style="padding: 0 24px 24px 24px;">
                    <p class="text-muted" style="margin-bottom: 16px;">Select which widgets you want to display on your dashboard.</p>
                    <div class="customize-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        ${renderCustomizeWidgetOption('trend', '30-Day Global Trend', 'monitoring')}
                        ${renderCustomizeWidgetOption('today', 'Today Status', 'donut_small')}
                        ${renderCustomizeWidgetOption('classes', 'Class Attendance', 'bar_chart')}
                        ${renderCustomizeWidgetOption('volume', 'Present vs Absent', 'stacked_bar_chart')}
                        ${renderCustomizeWidgetOption('dow', 'Day of Week Trends', 'pie_chart')}
                        ${renderCustomizeWidgetOption('atRisk', 'At-Risk Students', 'warning')}
                        ${renderCustomizeWidgetOption('absences', 'Consecutive Absences', 'notifications_active')}
                        ${renderCustomizeWidgetOption('heatmap', '90-Day Heatmap', 'grid_view')}
                        ${renderCustomizeWidgetOption('sixMonth', '6-Month Averages', 'event')}
                        ${renderCustomizeWidgetOption('topStudents', 'Star Students', 'star')}
                        ${renderCustomizeWidgetOption('classRadar', 'Class Comparison', 'radar')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('customizeModal')">${t("cancel")}</button>
                    <button class="btn btn-primary" onclick="saveCustomizeSettings()">Apply Changes</button>
                </div>
            </div>
        </div>

        <!-- Create Class Modal -->
        <div class="modal-overlay" id="createClassModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${t("createClassTitle")}</h3>
                    <button class="btn-icon" onclick="closeModal('createClassModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div class="input-group">
                    <label>${t("className")}</label>
                    <input type="text" id="newClassName" class="input-control" placeholder="${t("classPlaceHolder")}">
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('createClassModal')">${t("cancel")}</button>
                    <button class="btn btn-primary" onclick="submitCreateClass()">${t("create")}</button>
                </div>
            </div>
        </div>
    `;
}

function renderCustomizeWidgetOption(id, name, icon) {
    const isChecked = state.preferences.includes(id) ? 'checked' : '';
    return `
        <label class="widget-option" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="material-symbols-rounded" style="color: var(--primary);">${icon}</span>
                <span style="font-weight: 500;">${name}</span>
            </div>
            <input type="checkbox" id="cb_${id}" value="${id}" ${isChecked} style="accent-color: var(--primary); width: 18px; height: 18px; cursor: pointer;">
        </label>
    `;
}

function openCustomizeModal() {
    // Re-check boxes based on current state
    ['trend', 'today', 'classes', 'volume', 'dow', 'atRisk', 'absences', 'heatmap', 'sixMonth', 'topStudents', 'classRadar'].forEach(id => {
        const cb = document.getElementById('cb_' + id);
        if (cb) cb.checked = state.preferences.includes(id);
    });
    document.getElementById('customizeModal').classList.add('active');
}

async function saveCustomizeSettings() {
    const checkboxes = document.querySelectorAll('.customize-grid input[type="checkbox"]');
    const newPrefs = [];
    checkboxes.forEach(cb => {
        if (cb.checked) newPrefs.push(cb.value);
    });
    
    state.preferences = newPrefs;
    localStorage.setItem('preferences', JSON.stringify(newPrefs));
    
    try {
        await apiCall('/api/user/preferences', 'PUT', { preferences: newPrefs });
        showToast('Dashboard customized successfully');
    } catch (e) {
        showToast('Saved locally, but failed to sync to server', 'error');
    }
    
    closeModal('customizeModal');
    loadGlobalDashboard();
}

async function bindDashboard() {
    loadGlobalDashboard();
    await loadClasses();
}

let globalChartInstance = null;

async function loadGlobalDashboard() {
    const container = document.getElementById('globalDashboardContainer');
    if (!container) return;
    try {
        const stats = await apiCall('/api/dashboard/stats');
        
        let chartHtml = '';
        if (stats.trend && stats.trend.length > 0) {
            chartHtml = `
                <div style="flex: 2; min-width: 300px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">30-Day Global Trend</h3>
                    <div style="position: relative; flex: 1; min-height: 60px;">
                        <canvas id="globalChart"></canvas>
                    </div>
                </div>
            `;
        } else {
            chartHtml = `
                <div style="flex: 2; min-width: 300px; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--text-muted); min-height: 60px;">
                    No attendance data to show yet
                </div>
            `;
        }

        let row1Html = '';
        const hasSummary = true; // We always show summary for now, or we can make it optional. Let's always show summary to avoid empty space.
        const showTrend = state.preferences.includes('trend');
        
        if (showTrend) {
            row1Html = `
            <div style="display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 16px;">
                    <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="text-muted" style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Classes</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--primary);">${stats.totalClasses}</div>
                    </div>
                    <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="text-muted" style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Students</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--primary);">${stats.totalStudents}</div>
                    </div>
                    <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="text-muted" style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Today's Rate</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--primary);">${stats.todayRate}%</div>
                    </div>
                </div>
                ${chartHtml}
            </div>`;
        } else {
             row1Html = `
            <div style="display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px; display: flex; flex-direction: row; gap: 16px;">
                    <div style="flex:1; background: white; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="text-muted" style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Classes</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--primary);">${stats.totalClasses}</div>
                    </div>
                    <div style="flex:1; background: white; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="text-muted" style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Students</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--primary);">${stats.totalStudents}</div>
                    </div>
                    <div style="flex:1; background: white; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="text-muted" style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Today's Rate</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: var(--primary);">${stats.todayRate}%</div>
                    </div>
                </div>
            </div>`;
        }

        let html = row1Html;
        
        let row2 = [];
        if (state.preferences.includes('today')) {
            row2.push(`
                <div style="flex: 1; min-width: 300px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">Today's Attendance Status</h3>
                    <div style="position: relative; flex: 1; min-height: 200px;">
                        <canvas id="todayDoughnutChart"></canvas>
                    </div>
                </div>
            `);
        }
        if (state.preferences.includes('classes')) {
            row2.push(`
                <div style="flex: 2; min-width: 400px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">Current Month Attendance by Class</h3>
                    <div style="position: relative; flex: 1; min-height: 200px;">
                        <canvas id="classBarChart"></canvas>
                    </div>
                </div>
            `);
        }
        if (row2.length > 0) {
            html += `<div style="display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">${row2.join('')}</div>`;
        }
        
        let row3 = [];
        if (state.preferences.includes('volume')) {
            row3.push(`
                <div style="flex: 2; min-width: 400px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">Present vs. Absent Volume (30 Days)</h3>
                    <div style="position: relative; flex: 1; min-height: 250px;">
                        <canvas id="volumeChart"></canvas>
                    </div>
                </div>
            `);
        }
        if (state.preferences.includes('dow')) {
            row3.push(`
                <div style="flex: 1; min-width: 300px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">Trends by Day of Week</h3>
                    <div style="position: relative; flex: 1; min-height: 250px;">
                        <canvas id="dayOfWeekChart"></canvas>
                    </div>
                </div>
            `);
        }
        if (row3.length > 0) {
            html += `<div style="display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">${row3.join('')}</div>`;
        }
        
        let row4 = [];
        if (state.preferences.includes('atRisk')) {
            row4.push(`
                <div style="flex: 1; min-width: 400px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">At-Risk Students (Bottom 5)</h3>
                    <div style="position: relative; flex: 1; min-height: 200px;">
                        <canvas id="atRiskChart"></canvas>
                    </div>
                </div>
            `);
        }
        if (state.preferences.includes('absences')) {
            row4.push(`
                <div style="flex: 1; min-width: 300px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">Consecutive Absences Alert</h3>
                    <div id="consecutiveAbsencesList" style="display: flex; flex-direction: column; gap: 12px; overflow-y: auto; max-height: 200px;">
                        <!-- Alerts go here -->
                    </div>
                </div>
            `);
        }
        if (row4.length > 0) {
            html += `<div style="display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">${row4.join('')}</div>`;
        }
        
        let row5 = [];
        if (state.preferences.includes('sixMonth')) {
            row5.push(`
                <div style="flex: 2; min-width: 400px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">6-Month Historical Averages</h3>
                    <div style="position: relative; flex: 1; min-height: 250px;">
                        <canvas id="sixMonthChart"></canvas>
                    </div>
                </div>
            `);
        }
        if (state.preferences.includes('topStudents')) {
            row5.push(`
                <div style="flex: 1; min-width: 300px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">Star Students (Top 5)</h3>
                    <div style="position: relative; flex: 1; min-height: 250px;">
                        <canvas id="topStudentsChart"></canvas>
                    </div>
                </div>
            `);
        }
        if (row5.length > 0) {
            html += `<div style="display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">${row5.join('')}</div>`;
        }

        let row6 = [];
        if (state.preferences.includes('classRadar')) {
            row6.push(`
                <div style="flex: 1; min-width: 400px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 12px; font-size: 1.1rem; color: var(--text-main);">Class Performance Comparison</h3>
                    <div style="position: relative; flex: 1; min-height: 350px; display: flex; justify-content: center;">
                        <canvas id="classRadarChart"></canvas>
                    </div>
                </div>
            `);
        }
        if (row6.length > 0) {
            html += `<div style="display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">${row6.join('')}</div>`;
        }
        
        if (state.preferences.includes('heatmap')) {
            html += `
            <div style="background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 16px 24px; margin-bottom: 32px; overflow-x: auto;">
                <h3 style="margin-bottom: 16px; font-size: 1.1rem; color: var(--text-main);">90-Day Attendance Heatmap</h3>
                <div id="heatmapGrid" class="heatmap-grid">
                    <!-- Heatmap cells go here -->
                </div>
            </div>`;
        }

        container.innerHTML = html;
        
        // Render Chart
        const ctx = document.getElementById('globalChart');
        if (ctx && stats.trend && stats.trend.length > 0) {
            const labels = stats.trend.map(t => {
                const [y, m, d] = t.date.split('-');
                return `${parseInt(m)}/${parseInt(d)}`;
            });
            const dataRates = stats.trend.map(t => parseFloat(t.rate));
            
            if (globalChartInstance) globalChartInstance.destroy();
            
            let gradient = null;
            const canvasCtx = ctx.getContext('2d');
            if(canvasCtx) {
                gradient = canvasCtx.createLinearGradient(0, 0, 0, 160);
                gradient.addColorStop(0, 'rgba(79, 70, 229, 0.4)');
                gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');
            }
            
            globalChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Overall Attendance %',
                        data: dataRates,
                        borderColor: '#4f46e5',
                        backgroundColor: gradient || 'rgba(79, 70, 229, 0.2)',
                        borderWidth: 3,
                        pointBackgroundColor: '#4f46e5',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#4f46e5',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            max: 100, 
                            ticks: { callback: v => v + '%' },
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: { grid: { display: false } }
                    },
                    interaction: { mode: 'index', intersect: false }
                }
            });
        }
        
        // Render Today's Doughnut Chart
        const todayCtx = document.getElementById('todayDoughnutChart');
        if (todayCtx && stats.todayStats) {
            if (window.todayChartInstance) window.todayChartInstance.destroy();
            
            const hasData = stats.todayStats.present > 0 || stats.todayStats.absent > 0;
            
            window.todayChartInstance = new Chart(todayCtx, {
                type: 'doughnut',
                data: {
                    labels: hasData ? ['Present', 'Absent'] : ['No Data'],
                    datasets: [{
                        data: hasData ? [stats.todayStats.present, stats.todayStats.absent] : [1],
                        backgroundColor: hasData ? ['#10B981', '#EF4444'] : ['#E2E8F0'],
                        borderWidth: 0,
                        hoverOffset: hasData ? 4 : 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' },
                        tooltip: { enabled: hasData }
                    },
                    cutout: '70%'
                }
            });
        }

        // Render Class Bar Chart
        const classCtx = document.getElementById('classBarChart');
        if (classCtx && stats.classAttendance) {
            if (window.classChartInstance) window.classChartInstance.destroy();
            
            const classLabels = stats.classAttendance.map(c => c.name);
            const classRates = stats.classAttendance.map(c => parseFloat(c.rate));
            
            window.classChartInstance = new Chart(classCtx, {
                type: 'bar',
                data: {
                    labels: classLabels.length > 0 ? classLabels : ['No Classes'],
                    datasets: [{
                        label: 'Attendance Rate (%)',
                        data: classLabels.length > 0 ? classRates : [0],
                        backgroundColor: 'rgba(79, 70, 229, 0.8)',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            max: 100,
                            ticks: { callback: v => v + '%' },
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
        
        // Render Volume Chart
        const volumeCtx = document.getElementById('volumeChart');
        if (volumeCtx && stats.trend) {
            if (window.volumeChartInstance) window.volumeChartInstance.destroy();
            const labels = stats.trend.map(t => {
                const [y, m, d] = t.date.split('-');
                return `${parseInt(m)}/${parseInt(d)}`;
            });
            const presentData = stats.trend.map(t => t.present);
            const absentData = stats.trend.map(t => t.absent);

            window.volumeChartInstance = new Chart(volumeCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: t('present'), data: presentData, backgroundColor: '#10B981', stack: 'Stack 0' },
                        { label: t('absent'), data: absentData, backgroundColor: '#EF4444', stack: 'Stack 0' }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        x: { stacked: true, grid: { display: false } },
                        y: { stacked: true, beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
                    },
                    plugins: { tooltip: { mode: 'index', intersect: false }, legend: { position: 'bottom' } }
                }
            });
        }

        // Render Day of Week Chart
        const dowCtx = document.getElementById('dayOfWeekChart');
        if (dowCtx && stats.dayOfWeek) {
            if (window.dowChartInstance) window.dowChartInstance.destroy();
            const labels = stats.dayOfWeek.map(d => d.day);
            const data = stats.dayOfWeek.map(d => parseFloat(d.rate));

            window.dowChartInstance = new Chart(dowCtx, {
                type: 'polarArea',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            'rgba(79, 70, 229, 0.6)', 'rgba(59, 130, 246, 0.6)', 
                            'rgba(16, 185, 129, 0.6)', 'rgba(245, 158, 11, 0.6)', 
                            'rgba(239, 68, 68, 0.6)', 'rgba(139, 92, 246, 0.6)', 'rgba(236, 72, 153, 0.6)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'right' } },
                    scales: { r: { min: 0, max: 100, ticks: { display: false } } }
                }
            });
        }

        // Render At-Risk Chart
        const atRiskCtx = document.getElementById('atRiskChart');
        if (atRiskCtx && stats.atRisk) {
            if (window.atRiskChartInstance) window.atRiskChartInstance.destroy();
            const labels = stats.atRisk.map(s => s.name);
            const data = stats.atRisk.map(s => parseFloat(s.rate));

            window.atRiskChartInstance = new Chart(atRiskCtx, {
                type: 'bar',
                data: {
                    labels: labels.length > 0 ? labels : ['No At-Risk Students'],
                    datasets: [{
                        label: 'Attendance Rate (%)',
                        data: labels.length > 0 ? data : [0],
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { min: 0, max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(0,0,0,0.05)' } },
                        y: { grid: { display: false } }
                    }
                }
            });
        }

        // Render Consecutive Absences
        const absencesContainer = document.getElementById('consecutiveAbsencesList');
        if (absencesContainer && stats.consecutiveAbsences) {
            if (stats.consecutiveAbsences.length === 0) {
                absencesContainer.innerHTML = '<div style="color: var(--text-muted); font-style: italic; padding: 12px 0;">No active consecutive absences.</div>';
            } else {
                absencesContainer.innerHTML = stats.consecutiveAbsences.map(s => `
                    <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: #991B1B;">${s.name}</div>
                            <div style="font-size: 0.85rem; color: #DC2626;">${s.className}</div>
                        </div>
                        <div style="background: #EF4444; color: white; padding: 4px 8px; border-radius: 99px; font-size: 0.8rem; font-weight: 700;">
                            ${s.streak} Days
                        </div>
                    </div>
                `).join('');
            }
        }

        // Render Heatmap
        const heatmapContainer = document.getElementById('heatmapGrid');
        if (heatmapContainer && stats.heatmap) {
            heatmapContainer.innerHTML = '';
            stats.heatmap.forEach(h => {
                const rate = parseFloat(h.rate);
                let colorClass = 'heatmap-cell-0';
                if (rate >= 90) colorClass = 'heatmap-cell-4';
                else if (rate >= 75) colorClass = 'heatmap-cell-3';
                else if (rate >= 50) colorClass = 'heatmap-cell-2';
                else if (rate > 0) colorClass = 'heatmap-cell-1';
                
                heatmapContainer.innerHTML += `
                    <div class="heatmap-cell ${colorClass}" title="${h.date}: ${h.rate}%"></div>
                `;
            });
        }
        
        // Render 6-Month Trend
        const ctxSix = document.getElementById('sixMonthChart');
        if (ctxSix && stats.sixMonthTrend) {
            if (window.sixMonthChartInstance) window.sixMonthChartInstance.destroy();
            const labels = stats.sixMonthTrend.map(t => {
                const date = new Date(t.month + '-01');
                return date.toLocaleString('default', { month: 'short', year: 'numeric' });
            });
            const data = stats.sixMonthTrend.map(t => parseFloat(t.rate));
            
            window.sixMonthChartInstance = new Chart(ctxSix, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Avg Attendance %',
                        data: data,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            });
        }

        // Render Top Students
        const ctxTop = document.getElementById('topStudentsChart');
        if (ctxTop && stats.topStudents) {
            if (window.topStudentsChartInstance) window.topStudentsChartInstance.destroy();
            window.topStudentsChartInstance = new Chart(ctxTop, {
                type: 'bar',
                data: {
                    labels: stats.topStudents.map(s => s.name),
                    datasets: [{
                        label: 'Attendance %',
                        data: stats.topStudents.map(s => parseFloat(s.rate)),
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { x: { beginAtZero: true, max: 100 } },
                    plugins: { legend: { display: false } }
                }
            });
        }

        // Render Class Radar
        const ctxRadar = document.getElementById('classRadarChart');
        if (ctxRadar && stats.classRadar) {
            if (window.classRadarChartInstance) window.classRadarChartInstance.destroy();
            window.classRadarChartInstance = new Chart(ctxRadar, {
                type: 'radar',
                data: {
                    labels: stats.classRadar.map(c => c.name),
                    datasets: [{
                        label: 'Attendance Rate',
                        data: stats.classRadar.map(c => parseFloat(c.rate)),
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(139, 92, 246, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { display: true },
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }
                }
            });
        }
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="text-danger">Failed to load global insights</div>`;
    }
}

async function loadClasses() {
    const grid = document.getElementById('classesGrid');
    if(!grid) return;
    
    grid.innerHTML = Array(6).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text" style="width: 40%;"></div>
            <div class="skeleton skeleton-text" style="width: 70%; margin-top: 32px;"></div>
        </div>
    `).join('');

    try {
        const classes = await apiCall('/api/classes');
        classes.sort((a, b) => a.name.localeCompare(b.name));
        state.classes = classes;
        if (classes.length === 0) {
            grid.innerHTML = `<div class="text-muted">No classes found. Create one to get started.</div>`;
            return;
        }
        grid.innerHTML = classes.map(c => `
            <div class="card" onclick="navigate('/class/${c.id}')">
                <div class="card-header">
                    <span class="card-title">${c.name}</span>
                    <span class="badge">${c.studentCount} ${t("students")}</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

function openCreateClassModal() {
    document.getElementById('newClassName').value = '';
    document.getElementById('createClassModal').classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

async function submitCreateClass() {
    const name = document.getElementById('newClassName').value.trim();
    if (!name) return;
    try {
        await apiCall('/api/classes', 'POST', { name });
        closeModal('createClassModal');
        await loadClasses();
    } catch (err) {
        console.error(err);
    }
}

// --- Class View ---
function renderClassView() {
    return `
        <div class="container animate-fade-in" id="classViewContainer">
            <!-- Header populated dynamically -->
        </div>
        
        <!-- Add Student Modal -->
        <div class="modal-overlay" id="addStudentModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${t("addStudentTitle")}</h3>
                    <button class="btn-icon" onclick="closeModal('addStudentModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div class="input-group">
                    <label>${t("studentName")}</label>
                    <input type="text" id="newStudentName" class="input-control" required>
                </div>
                <div class="input-group">
                    <label>${t("email")}</label>
                    <input type="email" id="newStudentEmail" class="input-control" required>
                </div>
                <div class="input-group">
                    <label>${t("contact")}</label>
                    <input type="text" id="newStudentContact" class="input-control" required>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('addStudentModal')">${t("cancel")}</button>
                    <button class="btn btn-primary" onclick="submitAddStudent()">Add</button>
                </div>
            </div>
        </div>
        
        <!-- Edit Student Modal -->
        <div class="modal-overlay" id="editStudentModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${t("editStudent")}</h3>
                    <button class="btn-icon" onclick="closeModal('editStudentModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <input type="hidden" id="editStudentId">
                <div class="input-group">
                    <label>${t("studentName")}</label>
                    <input type="text" id="editStudentName" class="input-control" required>
                </div>
                <div class="input-group">
                    <label>${t("email")}</label>
                    <input type="email" id="editStudentEmail" class="input-control" required>
                </div>
                <div class="input-group">
                    <label>${t("contact")}</label>
                    <input type="text" id="editStudentContact" class="input-control" required>
                </div>
                <div class="modal-footer" style="justify-content:space-between;">
                    <button class="btn btn-danger btn-small" onclick="deleteStudent()">Delete Student</button>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary" onclick="closeModal('editStudentModal')">${t("cancel")}</button>
                        <button class="btn btn-primary" onclick="submitEditStudent()">${t("save")}</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Edit Class Modal -->
        <div class="modal-overlay" id="editClassModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${t("editClass")}</h3>
                    <button class="btn-icon" onclick="closeModal('editClassModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div class="input-group">
                    <label>${t("className")}</label>
                    <input type="text" id="editClassName" class="input-control">
                </div>
                <div class="modal-footer" style="justify-content:space-between;">
                    <button class="btn btn-danger btn-small" onclick="deleteClass()">Delete Class</button>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary" onclick="closeModal('editClassModal')">${t("cancel")}</button>
                        <button class="btn btn-primary" onclick="submitEditClass()">${t("save")}</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Confirm Notifications Modal -->
        <div class="modal-overlay" id="notifyModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Send Absence Alerts</h3>
                    <button class="btn-icon" onclick="closeModal('notifyModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <p class="text-muted mb-4">${t("notifyDesc")} <strong>(${state.todayDate})</strong>.</p>
                <div class="stats-row">
                    <div class="stat-box emails">
                        <div class="stat-val" id="prevEmails">0</div>
                        <div class="stat-label">Emails</div>
                    </div>
                    <div class="stat-box sms">
                        <div class="stat-val" id="prevSms">0</div>
                        <div class="stat-label">SMS Alerts</div>
                    </div>
                    <div class="stat-box calls">
                        <div class="stat-val" id="prevCalls">0</div>
                        <div class="stat-label">Voice Calls</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('notifyModal')">${t("cancel")}</button>
                    <button class="btn btn-primary" onclick="submitNotifications()"><span class="material-symbols-rounded">send</span> ${t("sendAlerts")}</button>
                </div>
            </div>
        </div>

        <!-- Terminal Logs Modal -->
        <div class="modal-overlay" id="terminalModal">
            <div class="modal-content" style="max-width: 800px; width: 90%; background: #1e1e1e; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div class="modal-header" style="border-bottom: 1px solid #333; padding-bottom: 12px; margin-bottom: 0;">
                    <h3 class="modal-title" style="color: #fff; display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-rounded" style="color: #3b82f6;">terminal</span>
                        Background Process Logs
                    </h3>
                    <button class="btn-icon" onclick="closeModal('terminalModal')" style="color: #aaa;"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div id="terminalOutput" style="background: #000; color: #a3a3a3; font-family: 'Courier New', Courier, monospace; font-size: 14px; padding: 16px; height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                    <div style="color: #3b82f6;">&gt; Initializing background task...</div>
                </div>
                <div class="modal-footer" style="border-top: 1px solid #333; margin-top: 0; padding-top: 16px;">
                    <button class="btn btn-secondary" onclick="closeModal('terminalModal')" style="background: #333; color: #fff; border: none;">Close to Background</button>
                </div>
            </div>
        </div>
        <!-- History Logs Modal -->
        <div class="modal-overlay" id="historyModal">
            <div class="modal-content" style="max-width: 900px; width: 95%;">
                <div class="modal-header">
                    <h3 class="modal-title">Notification History</h3>
                    <button class="btn-icon" onclick="closeModal('historyModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Student</th>
                                <th>Action</th>
                                <th>Status</th>
                                <th>System Logs</th>
                                <th>Parent Reason</th>
                            </tr>
                        </thead>
                        <tbody id="historyTableBody">
                            <tr><td colspan="6" style="text-align: center; padding: 24px;">Loading history...</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('historyModal')">Close</button>
                </div>
            </div>
        </div>
        
        <!-- Bulk Import Modal -->
        <div class="modal-overlay" id="bulkImportModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${t("bulkImport")}</h3>
                    <button class="btn-icon" onclick="closeModal('bulkImportModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div class="mb-4">
                    <p class="text-muted mb-4" style="line-height:1.5;">${t("bulkImportDesc")}</p>
                    <div style="background:white; border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden; box-shadow:var(--shadow-sm);">
                        <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                            <thead style="background:#F1F5F9; text-align:left; border-bottom:1px solid var(--border-color);">
                                <tr>
                                    <th style="padding:12px 16px; font-weight:600; color:var(--text-main);">Student Name <span style="color:var(--danger)">*</span></th>
                                    <th style="padding:12px 16px; font-weight:600; color:var(--text-main);">Parent Email</th>
                                    <th style="padding:12px 16px; font-weight:600; color:var(--text-main);">Parent Contact</th>
                                </tr>
                            </thead>
                            <tbody style="color:var(--text-muted);">
                                <tr style="border-bottom:1px solid var(--border-color);">
                                    <td style="padding:12px 16px;">John Doe</td>
                                    <td style="padding:12px 16px;">johns.parent@mail.com</td>
                                    <td style="padding:12px 16px;">1234567890</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 16px;">Jane Smith</td>
                                    <td style="padding:12px 16px;">janes.mom@mail.com</td>
                                    <td style="padding:12px 16px;">0987654321</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer" style="justify-content: flex-end;">
                    <div class="file-upload-wrapper btn btn-primary">
                        <span class="material-symbols-rounded">upload_file</span> Choose Excel File
                        <input type="file" id="bulkImport" accept=".xlsx, .xls" onchange="handleBulkImport(event); closeModal('bulkImportModal');">
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function bindClassView(classId) {
    state.currentClass = state.classes.find(c => c.id == classId) || { id: classId, name: t('loading') };
    
    renderClassContent(true); // render skeleton
    
    if (state.classes.length === 0) {
        const classes = await apiCall('/api/classes');
        state.classes = classes;
        state.currentClass = classes.find(c => c.id == classId);
    }
    
    await loadAttendanceData(classId, state.currentMonth);
    renderClassContent();
}

async function loadAttendanceData(classId, month) {
    try {
        const data = await apiCall(`/api/attendance?classId=${classId}&month=${month}`);
        state.currentStudents = data;
    } catch (err) {
        console.error(err);
    }
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function renderClassContent(isLoading = false) {
    const container = document.getElementById('classViewContainer');
    if (!container) return;
    
    const [year, month] = state.currentMonth.split('-');
    const daysInMonth = getDaysInMonth(parseInt(year), parseInt(month));
    
    let theadDays = '';
    for(let i=1; i<=daysInMonth; i++) {
        const d = new Date(year, month-1, i);
        const dateStr = `${year}-${month}-${i.toString().padStart(2, '0')}`;
        const isWeekend = d.getDay() === 0;
        const isToday = dateStr === state.todayDate;
        
        let thClass = '';
        if(isWeekend) thClass += ' col-weekend';
        if(isToday) thClass += ' col-today';
        
        theadDays += `<th class="${thClass}">${i}</th>`;
    }

    container.innerHTML = `
        <div class="header-actions" style="margin-bottom: 24px; align-items: center;">
            <div style="display:flex; align-items:center; gap: 24px;">
                <div style="display:flex; align-items:center; gap: 16px;">
                    <button class="btn-icon" style="background:var(--surface); border:1px solid var(--border-color);" onclick="navigate('/')" title="Back to Classes"><span class="material-symbols-rounded">arrow_back</span></button>
                    <h2 style="display:flex; align-items:center; gap:8px; margin:0;">
                        ${state.currentClass ? escapeHTML(state.currentClass.name) : t('classView')}
                        <button class="btn-icon" style="font-size:1.2rem; color:var(--text-muted);" onclick="openEditClassModal()" title="Edit Class Name">
                            <span class="material-symbols-rounded" style="font-size:1.2rem;">edit</span>
                        </button>
                    </h2>
                </div>
                <div class="month-nav" style="display:flex; align-items:center; gap:8px; background:var(--surface); padding:6px 12px; border-radius:var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                    <button class="btn-icon" style="padding:4px;" onclick="navigateMonth(-1)"><span class="material-symbols-rounded" style="font-size:1.2rem;">chevron_left</span></button>
                    <span style="font-weight:600; min-width: 130px; text-align:center;">${new Date(parseInt(year), parseInt(month)-1).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button class="btn-icon" style="padding:4px;" onclick="navigateMonth(1)"><span class="material-symbols-rounded" style="font-size:1.2rem;">chevron_right</span></button>
                </div>
                <button id="bgTaskBtn" class="btn btn-outline" style="display:none; color: #3b82f6; border-color: #3b82f6; font-weight: 600;" onclick="document.getElementById('terminalModal').classList.add('active')">
                    <span class="material-symbols-rounded" style="animation: spin 3s linear infinite;">autorenew</span> Task Running
                </button>
            </div>
            
            <div class="flex gap-2">
                <button class="btn btn-secondary" onclick="document.getElementById('addStudentModal').classList.add('active')" title="${t("addStudent")}">
                    <span class="material-symbols-rounded">person_add</span> Add
                </button>
                <button class="btn btn-secondary" onclick="document.getElementById('bulkImportModal').classList.add('active')" title="${t("bulkImport")}">
                    <span class="material-symbols-rounded">upload_file</span> Import
                </button>
                
                <div class="dropdown" style="position:relative; display:inline-block;">
                    <button class="btn btn-secondary" onclick="const m = document.getElementById('exportMenu'); m.style.display = m.style.display === 'block' ? 'none' : 'block'; event.stopPropagation();" title="${t("export")}">
                        <span class="material-symbols-rounded">download</span> Export
                    </button>
                    <div id="exportMenu" class="dropdown-content" style="display:none; position:absolute; right:0; top:100%; background:white; box-shadow:var(--shadow-lg); border-radius:var(--radius-md); border:1px solid var(--border-color); min-width: 150px; z-index:10;">
                        <a href="javascript:void(0)" onclick="exportToCSV()" style="display:block; padding:12px 16px; color:var(--text-main); text-decoration:none;">${t("downloadCsv")}</a>
                        <a href="javascript:void(0)" onclick="exportToExcel()" style="display:block; padding:12px 16px; color:var(--text-main); text-decoration:none;">${t("downloadExcel")}</a>
                        <a href="javascript:void(0)" onclick="exportToPDF()" style="display:block; padding:12px 16px; color:var(--text-main); text-decoration:none;">${t("downloadPdf")}</a>
                    </div>
                </div>
                
                <button class="btn btn-secondary" onclick="openHistoryModal()" title="${t("history")}"><span class="material-symbols-rounded">history</span> ${t("history")}</button>
                <button class="btn btn-primary" onclick="openNotifyModal()" title="${t("notifyParents")}"><span class="material-symbols-rounded">campaign</span> ${t("notify")}</button>
            </div>
        </div>
        
        <div id="chartContainer" class="mb-4" style="background:white; border-radius:var(--radius-lg); padding:24px; border:1px solid var(--border-color); box-shadow:var(--shadow-sm); display:none;">
            <h3 class="mb-4">${t("classInsights")}</h3>
            <div style="position: relative; height: 150px; width: 100%;">
                <canvas id="attendanceChart"></canvas>
            </div>
        </div>

        <div class="spreadsheet-container mt-4" style="${state.currentStudents.length === 0 ? 'border: none; box-shadow: none; overflow: hidden; background: transparent;' : ''}">
            ${isLoading ? `
                <div class="skeleton-card" style="padding: 0;">
                    <div class="skeleton skeleton-chart" style="margin-bottom: 24px;"></div>
                    ${Array(10).fill(0).map(() => `
                        <div class="skeleton-row" style="padding: 0 16px;">
                            <div class="skeleton skeleton-cell" style="flex:2;"></div>
                            <div class="skeleton skeleton-cell"></div>
                            <div class="skeleton skeleton-cell"></div>
                            ${Array(8).fill(0).map(() => `<div class="skeleton skeleton-cell"></div>`).join('')}
                        </div>
                    `).join('')}
                </div>
            ` : state.currentStudents.length === 0 ? `
                <div style="padding: 64px 24px; display:flex; flex-direction:column; align-items:center; background: white; border-radius: var(--radius-lg); border: 2px dashed var(--border-color);">
                    <span class="material-symbols-rounded" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;">person_add</span>
                    <h3 style="margin-bottom: 8px;">No students yet</h3>
                    <p class="text-muted" style="margin-bottom: 24px;">Add your first student to start taking attendance.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('addStudentModal').classList.add('active')">
                        <span class="material-symbols-rounded">add</span> Add Student
                    </button>
                </div>
            ` : `
            <table class="spreadsheet-table">
                <thead>
                    <tr>
                        <th class="sticky-col">Student Name</th>
                        <th class="sticky-col-2">Parent Email</th>
                        <th class="sticky-col-3">Parent Contact</th>
                        ${theadDays}
                        <th class="summary-col summary-col-1">Total Present</th>
                        <th class="summary-col summary-col-2">Total Absent</th>
                        <th class="summary-col summary-col-3">Attendance Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.currentStudents.map(s => {
                        let totalP = 0;
                        let totalA = 0;
                        
                        let tdDays = '';
                        for(let i=1; i<=daysInMonth; i++) {
                            const dateStr = `${year}-${month}-${i.toString().padStart(2, '0')}`;
                            const status = s.attendance[dateStr] || '';
                            if(status === 'P') totalP++;
                            if(status === 'A') totalA++;
                            
                            const d = new Date(year, month-1, i);
                            const isWeekend = d.getDay() === 0;
                            const isToday = dateStr === state.todayDate;
                            
                            let cellClass = 'cell-interactive';
                            if(isWeekend) cellClass += ' col-weekend';
                            if(isToday) cellClass += ' col-today';
                            if(status) cellClass += ` cell-${status}`;
                            
                            tdDays += `<td class="${cellClass}" onclick="toggleCellStatus(${s.student_id}, '${dateStr}', this)">${status}</td>`;
                        }
                        
                        const totalDays = totalP + totalA;
                        const rate = totalDays > 0 ? ((totalP / totalDays) * 100).toFixed(1) + '%' : '0.0%';
                        
                        return `
                            <tr>
                                <td class="sticky-col">
                                    <div style="display:flex; align-items:center; justify-content:space-between;">
                                        <span>${escapeHTML(s.name)}</span>
                                        <button class="edit-student-btn" onclick="openEditStudentModal(${s.student_id})" title="Edit Student">
                                            <span class="material-symbols-rounded" style="font-size:1.1rem; color:var(--text-muted);">edit</span>
                                        </button>
                                    </div>
                                </td>
                                <td class="sticky-col-2">${escapeHTML(s.email) || '-'}</td>
                                <td class="sticky-col-3">${escapeHTML(s.contact) || '-'}</td>
                                ${tdDays}
                                <td class="summary-col summary-col-1 text-center" style="color:var(--success)">${totalP}</td>
                                <td class="summary-col summary-col-2 text-center" style="color:var(--danger)">${totalA}</td>
                                <td class="summary-col summary-col-3 text-center">${rate}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;

    if (!isLoading && state.currentStudents.length > 0) {
        setTimeout(renderClassChart, 50);
    }
}

async function navigateMonth(dir) {
    const d = new Date(state.currentMonth + '-01');
    d.setMonth(d.getMonth() + dir);
    state.currentMonth = d.toISOString().substring(0, 7);
    await loadAttendanceData(state.currentClass.id, state.currentMonth);
    renderClassContent();
}

async function toggleCellStatus(studentId, dateStr, element) {
    const student = state.currentStudents.find(s => s.student_id === studentId);
    if(!student) return;
    
    let current = student.attendance[dateStr];
    let nextStatus = null;
    if(!current) nextStatus = 'P';
    else if(current === 'P') nextStatus = 'A';
    else nextStatus = null;
    
    if(nextStatus) student.attendance[dateStr] = nextStatus;
    else delete student.attendance[dateStr];
    
    if(element) {
        element.innerText = nextStatus || '';
        element.className = element.className.replace(/cell-[PA]/, '').trim();
        if(nextStatus) element.className += ` cell-${nextStatus}`;
        
        const tr = element.closest('tr');
        if(tr) {
            let totalP = 0, totalA = 0;
            const [year, month] = state.currentMonth.split('-');
            const daysInMonth = getDaysInMonth(parseInt(year), parseInt(month));
            for(let i=1; i<=daysInMonth; i++) {
                const dStr = `${year}-${month}-${i.toString().padStart(2, '0')}`;
                const st = student.attendance[dStr];
                if(st === 'P') totalP++;
                if(st === 'A') totalA++;
            }
            const total = totalP + totalA;
            const rate = total > 0 ? ((totalP / total) * 100).toFixed(1) + '%' : '0.0%';
            tr.querySelector('.summary-col-1').innerText = totalP;
            tr.querySelector('.summary-col-2').innerText = totalA;
            tr.querySelector('.summary-col-3').innerText = rate;
        }
    } else {
        renderClassContent();
    }
    
    if(attendanceChartInstance) {
        const [year, month] = state.currentMonth.split('-');
        const daysInMonth = getDaysInMonth(parseInt(year), parseInt(month));
        const dataRates = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dStr = `${year}-${month}-${i.toString().padStart(2, '0')}`;
            let present = 0, total = 0;
            state.currentStudents.forEach(s => {
                const st = s.attendance[dStr];
                if (st === 'P' || st === 'A') total++;
                if (st === 'P') present++;
            });
            let rate = total > 0 ? (present / total) * 100 : 0;
            dataRates.push(rate);
        }
        attendanceChartInstance.data.datasets[0].data = dataRates;
        attendanceChartInstance.update('none');
    }
    
    try {
        await apiCall('/api/attendance', 'POST', { 
            classId: state.currentClass.id, 
            date: dateStr, 
            records: [{ student_id: studentId, status: nextStatus }] 
        });
    } catch (err) {
        console.error('Autosave failed', err);
    }
}

async function submitAddStudent() {
    const name = document.getElementById('newStudentName').value.trim();
    const email = document.getElementById('newStudentEmail').value.trim();
    const contact = document.getElementById('newStudentContact').value.trim();
    if(!name) return showToast('Name is required', 'error');
    if(!email) return showToast('Email is required', 'error');
    if(!contact) return showToast('Contact Number is required', 'error');
    
    if(!contact.startsWith('+91')) {
        return showToast('Please include the +91 prefix in the contact number', 'error');
    }
    
    try {
        await apiCall('/api/students', 'POST', { classId: state.currentClass.id, name, email, contact });
        closeModal('addStudentModal');
        await loadAttendanceData(state.currentClass.id, state.currentMonth);
        renderClassContent();
    } catch(e) { console.error(e); }
}

async function handleBulkImport(e) {
    const file = e.target.files[0];
    if(!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('classId', state.currentClass.id);
    
    try {
        const res = await fetch('/api/students/import', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${state.token}` },
            body: formData
        });
        if(res.ok) {
            showToast('Bulk import successful!');
            await loadAttendanceData(state.currentClass.id, state.currentMonth);
            renderClassContent();
        } else {
            showToast('Bulk import failed', 'error');
        }
    } catch(e) { console.error(e); showToast('An error occurred', 'error'); }
}

async function openNotifyModal() {
    try {
        const res = await apiCall(`/api/notifications/preview?date=${state.todayDate}`);
        document.getElementById('prevEmails').textContent = res.emails;
        document.getElementById('prevSms').textContent = res.sms;
        document.getElementById('prevCalls').textContent = res.calls;
        
        document.getElementById('notifyModal').classList.add('active');
    } catch(e) { console.error(e); }
}

async function submitNotifications() {
    closeModal('notifyModal');
    
    const bgBtn = document.getElementById('bgTaskBtn');
    if (bgBtn) bgBtn.style.display = 'flex';
    
    const terminalOut = document.getElementById('terminalOutput');
    if (terminalOut) {
        terminalOut.innerHTML = `<div style="color: #3b82f6;">&gt; Fetching pending notifications for ${state.todayDate}...</div>`;
    }

    try {
        const pendingRes = await apiCall(`/api/notifications/pending?date=${state.todayDate}`);
        const pendingIds = pendingRes.pending || [];
        
        if (pendingIds.length === 0) {
            if (terminalOut) {
                terminalOut.innerHTML += `<div style="color: #10b981;">&gt; No pending notifications found.</div>`;
            }
            setTimeout(() => {
                if (bgBtn) bgBtn.style.display = 'none';
                showToast('Notifications process completed.');
                showNotificationLogsModal([{studentName: 'N/A', action: 'None', status: 'Info', reason: 'No new absentees to notify today.'}]);
            }, 1000);
            return;
        }

        if (terminalOut) {
            terminalOut.innerHTML += `<div>&gt; Found ${pendingIds.length} students to notify. Beginning process...</div>`;
        }

        const allLogs = [];
        for (let i = 0; i < pendingIds.length; i++) {
            const sid = pendingIds[i];
            try {
                if (terminalOut) {
                    terminalOut.innerHTML += `<div>&gt; Processing student ID ${sid} (${i + 1}/${pendingIds.length})...</div>`;
                    terminalOut.scrollTop = terminalOut.scrollHeight;
                }

                const res = await apiCall('/api/notifications/send-single', 'POST', { date: state.todayDate, student_id: sid });
                
                if (res.logs && res.logs.length > 0) {
                    res.logs.forEach(log => {
                        allLogs.push(log);
                        if (terminalOut) {
                            const color = log.status === 'Success' ? '#10b981' : (log.status === 'Error' ? '#ef4444' : '#a3a3a3');
                            terminalOut.innerHTML += `<div style="color: ${color};">&gt; [${log.status.toUpperCase()}] ${log.action} for ${log.studentName}: ${log.reason}</div>`;
                        }
                    });
                } else {
                    if (terminalOut) {
                        terminalOut.innerHTML += `<div style="color: #f59e0b;">&gt; [SKIPPED] No action required for student ID ${sid} (Missing contact info or not absent).</div>`;
                    }
                }
            } catch (err) {
                if (terminalOut) {
                    terminalOut.innerHTML += `<div style="color: #ef4444;">&gt; [FATAL ERROR] Failed to process student ID ${sid}: ${err.message}</div>`;
                }
            }
            if (terminalOut) terminalOut.scrollTop = terminalOut.scrollHeight;
        }
        
        if (terminalOut) {
            terminalOut.innerHTML += `<div style="color: #10b981; margin-top: 16px;">&gt; Background task completed successfully!</div>`;
            terminalOut.scrollTop = terminalOut.scrollHeight;
        }

        setTimeout(() => {
            if (bgBtn) bgBtn.style.display = 'none';
            closeModal('terminalModal');
            showToast('Notifications process completed.');
            showNotificationLogsModal(allLogs.length > 0 ? allLogs : [{studentName: 'N/A', action: 'None', status: 'Info', reason: 'No new absentees to notify today.'}]);
        }, 1500);

    } catch(e) {
        console.error(e);
        if (terminalOut) {
            terminalOut.innerHTML += `<div style="color: #ef4444;">&gt; [SYSTEM ERROR] Process halted: ${e.message}</div>`;
        }
        showToast('Failed to execute notifications', 'error');
        if (bgBtn) {
            bgBtn.style.display = 'none';
        }
    }
}

function showNotificationLogsModal(logs) {
    let container = document.getElementById('notificationLogsModal');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationLogsModal';
        container.className = 'modal-overlay';
        document.body.appendChild(container);
    }
    
    let tableHtml = `
        <table class="spreadsheet-table" style="width: 100%; text-align: left; margin-top: 16px;">
            <thead>
                <tr>
                    <th style="padding: 12px; background: #F1F5F9;">Student</th>
                    <th style="padding: 12px; background: #F1F5F9;">Action</th>
                    <th style="padding: 12px; background: #F1F5F9;">Status</th>
                    <th style="padding: 12px; background: #F1F5F9;">Details</th>
                </tr>
            </thead>
            <tbody>
                ${logs.map(log => {
                    let statusColor = 'var(--text-main)';
                    if(log.status === 'Success') statusColor = 'var(--success)';
                    if(log.status === 'Skipped') statusColor = 'var(--text-muted)';
                    if(log.status === 'Error') statusColor = 'var(--danger)';
                    
                    return `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px;">${escapeHTML(log.studentName)}</td>
                            <td style="padding: 12px;">${escapeHTML(log.action)}</td>
                            <td style="padding: 12px; font-weight: bold; color: ${statusColor};">${escapeHTML(log.status)}</td>
                            <td style="padding: 12px; color: var(--text-muted);">${escapeHTML(log.reason || '')}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    if (logs.length === 0) {
        tableHtml = '<p class="text-muted mt-4">No notification actions were logged.</p>';
    }

    container.innerHTML = `
        <div class="modal-content" style="max-width: 700px; max-height: 80vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3 class="modal-title">Background Process Logs</h3>
                <button class="btn-icon" onclick="closeModal('notificationLogsModal')"><span class="material-symbols-rounded">close</span></button>
            </div>
            <div style="overflow-y: auto; flex: 1;">
                <p class="text-muted mb-2">Detailed view of the automated notification process for ${state.todayDate}.</p>
                ${tableHtml}
            </div>
            <div class="modal-footer" style="margin-top: 16px;">
                <button class="btn btn-secondary" onclick="closeModal('notificationLogsModal')">Close</button>
            </div>
        </div>
    `;
    
    // Slight delay to allow DOM to render before adding active class for transition
    setTimeout(() => container.classList.add('active'), 10);
}

function openEditClassModal() {
    document.getElementById('editClassName').value = state.currentClass ? state.currentClass.name : '';
    document.getElementById('editClassModal').classList.add('active');
}

async function submitEditClass() {
    const name = document.getElementById('editClassName').value.trim();
    if (!name) return;
    try {
        await apiCall(`/api/classes/${state.currentClass.id}`, 'PUT', { name });
        closeModal('editClassModal');
        state.currentClass.name = name;
        const c = state.classes.find(cls => cls.id === state.currentClass.id);
        if (c) c.name = name;
        renderClassContent();
    } catch(e) { console.error(e); }
}

function openEditStudentModal(id) {
    const student = state.currentStudents.find(s => s.student_id === id);
    if(!student) return;
    document.getElementById('editStudentId').value = id;
    document.getElementById('editStudentName').value = student.name;
    document.getElementById('editStudentEmail').value = student.email || '';
    document.getElementById('editStudentContact').value = student.contact || '';
    document.getElementById('editStudentModal').classList.add('active');
}

async function submitEditStudent() {
    const id = document.getElementById('editStudentId').value;
    const name = document.getElementById('editStudentName').value.trim();
    const email = document.getElementById('editStudentEmail').value.trim();
    const contact = document.getElementById('editStudentContact').value.trim();
    if(!name) return showToast('Name is required', 'error');
    if(!email) return showToast('Email is required', 'error');
    if(!contact) return showToast('Contact Number is required', 'error');
    
    if(!contact.startsWith('+91')) {
        return showToast('Please include the +91 prefix in the contact number', 'error');
    }
    try {
        await apiCall(`/api/students/${id}`, 'PUT', { name, email, contact });
        closeModal('editStudentModal');
        await loadAttendanceData(state.currentClass.id, state.currentMonth);
        renderClassContent();
    } catch(e) { console.error(e); }
}

async function deleteClass() {
    if(!confirm(t('classDeleteConfirm'))) return;
    try {
        await apiCall(`/api/classes/${state.currentClass.id}`, 'DELETE');
        closeModal('editClassModal');
        showToast(t('classDeleted'));
        navigate('/');
    } catch(e) { console.error(e); showToast(t('classDeleteFail'), 'error'); }
}

async function deleteStudent() {
    const id = document.getElementById('editStudentId').value;
    if(!confirm(t('studentDeleteConfirm'))) return;
    try {
        await apiCall(`/api/students/${id}`, 'DELETE');
        closeModal('editStudentModal');
        showToast(t('studentDeleted'));
        await loadAttendanceData(state.currentClass.id, state.currentMonth);
        renderClassContent();
    } catch(e) { console.error(e); showToast(t('studentDeleteFail'), 'error'); }
}

// Init
window.addEventListener('popstate', () => {
    state.currentPath = window.location.pathname;
    render();
});
render();

let attendanceChartInstance = null;
function renderClassChart() {
    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) return;
    chartContainer.style.display = 'block';

    const [year, month] = state.currentMonth.split('-');
    const daysInMonth = getDaysInMonth(parseInt(year), parseInt(month));
    
    const labels = [];
    const dataRates = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
        labels.push(i.toString());
        const dateStr = `${year}-${month}-${i.toString().padStart(2, '0')}`;
        
        let present = 0;
        let total = 0;
        
        state.currentStudents.forEach(s => {
            const st = s.attendance[dateStr];
            if (st === 'P' || st === 'A') total++;
            if (st === 'P') present++;
        });
        
        let rate = total > 0 ? (present / total) * 100 : 0;
        dataRates.push(rate);
    }

    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    if (attendanceChartInstance) {
        attendanceChartInstance.destroy();
    }
    
    attendanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Attendance Rate (%)',
                data: dataRates,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#2563EB',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function exportToCSV() {
    const menu = document.getElementById('exportMenu');
    if (menu) menu.style.display = 'none';
    if (!state.currentClass || state.currentStudents.length === 0) return showToast(t('noData'), 'error');
    
    showToast(t('preparingCsv'), 'success');
    try {
        const res = await fetch(`/api/attendance/export?classId=${state.currentClass.id}&month=${state.currentMonth}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        
        let filename = `${state.currentClass.name.replace(/\s+/g, '_')}_Attendance_${state.currentMonth}.csv`;
        const disposition = res.headers.get('Content-Disposition');
        if (disposition && disposition.indexOf('filename=') !== -1) {
            const matches = /filename="([^"]+)"/.exec(disposition);
            if (matches != null && matches[1]) filename = matches[1];
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch(err) {
        console.error(err);
        showToast(t('failedExport'), 'error');
    }
}

async function fetchExportData() {
    const res = await fetch(`/api/attendance/export?classId=${state.currentClass.id}&month=${state.currentMonth}`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
    });
    if (!res.ok) throw new Error('Export failed');
    return await res.text();
}

function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];
    for (let line of lines) {
        if (!line.trim()) continue;
        const row = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                if (i < line.length - 1 && line[i+1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (line[i] === ',' && !inQuotes) {
                row.push(cur);
                cur = '';
            } else {
                cur += line[i];
            }
        }
        row.push(cur);
        result.push(row);
    }
    return result;
}

async function exportToExcel() {
    const menu = document.getElementById('exportMenu');
    if (menu) menu.style.display = 'none';
    if (!state.currentClass || state.currentStudents.length === 0) return showToast(t('noData'), 'error');
    
    showToast(t('preparingExcel'), 'success');
    try {
        const csvText = await fetchExportData();
        const data = parseCSV(csvText);
        let filename = `${state.currentClass.name.replace(/\s+/g, '_')}_Attendance_${state.currentMonth}.xlsx`;
        
        const wb = window.XLSX.utils.book_new();
        const ws = window.XLSX.utils.aoa_to_sheet(data);
        window.XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        window.XLSX.writeFile(wb, filename);
    } catch(err) {
        console.error(err);
        showToast(t('failedExport'), 'error');
    }
}

async function exportToPDF() {
    const menu = document.getElementById('exportMenu');
    if (menu) menu.style.display = 'none';
    if (!state.currentClass || state.currentStudents.length === 0) return showToast(t('noData'), 'error');
    
    showToast(t('preparingPdf'), 'success');
    try {
        const csvText = await fetchExportData();
        const data = parseCSV(csvText);
        let filename = `${state.currentClass.name.replace(/\s+/g, '_')}_Attendance_${state.currentMonth}.pdf`;
        
        const doc = new window.jspdf.jsPDF('landscape');
        doc.text(`Attendance Report - ${state.currentClass.name} - ${state.currentMonth}`, 14, 15);
        
        doc.autoTable({
            head: [data[0]],
            body: data.slice(1),
            startY: 20,
            styles: { fontSize: 7, cellPadding: 1 },
            headStyles: { fillColor: [66, 66, 66] }
        });
        doc.save(filename);
    } catch(err) {
        console.error(err);
        showToast(t('failedExport'), 'error');
    }
}

window.onclick = function(event) {
  if (!event.target.closest('.dropdown')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.style.display === 'block') {
        openDropdown.style.display = 'none';
      }
    }
  }
}

async function openHistoryModal() {
    document.getElementById('historyModal').classList.add('active');
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px;">Loading history...</td></tr>';
    try {
        const res = await apiCall('/api/notifications/history');
        if (res.logs && res.logs.length > 0) {
            tbody.innerHTML = res.logs.map(log => {
                let statusColor = log.status === 'Success' ? 'var(--success)' : (log.status === 'Error' ? 'var(--danger)' : 'var(--text-main)');
                return `<tr style="border-bottom: 1px solid var(--border-color); background: #fff;">
                    <td style="padding: 12px 16px; white-space: nowrap;">${new Date(log.created_at).toLocaleString()}</td>
                    <td style="padding: 12px 16px;">${escapeHTML(log.studentName)}</td>
                    <td style="padding: 12px 16px;">${escapeHTML(log.action)}</td>
                    <td style="padding: 12px 16px; color: ${statusColor}; font-weight: 500;">${escapeHTML(log.status)}</td>
                    <td style="padding: 12px 16px; font-size: 0.85em; max-width: 300px; word-wrap: break-word;">${escapeHTML(log.reason || '-')}</td>
                    <td style="padding: 12px 16px; font-size: 0.9em; font-style: italic; color: #555;">${escapeHTML(log.parentReason || '-')}</td>
                </tr>`;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px;">No notification history found.</td></tr>';
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 24px;">Error loading history.</td></tr>';
    }
}
