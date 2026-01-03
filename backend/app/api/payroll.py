from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.models.employee import EmployeeProfile
from app.models.payroll import Payroll

router = APIRouter()


# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Helpers ----------------
def get_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    return user


def get_employee_profile(db: Session, user_id: int):
    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == user_id
    ).first()
    if not employee:
        raise HTTPException(status_code=400, detail="Employee profile not found")
    return employee


# ---------------- HR Creates Payroll ----------------
@router.post("/create")
def create_payroll(
    user_id: int,          # HR user_id
    employee_id: int,      # employee_profiles.id
    basic_salary: int,
    deductions: int,
    month: str,
    db: Session = Depends(get_db)
):
    hr = get_user(db, user_id)

    if hr.role != "admin":
        raise HTTPException(status_code=403, detail="Only HR can create payroll")

    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.id == employee_id,
        EmployeeProfile.company_id == hr.company_id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    net_salary = basic_salary - deductions

    payroll = Payroll(
        employee_id=employee.id,
        basic_salary=basic_salary,
        deductions=deductions,
        net_salary=net_salary,
        month=month
    )

    db.add(payroll)
    db.commit()
    db.refresh(payroll)

    return {
        "message": "Payroll created successfully",
        "payroll_id": payroll.id,
        "net_salary": net_salary
    }


# ---------------- Employee Views Own Payroll ----------------
@router.get("/me")
def my_payroll(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user(db, user_id)
    employee = get_employee_profile(db, user.id)

    payrolls = db.query(Payroll).filter(
        Payroll.employee_id == employee.id
    ).order_by(Payroll.id.desc()).all()

    return payrolls


# ---------------- HR Views Company Payroll ----------------
@router.get("/company")
def company_payroll(
    user_id: int,
    db: Session = Depends(get_db)
):
    hr = get_user(db, user_id)

    if hr.role != "admin":
        raise HTTPException(status_code=403, detail="Only HR can view payroll")

    payrolls = (
        db.query(Payroll)
        .join(EmployeeProfile, Payroll.employee_id == EmployeeProfile.id)
        .filter(EmployeeProfile.company_id == hr.company_id)
        .order_by(Payroll.id.desc())
        .all()
    )

    return payrolls
