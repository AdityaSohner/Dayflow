from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.company import Company
from app.models.user import User
from app.schemas.auth import CompanySignupRequest, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/company-signup")
def company_signup(
    payload: CompanySignupRequest,
    db: Session = Depends(get_db)
):

    existing_company = db.query(Company).filter(
        Company.name == payload.company_name
    ).first()

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail="Company already exists"
        )

    company = Company(name=payload.company_name)
    db.add(company)
    db.commit()
    db.refresh(company)

    admin_user = User(
        company_id=company.id,
        email=payload.email,
        full_name=payload.admin_name,
        hashed_password=hash_password(payload.password),
        role="admin",
        is_active=True
    )

    db.add(admin_user)
    db.commit()

    return {
        "message": "Company and admin user created successfully"
    }

@router.post("/login")
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    
    user = db.query(User).filter(
        User.email == payload.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    
    access_token = create_access_token(
        data={
            "user_id": user.id,
            "company_id": user.company_id,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }
