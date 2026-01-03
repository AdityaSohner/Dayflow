from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import secrets
import string

router = APIRouter()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Secret key for JWT (use environment variable in production)
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Pydantic models
class UserLogin(BaseModel):
    email_or_id: str
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    company_name: str
    full_name: str
    phone: Optional[str] = None

class PasswordReset(BaseModel):
    current_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def generate_random_password(length: int = 12) -> str:
    """Generate a random password for new employees"""
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(characters) for _ in range(length))
    return password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return payload
    except jwt.PyJWTError:
        raise credentials_exception

# Routes
@router.post("/register", response_model=dict)
async def register(user: UserRegister):
    """
    Register a new company/admin user
    """
    try:
        # TODO: Check if email already exists in database
        # For now, return success with dummy data
        
        # Generate temporary password
        temp_password = generate_random_password()
        hashed_password = get_password_hash(temp_password)
        
        # TODO: Save user to database with hashed password and is_first_login=True
        
        return {
            "message": "Registration successful",
            "email": user.email,
            "temporary_password": temp_password,
            "note": "Please save this password. User will be required to reset it on first login."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    """
    Login user and return JWT token
    """
    try:
        # TODO: Query database for user by email or employee ID
        # For now, using dummy data
        
        # Example: Check if user exists and verify password
        # user_in_db = get_user_from_db(user.email_or_id)
        # if not user_in_db or not verify_password(user.password, user_in_db.hashed_password):
        #     raise HTTPException(status_code=401, detail="Incorrect email/ID or password")
        
        # Dummy user data
        user_data = {
            "id": "EMP001",
            "email": "user@example.com",
            "name": "Test User",
            "role": "employee",
            "is_first_login": True  # Set to False after first password reset
        }
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data["id"], "email": user_data["email"]},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/reset-password")
async def reset_password(
    password_data: PasswordReset,
    current_user: dict = Depends(get_current_user)
):
    """
    Reset user password (for first-time login or password change)
    """
    try:
        user_id = current_user.get("sub")
        
        # TODO: Get user from database
        # user_in_db = get_user_from_db(user_id)
        
        # Verify current password
        # if not verify_password(password_data.current_password, user_in_db.hashed_password):
        #     raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Validate new password strength
        if len(password_data.new_password) < 8:
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 8 characters long"
            )
        
        # Hash new password
        new_hashed_password = get_password_hash(password_data.new_password)
        
        # TODO: Update password in database and set is_first_login=False
        # update_user_password(user_id, new_hashed_password, is_first_login=False)
        
        return {
            "message": "Password reset successfully",
            "user_id": user_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}"
        )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout user (invalidate token on client side)
    """
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current user information
    """
    return current_user
