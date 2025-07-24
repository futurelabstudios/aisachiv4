import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schemas import (
    AdminConversationResponse, 
    AdminUserStats, 
    ConversationFilter,
    ConversationListResponse,
    User
)
from app.utils.admin_dependencies import require_admin
from app.services.database_service import database_service
from app.core.database import get_session

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)


@router.get("/conversations", response_model=ConversationListResponse)
async def get_all_conversations(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    user_email: Optional[str] = Query(None, description="Filter by user email"),
    date_from: Optional[datetime] = Query(None, description="Filter conversations from date"),
    date_to: Optional[datetime] = Query(None, description="Filter conversations to date"),
    interaction_type: Optional[str] = Query(None, description="Filter by interaction type"),
    search_query: Optional[str] = Query(None, description="Search in conversation content"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """
    Get paginated list of all conversations with filtering options.
    Only accessible by admin users.
    """
    try:
        # Create filter object
        filters = ConversationFilter(
            user_email=user_email,
            date_from=date_from,
            date_to=date_to,
            interaction_type=interaction_type,
            search_query=search_query
        )
        
        # Calculate skip
        skip = (page - 1) * page_size
        
        # Get conversations
        conversations_data, total_count = await database_service.get_all_conversations_admin(
            db=db,
            skip=skip,
            limit=page_size,
            filters=filters,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        # Convert to response models
        conversations = [
            AdminConversationResponse(**conv_data) 
            for conv_data in conversations_data
        ]
        
        # Calculate total pages
        total_pages = (total_count + page_size - 1) // page_size
        
        logger.info(f"Admin {admin_user.email} accessed conversations page {page}")
        
        return ConversationListResponse(
            conversations=conversations,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"Error getting conversations for admin {admin_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve conversations")


@router.get("/statistics", response_model=AdminUserStats)
async def get_admin_statistics(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """
    Get comprehensive statistics for admin dashboard.
    Only accessible by admin users.
    """
    try:
        stats_data = await database_service.get_dashboard_stats(db)
        
        logger.info(f"Admin {admin_user.email} accessed statistics")

        # Map dictionary from service to the response model
        response_stats = AdminUserStats(
            total_users=stats_data.get("total_users", 0),
            active_users=stats_data.get("active_users", 0),
            total_conversations=stats_data.get("total_conversations", 0),
            avg_response_time=float(stats_data.get("avg_response_time", 0.0)),
            conversations_today=stats_data.get("today_conversations", 0),
            conversations_this_week=stats_data.get("week_conversations", 0),
            conversations_this_month=stats_data.get("month_conversations", 0),
        )
        return response_stats
        
    except Exception as e:
        logger.error(f"Error getting statistics for admin {admin_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")


@router.get("/users")
async def get_users_with_stats(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """
    Get paginated list of users with their conversation statistics.
    Only accessible by admin users.
    """
    try:
        # Calculate skip
        skip = (page - 1) * page_size
        
        # Get users with conversation counts
        users_data, total_count = await database_service.get_users_with_conversation_count(
            db=db,
            skip=skip,
            limit=page_size
        )
        
        # Calculate total pages
        total_pages = (total_count + page_size - 1) // page_size
        
        logger.info(f"Admin {admin_user.email} accessed users page {page}")
        
        return {
            "users": users_data,
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
        
    except Exception as e:
        logger.error(f"Error getting users for admin {admin_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve users")


@router.post("/conversations/export")
async def export_conversations(
    filters: ConversationFilter,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """
    Export conversations data as CSV.
    Only accessible by admin users.
    """
    try:
        # Get all conversations matching filters (without pagination for export)
        conversations_data, _ = await database_service.get_all_conversations_admin(
            db=db,
            skip=0,
            limit=10000,  # Large limit for export
            filters=filters,
            sort_by="created_at",
            sort_order="desc"
        )
        
        # Create CSV content
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            'id', 'user_email', 'interaction_type', 'user_question', 'assistant_answer', 
            'response_time', 'created_at', 'metadata'
        ])
        
        writer.writeheader()
        for conv in conversations_data:
            # Truncate long text for CSV readability
            conv_export = {
                'id': conv.get('id'),
                'user_email': conv.get('user_email'),
                'interaction_type': conv.get('interaction_type', 'chat'),
                'user_question': str(conv.get('user_question', ''))[:500] + ('...' if len(str(conv.get('user_question', ''))) > 500 else ''),
                'assistant_answer': str(conv.get('assistant_answer', ''))[:500] + ('...' if len(str(conv.get('assistant_answer', ''))) > 500 else ''),
                'response_time': conv.get('response_time'),
                'created_at': conv.get('created_at'),
                'metadata': str(conv.get('metadata')) if conv.get('metadata') else ''
            }
            writer.writerow(conv_export)
        
        csv_content = output.getvalue()
        output.close()
        
        logger.info(f"Admin {admin_user.email} exported {len(conversations_data)} conversations")
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=conversations_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
        )
        
    except Exception as e:
        logger.error(f"Error exporting conversations for admin {admin_user.email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to export conversations")


@router.get("/health")
async def admin_health_check(
    admin_user: User = Depends(require_admin)
):
    """
    Health check endpoint for admin functionality.
    Only accessible by admin users.
    """
    return {
        "status": "healthy",
        "admin_user": admin_user.email,
        "timestamp": datetime.now()
    }
