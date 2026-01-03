// Minimal navbar dropdown handlers (keeps this page standalone)
function toggleDropdown() {
	const menu = document.getElementById('userDropdown');
	if (!menu) return;
	menu.classList.toggle('show');
}

function goToProfile() {
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

// Basic front-end gate: if stored role is employee, block access
function enforceAdminOnly() {
	const banner = document.getElementById('accessBanner');
	const main = document.getElementById('mainCard');
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

	if (role === 'employee') {
		if (banner) banner.style.display = 'block';
		if (main) main.style.display = 'none';
		return false;
	}
	return true;
}

// Dummy data (Admin/HR sees all requests)
const LEAVE_TYPES = {
	paid: 'Paid Time Off',
	sick: 'Sick Time Off'
};

const requests = [
	{ id: 'LVR-1001', name: 'Rajesh Kumar Singh', start: '2026-01-04', end: '2026-01-05', category: 'paid', status: 'pending' },
	{ id: 'LVR-1002', name: 'Priya Sharma', start: '2026-01-10', end: '2026-01-10', category: 'sick', status: 'pending' },
	{ id: 'LVR-1003', name: 'Amit Verma', start: '2026-01-14', end: '2026-01-16', category: 'paid', status: 'approved' },
	{ id: 'LVR-1004', name: 'Neha Gupta', start: '2026-01-07', end: '2026-01-07', category: 'sick', status: 'rejected' },
	{ id: 'LVR-1005', name: 'Karan Mehta', start: '2026-01-21', end: '2026-01-22', category: 'paid', status: 'pending' },
	{ id: 'LVR-1006', name: 'Sara Khan', start: '2026-01-11', end: '2026-01-12', category: 'sick', status: 'pending' }
];

const state = {
	tab: 'paid',
	query: ''
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

function filteredRequests() {
	const q = state.query.trim().toLowerCase();
	return requests.filter(r => {
		if (r.category !== state.tab) return false;
		if (!q) return true;
		return r.name.toLowerCase().includes(q);
	});
}

function setStatus(id, nextStatus) {
	const req = requests.find(r => r.id === id);
	if (!req) return;
	req.status = nextStatus;
	render();
}

function render() {
	const body = document.getElementById('leaveBody');
	if (!body) return;
	const rows = filteredRequests().map(r => {
		const disabled = r.status !== 'pending';
		return `
			<tr>
				<td>${r.name}</td>
				<td class="mono">${fmtDate(r.start)}</td>
				<td class="mono">${fmtDate(r.end)}</td>
				<td>${LEAVE_TYPES[r.category]}</td>
				<td>
					<span class="status-pill ${r.status}">${statusLabel(r.status)}</span>
				</td>
				<td>
					<div class="row-actions">
						<button class="btn-action btn-approve" type="button" ${disabled ? 'disabled' : ''} onclick="setStatus('${r.id}', 'approved')">Approve</button>
						<button class="btn-action btn-reject" type="button" ${disabled ? 'disabled' : ''} onclick="setStatus('${r.id}', 'rejected')">Reject</button>
					</div>
				</td>
			</tr>
		`;
	}).join('');

	body.innerHTML = rows || `
		<tr>
			<td colspan="6" class="empty">No leave requests found.</td>
		</tr>
	`;
}

function setTab(tab) {
	state.tab = tab;
	document.getElementById('tabPaid').classList.toggle('active', tab === 'paid');
	document.getElementById('tabSick').classList.toggle('active', tab === 'sick');
	render();
}

document.addEventListener('DOMContentLoaded', function () {
	if (!enforceAdminOnly()) return;

	document.getElementById('tabPaid').addEventListener('click', () => setTab('paid'));
	document.getElementById('tabSick').addEventListener('click', () => setTab('sick'));

	document.getElementById('searchInput').addEventListener('input', function (e) {
		state.query = e.target.value || '';
		render();
	});

	setTab('paid');
});
