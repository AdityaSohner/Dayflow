from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base

class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(Integer, ForeignKey("employee_profiles.id"))

    basic_salary = Column(Integer)
    deductions = Column(Integer)
    net_salary = Column(Integer)

    month = Column(String)
