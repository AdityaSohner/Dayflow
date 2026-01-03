// Admin Dashboard JavaScript

// Dummy employee data
let employees = [
    { id: 1, name: "Rajesh Kumar", role: "Senior Developer", department: "Engineering", status: "present" },
    { id: 2, name: "Priya Sharma", role: "Product Manager", department: "Product", status: "present" },
    { id: 3, name: "Amit Patel", role: "UI/UX Designer", department: "Design", status: "on-leave" },
    { id: 4, name: "Sneha Reddy", role: "HR Manager", department: "Human Resources", status: "present" },
    { id: 5, name: "Vikram Singh", role: "DevOps Engineer", department: "Engineering", status: "present" },
    { id: 6, name: "Ananya Gupta", role: "Marketing Lead", department: "Marketing", status: "present" },
    { id: 7, name: "Rahul Verma", role: "Sales Executive", department: "Sales", status: "absent" },
    { id: 8, name: "Kavya Menon", role: "Content Writer", department: "Marketing", status: "present" },
    { id: 9, name: "Arjun Nair", role: "Backend Developer", department: "Engineering", status: "present" },
    { id: 10, name: "Neha Joshi", role: "QA Engineer", department: "Engineering", status: "on-leave" },
    { id: 11, name: "Sanjay Desai", role: "Business Analyst", department: "Product", status: "present" },
    { id: 12, name: "Meera Iyer", role: "Finance Manager", department: "Finance", status: "present" },
    { id: 13, name: "Karthik Rao", role: "Frontend Developer", department: "Engineering", status: "present" },
    { id: 14, name: "Pooja Malhotra", role: "Recruiter", department: "Human Resources", status: "present" },
    { id: 15, name: "Aditya Chopra", role: "Data Scientist", department: "Engineering", status: "present" },
    { id: 16, name: "Divya Pillai", role: "Customer Success", department: "Support", status: "on-leave" },
];

let filteredEmployees = [...employees];

// Get initials from name
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Generate random gradient for avatar
function getAvatarGradient(index) {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    return gradients[index % gradients.length];
}

// Render employee cards
function renderEmployees(employeesToRender = employees) {
    const grid = document.getElementById('employeeGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (employeesToRender.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>No employees found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    employeesToRender.forEach((emp, index) => {
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.onclick = () => openEmployeeProfile(emp.id);

        // Determine status icon
        let statusIcon = '';
        let statusClass = '';
        if (emp.status === 'present') {
            statusIcon = '<div class="status-dot-present"></div>';
            statusClass = 'present';
        } else if (emp.status === 'on-leave') {
            statusIcon = '✈️';
            statusClass = 'on-leave';
        } else if (emp.status === 'absent') {
            statusIcon = '<div class="status-dot-absent"></div>';
            statusClass = 'absent';
        }

        card.innerHTML = `
            <div class="card-status-indicator ${statusClass}">${statusIcon}</div>
            <div class="employee-avatar" style="background: ${getAvatarGradient(index)}">
                ${getInitials(emp.name)}
            </div>
            <div class="employee-info">
                <div class="employee-name">${emp.name}</div>
                <div class="employee-role">${emp.role}</div>
                <div class="employee-department">${emp.department}</div>
            </div>
        `;

        grid.appendChild(card);
    });

    // Update statspresent
    updateStats();
}

// Update statistics
function updateStats() {
    const totalEmployees = document.getElementById('totalEmployees');
    const activeEmployees = document.getElementById('activeEmployees');
    const onLeave = document.getElementById('onLeave');

    if (totalEmployees) {
        totalEmployees.textContent = employees.length;
    }
    if (activeEmployees) {
        activeEmployees.textContent = employees.filter(e => e.status === 'present').length;
    }
    if (onLeave) {
        onLeave.textContent = employees.filter(e => e.status === 'on-leave').length;
    }
}

// Open employee profile
function openEmployeeProfile(employeeId) {
            window.location.href = `employee.html?id=${employeeId}`;
}

// Toggle user dropdown
function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
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

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        window.location.href = '../auth/login.html';
    }
}

// Search employees
function searchEmployees() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        renderEmployees(employees);
        return;
    }

    const filtered = employees.filter(emp => {
        const nameMatch = emp.name.toLowerCase().includes(searchTerm);
        const idMatch = emp.id.toString().includes(searchTerm);
        const employeeId = `EMP${emp.id.toString().padStart(3, '0')}`;
        const empIdMatch = employeeId.toLowerCase().includes(searchTerm);
        
        return nameMatch || idMatch || empIdMatch;
    });

    renderEmployees(filtered);
}

// Open Add Employee Modal
function openAddEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Close Add Employee Modal
function closeAddEmployeeModal() {
    const modal = document.getElementById('addEmployeeModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        document.getElementById('addEmployeeForm').reset();
    }
}

// Handle Add Employee Form Submit
function handleAddEmployee(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Generate random password
    const randomPassword = generateRandomPassword();

    // Create new employee object
    const newEmployee = {
        id: employees.length + 1,
        name: formData.get('empName'),
        role: formData.get('empRole'),
        department: formData.get('empDepartment'),
        status: formData.get('empStatus'),
        email: formData.get('empEmail'),
        phone: formData.get('empPhone'),
        password: randomPassword
    };

    // Add to employees array
    employees.push(newEmployee);

    // Show success message with password
    alert(`Employee created successfully!\n\nEmployee ID: EMP${newEmployee.id.toString().padStart(3, '0')}\nTemporary Password: ${randomPassword}\n\nPlease share this password with the employee. They will be required to change it on first login.`);

    // Close modal and refresh list
    closeAddEmployeeModal();
    renderEmployees();
}

// Generate random password
function generateRandomPassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addEmployeeModal');
    if (event.target === modal) {
        closeAddEmployeeModal();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (typeof requireAuth === 'function') {
        requireAuth();
    }

    // Render employees with default list
    console.log('Loading employees:', employees.length);
    renderEmployees(employees);
});
