"""
Reports API endpoints.
Handles CRUD operations for SEO analysis reports.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import Session, select, func

from app.database import get_session
from app.models import User, Report
from app.schemas import ReportCreate, ReportRead, ReportUpdate, PaginatedReports
from app.core.security import decode_token, security

router = APIRouter()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Get the current authenticated user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Handle missing credentials
    if credentials is None:
        raise credentials_exception
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return user


@router.get("/reports", response_model=PaginatedReports)
async def get_reports(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all reports for the current user with pagination.
    """
    offset = (page - 1) * limit
    
    # Get total count
    count_statement = select(func.count(Report.id)).where(Report.owner_id == current_user.id)
    total = session.exec(count_statement).one()
    
    # Get reports with pagination
    statement = (
        select(Report)
        .where(Report.owner_id == current_user.id)
        .order_by(Report.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    reports = session.exec(statement).all()
    
    return PaginatedReports(
        items=reports,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit if total > 0 else 1
    )


@router.post("/reports", response_model=ReportRead, status_code=status.HTTP_201_CREATED)
async def create_report(
    report_data: ReportCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new SEO analysis report.
    """
    report = Report(
        title=report_data.title,
        url=report_data.url,
        payload=report_data.payload,
        owner_id=current_user.id
    )
    
    session.add(report)
    session.commit()
    session.refresh(report)
    
    return report


@router.get("/reports/{report_id}", response_model=ReportRead)
async def get_report(
    report_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get a specific report by ID."""
    statement = select(Report).where(
        Report.id == report_id,
        Report.owner_id == current_user.id
    )
    report = session.exec(statement).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return report


@router.patch("/reports/{report_id}", response_model=ReportRead)
async def update_report(
    report_id: int,
    report_data: ReportUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update a report's title.
    """
    statement = select(Report).where(
        Report.id == report_id,
        Report.owner_id == current_user.id
    )
    report = session.exec(statement).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    if report_data.title is not None:
        report.title = report_data.title
    
    session.add(report)
    session.commit()
    session.refresh(report)
    
    return report


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a report."""
    statement = select(Report).where(
        Report.id == report_id,
        Report.owner_id == current_user.id
    )
    report = session.exec(statement).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    session.delete(report)
    session.commit()
    
    return None
