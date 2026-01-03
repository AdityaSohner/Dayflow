// Authentication utilities
const API_BASE_URL = 'http://localhost:8000/api';

// Check if user is authenticated
function isAuthenticated() {
    const user = localStorage.getItem('user');
    return !!user;
}

// Get user data from localStorage
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Logout user
function logout() {
    localStorage.removeItem('user');
    window.location.href = '/frontend/pages/auth/login.html';
}

// Check if user needs to reset password on first login
function checkFirstLogin() {
    const user = getCurrentUser();
    if (user && user.is_first_login) {
        // Redirect to reset password page
        const currentPath = window.location.pathname;
        const resetPasswordPath = '/frontend/pages/auth/reset-password.html';
        
        // Don't redirect if already on reset password page or login/register pages
        if (!currentPath.includes('reset-password.html') && 
            !currentPath.includes('login.html') && 
            !currentPath.includes('register.html')) {
            window.location.href = resetPasswordPath;
            return true;
        }
    }
    return false;
}

// Protect pages that require authentication
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/frontend/pages/auth/login.html';
        return false;
    }
    
    // Check if first login
    checkFirstLogin();
    return true;
}

// Handle login form
async function handleLogin(email_or_id, password) {
    // Demo credentials for testing (remove in production)
    const demoUsers = {
        'admin@dayflow.com': { password: 'admin123', role: 'admin', name: 'Admin User', is_first_login: false },
        'admin': { password: 'admin123', role: 'admin', name: 'Admin User', is_first_login: false },
        'hr@dayflow.com': { password: 'hr123', role: 'hr', name: 'HR Manager', is_first_login: false },
        'employee@dayflow.com': { password: 'emp123', role: 'employee', name: 'Employee User', is_first_login: false },
        'EMP001': { password: 'temp123', role: 'employee', name: 'New Employee', is_first_login: false }
    };

    // Check demo credentials first (for testing without backend)
    if (demoUsers[email_or_id]) {
        const user = demoUsers[email_or_id];
        if (user.password === password) {
            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify({
                id: email_or_id,
                email: email_or_id,
                name: user.name,
                role: user.role,
                is_first_login: user.is_first_login,
                token: 'demo_token_' + Date.now()
            }));

            // Check if first login
            if (user.is_first_login) {
                window.location.href = '/frontend/pages/auth/reset-password.html';
            } else {
                // Redirect based on role
                if (user.role === 'admin' || user.role === 'hr') {
                    window.location.href = '/frontend/pages/admin/dashboard.html';
                } else {
                    window.location.href = '/frontend/pages/employee/dashboard.html';
                }
            }
            return { success: true };
        } else {
            return { 
                success: false, 
                error: 'Incorrect password'
            };
        }
    }

    // If not demo user, try API call
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email_or_id: email_or_id,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Save user data and token to localStorage
            localStorage.setItem('user', JSON.stringify({
                ...data.user,
                token: data.access_token
            }));

            // Check if first login
            if (data.user.is_first_login) {
                // Redirect to reset password page
                window.location.href = '/frontend/pages/auth/reset-password.html';
            } else {
                // Redirect based on role
                if (data.user.role === 'admin' || data.user.role === 'hr') {
                    window.location.href = '/frontend/pages/admin/dashboard.html';
                } else {
                    window.location.href = '/frontend/pages/employee/dashboard.html';
                }
            }
            return { success: true };
        } else {
            return { 
                success: false, 
                error: data.detail || 'Login failed'
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { 
            success: false, 
            error: 'Invalid credentials. Use demo credentials or start backend server.'
        };
    }
}

// Handle registration
async function handleRegister(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            return { 
                success: true, 
                data: data 
            };
        } else {
            return { 
                success: false, 
                error: data.detail || 'Registration failed'
            };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { 
            success: false, 
            error: 'Network error. Please try again.'
        };
    }
}

// Handle password reset
async function handlePasswordReset(currentPassword, newPassword) {
    const user = getCurrentUser();
    
    if (!user || !user.token) {
        return { 
            success: false, 
            error: 'Not authenticated' 
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Clear user data and redirect to login
            localStorage.removeItem('user');
            return { 
                success: true, 
                message: 'Password reset successfully' 
            };
        } else {
            return { 
                success: false, 
                error: data.detail || 'Password reset failed'
            };
        }
    } catch (error) {
        console.error('Password reset error:', error);
        return { 
            success: false, 
            error: 'Network error. Please try again.'
        };
    }
}

// Initialize login page
document.addEventListener('DOMContentLoaded', function() {
    // Check if on login page
    if (window.location.pathname.includes('login.html')) {
        const loginForm = document.getElementById('login-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const emailOrId = document.getElementById('email-phone').value;
                const password = document.getElementById('pass').value;
                
                const result = await handleLogin(emailOrId, password);
                
                if (!result.success) {
                    alert(result.error);
                }
            });
        }
    }
    
    // Check if on register page
    if (window.location.pathname.includes('register.html')) {
        const registerForm = document.getElementById('register-form');
        
        if (registerForm) {
            registerForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(registerForm);
                const userData = {
                    email: formData.get('email'),
                    company_name: formData.get('company_name'),
                    full_name: formData.get('full_name'),
                    phone: formData.get('phone')
                };
                
                const result = await handleRegister(userData);
                
                if (result.success) {
                    alert(`Registration successful! Your temporary password is: ${result.data.temporary_password}\n\nPlease save this password. You will be required to reset it on first login.`);
                    window.location.href = 'login.html';
                } else {
                    alert(result.error);
                }
            });
        }
    }
    
    // Check authentication on protected pages
    const protectedPaths = ['/admin/', '/employee/'];
    const currentPath = window.location.pathname;
    
    if (protectedPaths.some(path => currentPath.includes(path))) {
        requireAuth();
    }
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isAuthenticated,
        getCurrentUser,
        logout,
        checkFirstLogin,
        requireAuth,
        handleLogin,
        handleRegister,
        handlePasswordReset
    };
}
