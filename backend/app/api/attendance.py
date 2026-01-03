from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime

from app.db.session import SessionLocal
from app.models.user import User
from app.models.attendance import Attendance
from app.models.employee import EmployeeProfile  # adjust import if filename differs

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


def get_employee_profile(db: Session, user_id: int):
    employee = db.query(EmployeeProfile).filter(
        EmployeeProfile.user_id == user_id
    ).first()
    if not employee:
        raise HTTPException(status_code=400, detail="Employee profile not found")
    return employee


# ---------------- Employee Check-in ----------------
@router.post("/check-in")
def check_in(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user(db, user_id)

    if user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can check in")

    employee = get_employee_profile(db, user.id)
    today = date.today()

    existing = db.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.date == today
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")

    attendance = Attendance(
        employee_id=employee.id,
        date=today,
        check_in_time=datetime.now().time(),
        status="present"
    )

    db.add(attendance)
    db.commit()

    return {"message": "Check-in successful"}


# ---------------- Employee Check-out ----------------
@router.post("/check-out")
def check_out(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user(db, user_id)

    if user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can check out")

    employee = get_employee_profile(db, user.id)
    today = date.today()

    attendance = db.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.date == today
    ).first()

    if not attendance:
        raise HTTPException(status_code=400, detail="No check-in found")

    if attendance.check_out_time:
        raise HTTPException(status_code=400, detail="Already checked out")

    attendance.check_out_time = datetime.now().time()
    db.commit()

    return {"message": "Check-out successful"}


# ---------------- Employee Views Own Attendance ----------------
@router.get("/me")
def my_attendance(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user(db, user_id)
    employee = get_employee_profile(db, user.id)

    records = db.query(Attendance).filter(
        Attendance.employee_id == employee.id
    ).order_by(Attendance.date.desc()).all()

    return records
