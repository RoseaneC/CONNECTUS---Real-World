from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from typing import List, Optional
from datetime import datetime
from ..models.post import Post, PostLike, PostComment
from ..models.user import User
from ..schemas.post import PostCreate, PostUpdate, PostCommentCreate
import logging

logger = logging.getLogger(__name__)


class PostService:
    """Serviço para gerenciamento de posts"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_post(self, author_id: int, post_data: PostCreate) -> Optional[Post]:
        """Cria um novo post"""
        try:
            db_post = Post(
                author_id=author_id,
                content=post_data.content,
                image_url=post_data.image_url
            )
            
            self.db.add(db_post)
            self.db.commit()
            self.db.refresh(db_post)
            
            # Atualizar contador de posts do usuário no ranking
            self._update_user_posts_count(author_id)
            
            logger.info(f"Post criado por usuário {author_id}")
            return db_post
            
        except Exception as e:
            logger.error(f"Erro ao criar post: {e}")
            self.db.rollback()
            return None
    
    def get_post_by_id(self, post_id: int) -> Optional[Post]:
        """Obtém post por ID"""
        return self.db.query(Post).filter(
            and_(Post.id == post_id, Post.is_active == True)
        ).first()
    
    def get_user_posts(self, user_id: int, limit: int = 20, offset: int = 0) -> List[dict]:
        """Obtém posts do usuário"""
        posts = self.db.query(Post).filter(
            and_(Post.author_id == user_id, Post.is_active == True)
        ).order_by(desc(Post.created_at)).offset(offset).limit(limit).all()
        
        # Converter para formato esperado pelo schema
        return [self._post_to_dict(post) for post in posts]
    
    def get_timeline_posts(self, limit: int = 20, offset: int = 0) -> List[dict]:
        """Obtém posts da timeline (todos os posts ativos)"""
        posts = self.db.query(Post).filter(
            Post.is_active == True
        ).order_by(desc(Post.created_at)).offset(offset).limit(limit).all()
        
        # Converter para formato esperado pelo schema
        return [self._post_to_dict(post) for post in posts]
    
    def update_post(self, post_id: int, author_id: int, post_data: PostUpdate) -> Optional[Post]:
        """Atualiza um post"""
        try:
            post = self.db.query(Post).filter(
                and_(Post.id == post_id, Post.author_id == author_id, Post.is_active == True)
            ).first()
            
            if not post:
                return None
            
            update_data = post_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(post, field, value)
            
            post.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(post)
            
            return post
            
        except Exception as e:
            logger.error(f"Erro ao atualizar post: {e}")
            self.db.rollback()
            return None
    
    def delete_post(self, post_id: int, author_id: int) -> bool:
        """Deleta um post (soft delete)"""
        try:
            post = self.db.query(Post).filter(
                and_(Post.id == post_id, Post.author_id == author_id, Post.is_active == True)
            ).first()
            
            if not post:
                return False
            
            post.is_active = False
            self.db.commit()
            
            # Atualizar contador de posts do usuário no ranking
            self._update_user_posts_count(author_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao deletar post: {e}")
            self.db.rollback()
            return False
    
    def like_post(self, user_id: int, post_id: int) -> bool:
        """Curtir/descurtir um post"""
        try:
            # Verificar se já curtiu
            existing_like = self.db.query(PostLike).filter(
                and_(PostLike.user_id == user_id, PostLike.post_id == post_id)
            ).first()
            
            post = self.get_post_by_id(post_id)
            if not post:
                return False
            
            if existing_like:
                # Descurtir
                self.db.delete(existing_like)
                post.likes_count = max(0, post.likes_count - 1)
            else:
                # Curtir
                new_like = PostLike(user_id=user_id, post_id=post_id)
                self.db.add(new_like)
                post.likes_count += 1
            
            self.db.commit()
            
            # Atualizar contador de likes recebidos no ranking
            self._update_user_likes_received(post.author_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao curtir post: {e}")
            self.db.rollback()
            return False
    
    def comment_post(self, user_id: int, post_id: int, comment_data: PostCommentCreate) -> Optional[PostComment]:
        """Comentar em um post"""
        try:
            post = self.get_post_by_id(post_id)
            if not post:
                return None
            
            comment = PostComment(
                user_id=user_id,
                post_id=post_id,
                content=comment_data.content
            )
            
            self.db.add(comment)
            post.comments_count += 1
            self.db.commit()
            self.db.refresh(comment)
            
            return comment
            
        except Exception as e:
            logger.error(f"Erro ao comentar post: {e}")
            self.db.rollback()
            return None
    
    def get_post_comments(self, post_id: int, limit: int = 20, offset: int = 0) -> List[PostComment]:
        """Obtém comentários de um post"""
        return self.db.query(PostComment).filter(
            and_(PostComment.post_id == post_id, PostComment.is_active == True)
        ).order_by(PostComment.created_at).offset(offset).limit(limit).all()
    
    def share_post(self, post_id: int) -> bool:
        """Compartilhar um post (incrementar contador)"""
        try:
            post = self.get_post_by_id(post_id)
            if not post:
                return False
            
            post.shares_count += 1
            self.db.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao compartilhar post: {e}")
            self.db.rollback()
            return False
    
    def get_user_liked_posts(self, user_id: int, limit: int = 20, offset: int = 0) -> List[Post]:
        """Obtém posts curtidos pelo usuário"""
        return self.db.query(Post).join(PostLike).filter(
            and_(
                PostLike.user_id == user_id,
                Post.is_active == True
            )
        ).order_by(desc(PostLike.created_at)).offset(offset).limit(limit).all()
    
    def search_posts(self, query: str, limit: int = 20, offset: int = 0) -> List[dict]:
        """Busca posts por conteúdo"""
        posts = self.db.query(Post).filter(
            and_(
                Post.content.ilike(f"%{query}%"),
                Post.is_active == True
            )
        ).order_by(desc(Post.created_at)).offset(offset).limit(limit).all()
        
        # Converter para formato esperado pelo schema
        return [self._post_to_dict(post) for post in posts]
    
    def get_post_stats(self, post_id: int) -> dict:
        """Obtém estatísticas de um post"""
        post = self.get_post_by_id(post_id)
        if not post:
            return {}
        
        return {
            "likes_count": post.likes_count,
            "comments_count": post.comments_count,
            "shares_count": post.shares_count,
            "created_at": post.created_at,
            "author": {
                "id": post.author.id,
                "nickname": post.author.nickname,
                "level": post.author.level
            }
        }
    
    def _update_user_posts_count(self, user_id: int):
        """Atualiza contador de posts do usuário no ranking"""
        try:
            from ..models.ranking import UserRanking
            
            ranking = self.db.query(UserRanking).filter(UserRanking.user_id == user_id).first()
            if ranking:
                posts_count = self.db.query(Post).filter(
                    and_(Post.author_id == user_id, Post.is_active == True)
                ).count()
                ranking.posts_created = posts_count
                ranking.last_updated = datetime.utcnow()
                self.db.commit()
                
        except Exception as e:
            logger.error(f"Erro ao atualizar contador de posts: {e}")
    
    def _update_user_likes_received(self, user_id: int):
        """Atualiza contador de likes recebidos do usuário no ranking"""
        try:
            from ..models.ranking import UserRanking
            
            ranking = self.db.query(UserRanking).filter(UserRanking.user_id == user_id).first()
            if ranking:
                likes_received = self.db.query(func.sum(Post.likes_count)).filter(
                    and_(Post.author_id == user_id, Post.is_active == True)
                ).scalar() or 0
                ranking.likes_received = likes_received
                ranking.last_updated = datetime.utcnow()
                self.db.commit()
                
        except Exception as e:
            logger.error(f"Erro ao atualizar contador de likes recebidos: {e}")
    
    def _post_to_dict(self, post: Post) -> dict:
        """Converte objeto Post para dict compatível com PostResponse"""
        # Buscar autor
        author = self.db.query(User).filter(User.id == post.author_id).first()
        author_dict = {
            "id": author.id,
            "nickname": author.nickname,
            "level": author.level
        } if author else {"id": post.author_id, "nickname": "Usuário", "level": 1}
        
        return {
            "id": post.id,
            "author_id": post.author_id,
            "content": post.content,
            "image_url": post.image_url,
            "likes_count": post.likes_count,
            "comments_count": post.comments_count,
            "shares_count": post.shares_count,
            "is_active": post.is_active,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "updated_at": post.updated_at.isoformat() if post.updated_at else None,
            "author": author_dict,
            "likes": [],
            "comments": []
        }


