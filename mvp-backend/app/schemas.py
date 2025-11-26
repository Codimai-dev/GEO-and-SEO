from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ---------- User ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    is_active: bool

    class Config:
        orm_mode = True


# ---------- Token ----------
class Token(BaseModel):
    access_token: str
    token_type: str


# ---------- Report ----------
class ReportCreate(BaseModel):
    title: str
    url: str
    payload: Optional[str] = None

class ReportRead(BaseModel):
    id: int
    title: str
    url: str
    payload: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True
