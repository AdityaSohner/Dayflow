from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import secrets
import string

router = APIRouter()

# Pydantic models
class EmployeeCreate(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    department: str
    position: str
    employee_id: Optional[str] = None
    salary: Optional[float] = None
    join_date: Optional[str] = None

class EmployeeResponse(BaseModel):
    id: str
    employee_id: str
    email: EmailStr
    full_name: str
    phone: Optional[str]
    department: str
    position: str
    salary: Optional[float]
    join_date: str
    temporary_password: str
    is_active: bool
    is_first_login: bool
    created_at: datetime

class EmployeeUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    salary: Optional[float] = None
    is_active: Optional[bool] = None

# Helper functions
def generate_random_password(length: int = 12) -> str:
    """
    Generate a secure random password for new employees
    Password includes uppercase, lowercase, digits, and special characters
    """
    # Ensure password has at least one of each required character type
    password_chars = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice(string.punctuation)
    ]
    
    # Fill the rest with random characters
    all_chars = string.ascii_letters + string.digits + string.punctuation
    password_chars.extend(secrets.choice(all_chars) for _ in range(length - 4))
    
    # Shuffle the password characters
    secrets.SystemRandom().shuffle(password_chars)
    
    return ''.join(password_chars)

def generate_employee_id(department: str) -> str:
    """Generate unique employee ID based on department"""
    # Get department prefix (first 3 letters)
    dept_prefix = department[:3].upper()
    
    # TODO: Get count from database to generate sequential number
    # For now, using random number
    random_num = secrets.randbelow(9999)
    
    return f"{dept_prefix}{random_num:04d}"

# Routes
@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    """
    Create a new employee with random password
    Admin will receive the temporary password to share with employee
    """
    try:
        # Generate employee ID if not provided
        if not employee.employee_id:
            employee_id = generate_employee_id(employee.department)
        else:
            employee_id = employee.employee_id
        
        # Generate random temporary password
        temporary_password = generate_random_password()
        
        # TODO: Hash password before storing
        # from auth import get_password_hash
        # hashed_password = get_password_hash(temporary_password)
        
        # TODO: Save employee to database with:
        # - hashed_password
        # - is_first_login = True
        # - is_active = True
        # - created_at = datetime.now()
        
        employee_data = {
            "id": f"emp_{secrets.token_hex(8)}",
            "employee_id": employee_id,
            "email": employee.email,
            "full_name": employee.full_name,
            "phone": employee.phone,
            "department": employee.department,
            "position": employee.position,
            "salary": employee.salary,
            "join_date": employee.join_date or datetime.now().strftime("%Y-%m-%d"),
            "temporary_password": temporary_password,
            "is_active": True,
            "is_first_login": True,
            "created_at": datetime.now().isoformat()
        }
        
        return {
            "message": "Employee created successfully",
            "employee": employee_data,
            "note": "Share the temporary password with the employee. They will be required to reset it on first login."
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create employee: {str(e)}"
        )

@router.get("/", response_model=List[dict])
async def get_all_employees():
    """Get all employees"""
    try:
        # TODO: Query database for all employees
        # For now, return empty list
        return []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch employees: {str(e)}"
        )

@router.get("/{employee_id}", response_model=dict)
async def get_employee(employee_id: str):
    """Get employee by ID"""
    try:
        # TODO: Query database for employee
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch employee: {str(e)}"
        )

@router.put("/{employee_id}", response_model=dict)
async def update_employee(employee_id: str, employee: EmployeeUpdate):
    """Update employee information"""
    try:
        # TODO: Update employee in database
        return {
            "message": "Employee updated successfully",
            "employee_id": employee_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update employee: {str(e)}"
        )

@router.delete("/{employee_id}", response_model=dict)
async def delete_employee(employee_id: str):
    """Delete/deactivate employee"""
    try:
        # TODO: Soft delete employee in database (set is_active=False)
        return {
            "message": "Employee deleted successfully",
            "employee_id": employee_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete employee: {str(e)}"
        )

@router.post("/{employee_id}/reset-password", response_model=dict)
async def admin_reset_employee_password(employee_id: str):
    """
    Admin can reset employee password
    Generates new random password and marks as first login
    """
    try:
        # Generate new random password
        new_password = generate_random_password()
        
        # TODO: Hash and update password in database
        # Also set is_first_login = True
        
        return {
            "message": "Password reset successfully",
            "employee_id": employee_id,
            "temporary_password": new_password,
            "note": "Employee will be required to reset this password on next login."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {str(e)}"
        )
