// Minimal navbar dropdown handlers (keeps this page standalone)
function toggleDropdown() {
	const menu = document.getElementById('userDropdown');
	if (!menu) return;
	menu.classList.toggle('show');
}

function goToProfile() {
	// Placeholder: keep same behavior pattern as other pages
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
	const content = document.getElementById('attendanceContent');
	const nav = document.getElementById('attendanceAdminNav');
	const role = getUserRole();
	const allowed = isAdminOrHr(role);

	if (allowed) {
		if (banner) banner.style.display = 'none';
		if (content) content.style.display = 'block';
		if (nav) nav.style.display = 'inline-flex';
		return true;
	}

	if (banner) banner.style.display = 'block';
	if (content) content.style.display = 'none';
	if (nav) nav.style.display = 'none';
	return false;
}

// Attendance data (dummy, generated)
const employees = [
	{ id: 'EMP001', name: 'Rajesh Kumar Singh' },
	{ id: 'EMP002', name: 'Priya Sharma' },
	{ id: 'EMP003', name: 'Amit Verma' },
	{ id: 'EMP004', name: 'Neha Gupta' },
	{ id: 'EMP005', name: 'Karan Mehta' },
	{ id: 'EMP006', name: 'Sara Khan' },
	{ id: 'EMP007', name: 'Vikram Joshi' },
	{ id: 'EMP008', name: 'Ananya Iyer' }
];

const state = {
	view: 'day',
	current: new Date(),
	query: ''
};

function pad2(n) {
	return String(n).padStart(2, '0');
}

function sameYMD(a, b) {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDayLabel(date) {
	return date.toLocaleDateString('en-IN', {
		weekday: 'short',
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
}

function formatMonthLabel(date) {
	return date.toLocaleDateString('en-IN', {
		month: 'long',
		year: 'numeric'
	});
}

function minutesToHm(totalMinutes) {
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	return `${h}h ${pad2(m)}m`;
}

function fmtTime(h, m) {
	const d = new Date();
	d.setHours(h, m, 0, 0);
	return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// Deterministic dummy record generator for a given employee + date
function generateRecord(employeeIndex, date) {
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const dow = date.getDay();

	// Weekend: more likely missing
	const weekend = (dow === 0 || dow === 6);
	const seed = (employeeIndex + 1) * 97 + day * 13 + month * 31;
	const mod = seed % 100;

	// Absent logic
	if (weekend && mod < 65) {
		return { present: false };
	}
	if (!weekend && mod < 12) {
		return { present: false };
	}

	// Partial day logic
	const partial = (!weekend && mod >= 12 && mod < 20);

	// Check-in around 9:00–10:15
	const inHour = 9 + (seed % 2);
	const inMin = 5 + (seed % 70);
	const checkInMins = inHour * 60 + inMin;

	// Work minutes: 6h–10h
	const baseWork = partial ? (360 + (seed % 90)) : (450 + (seed % 150));
	const checkOutMins = checkInMins + baseWork;

	const outHour = Math.floor(checkOutMins / 60);
	const outMin = checkOutMins % 60;

	const extraMinutes = Math.max(0, baseWork - 480); // > 8h

	return {
		present: true,
		partial,
		checkIn: fmtTime(inHour, inMin),
		checkOut: fmtTime(outHour, outMin),
		workMinutes: baseWork,
		extraMinutes
	};
}

function getFilteredEmployees() {
	const q = state.query.trim().toLowerCase();
	if (!q) return employees;
	return employees.filter(e => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
}

function renderDateLabel() {
	const label = document.getElementById('dateLabel');
	if (!label) return;
	label.textContent = state.view === 'day' ? formatDayLabel(state.current) : formatMonthLabel(state.current);
}

function renderDayTable() {
	const body = document.getElementById('attendanceBody');
	if (!body) return;
	const list = getFilteredEmployees();

	const rows = list.map((emp, idx) => {
		const rec = generateRecord(idx, state.current);
		if (!rec.present) {
			return `
				<tr>
					<td>
						${emp.name}
						<span class="status-pill absent">Absent</span>
					</td>
					<td class="time-cell">—</td>
					<td class="time-cell">—</td>
					<td class="hours-cell hours-missing">0h 00m</td>
					<td class="hours-cell hours-missing">0h 00m</td>
				</tr>
			`;
		}

		const workClass = rec.workMinutes >= 480 ? 'hours-ok' : (rec.workMinutes >= 360 ? 'hours-low' : 'hours-missing');
		const statusPill = rec.partial ? '<span class="status-pill partial">Partial</span>' : '';

		return `
			<tr>
				<td>${emp.name} ${statusPill}</td>
				<td class="time-cell">${rec.checkIn}</td>
				<td class="time-cell">${rec.checkOut}</td>
				<td class="hours-cell ${workClass}">${minutesToHm(rec.workMinutes)}</td>
				<td class="hours-cell ${rec.extraMinutes > 0 ? 'hours-ok' : ''}">${minutesToHm(rec.extraMinutes)}</td>
			</tr>
		`;
	}).join('');

	body.innerHTML = rows || `
		<tr>
			<td colspan="5" style="padding: 1.25rem; color: var(--gray);">No employees found.</td>
		</tr>
	`;
}

function daysInMonth(date) {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function renderMonthSummary() {
	const body = document.getElementById('monthBody');
	if (!body) return;

	const list = getFilteredEmployees();
	const totalDays = daysInMonth(state.current);
	const year = state.current.getFullYear();
	const month = state.current.getMonth();

	const rows = list.map((emp, idx) => {
		let workMinutes = 0;
		let extraMinutes = 0;

		for (let d = 1; d <= totalDays; d++) {
			const dt = new Date(year, month, d);
			const rec = generateRecord(idx, dt);
			if (!rec.present) continue;
			workMinutes += rec.workMinutes;
			extraMinutes += rec.extraMinutes;
		}

		return `
			<tr>
				<td>${emp.name}</td>
				<td class="time-cell">—</td>
				<td class="time-cell">—</td>
				<td class="hours-cell ${workMinutes > 0 ? 'hours-ok' : 'hours-missing'}">${minutesToHm(workMinutes)}</td>
				<td class="hours-cell ${extraMinutes > 0 ? 'hours-ok' : ''}">${minutesToHm(extraMinutes)}</td>
			</tr>
		`;
	}).join('');

	body.innerHTML = rows || `
		<tr>
			<td colspan="5" style="padding: 1.25rem; color: var(--gray);">No employees found.</td>
		</tr>
	`;
}

function render() {
	renderDateLabel();
	if (state.view === 'day') {
		renderDayTable();
	} else {
		renderMonthSummary();
	}
}

function setView(view) {
	state.view = view;
	document.getElementById('dayToggle').classList.toggle('active', view === 'day');
	document.getElementById('monthToggle').classList.toggle('active', view === 'month');
	document.getElementById('dayView').classList.toggle('hidden', view !== 'day');
	document.getElementById('monthView').classList.toggle('hidden', view !== 'month');
	render();
}

function stepPrev() {
	const d = new Date(state.current);
	if (state.view === 'day') {
		d.setDate(d.getDate() - 1);
	} else {
		d.setMonth(d.getMonth() - 1);
		d.setDate(1);
	}
	state.current = d;
	render();
}

function stepNext() {
	const d = new Date(state.current);
	if (state.view === 'day') {
		d.setDate(d.getDate() + 1);
	} else {
		d.setMonth(d.getMonth() + 1);
		d.setDate(1);
	}
	state.current = d;
	render();
}

document.addEventListener('DOMContentLoaded', function () {
	if (!enforceAdminOnly()) return;

	// Default: day-wise
	setView('day');

	document.getElementById('prevBtn').addEventListener('click', stepPrev);
	document.getElementById('nextBtn').addEventListener('click', stepNext);

	document.getElementById('dayToggle').addEventListener('click', function () { setView('day'); });
	document.getElementById('monthToggle').addEventListener('click', function () { setView('month'); });

	document.getElementById('searchInput').addEventListener('input', function (e) {
		state.query = e.target.value || '';
		render();
	});

	// If you land here from elsewhere with a date in query params: ?date=2026-01-03
	const params = new URLSearchParams(window.location.search);
	const dateParam = params.get('date');
	if (dateParam) {
		const parsed = new Date(dateParam);
		if (!Number.isNaN(parsed.getTime())) {
			state.current = parsed;
		}
	}

	render();
});
