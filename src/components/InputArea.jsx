import React, { useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi'; 

function InputArea({ value, onChange, onSend, isLoading }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; 
      const scrollHeight = textarea.scrollHeight;

      textarea.style.height = `${scrollHeight}px`;
    }
  }, [value]); 

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleKeyPress = (e) => {

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      if (!isLoading && value.trim()) { 
        onSend();
      }
    }
  };

  const handleSendClick = () => {
    if (!isLoading && value.trim()) {
        onSend();
    }
  }

  return (
    <div className="input-area">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Спросите что-нибудь у AI..."
        rows="1" 
        disabled={isLoading}
        aria-label="Поле ввода сообщения"
      />
      <button onClick={handleSendClick} disabled={isLoading || !value.trim()} aria-label="Отправить сообщение">
        <FiSend /> {}
      </button>
    </div>
  );
}

export default InputArea;