from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.db.base import Base

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(Integer, ForeignKey("employee_profiles.id"))

    leave_type = Column(String) #(paid | sick | unpaid)

    start_date = Column(Date)
    end_date = Column(Date)

    status = Column(String, default="pending")# (pending | approved | rejected)

    admin_comment = Column(String)
