// Attendance Approval (Admin/HR) - UI only

// Navbar dropdown handlers
function toggleDropdown() {
	const menu = document.getElementById('userDropdown');
	if (!menu) return;
	menu.classList.toggle('show');
}

function goToProfile() {
	// Admin profile placeholder
	window.location.href = 'employee.html';
}

function logout() {
	try {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
	} catch (e) {
		// ignore
	}
	window.location.href = '../auth/login.html';
}

document.addEventListener('click', function (e) {
	const menu = document.getElementById('userDropdown');
	const avatar = document.querySelector('.user-avatar');
	if (!menu || !avatar) return;
	if (!menu.contains(e.target) && !avatar.contains(e.target)) {
		menu.classList.remove('show');
	}
});

// Admin-only gate
function getUserRole() {
	let role = '';
	try {
		const userRaw = localStorage.getItem('user');
		if (userRaw) {
			const user = JSON.parse(userRaw);
			role = String(user.role || user.type || '').toLowerCase();
		}
	} catch (e) {
		role = '';
	}
	return role;
}

function isAdminOrHr(role) {
	return role === 'admin' || role === 'hr';
}

function enforceAdminOnly() {
	const banner = document.getElementById('accessBanner');
	const main = document.getElementById('mainCard');
	const tableCard = document.getElementById('tableCard');
	const note = document.querySelector('.note-card');
	const nav = document.getElementById('attendanceAdminNav');
	const role = getUserRole();
	const allowed = isAdminOrHr(role);

	if (allowed) {
		if (banner) banner.style.display = 'none';
		if (main) main.style.display = 'flex';
		if (tableCard) tableCard.style.display = 'block';
		if (note) note.style.display = 'block';
		if (nav) nav.style.display = 'inline-flex';
		return true;
	}

	if (banner) banner.style.display = 'block';
	if (main) main.style.display = 'none';
	if (tableCard) tableCard.style.display = 'none';
	if (note) note.style.display = 'none';
	if (nav) nav.style.display = 'none';
	return false;
}

// Dummy attendance approvals
const approvals = [
	{ id: 'ATD-2001', name: 'Rajesh Kumar Singh', date: '2026-01-02', inTime: '09:18 AM', outTime: '06:12 PM', workHours: '8h 54m', status: 'pending' },
	{ id: 'ATD-2002', name: 'Priya Sharma', date: '2026-01-02', inTime: '09:05 AM', outTime: '06:01 PM', workHours: '8h 56m', status: 'approved' },
	{ id: 'ATD-2003', name: 'Amit Verma', date: '2026-01-01', inTime: '10:02 AM', outTime: '04:40 PM', workHours: '6h 38m', status: 'pending' },
	{ id: 'ATD-2004', name: 'Neha Gupta', date: '2026-01-01', inTime: '—', outTime: '—', workHours: '0h 00m', status: 'rejected' },
	{ id: 'ATD-2005', name: 'Karan Mehta', date: '2026-01-02', inTime: '09:41 AM', outTime: '05:09 PM', workHours: '7h 28m', status: 'pending' },
	{ id: 'ATD-2006', name: 'Sara Khan', date: '2026-01-03', inTime: '09:12 AM', outTime: '06:22 PM', workHours: '9h 10m', status: 'pending' }
];

const state = {
	query: '',
	date: ''
};

function fmtDate(iso) {
	const d = new Date(iso + 'T00:00:00');
	return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusLabel(status) {
	if (status === 'approved') return 'Approved';
	if (status === 'rejected') return 'Rejected';
	return 'Pending';
}

function filteredApprovals() {
	const q = state.query.trim().toLowerCase();
	const date = state.date;

	return approvals.filter(a => {
		if (date && a.date !== date) return false;
		if (!q) return true;
		return a.name.toLowerCase().includes(q);
	});
}

function setStatus(id, nextStatus) {
	const item = approvals.find(a => a.id === id);
	if (!item) return;
	item.status = nextStatus;
	render();
}

window.setStatus = setStatus;

function render() {
	const body = document.getElementById('approvalBody');
	if (!body) return;

	const rows = filteredApprovals().map(a => {
		const disabled = a.status !== 'pending';
		const inTime = a.inTime || '—';
		const outTime = a.outTime || '—';

		return `
			<tr>
				<td>${a.name}</td>
				<td class="mono">${fmtDate(a.date)}</td>
				<td class="mono">${inTime}</td>
				<td class="mono">${outTime}</td>
				<td class="mono"><strong>${a.workHours}</strong></td>
				<td><span class="status-pill ${a.status}">${statusLabel(a.status)}</span></td>
				<td>
					<div class="row-actions">
						<button class="btn-action btn-approve" type="button" ${disabled ? 'disabled' : ''} onclick="setStatus('${a.id}', 'approved')">Approve</button>
						<button class="btn-action btn-reject" type="button" ${disabled ? 'disabled' : ''} onclick="setStatus('${a.id}', 'rejected')">Reject</button>
					</div>
				</td>
			</tr>
		`;
	}).join('');

	body.innerHTML = rows || `
		<tr>
			<td colspan="7" class="empty">No attendance entries found.</td>
		</tr>
	`;
}

document.addEventListener('DOMContentLoaded', function () {
	if (!enforceAdminOnly()) return;

	const searchInput = document.getElementById('searchInput');
	const dateFilter = document.getElementById('dateFilter');
	const clearDateBtn = document.getElementById('clearDateBtn');

	if (searchInput) {
		searchInput.addEventListener('input', function (e) {
			state.query = e.target.value || '';
			render();
		});
	}

	if (dateFilter) {
		dateFilter.addEventListener('change', function (e) {
			state.date = e.target.value || '';
			render();
		});
	}

	if (clearDateBtn) {
		clearDateBtn.addEventListener('click', function () {
			state.date = '';
			if (dateFilter) dateFilter.value = '';
			render();
		});
	}

	render();
});
