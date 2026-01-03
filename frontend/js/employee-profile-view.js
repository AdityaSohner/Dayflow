// Employee Profile - Admin View (Read-Only)

// Sample Employee Data
const employeeData = {
	id: 1,
	name: "Rajesh Kumar Singh",
	loginId: "EMP001",
	email: "rajesh.kumar@dayflow.com",
	mobile: "+91 98765 43210",
	company: "DayFlow Technologies",
	department: "Engineering",
	manager: "Priya Sharma",
	location: "Bangalore, India",

	// Private Info
	dateOfBirth: "15/03/1994",
	address: "123, MG Road, Bangalore, Karnataka - 560001",
	nationality: "Indian",
	gender: "Male",
	maritalStatus: "Married",
	dateOfJoining: "01/06/2021",

	// Bank Details
	bankAccount: "XXXX-XXXX-1234",
	ifsc: "HDFC0001234",
	bankName: "HDFC Bank, MG Road Branch",

	// IDs
	pan: "ABCDE1234F",
	uan: "123456789012",
	employeeCode: "EMP001",

	// Salary
	monthlyWage: 120000,
	yearlyWage: 1440000,
	workingDaysPerWeek: 5,
	breakTimeHrs: 1,

	// Resume
	aboutMe: "Experienced Senior Developer with 8+ years in full-stack development. Passionate about building scalable applications and mentoring junior developers.",

	jobDescription: "Lead the development team in designing and implementing enterprise-level applications. Responsible for code reviews, architecture decisions, and ensuring best practices.",

	interests: "Coding, Open Source Contribution, Tech Blogging, Chess, Photography",

	skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "MongoDB", "PostgreSQL"],

	certifications: [
		"AWS Certified Solutions Architect",
		"Google Cloud Professional Developer",
		"Certified Scrum Master (CSM)",
		"MongoDB Certified Developer"
	]
};

// Salary Components Calculation
function calculateSalaryBreakdown() {
	const monthly = employeeData.monthlyWage;

	// Earnings
	const basic = Math.round(monthly * 0.40); // 40%
	const hra = Math.round(monthly * 0.20); // 20%
	const standardAllowance = Math.round(monthly * 0.15); // 15%
	const performanceBonus = Math.round(monthly * 0.10); // 10%
	const lta = Math.round(monthly * 0.05); // 5%
	const fixedAllowance = monthly - (basic + hra + standardAllowance + performanceBonus + lta); // Remaining

	const grossSalary = basic + hra + standardAllowance + performanceBonus + lta + fixedAllowance;

	// Deductions
	const pfEmployee = Math.round(basic * 0.12); // 12% of basic
	const pfEmployer = Math.round(basic * 0.12); // 12% of basic (employer contribution)
	const professionalTax = 200; // Fixed

	const totalDeductions = pfEmployee + professionalTax;
	const netSalary = grossSalary - totalDeductions;

	return {
		basic,
		hra,
		standardAllowance,
		performanceBonus,
		lta,
		fixedAllowance,
		grossSalary,
		pfEmployee,
		pfEmployer,
		professionalTax,
		totalDeductions,
		netSalary
	};
}

// Load Employee Data
function loadEmployeeData() {
	const setText = (id, value) => {
		const el = document.getElementById(id);
		if (el) el.textContent = value;
	};
	const setHtml = (id, html) => {
		const el = document.getElementById(id);
		if (el) el.innerHTML = html;
	};

	// Header Info
	setText('empName', employeeData.name);
	setText('empLoginId', employeeData.loginId);
	setText('empEmail', employeeData.email);
	setText('empMobile', employeeData.mobile);
	setText('empCompany', employeeData.company);
	setText('empDepartment', employeeData.department);
	setText('empManager', employeeData.manager);
	setText('empLocation', employeeData.location);

	// Avatar
	const initials = employeeData.name.split(' ').map(n => n[0]).join('').substring(0, 2);
	setText('empAvatar', initials);

	// Resume Tab
	setText('aboutMe', employeeData.aboutMe);
	setText('jobDescription', employeeData.jobDescription);
	setText('interests', employeeData.interests);

	// Skills
	setHtml(
		'skillsList',
		employeeData.skills.map(skill => `<div class="skill-tag">${skill}</div>`).join('')
	);

	// Certifications
	setHtml(
		'certsList',
		employeeData.certifications.map(cert => `<li class="cert-item">${cert}</li>`).join('')
	);

	// Private Info
	setText('dob', employeeData.dateOfBirth);
	setText('address', employeeData.address);
	setText('nationality', employeeData.nationality);
	setText('gender', employeeData.gender);
	setText('maritalStatus', employeeData.maritalStatus);
	setText('joiningDate', employeeData.dateOfJoining);
	setText('bankAccount', employeeData.bankAccount);
	setText('ifsc', employeeData.ifsc);
	setText('bankName', employeeData.bankName);
	setText('pan', employeeData.pan);
	setText('uan', employeeData.uan);
	setText('empCode', employeeData.employeeCode);

	// Salary Info
	loadSalaryInfo();
}

// Load Salary Information
function loadSalaryInfo() {
	const salary = calculateSalaryBreakdown();

	// Overview Cards
	document.getElementById('monthlyWage').textContent = `₹${employeeData.monthlyWage.toLocaleString('en-IN')}`;
	document.getElementById('yearlyWage').textContent = `₹${employeeData.yearlyWage.toLocaleString('en-IN')}`;
	document.getElementById('workingDays').textContent = `${employeeData.workingDaysPerWeek} days/week`;
	document.getElementById('breakTime').textContent = `${employeeData.breakTimeHrs} hour`;

	// Breakdown Table
	document.getElementById('basicSalary').textContent = `₹${salary.basic.toLocaleString('en-IN')}`;
	document.getElementById('hra').textContent = `₹${salary.hra.toLocaleString('en-IN')}`;
	document.getElementById('standardAllowance').textContent = `₹${salary.standardAllowance.toLocaleString('en-IN')}`;
	document.getElementById('performanceBonus').textContent = `₹${salary.performanceBonus.toLocaleString('en-IN')}`;
	document.getElementById('lta').textContent = `₹${salary.lta.toLocaleString('en-IN')}`;
	document.getElementById('fixedAllowance').textContent = `₹${salary.fixedAllowance.toLocaleString('en-IN')}`;
	document.getElementById('grossSalary').textContent = `₹${salary.grossSalary.toLocaleString('en-IN')}`;

	document.getElementById('pfEmployee').textContent = `- ₹${salary.pfEmployee.toLocaleString('en-IN')}`;
	document.getElementById('pfEmployer').textContent = `₹${salary.pfEmployer.toLocaleString('en-IN')} (Employer)`;
	document.getElementById('profTax').textContent = `- ₹${salary.professionalTax.toLocaleString('en-IN')}`;

	document.getElementById('netSalary').textContent = `₹${salary.netSalary.toLocaleString('en-IN')}`;
}

// Tab Switching
function switchTab(tabName, evt) {
	// Remove active class from all tabs
	document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
	document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

	// Add active class to selected tab
	const e = evt || window.event;
	if (e && e.target) {
		e.target.classList.add('active');
	}
	document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
	// Check authentication
	if (typeof requireAuth === 'function') {
		requireAuth();
	}

	// Load employee data
	loadEmployeeData();

	// Get employee ID from URL if present
	const urlParams = new URLSearchParams(window.location.search);
	const empId = urlParams.get('id');
	console.log('Loading profile for employee ID:', empId);
});
