from pydantic import BaseModel, EmailStr

class CompanySignupRequest(BaseModel):
    company_name: str
    admin_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
