from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.models.employee import EmployeeProfile
from app.models.leave import LeaveRequest
from app.schemas.leave import LeaveApplyRequest

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


# ---------------- Employee Applies Leave ----------------
@router.post("/apply")
def apply_leave(
    user_id: int,
    payload: LeaveApplyRequest,
    db: Session = Depends(get_db)
):
    user = get_user(db, user_id)

    if user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can apply leave")

    employee = get_employee_profile(db, user.id)

    leave = LeaveRequest(
        employee_id=employee.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status="pending"
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return {
        "message": "Leave applied successfully",
        "leave_id": leave.id
    }


# ---------------- Employee Views Own Leaves ----------------
@router.get("/me")
def my_leaves(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user(db, user_id)
    employee = get_employee_profile(db, user.id)

    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee.id
    ).order_by(LeaveRequest.start_date.desc()).all()

    return leaves


# ---------------- HR Views Company Leaves ----------------
@router.get("/company")
def company_leaves(
    user_id: int,
    db: Session = Depends(get_db)
):
    hr = get_user(db, user_id)

    if hr.role != "admin":
        raise HTTPException(status_code=403, detail="Only HR can view leaves")

    leaves = (
        db.query(LeaveRequest)
        .join(EmployeeProfile, LeaveRequest.employee_id == EmployeeProfile.id)
        .filter(EmployeeProfile.company_id == hr.company_id)
        .order_by(LeaveRequest.start_date.desc())
        .all()
    )

    return leaves


# ---------------- HR Approves Leave ----------------
@router.post("/{leave_id}/approve")
def approve_leave(
    leave_id: int,
    user_id: int,
    admin_comment: str = "",
    db: Session = Depends(get_db)
):
    hr = get_user(db, user_id)

    if hr.role != "admin":
        raise HTTPException(status_code=403, detail="Only HR can approve leave")

    leave = (
        db.query(LeaveRequest)
        .join(EmployeeProfile, LeaveRequest.employee_id == EmployeeProfile.id)
        .filter(
            LeaveRequest.id == leave_id,
            EmployeeProfile.company_id == hr.company_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    leave.status = "approved"
    leave.admin_comment = admin_comment
    db.commit()

    return {"message": "Leave approved"}


# ---------------- HR Rejects Leave ----------------
@router.post("/{leave_id}/reject")
def reject_leave(
    leave_id: int,
    user_id: int,
    admin_comment: str = "",
    db: Session = Depends(get_db)
):
    hr = get_user(db, user_id)

    if hr.role != "admin":
        raise HTTPException(status_code=403, detail="Only HR can reject leave")

    leave = (
        db.query(LeaveRequest)
        .join(EmployeeProfile, LeaveRequest.employee_id == EmployeeProfile.id)
        .filter(
            LeaveRequest.id == leave_id,
            EmployeeProfile.company_id == hr.company_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    leave.status = "rejected"
    leave.admin_comment = admin_comment
    db.commit()

    return {"message": "Leave rejected"}
