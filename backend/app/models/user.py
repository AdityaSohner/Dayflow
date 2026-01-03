from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    full_name = Column(String, nullable=False)  # ✅ ADD THIS

    role = Column(String, nullable=False)  # admin | employee
    is_active = Column(Boolean, default=True)
