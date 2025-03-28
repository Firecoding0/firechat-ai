import React, { useEffect, useRef } from 'react';
import Message from './Message';

function ChatWindow({ messages, isLoading, currentAiMessageId, onToggleThinkBlock }) {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {

     const shouldScroll = () => {
         const container = endOfMessagesRef.current?.parentNode?.parentNode; 
         if (!container) return true; 

         const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
         return nearBottom;
     }

     if (shouldScroll()) {
       endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
     }
  }, [messages]); 

  return (
    <div className="chat-window">
      <div className="message-list">
        {messages.map((msg, index) => (
          <Message
            key={msg.id || index} 
            sender={msg.sender}
            segments={msg.segments || []} 
            isStreaming={isLoading && msg.id === currentAiMessageId} 
            onToggleThinkBlock={(segmentIndex) => onToggleThinkBlock(msg.id, segmentIndex)} 
          />
        ))}
        {}
         {isLoading && currentAiMessageId && messages.find(m => m.id === currentAiMessageId)?.segments.length === 0 && (
             <div className="message ai system-message">
                 <span className="ai-typing-cursor"></span> {}
             </div>
         )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
}

export default ChatWindow;