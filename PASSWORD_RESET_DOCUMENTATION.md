# Password Reset Implementation - Dayflow HRMS

## Overview
This implementation provides a complete password reset flow for first-time login users in the Dayflow HRMS system.

## Features

### 1. **Random Password Generation**
- When a company registers or creates a new employee, a secure random password is automatically generated
- Password includes uppercase, lowercase, digits, and special characters
- Minimum 12 characters for security
- Admin receives the temporary password to share with the employee

### 2. **First-Time Login Detection**
- New employees are marked with `is_first_login: true` in the database
- Upon successful login, if `is_first_login` is true, user is automatically redirected to reset password page
- Cannot access other pages until password is reset

### 3. **Password Reset Page**
- Located at: `frontend/pages/auth/reset-password.html`
- Features:
  - Real-time password validation
  - Visual feedback for password requirements
  - Ensures new password is different from temporary password
  - Confirmation field to prevent typos

### 4. **Password Requirements**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Visual indicators show which requirements are met

## File Structure

```
backend/
  app/
    api/
      auth.py          # Authentication endpoints (login, register, reset password)
      employees.py     # Employee management (create with random password)
    
frontend/
  pages/
    auth/
      reset-password.html  # Password reset UI
      login.html          # Login page
  js/
    auth.js            # Authentication logic and first-login detection
```

## API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/register`
Register a new company/admin user
```json
{
  "email": "admin@company.com",
  "company_name": "Company Name",
  "full_name": "Admin Name",
  "phone": "1234567890"
}
```
**Response:**
```json
{
  "message": "Registration successful",
  "email": "admin@company.com",
  "temporary_password": "RandomP@ss123",
  "note": "Please save this password..."
}
```

#### POST `/api/auth/login`
User login
```json
{
  "email_or_id": "EMP001 or user@email.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "EMP001",
    "email": "user@email.com",
    "name": "User Name",
    "role": "employee",
    "is_first_login": true
  }
}
```

#### POST `/api/auth/reset-password`
Reset user password (requires authentication)
```json
{
  "current_password": "old_password",
  "new_password": "new_password"
}
```

### Employee Management (`/api/employees`)

#### POST `/api/employees/`
Create new employee with random password
```json
{
  "email": "employee@company.com",
  "full_name": "Employee Name",
  "department": "Engineering",
  "position": "Developer",
  "phone": "1234567890",
  "salary": 50000
}
```
**Response:**
```json
{
  "message": "Employee created successfully",
  "employee": {
    "employee_id": "ENG0001",
    "email": "employee@company.com",
    "temporary_password": "Random@Pass123",
    "is_first_login": true,
    ...
  },
  "note": "Share the temporary password with the employee..."
}
```

#### POST `/api/employees/{employee_id}/reset-password`
Admin can reset employee password
**Response:**
```json
{
  "message": "Password reset successfully",
  "employee_id": "ENG0001",
  "temporary_password": "NewRandom@Pass456",
  "note": "Employee will be required to reset this password on next login."
}
```

## Flow Diagram

```
1. Company Registration
   ↓
2. Admin Creates Employee → Random Password Generated
   ↓
3. Admin Shares Password with Employee
   ↓
4. Employee Logs In (First Time)
   ↓
5. System Detects is_first_login = true
   ↓
6. Auto-Redirect to Reset Password Page
   ↓
7. Employee Enters Current & New Password
   ↓
8. Password Updated + is_first_login = false
   ↓
9. Redirect to Login Page
   ↓
10. Employee Logs In with New Password
    ↓
11. Access to Dashboard
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **JWT Tokens**: Secure authentication using JSON Web Tokens
3. **Random Password Generation**: Cryptographically secure random passwords
4. **Password Strength Validation**: Enforces strong password requirements
5. **First-Login Flag**: Prevents access until password is changed
6. **Token Expiration**: JWT tokens expire after 30 minutes

## Installation & Setup

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Backend Server
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 3. Open Frontend
Open `frontend/pages/auth/login.html` in your browser

## Usage Example

### Creating an Employee (Admin)
1. Admin logs into the system
2. Goes to Employees page
3. Clicks "Add Employee"
4. Fills in employee details (email, name, department, etc.)
5. System generates random password (e.g., "Xy7#mK9@pL2n")
6. Admin receives the password and shares it with employee via email/chat

### First-Time Login (Employee)
1. Employee opens login page
2. Enters Employee ID/Email and temporary password
3. Clicks "Sign In"
4. System detects first login → Redirects to reset password page
5. Employee enters:
   - Current password (temporary password)
   - New password (meets requirements)
   - Confirm new password
6. Clicks "Reset Password"
7. Password updated successfully
8. Redirected to login page
9. Logs in with new password
10. Can now access the system normally

## Configuration

### Environment Variables (backend/.env)
```env
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql://user:password@localhost/dbname
```

### Frontend API Configuration (frontend/js/auth.js)
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## TODO / Future Enhancements

1. **Database Integration**: Connect to actual database (currently using dummy data)
2. **Email Notifications**: Send temporary password via email
3. **Password Reset via Email**: Forgot password functionality
4. **Password History**: Prevent reusing old passwords
5. **Account Lockout**: Lock account after multiple failed attempts
6. **Two-Factor Authentication**: Add 2FA for enhanced security
7. **Password Expiration**: Force password change every 90 days
8. **Audit Logging**: Log all password changes and login attempts

## Testing

### Test the Flow
1. Register a new company (get temporary password)
2. Login with temporary password
3. Should redirect to reset password page
4. Reset password successfully
5. Login with new password
6. Should access dashboard

### API Testing with curl

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_id":"test@example.com","password":"temp123"}'
```

**Reset Password:**
```bash
curl -X POST http://localhost:8000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"current_password":"temp123","new_password":"NewPass123!"}'
```

## Troubleshooting

**Issue**: "Session expired" error
- **Solution**: Login again to get a new token

**Issue**: Password reset doesn't work
- **Solution**: Ensure backend server is running and CORS is enabled

**Issue**: Not redirecting to reset password page
- **Solution**: Check browser console for errors, verify `is_first_login` flag

## Support

For issues or questions, please contact the development team.

---
**Version**: 1.0  
**Last Updated**: January 2026  
**Author**: Dayflow Development Team
