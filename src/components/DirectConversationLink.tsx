import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

/**
 * A component that provides a direct link to the Nimali-CloudLink conversation
 * This appears in the conversations list when no conversations are found
 */
export function DirectConversationLink() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/student/35/messages/58?type=company');
  };

  return (
    <div 
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-t"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? '#f9f9f9' : 'white',
        transform: isHovered ? 'translateY(-1px)' : 'none',
        boxShadow: isHovered ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.2s ease'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[#800020]/10 rounded-full flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-[#800020]" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-[#800020]">CloudLink Sri Lanka</h3>
          <p className="text-sm text-gray-600 truncate">
            Direct link to conversation with Nimali
          </p>
        </div>
      </div>
    </div>
  );
}
