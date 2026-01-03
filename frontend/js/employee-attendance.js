// Employee Attendance (DayFlow) - UI only

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
	const content = document.getElementById('attendanceContent');
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

function isoYMD(d) {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function todayISO() {
	return isoYMD(new Date());
}

function fmtMonthLabel(d) {
	return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function fmtDateLabel(iso) {
	const d = new Date(iso + 'T00:00:00');
	return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTimeNow() {
	return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function minutesToHm(totalMinutes) {
	const h = Math.floor(totalMinutes / 60);
	const m = totalMinutes % 60;
	return `${h}h ${pad2(m)}m`;
}

function loadTodayState() {
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

function saveTodayState(state) {
	try {
		localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(state));
	} catch (e) {
		// ignore
	}
}

function deriveIndicator(todayState) {
	if (todayState.checkIn) {
		return { dot: 'online', text: todayState.checkOut ? 'Checked out' : 'Checked in' };
	}
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

function daysInMonth(d) {
	return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function isWeekend(d) {
	const day = d.getDay();
	return day === 0 || day === 6;
}

// Deterministic dummy generator (past days only)
function generateDayRecord(date, seedBase) {
	const weekend = isWeekend(date);
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const seed = seedBase * 97 + day * 13 + month * 31;
	const mod = seed % 100;

	// Leave (working days only): small chance
	if (!weekend && mod >= 8 && mod < 12) {
		return { kind: 'leave' };
	}

	// Absent: higher on Mondays/Fridays
	const dow = date.getDay();
	const absentBias = (dow === 1 || dow === 5) ? 10 : 0;
	if (!weekend && mod < (10 + absentBias)) {
		return { kind: 'absent' };
	}

	// Weekend: no working day record
	if (weekend) {
		return { kind: 'weekend' };
	}

	// Present
	const inHour = 9 + (seed % 2);
	const inMin = 5 + (seed % 50);
	const checkInMins = inHour * 60 + inMin;
	const baseWork = 450 + (seed % 150); // 7.5h–10h
	const checkOutMins = checkInMins + baseWork;
	const outHour = Math.floor(checkOutMins / 60);
	const outMin = checkOutMins % 60;
	const extraMinutes = Math.max(0, baseWork - 480);

	return {
		kind: 'present',
		checkIn: new Date(0, 0, 0, inHour, inMin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
		checkOut: new Date(0, 0, 0, outHour, outMin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
		workMinutes: baseWork,
		extraMinutes
	};
}

const state = {
	month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
	seedBase: 7
};

function renderMonthHeader() {
	const label = document.getElementById('monthLabel');
	if (label) label.textContent = fmtMonthLabel(state.month);
}

function computeMonthRows() {
	const rows = [];
	const year = state.month.getFullYear();
	const month = state.month.getMonth();
	const total = daysInMonth(state.month);
	const today = todayISO();
	const todayState = loadTodayState();
	const now = new Date();

	for (let d = 1; d <= total; d++) {
		const dt = new Date(year, month, d);
		const iso = isoYMD(dt);

		let rec;
		if (iso === today) {
			// Today: only editable via check-in/out
			if (todayState.checkIn) {
				const workMinutes = todayState.checkOut ? 480 : 0;
				rec = {
					kind: 'present',
					checkIn: todayState.checkIn,
					checkOut: todayState.checkOut || '—',
					workMinutes,
					extraMinutes: 0,
					isToday: true
				};
			} else {
				rec = { kind: now.getHours() >= 14 ? 'absent' : 'pending', isToday: true };
			}
		} else if (dt > now) {
			rec = { kind: 'future' };
		} else {
			rec = generateDayRecord(dt, state.seedBase);
		}

		rows.push({ iso, rec, weekend: isWeekend(dt) });
	}

	return rows;
}

function computeSummary(monthRows) {
	let present = 0;
	let absent = 0;
	let leaves = 0;
	let workingDays = 0;

	for (const r of monthRows) {
		if (r.weekend) continue;
		workingDays++;
		if (r.rec.kind === 'present') present++;
		else if (r.rec.kind === 'absent') absent++;
		else if (r.rec.kind === 'leave') leaves++;
	}

	return { present, absent, leaves, workingDays };
}

function setSummary(summary) {
	const p = document.getElementById('daysPresent');
	const a = document.getElementById('daysAbsent');
	const l = document.getElementById('leavesTaken');
	const w = document.getElementById('workingDays');
	if (p) p.textContent = String(summary.present);
	if (a) a.textContent = String(summary.absent);
	if (l) l.textContent = String(summary.leaves);
	if (w) w.textContent = String(summary.workingDays);
}

function setTodayAction(monthRows) {
	const todayInfo = document.getElementById('todayInfo');
	const todayBtn = document.getElementById('todayActionBtn');
	if (!todayInfo || !todayBtn) return;

	const today = todayISO();
	const inMonth = state.month.getFullYear() === new Date().getFullYear() && state.month.getMonth() === new Date().getMonth();
	const isVisible = inMonth;

	if (!isVisible) {
		todayInfo.style.display = 'none';
		todayBtn.style.display = 'none';
		return;
	}

	todayInfo.style.display = 'inline-flex';
	todayBtn.style.display = 'inline-flex';

	const todayState = loadTodayState();
	todayInfo.querySelector('.mono').textContent = fmtDateLabel(today);

	if (!todayState.checkIn) {
		todayBtn.textContent = 'Check In';
		todayBtn.disabled = false;
	} else if (!todayState.checkOut) {
		todayBtn.textContent = 'Check Out';
		todayBtn.disabled = false;
	} else {
		todayBtn.textContent = 'Checked Out';
		todayBtn.disabled = true;
	}
}

function renderTable(monthRows) {
	const body = document.getElementById('attendanceBody');
	if (!body) return;

	const today = todayISO();

	const html = monthRows.map(r => {
		const isToday = r.iso === today;
		const rowClass = isToday ? 'today-row' : '';

		let checkIn = '—';
		let checkOut = '—';
		let work = '0h 00m';
		let extra = '0h 00m';
		let workClass = 'hours-missing';

		if (r.rec.kind === 'present') {
			checkIn = r.rec.checkIn || '—';
			checkOut = r.rec.checkOut || '—';
			work = minutesToHm(r.rec.workMinutes || 0);
			extra = minutesToHm(r.rec.extraMinutes || 0);
			workClass = (r.rec.workMinutes || 0) > 0 ? 'hours-ok' : 'hours-missing';
		} else if (r.rec.kind === 'leave') {
			checkIn = 'Leave';
			checkOut = 'Leave';
			work = '0h 00m';
			extra = '0h 00m';
		} else if (r.rec.kind === 'weekend') {
			checkIn = 'Weekend';
			checkOut = 'Weekend';
		} else if (r.rec.kind === 'future') {
			// keep dashes
		} else if (r.rec.kind === 'pending') {
			// today before 2pm
		} else if (r.rec.kind === 'absent') {
			checkIn = 'Absent';
			checkOut = 'Absent';
		}

		return `
			<tr class="${rowClass}">
				<td class="mono">${fmtDateLabel(r.iso)}${isToday ? '<span class="badge-today">Today</span>' : ''}</td>
				<td class="mono">${checkIn}</td>
				<td class="mono">${checkOut}</td>
				<td class="mono ${workClass}">${work}</td>
				<td class="mono">${extra}</td>
			</tr>
		`;
	}).join('');

	body.innerHTML = html;
}

function renderAll() {
	const name = getUserName();
	const nameEl = document.getElementById('employeeName');
	const avatarEl = document.getElementById('userAvatar');
	if (nameEl) nameEl.textContent = name;
	if (avatarEl) {
		const initials = String(name)
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map(p => p[0].toUpperCase())
			.join('') || 'EU';
		avatarEl.textContent = initials;
	}

	const todayState = loadTodayState();
	const indicator = deriveIndicator(todayState);
	setNavbarIndicator(indicator.dot, indicator.text);

	renderMonthHeader();
	const monthRows = computeMonthRows();
	const summary = computeSummary(monthRows);
	setSummary(summary);
	setTodayAction(monthRows);
	renderTable(monthRows);
}

function stepMonth(delta) {
	const d = new Date(state.month);
	d.setMonth(d.getMonth() + delta);
	d.setDate(1);
	state.month = d;
	renderAll();
}

document.addEventListener('DOMContentLoaded', function () {
	if (typeof requireAuth === 'function') {
		if (!requireAuth()) return;
	}

	if (!enforceEmployeeOnly()) return;

	const prev = document.getElementById('prevMonthBtn');
	const next = document.getElementById('nextMonthBtn');
	if (prev) prev.addEventListener('click', function () { stepMonth(-1); });
	if (next) next.addEventListener('click', function () { stepMonth(1); });

	const todayBtn = document.getElementById('todayActionBtn');
	if (todayBtn) {
		todayBtn.addEventListener('click', function () {
			let s = loadTodayState();
			if (!s.checkIn) {
				s.checkIn = fmtTimeNow();
				saveTodayState(s);
			} else if (!s.checkOut) {
				s.checkOut = fmtTimeNow();
				saveTodayState(s);
			}
			renderAll();
		});
	}

	renderAll();
});
