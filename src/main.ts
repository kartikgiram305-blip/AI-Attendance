const app = document.getElementById('app');

const state = {
    username: localStorage.getItem('username') || null,
    currentPath: '/',
    classes: [],
    currentClass: null,
    currentStudents: [],
    
    currentMonth: new Date().toISOString().substring(0, 7),
    todayDate: new Date().toISOString().split('T')[0]
};

// --- API Wrapper ---
async function apiCall(endpoint: string, method = 'GET', body: any = null) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    const options: RequestInit = { method, headers, credentials: 'include' };
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
    localStorage.removeItem('username');
    state.username = null;
    fetch('/api/logout', { method: 'POST' }).finally(() => {
        navigate('/login');
    });
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
    app!.innerHTML = '';
    
    if (state.currentPath === '/login') {
        app.innerHTML = renderLogin();
        bindLogin();
    } else if (state.currentPath === '/') {
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
                body: JSON.stringify({ username: u, password: p }),
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('username', data.username);
                state.username = data.username;
                navigate('/');
            } else {
                document.getElementById('loginError')!.textContent = 'Invalid credentials';
                document.getElementById('loginError')!.style.display = 'block';
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
                    <h2>Global Insights</h2>
                    <p class="text-muted">Overview of attendance across all classes</p>
                </div>
            </div>
            
            <div id="globalDashboardContainer" style="margin-bottom: 48px;">
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

        container.innerHTML = `
            <div style="display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap;">
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
            </div>
        `;
        
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
                    <label>Parent/Student Email</label>
                    <input type="email" id="newStudentEmail" class="input-control" required>
                </div>
                <div class="input-group">
                    <label>Contact Number</label>
                    <input type="text" id="newStudentContact" class="input-control" required>
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
                    <label>Parent/Student Email</label>
                    <input type="email" id="editStudentEmail" class="input-control" required>
                </div>
                <div class="input-group">
                    <label>Contact Number</label>
                    <input type="text" id="editStudentContact" class="input-control" required>
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
                    <h3 class="modal-title">Send Absence Alerts</h3>
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
        
        <!-- Bulk Import Modal -->
        <div class="modal-overlay" id="bulkImportModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Bulk Import Students</h3>
                    <button class="btn-icon" onclick="closeModal('bulkImportModal')"><span class="material-symbols-rounded">close</span></button>
                </div>
                <div class="mb-4">
                    <p class="text-muted mb-4" style="line-height:1.5;">Please upload an Excel file (.xlsx, .xls) containing your student roster. The file must contain the following columns in exactly this format:</p>
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
    state.currentClass = state.classes.find(c => c.id == classId) || { id: classId, name: 'Loading...' };
    
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
                        ${state.currentClass ? escapeHTML(state.currentClass.name) : 'Class View'}
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
            </div>
            
            <div class="flex gap-2">
                <button class="btn btn-secondary" onclick="document.getElementById('addStudentModal').classList.add('active')" title="Add Student">
                    <span class="material-symbols-rounded">person_add</span> Add
                </button>
                <button class="btn btn-secondary" onclick="document.getElementById('bulkImportModal').classList.add('active')" title="Bulk Import (Excel)">
                    <span class="material-symbols-rounded">upload_file</span> Import
                </button>
                
                <div class="dropdown" style="position:relative; display:inline-block;">
                    <button class="btn btn-secondary" onclick="const m = document.getElementById('exportMenu'); m.style.display = m.style.display === 'block' ? 'none' : 'block'; event.stopPropagation();" title="Export Data">
                        <span class="material-symbols-rounded">download</span> Export
                    </button>
                    <div id="exportMenu" class="dropdown-content" style="display:none; position:absolute; right:0; top:100%; background:white; box-shadow:var(--shadow-lg); border-radius:var(--radius-md); border:1px solid var(--border-color); min-width: 150px; z-index:10;">
                        <a href="javascript:void(0)" onclick="exportToCSV()" style="display:block; padding:12px 16px; color:var(--text-main); text-decoration:none;">Download CSV</a>
                        <a href="javascript:void(0)" onclick="exportToExcel()" style="display:block; padding:12px 16px; color:var(--text-main); text-decoration:none;">Download Excel</a>
                        <a href="javascript:void(0)" onclick="exportToPDF()" style="display:block; padding:12px 16px; color:var(--text-main); text-decoration:none;">Download PDF</a>
                    </div>
                </div>
                
                <button class="btn btn-primary" onclick="openNotifyModal()" title="Notify Parents"><span class="material-symbols-rounded">campaign</span> Notify</button>
            </div>
        </div>
        
        <div id="chartContainer" class="mb-4" style="background:white; border-radius:var(--radius-lg); padding:24px; border:1px solid var(--border-color); box-shadow:var(--shadow-sm); display:none;">
            <h3 class="mb-4">Class Insights</h3>
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
    if(!name) return showToast('Name is required', 'error');
    if(!email) return showToast('Email is required', 'error');
    if(!contact) return showToast('Contact Number is required', 'error');
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
    if (!state.currentClass || state.currentStudents.length === 0) return showToast('No data to export', 'error');
    
    showToast('Preparing CSV...', 'success');
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
        showToast('Failed to export', 'error');
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
    if (!state.currentClass || state.currentStudents.length === 0) return showToast('No data to export', 'error');
    
    showToast('Preparing Excel...', 'success');
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
        showToast('Failed to export', 'error');
    }
}

async function exportToPDF() {
    const menu = document.getElementById('exportMenu');
    if (menu) menu.style.display = 'none';
    if (!state.currentClass || state.currentStudents.length === 0) return showToast('No data to export', 'error');
    
    showToast('Preparing PDF...', 'success');
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
        showToast('Failed to export', 'error');
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
