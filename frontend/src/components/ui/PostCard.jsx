import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share, MoreHorizontal, User } from 'lucide-react';
import { formatRelativeDate, formatUsername, truncateText } from '../../utils/formatters';
import { useState } from 'react';

const PostCard = ({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onDelete,
  showActions = true,
  className = ''
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = async () => {
    try {
      await onLike(post.id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  const handleComment = () => {
    onComment(post.id);
  };

  const handleShare = async () => {
    try {
      await onShare(post.id);
    } catch (error) {
      console.error('Erro ao compartilhar post:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja deletar este post?')) {
      onDelete(post.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {post.author?.nickname || 'Usuário'}
            </h3>
            <p className="text-sm text-gray-400">
              {formatUsername(post.author?.nickname)} • {formatRelativeDate(post.created_at)}
            </p>
          </div>
        </div>
        
        {showActions && (
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-100 leading-relaxed">
          {truncateText(post.content, 500)}
        </p>
        
        {post.image_url && (
          <div className="mt-4 rounded-lg overflow-hidden">
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full h-64 object-cover"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likesCount}</span>
            </button>
            
            <button
              onClick={handleComment}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments_count || 0}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
            >
              <Share className="w-5 h-5" />
              <span className="text-sm">{post.shares_count || 0}</span>
            </button>
          </div>
          
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              Deletar
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PostCard;















