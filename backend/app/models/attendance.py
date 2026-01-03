from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from app.db.base import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(Integer, ForeignKey("employee_profiles.id"))
    date = Column(Date)

    check_in_time = Column(Time)
    check_out_time = Column(Time)

    status = Column(String) # (present | absent | half-day | leave

