from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.models.employee import EmployeeProfile
import random

router = APIRouter()


# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Helper ----------------
def get_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    return user


# ---------------- HR Creates Employee ----------------
@router.post("/")
def create_employee(
    user_id: int,            # HR user_id
    email: str,
    full_name: str,
    password: str,
    db: Session = Depends(get_db)
):
    hr = get_user(db, user_id)

    if hr.role != "admin":
        raise HTTPException(status_code=403, detail="Only HR can create employees")

    # Check if employee already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Employee already exists")

    employee = User(
        company_id=hr.company_id,
        email=email,
        full_name=full_name,
        hashed_password=hash_password(password),
        role="employee",
        is_active=True
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    employee_profile = EmployeeProfile(
    user_id=employee.id,
    company_id=hr.company_id,
    employee_code=f"EMP{random.randint(1000,9999)}",
    full_name=full_name,
    department="General",
    job_title="Employee",
    salary=0,
    year_of_joining=2024
)

    db.add(employee_profile)
    db.commit()

    return {
        "message": "Employee created successfully",
        "employee_id": employee.id
    }


# ---------------- HR Views All Employees ----------------
@router.get("/")
def list_employees(
    user_id: int,
    db: Session = Depends(get_db)
):
    hr = get_user(db, user_id)

    if hr.role != "admin":
        raise HTTPException(status_code=403, detail="Only HR can view employees")

    employees = db.query(User).filter(
        User.company_id == hr.company_id,
        User.role == "employee"
    ).all()

    return [
        {
            "id": emp.id,
            "full_name": emp.full_name,
            "email": emp.email,
            "is_active": emp.is_active
        }
        for emp in employees
    ]


# ---------------- Employee Views Own Profile ----------------
@router.get("/me")
def my_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user(db, user_id)

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "company_id": user.company_id
    }
