<<<<<<< HEAD
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_reports():
    return {"message": "Reports API"}
=======
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.db.session import SessionLocal
from app.models.user import User
from app.models.employee import EmployeeProfile
from app.models.attendance import Attendance
from app.models.leave import LeaveRequest
from app.models.payroll import Payroll

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


# ---------------- HR Dashboard Report ----------------
@router.get("/dashboard")
def hr_dashboard(
    user_id: int,
    db: Session = Depends(get_db)
):
    hr = get_user(db, user_id)

    if hr.role != "admin":
        raise HTTPException(status_code=403, detail="Only HR can view dashboard")

    total_employees = db.query(EmployeeProfile).filter(
        EmployeeProfile.company_id == hr.company_id
    ).count()

    today_attendance = db.query(Attendance).filter(
        Attendance.date == date.today()
    ).count()

    pending_leaves = db.query(LeaveRequest).filter(
        LeaveRequest.status == "pending"
    ).count()

    total_payrolls = (
        db.query(Payroll)
        .join(EmployeeProfile, Payroll.employee_id == EmployeeProfile.id)
        .filter(EmployeeProfile.company_id == hr.company_id)
        .count()
    )

    return {
        "total_employees": total_employees,
        "today_attendance": today_attendance,
        "pending_leaves": pending_leaves,
        "total_payrolls_generated": total_payrolls
    }
>>>>>>> d84000d7c096f156e71cba7eafa99c7359a1099b
