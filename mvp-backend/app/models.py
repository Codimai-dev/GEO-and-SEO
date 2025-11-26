from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    full_name: Optional[str] = None
    hashed_password: str
    is_active: bool = True

    reports: List["Report"] = Relationship(back_populates="owner")

class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    url: str
    payload: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    owner_id: int = Field(foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="reports")
