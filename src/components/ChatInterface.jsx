import React from 'react';
import ChatWindow from './ChatWindow';
import InputArea from './InputArea';

function ChatInterface({
  messages,
  currentInput,
  setCurrentInput,
  isLoading,
  error,
  handleSend,
  currentAiMessageId, 
  onToggleThinkBlock 
}) {

  return (
    <div className="chat-interface">
      <ChatWindow
         messages={messages}
         isLoading={isLoading} 
         currentAiMessageId={currentAiMessageId} 
         onToggleThinkBlock={onToggleThinkBlock} 
      />
      {error && <div className="error-message">{error}</div>}
      {}
      <InputArea
        value={currentInput}
        onChange={setCurrentInput} 
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}

export default ChatInterface;