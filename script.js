const app = document.getElementById('app');

const state = {
    token: localStorage.getItem('token') || null,
    username: localStorage.getItem('username') || null,
    currentPath: '/',
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
    state.token = null;
    state.username = null;
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
    
    if (!state.token && state.currentPath !== '/login' && state.currentPath !== '/') {
        navigate('/login');
        return;
    }
    
    if (state.currentPath === '/login') {
        app.innerHTML = renderLogin();
        bindLogin();
    } else if (state.currentPath === '/') {
        if (state.token) {
            navigate('/dashboard');
        } else {
            app.innerHTML = renderLandingPage();
            setTimeout(bindLandingPage, 50); // allow DOM to settle
        }
    } else if (state.currentPath === '/dashboard') {
        app.innerHTML = renderNavbar() + renderDashboard();
        bindDashboard();
    } else if (state.currentPath.startsWith('/class/')) {
        const classId = state.currentPath.split('/')[2];
        app.innerHTML = renderNavbar() + renderClassView();
        bindClassView(classId);
    }
}

// --- Landing Page View ---
function renderLandingPage() {
    return `
        <div class="landing-page animate-fade-in">
            <div class="landing-bg"></div>
            
            <nav class="landing-nav" id="landingNav">
                <div class="navbar-brand">
                    <span class="material-symbols-rounded logo-icon">school</span> Attend<span>AI</span>
                </div>
                <div>
                    <button class="btn btn-secondary" style="margin-right: 12px; background: transparent; border: none; color: white; font-weight: 600;" onclick="navigate('/login')">Log In</button>
                    <button class="btn btn-primary pulse-btn" onclick="navigate('/login')">Get Started</button>
                </div>
            </nav>

            <main class="hero-section">
                <div class="hero-badge scroll-reveal fade-up">🚀 The Future of Classroom Management</div>
                <h1 class="hero-title scroll-reveal fade-up delay-1">Effortless Attendance with AI-Powered Insights</h1>
                <p class="hero-subtitle scroll-reveal fade-up delay-2">Automate your class rosters, instantly notify absentees via Email/SMS, and gain powerful insights with a single click. Designed for modern educators.</p>
                
                <div class="hero-cta scroll-reveal fade-up delay-3">
                    <button class="btn btn-primary pulse-btn" onclick="navigate('/login')">Start for Free</button>
                    <button class="btn btn-secondary" onclick="document.getElementById('features').scrollIntoView({behavior: 'smooth'})">Learn More</button>
                </div>
            </main>

            <section id="features" class="features-section">
                <div class="features-grid">
                    <div class="feature-card scroll-reveal fade-up">
                        <div class="feature-icon blue">
                            <span class="material-symbols-rounded">speed</span>
                        </div>
                        <h3 class="feature-title">Lightning Fast</h3>
                        <p class="feature-desc">Mark attendance for hundreds of students in seconds. Designed for speed so you can focus on teaching.</p>
                    </div>
                    
                    <div class="feature-card scroll-reveal fade-up delay-1">
                        <div class="feature-icon purple">
                            <span class="material-symbols-rounded">notifications_active</span>
                        </div>
                        <h3 class="feature-title">Smart Notifications</h3>
                        <p class="feature-desc">Automatically alert parents and students of absences via Email, SMS, or Voice calls based on absence thresholds.</p>
                    </div>

                    <div class="feature-card scroll-reveal fade-up delay-2">
                        <div class="feature-icon pink">
                            <span class="material-symbols-rounded">upload_file</span>
                        </div>
                        <h3 class="feature-title">Bulk Import</h3>
                        <p class="feature-desc">Upload Excel or CSV files to instantly populate your class rosters. No more manual data entry.</p>
                    </div>
                </div>
            </section>
        </div>
    `;
}

function bindLandingPage() {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
        observer.observe(el);
    });

    // Sticky Navbar
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('landingNav');
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    });
}

// --- Login View ---
function renderLogin() {
    return `
        <div class="auth-container animate-fade-in">
            <div class="auth-card">
                <h1>AttendAI</h1>
                <p class="text-muted mb-4">Please sign in to continue</p>
                <form id="loginForm">
                    <div class="input-group text-left">
                        <label>Username</label>
                        <input type="text" id="username" class="input-control" value="user1" required>
                    </div>
                    <div class="input-group text-left">
                        <label>Password</label>
                        <input type="password" id="password" class="input-control" value="user1" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%; margin-top: 16px;">Sign In</button>
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
                state.token = data.token;
                state.username = data.username;
                navigate('/dashboard');
            } else {
                document.getElementById('loginError').textContent = 'Invalid credentials';
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
            <div class="navbar-brand cursor-pointer" onclick="navigate('/dashboard')">
                <span class="material-symbols-rounded">school</span> Attend<span>AI</span>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-muted text-sm">Welcome, <strong>${state.username}</strong></span>
                <button class="btn-icon" onclick="logout()" title="Logout"><span class="material-symbols-rounded">logout</span></button>
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
                    <h2>Classes Overview</h2>
                    <p class="text-muted">Manage your classes and student rosters</p>
                </div>
                <button class="btn btn-primary" onclick="openCreateClassModal()">
                    <span class="material-symbols-rounded">add</span> New Class
                </button>
            </div>
            <div class="grid" id="classesGrid">
                <!-- Loading -->
            </div>
        </div>
        
        <!-- Create Class Modal -->
        <div class="modal-overlay" id="createClassModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Create New Class</h3>
                    <button class="btn-icon" onclick="closeModal('createClassModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div class="input-group">
                    <label>Class Name</label>
                    <input type="text" id="newClassName" class="input-control" placeholder="e.g. Mathematics 101">
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('createClassModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitCreateClass()">Create</button>
                </div>
            </div>
        </div>
    `;
}

async function bindDashboard() {
    await loadClasses();
}

async function loadClasses() {
    const grid = document.getElementById('classesGrid');
    if(!grid) return;
    try {
        const classes = await apiCall('/api/classes');
        state.classes = classes;
        if (classes.length === 0) {
            grid.innerHTML = `<div class="text-muted">No classes found. Create one to get started.</div>`;
            return;
        }
        grid.innerHTML = classes.map(c => `
            <div class="card" onclick="navigate('/class/${c.id}')">
                <div class="card-header">
                    <span class="card-title">${c.name}</span>
                    <span class="badge">${c.studentCount} Students</span>
                </div>
                <p class="text-muted mt-4" style="font-size: 0.85rem;">Created: ${new Date(c.created_at).toLocaleDateString()}</p>
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
                    <h3 class="modal-title">Add Student</h3>
                    <button class="btn-icon" onclick="closeModal('addStudentModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div class="input-group">
                    <label>Student Name</label>
                    <input type="text" id="newStudentName" class="input-control" required>
                </div>
                <div class="input-group">
                    <label>Parent/Student Email (Optional)</label>
                    <input type="email" id="newStudentEmail" class="input-control">
                </div>
                <div class="input-group">
                    <label>Contact Number (Optional)</label>
                    <input type="text" id="newStudentContact" class="input-control">
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('addStudentModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitAddStudent()">Add</button>
                </div>
            </div>
        </div>
        
        <!-- Edit Student Modal -->
        <div class="modal-overlay" id="editStudentModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Edit Student</h3>
                    <button class="btn-icon" onclick="closeModal('editStudentModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <input type="hidden" id="editStudentId">
                <div class="input-group">
                    <label>Student Name</label>
                    <input type="text" id="editStudentName" class="input-control" required>
                </div>
                <div class="input-group">
                    <label>Parent/Student Email (Optional)</label>
                    <input type="email" id="editStudentEmail" class="input-control">
                </div>
                <div class="input-group">
                    <label>Contact Number (Optional)</label>
                    <input type="text" id="editStudentContact" class="input-control">
                </div>
                <div class="modal-footer" style="justify-content:space-between;">
                    <button class="btn btn-danger btn-small" onclick="deleteStudent()">Delete Student</button>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary" onclick="closeModal('editStudentModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="submitEditStudent()">Save</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Edit Class Modal -->
        <div class="modal-overlay" id="editClassModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Edit Class Name</h3>
                    <button class="btn-icon" onclick="closeModal('editClassModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div class="input-group">
                    <label>Class Name</label>
                    <input type="text" id="editClassName" class="input-control">
                </div>
                <div class="modal-footer" style="justify-content:space-between;">
                    <button class="btn btn-danger btn-small" onclick="deleteClass()">Delete Class</button>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary" onclick="closeModal('editClassModal')">Cancel</button>
                        <button class="btn btn-primary" onclick="submitEditClass()">Save</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Confirm Notifications Modal -->
        <div class="modal-overlay" id="notifyModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Process Notifications</h3>
                    <button class="btn-icon" onclick="closeModal('notifyModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <p class="text-muted mb-4">The following actions will be executed based on the recorded absences for <strong>Today (${state.todayDate})</strong>.</p>
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
                    <button class="btn btn-secondary" onclick="closeModal('notifyModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="submitNotifications()"><span class="material-symbols-rounded">send</span> Send Alerts</button>
                </div>
            </div>
        </div>
    `;
}

async function bindClassView(classId) {
    state.currentClass = state.classes.find(c => c.id == classId) || { id: classId, name: 'Loading...' };
    
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

function renderClassContent() {
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
        <div class="mb-4">
            <button class="btn btn-secondary btn-small" onclick="navigate('/')"><span class="material-symbols-rounded">arrow_back</span> Back to Classes</button>
        </div>
        <div class="header-actions">
            <div>
                <h2 style="display:flex; align-items:center; gap:8px;">
                    ${state.currentClass ? state.currentClass.name : 'Class View'}
                    <button class="btn-icon" style="font-size:1.2rem; color:var(--text-muted);" onclick="openEditClassModal()" title="Edit Class Name">
                        <span class="material-symbols-rounded" style="font-size:1.2rem;">edit</span>
                    </button>
                </h2>
                <p class="text-muted">Take attendance and trigger notifications</p>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-secondary" onclick="document.getElementById('addStudentModal').classList.add('active')">
                    <span class="material-symbols-rounded">person_add</span> Add Student
                </button>
                <div class="file-upload-wrapper btn btn-secondary">
                    <span class="material-symbols-rounded">upload_file</span> Bulk Import (Excel)
                    <input type="file" id="bulkImport" accept=".xlsx" onchange="handleBulkImport(event)">
                </div>
            </div>
        </div>
        
        <div class="flex items-center justify-between mb-4">
            <div class="month-nav" style="display:flex; align-items:center; gap:16px; background:var(--surface); padding:8px 16px; border-radius:var(--radius-lg); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                <button class="btn-icon" onclick="navigateMonth(-1)"><span class="material-symbols-rounded">chevron_left</span></button>
                <span style="font-weight:600; min-width: 140px; text-align:center;">${new Date(parseInt(year), parseInt(month)-1).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button class="btn-icon" onclick="navigateMonth(1)"><span class="material-symbols-rounded">chevron_right</span></button>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-primary" onclick="openNotifyModal()"><span class="material-symbols-rounded">notifications_active</span> Process Notifications</button>
            </div>
        </div>

        <div class="spreadsheet-container mt-4" style="${state.currentStudents.length === 0 ? 'border: none; box-shadow: none; overflow: hidden; background: transparent;' : ''}">
            ${state.currentStudents.length === 0 ? `
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
                        <th class="sticky-col">Parent Email</th>
                        <th class="sticky-col">Parent Contact</th>
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
                            
                            tdDays += `<td class="${cellClass}" onclick="toggleCellStatus(${s.student_id}, '${dateStr}')">${status}</td>`;
                        }
                        
                        const totalDays = totalP + totalA;
                        const rate = totalDays > 0 ? ((totalP / totalDays) * 100).toFixed(1) + '%' : '0.0%';
                        
                        return `
                            <tr>
                                <td class="sticky-col">
                                    <div style="display:flex; align-items:center; justify-content:space-between;">
                                        <span>${s.name}</span>
                                        <button class="edit-student-btn" onclick="openEditStudentModal(${s.student_id})" title="Edit Student">
                                            <span class="material-symbols-rounded" style="font-size:1.1rem; color:var(--text-muted);">edit</span>
                                        </button>
                                    </div>
                                </td>
                                <td class="sticky-col-2">${s.email || '-'}</td>
                                <td class="sticky-col-3">${s.contact || '-'}</td>
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
}

async function navigateMonth(dir) {
    const d = new Date(state.currentMonth + '-01');
    d.setMonth(d.getMonth() + dir);
    state.currentMonth = d.toISOString().substring(0, 7);
    await loadAttendanceData(state.currentClass.id, state.currentMonth);
    renderClassContent();
}

async function toggleCellStatus(studentId, dateStr) {
    const student = state.currentStudents.find(s => s.student_id === studentId);
    if(!student) return;
    
    let current = student.attendance[dateStr];
    let nextStatus = null;
    if(!current) nextStatus = 'P';
    else if(current === 'P') nextStatus = 'A';
    else nextStatus = null;
    
    const scrollContainer = document.querySelector('.spreadsheet-container');
    const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;
    
    // Optimistic update
    if(nextStatus) student.attendance[dateStr] = nextStatus;
    else delete student.attendance[dateStr];
    
    renderClassContent();
    
    const newScrollContainer = document.querySelector('.spreadsheet-container');
    if(newScrollContainer) newScrollContainer.scrollLeft = scrollLeft;
    
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
    const name = document.getElementById('newStudentName').value;
    const email = document.getElementById('newStudentEmail').value;
    const contact = document.getElementById('newStudentContact').value;
    if(!name) return;
    
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
    try {
        await apiCall('/api/notifications/send', 'POST', { date: state.todayDate });
        closeModal('notifyModal');
        showToast('Notifications process initiated for today.');
    } catch(e) { console.error(e); }
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
    if(!name) return;
    try {
        await apiCall(`/api/students/${id}`, 'PUT', { name, email, contact });
        closeModal('editStudentModal');
        await loadAttendanceData(state.currentClass.id, state.currentMonth);
        renderClassContent();
    } catch(e) { console.error(e); }
}

async function deleteClass() {
    if(!confirm('Are you sure you want to delete this class? This cannot be undone.')) return;
    try {
        await apiCall(`/api/classes/${state.currentClass.id}`, 'DELETE');
        closeModal('editClassModal');
        showToast('Class deleted');
        navigate('/');
    } catch(e) { console.error(e); showToast('Failed to delete class', 'error'); }
}

async function deleteStudent() {
    const id = document.getElementById('editStudentId').value;
    if(!confirm('Are you sure you want to delete this student?')) return;
    try {
        await apiCall(`/api/students/${id}`, 'DELETE');
        closeModal('editStudentModal');
        showToast('Student deleted');
        await loadAttendanceData(state.currentClass.id, state.currentMonth);
        renderClassContent();
    } catch(e) { console.error(e); showToast('Failed to delete student', 'error'); }
}

// Init
window.addEventListener('popstate', () => {
    state.currentPath = window.location.pathname;
    render();
});
render();
