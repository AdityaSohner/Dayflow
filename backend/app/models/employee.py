from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base

class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    company_id = Column(Integer, ForeignKey("companies.id"))

    employee_code = Column(String, unique=True, index=True)

    full_name = Column(String, nullable=False)
    phone = Column(String)
    address = Column(String)

    job_title = Column(String)
    department = Column(String)

    salary = Column(Integer)
    year_of_joining = Column(Integer)
