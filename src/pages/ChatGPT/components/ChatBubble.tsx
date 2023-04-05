import React from 'react';
import './ChatBubble.css';
import { MarkDownArea } from './MarkdownArea';

interface ChatBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content }) => {
  let cardStyle;
  switch (role) {
    case 'user':
      cardStyle = { backgroundColor: '#27ae60' };
      break;
    case 'assistant':
      cardStyle = { backgroundColor: '#3498db' };
      break;
    case 'system':
      cardStyle = { backgroundColor: '#2c3e50' };
      break;
  }

  return (
    <div className={`${role} chat-bubble`}>
      <div style={cardStyle} className="chat-bubble-card">
        <MarkDownArea>{content}</MarkDownArea>
      </div>
    </div>
  );
};

export default ChatBubble;
