// Employee Dashboard (DayFlow) - UI only

function toggleDropdown() {
	const menu = document.getElementById('userDropdown');
	if (!menu) return;
	menu.classList.toggle('show');
}

function goToProfile() {
	window.location.href = 'profile.html';
}

function logout() {
	try {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
	} catch (e) {
		// ignore
	}
	window.location.href = '/frontend/pages/auth/login.html';
}

document.addEventListener('click', function (e) {
	const menu = document.getElementById('userDropdown');
	const avatar = document.querySelector('.user-avatar');
	if (!menu || !avatar) return;
	if (!menu.contains(e.target) && !avatar.contains(e.target)) {
		menu.classList.remove('show');
	}
});

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

function getUserName() {
	try {
		const userRaw = localStorage.getItem('user');
		if (!userRaw) return 'Employee';
		const user = JSON.parse(userRaw);
		return user.name || user.full_name || user.username || 'Employee';
	} catch (e) {
		return 'Employee';
	}
}

function enforceEmployeeOnly() {
	const banner = document.getElementById('accessBanner');
	const content = document.getElementById('employeeDashboardContent');
	const role = getUserRole();

	if (role !== 'employee') {
		if (banner) banner.style.display = 'block';
		if (content) content.style.display = 'none';
		return false;
	}

	if (banner) banner.style.display = 'none';
	if (content) content.style.display = 'block';
	return true;
}

const ATTENDANCE_KEY = 'dayflow.employeeAttendance';

function pad2(n) {
	return String(n).padStart(2, '0');
}

function todayISO() {
	const d = new Date();
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fmtTodayLong() {
	return new Date().toLocaleDateString('en-IN', {
		weekday: 'long',
		year: 'numeric',
		month: 'short',
		day: '2-digit'
	});
}

function fmtTimeNow() {
	return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function loadAttendanceState() {
	const iso = todayISO();
	try {
		const raw = localStorage.getItem(ATTENDANCE_KEY);
		if (!raw) return { date: iso, checkIn: '', checkOut: '' };
		const parsed = JSON.parse(raw);
		if (!parsed || parsed.date !== iso) return { date: iso, checkIn: '', checkOut: '' };
		return {
			date: iso,
			checkIn: String(parsed.checkIn || ''),
			checkOut: String(parsed.checkOut || '')
		};
	} catch (e) {
		return { date: iso, checkIn: '', checkOut: '' };
	}
}

function saveAttendanceState(state) {
	try {
		localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(state));
	} catch (e) {
		// ignore
	}
}

function deriveIndicator(state) {
	// Red: not checked in
	// Green: checked in (or checked out)
	// Yellow: absent (no leave applied) - demo-only heuristic
	if (state.checkIn) {
		return { dot: 'online', text: state.checkOut ? 'Checked out' : 'Checked in' };
	}

	// Optional: show Absent later in the day if still no check-in (UI only)
	const now = new Date();
	if (now.getHours() >= 14) {
		return { dot: 'away', text: 'Absent' };
	}

	return { dot: 'offline', text: 'Not checked in' };
}

function setNavbarIndicator(dotClass, text) {
	const dot = document.getElementById('attendanceStatusDot');
	const label = document.getElementById('attendanceStatusText');
	if (dot) {
		dot.classList.remove('online', 'away', 'offline');
		dot.classList.add(dotClass);
	}
	if (label) label.textContent = text;
}

function setAttendanceCard(state) {
	const statusEl = document.getElementById('todayStatus');
	const inEl = document.getElementById('todayCheckIn');
	const outEl = document.getElementById('todayCheckOut');
	const btn = document.getElementById('attendanceActionBtn');

	const indicator = deriveIndicator(state);
	if (statusEl) statusEl.textContent = indicator.text;
	if (inEl) inEl.textContent = state.checkIn || '—';
	if (outEl) outEl.textContent = state.checkOut || '—';

	if (!btn) return;
	btn.disabled = false;

	if (!state.checkIn) {
		btn.textContent = 'Check In';
	} else if (!state.checkOut) {
		btn.textContent = 'Check Out';
	} else {
		btn.textContent = 'Checked Out';
		btn.disabled = true;
	}
}

function setStaticCards() {
	const wageEl = document.getElementById('monthlyWage');
	const salaryEl = document.getElementById('lastSalaryDate');
	const paidEl = document.getElementById('paidLeave');
	const sickEl = document.getElementById('sickLeave');

	if (wageEl) wageEl.textContent = '₹45,000';
	if (salaryEl) salaryEl.textContent = '31 Dec 2025';
	if (paidEl) paidEl.textContent = '8 days';
	if (sickEl) sickEl.textContent = '4 days';
}

document.addEventListener('DOMContentLoaded', function () {
	if (typeof requireAuth === 'function') {
		if (!requireAuth()) return;
	}

	if (!enforceEmployeeOnly()) return;

	const name = getUserName();
	const nameEl = document.getElementById('employeeName');
	const avatarEl = document.getElementById('userAvatar');
	const dateEl = document.getElementById('todayDate');

	if (nameEl) nameEl.textContent = name;
	if (dateEl) dateEl.textContent = fmtTodayLong();

	if (avatarEl) {
		const initials = String(name)
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map(p => p[0].toUpperCase())
			.join('') || 'EU';
		avatarEl.textContent = initials;
	}

	setStaticCards();

	let attendance = loadAttendanceState();
	const indicator = deriveIndicator(attendance);
	setNavbarIndicator(indicator.dot, indicator.text);
	setAttendanceCard(attendance);

	const actionBtn = document.getElementById('attendanceActionBtn');
	if (actionBtn) {
		actionBtn.addEventListener('click', function () {
			attendance = loadAttendanceState();
			if (!attendance.checkIn) {
				attendance.checkIn = fmtTimeNow();
				saveAttendanceState(attendance);
			} else if (!attendance.checkOut) {
				attendance.checkOut = fmtTimeNow();
				saveAttendanceState(attendance);
			}

			const nextIndicator = deriveIndicator(attendance);
			setNavbarIndicator(nextIndicator.dot, nextIndicator.text);
			setAttendanceCard(attendance);
		});
	}

	const payrollBtn = document.getElementById('viewPayrollBtn');
	if (payrollBtn) {
		payrollBtn.addEventListener('click', function () {
			window.location.href = 'payroll.html';
		});
	}

	const leaveBtn = document.getElementById('requestLeaveBtn');
	if (leaveBtn) {
		leaveBtn.addEventListener('click', function () {
			window.location.href = 'leave.html';
		});
	}
});
