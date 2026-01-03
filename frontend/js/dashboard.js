// Debug script to ensure employees load
window.addEventListener('load', function() {
	console.log('Page loaded');
	console.log('Employee grid element:', document.getElementById('employeeGrid'));
	console.log('Employees array exists:', typeof employees !== 'undefined');
	if (typeof employees !== 'undefined') {
		console.log('Number of employees:', employees.length);
	}
	// Force render after a short delay
	setTimeout(function() {
		if (typeof renderEmployees === 'function') {
			console.log('Force rendering employees...');
			renderEmployees();
		}
	}, 500);
});
