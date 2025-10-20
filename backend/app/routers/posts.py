from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..schemas.post import PostCreate, PostUpdate, PostResponse, PostCommentCreate, PostCommentResponse, PostOut
from ..services.post_service import PostService
from ..core.auth import get_current_active_user
from ..models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/", response_model=PostOut)
async def create_post_slash(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria um novo post (com barra)"""
    return await create_post_no_slash(post_data, current_user, db)

@router.post("", response_model=PostOut)
async def create_post_no_slash(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cria um novo post (sem barra)"""
    try:
        post_service = PostService(db)
        post = post_service.create_post(current_user.id, post_data)
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao criar post"
            )
        
        # Garantir que o relacionamento author está carregado
        _ = post.author.id  # força lazy-load, se necessário
        
        logger.info(f"post_created id=%s user=%s", post.id, current_user.id)
        return PostOut.model_validate(post)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao criar post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/timeline", response_model=List[PostResponse])
async def get_timeline(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Obtém timeline de posts"""
    try:
        post_service = PostService(db)
        posts = post_service.get_timeline_posts(limit, offset)
        return posts
        
    except Exception as e:
        logger.error(f"Erro ao obter timeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/my-posts", response_model=List[PostResponse])
async def get_my_posts(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtém posts do usuário atual"""
    try:
        post_service = PostService(db)
        posts = post_service.get_user_posts(current_user.id, limit, offset)
        
        if not posts:
            return []
        
        return posts
        
    except Exception as e:
        logger.error(f"Erro ao obter posts do usuário: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/search")
async def search_posts(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Busca posts por conteúdo"""
    try:
        post_service = PostService(db)
        posts = post_service.search_posts(q, limit, offset)
        return posts
        
    except Exception as e:
        logger.error(f"Erro ao buscar posts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Obtém um post específico"""
    try:
        post_service = PostService(db)
        post = post_service.get_post_by_id(post_id)
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado"
            )
        
        return post
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Atualiza um post"""
    try:
        post_service = PostService(db)
        post = post_service.update_post(post_id, current_user.id, post_data)
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado ou não pertence ao usuário"
            )
        
        logger.info(f"Post {post_id} atualizado pelo usuário {current_user.id}")
        return post
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deleta um post"""
    try:
        post_service = PostService(db)
        success = post_service.delete_post(post_id, current_user.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado ou não pertence ao usuário"
            )
        
        logger.info(f"Post {post_id} deletado pelo usuário {current_user.id}")
        return {"message": "Post deletado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Curtir/descurtir um post"""
    try:
        post_service = PostService(db)
        success = post_service.like_post(current_user.id, post_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao curtir post"
            )
        
        return {"message": "Ação realizada com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao curtir post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/{post_id}/comment", response_model=PostCommentResponse)
async def comment_post(
    post_id: int,
    comment_data: PostCommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Comentar em um post"""
    try:
        post_service = PostService(db)
        comment = post_service.comment_post(current_user.id, post_id, comment_data)
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao comentar no post"
            )
        
        logger.info(f"Comentário adicionado ao post {post_id} pelo usuário {current_user.id}")
        return comment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao comentar post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/{post_id}/comments", response_model=List[PostCommentResponse])
async def get_post_comments(
    post_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Obtém comentários de um post"""
    try:
        post_service = PostService(db)
        comments = post_service.get_post_comments(post_id, limit, offset)
        return comments
        
    except Exception as e:
        logger.error(f"Erro ao obter comentários: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/{post_id}/share")
async def share_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Compartilhar um post"""
    try:
        post_service = PostService(db)
        success = post_service.share_post(post_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Erro ao compartilhar post"
            )
        
        return {"message": "Post compartilhado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao compartilhar post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/{post_id}/stats")
async def get_post_stats(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Obtém estatísticas de um post"""
    try:
        post_service = PostService(db)
        stats = post_service.get_post_stats(post_id)
        
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post não encontrado"
            )
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


