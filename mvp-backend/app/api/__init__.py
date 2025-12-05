"""API routers module."""
from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.reports import router as reports_router
from app.api.analysis import router as analysis_router
from app.api.ai import router as ai_router

# Main API router
api_router = APIRouter()

# Include sub-routers
api_router.include_router(auth_router, tags=["Authentication"])
api_router.include_router(reports_router, tags=["Reports"])
api_router.include_router(analysis_router, tags=["Analysis"])
api_router.include_router(ai_router, tags=["AI"])

__all__ = ["api_router"]
