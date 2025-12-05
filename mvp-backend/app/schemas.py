"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


# Report Schemas
class ReportCreate(BaseModel):
    title: str
    url: str
    payload: Optional[str] = None


class ReportUpdate(BaseModel):
    title: Optional[str] = None


class ReportRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    url: str
    payload: Optional[str] = None
    created_at: datetime


class PaginatedReports(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    items: List[ReportRead]
    total: int
    page: int
    limit: int
    pages: int
