import { motion } from 'framer-motion';
import { User, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatRelativeDate, formatUsername } from '../../utils/formatters';
import { useState } from 'react';

const MessageCard = ({ 
  message, 
  isOwn = false,
  onDelete,
  showActions = true,
  className = ''
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
    setShowMenu(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${className}`}
    >
      <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>

        {/* Message Content */}
        <div className={`relative ${isOwn ? 'text-right' : 'text-left'}`}>
          {/* Message Bubble */}
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwn
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gray-700 text-gray-100'
            }`}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>

          {/* Message Info */}
          <div className={`flex items-center space-x-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-400">
              {formatRelativeDate(message.created_at)}
            </span>
            
            {message.is_filtered && (
              <span className="text-xs text-red-400">
                Filtrado: {message.filter_reason}
              </span>
            )}
          </div>

          {/* Actions Menu */}
          {showActions && onDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-0 right-0 mt-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10"
                >
                  <button
                    onClick={handleDelete}
                    className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Deletar</span>
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );
};

export default MessageCard;






