// Tab switching functionality
function switchTab(tabName, evt) {
	// Remove active class from all tabs
	document.querySelectorAll('.tab-button').forEach(btn => {
		btn.classList.remove('active');
	});
	document.querySelectorAll('.tab-pane').forEach(pane => {
		pane.classList.remove('active');
	});

	// Add active class to selected tab
	const e = evt || window.event;
	if (e && e.target) {
		e.target.classList.add('active');
	}
	document.getElementById(tabName + '-tab').classList.add('active');
}

// Toggle dropdown
function toggleDropdown() {
	const dropdown = document.getElementById('userDropdown');
	dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
	const userMenu = document.querySelector('.user-menu');
	const dropdown = document.getElementById('userDropdown');

	if (userMenu && dropdown && !userMenu.contains(event.target)) {
		dropdown.classList.remove('show');
	}
});

// Go to profile
function goToProfile() {
	window.location.href = '../employee/profile.html';
}

// Logout
function logout() {
	if (confirm('Are you sure you want to logout?')) {
		localStorage.removeItem('user');
		window.location.href = '../auth/login.html';
	}
}

// Load employee data from URL parameter
document.addEventListener('DOMContentLoaded', function() {
	// Check authentication
	if (typeof requireAuth === 'function') {
		requireAuth();
	}

	// Get employee ID from URL
	const urlParams = new URLSearchParams(window.location.search);
	const employeeId = urlParams.get('id');

	// In real app, fetch employee data from API
	// For now, using dummy data
	console.log('Loading employee profile for ID:', employeeId);
});
