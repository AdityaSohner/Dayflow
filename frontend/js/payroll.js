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

function enforceAdminOnly() {
	const banner = document.getElementById('accessBanner');
	const layout = document.getElementById('payrollLayout');
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
		if (layout) layout.style.display = 'none';
		return false;
	}
	return true;
}

// Dummy employees
const employees = [
	{ id: 'EMP001', name: 'Rajesh Kumar Singh', dept: 'Engineering', loc: 'Bangalore', monthlyWage: 120000 },
	{ id: 'EMP002', name: 'Priya Sharma', dept: 'HR', loc: 'Delhi', monthlyWage: 85000 },
	{ id: 'EMP003', name: 'Amit Verma', dept: 'Finance', loc: 'Mumbai', monthlyWage: 95000 },
	{ id: 'EMP004', name: 'Neha Gupta', dept: 'Design', loc: 'Pune', monthlyWage: 78000 },
	{ id: 'EMP005', name: 'Sara Khan', dept: 'Operations', loc: 'Hyderabad', monthlyWage: 68000 }
];

const PCT = {
	basic: 0.40,
	hra: 0.20,
	allowances: 0.20,
	bonus: 0.10,
	// PF as % of basic
	pfOfBasic: 0.12,
	// Tax as % of gross
	taxOfGross: 0.05
};

function inr(n) {
	return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function calcBreakdown(monthlyWage) {
	const basic = monthlyWage * PCT.basic;
	const hra = monthlyWage * PCT.hra;
	const allowances = monthlyWage * PCT.allowances;
	const bonus = monthlyWage * PCT.bonus;

	// Remaining goes into allowances implicitly? For demo, keep fixed % and treat remainder as additional allowance.
	const earnings = basic + hra + allowances + bonus;
	const remainder = Math.max(0, monthlyWage - earnings);
	const allowancesFinal = allowances + remainder;

	const gross = basic + hra + allowancesFinal + bonus;
	const pf = basic * PCT.pfOfBasic;
	const tax = gross * PCT.taxOfGross;
	const net = gross - (pf + tax);

	return { basic, hra, allowances: allowancesFinal, bonus, pf, tax, net };
}

let selectedId = employees[0]?.id;

function renderEmployeeList() {
	const tbody = document.getElementById('employeeList');
	tbody.innerHTML = employees.map(e => {
		const active = e.id === selectedId ? 'active' : '';
		return `
			<tr class="employee-row ${active}" onclick="selectEmployee('${e.id}')">
				<td>${e.name}<div style="font-size:0.8rem; font-weight:800; opacity:${active ? 0.9 : 0.75};">${e.id}</div></td>
				<td style="text-align:right; font-variant-numeric: tabular-nums; font-weight:900;">${inr(e.monthlyWage)}</td>
			</tr>
		`;
	}).join('');
}

function renderSheet() {
	const emp = employees.find(e => e.id === selectedId) || employees[0];
	if (!emp) return;

	const yearly = emp.monthlyWage * 12;
	const b = calcBreakdown(emp.monthlyWage);

	document.getElementById('sheetTitle').textContent = `Payroll Sheet — ${emp.name}`;
	document.getElementById('sheetSubtitle').textContent = `Read-only calculated salary components (dummy)`;

	document.getElementById('monthlyWage').textContent = inr(emp.monthlyWage);
	document.getElementById('yearlyWage').textContent = inr(yearly);
	document.getElementById('empId').textContent = emp.id;
	document.getElementById('empDept').textContent = emp.dept;
	document.getElementById('empLoc').textContent = emp.loc;

	document.getElementById('basic').textContent = inr(b.basic);
	document.getElementById('hra').textContent = inr(b.hra);
	document.getElementById('allowances').textContent = inr(b.allowances);
	document.getElementById('bonus').textContent = inr(b.bonus);
	document.getElementById('pf').textContent = `- ${inr(b.pf)}`;
	document.getElementById('tax').textContent = `- ${inr(b.tax)}`;
	document.getElementById('netPay').textContent = inr(b.net);
}

function selectEmployee(id) {
	selectedId = id;
	renderEmployeeList();
	renderSheet();
}

window.selectEmployee = selectEmployee;

document.addEventListener('DOMContentLoaded', function () {
	if (!enforceAdminOnly()) return;
	renderEmployeeList();
	renderSheet();
});
