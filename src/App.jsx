import React, { useState, useRef, useEffect, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import { parseMessageContent } from './utils/parseMessage'; 
import './App.css'; 

const generateId = () => `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const API_URL = 'http://localhost:5000/api/chat'; 

function App() {

  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [settings, setSettings] = useState({
    model: 'llama3-8b-8192', 
    temperature: 1.0,
    maxTokens: 8192,
    topP: 0.95,
  });

  const eventSourceRef = useRef(null);
  const currentAiMessageIdRef = useRef(null);
  const accumulatedChunksRef = useRef({}); 

  const handleClearChat = () => {

    if (eventSourceRef.current) {
      console.log("Закрытие SSE соединения при очистке чата...");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setMessages([]);
    setError(null);
    setIsLoading(false);
    currentAiMessageIdRef.current = null;
    accumulatedChunksRef.current = {};
    setCurrentInput(''); 
    console.log("Чат очищен.");
  };

   const handleToggleThinkBlock = (messageId, segmentIndex) => {
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === messageId && msg.segments && msg.segments[segmentIndex]?.type === 'think') {

          const newSegments = [...msg.segments];

          newSegments[segmentIndex] = {
             ...newSegments[segmentIndex],
             isExpanded: !newSegments[segmentIndex].isExpanded 
            };
          return { ...msg, segments: newSegments };
        }
        return msg;
      })
    );
  };

  const handleSend = useCallback(async () => {
    const messageText = currentInput.trim();
    if (!messageText || isLoading) return;

    if (eventSourceRef.current) {
      console.log("Прерывание предыдущего запроса...");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const newUserMessage = {
        id: generateId(),
        sender: 'user',

        segments: [{ type: 'text', content: messageText }]
    };
    setMessages(prev => [...prev, newUserMessage]);
    setCurrentInput('');
    setIsLoading(true);
    setError(null);

    const aiMessageId = generateId();
    currentAiMessageIdRef.current = aiMessageId;
    accumulatedChunksRef.current[aiMessageId] = ''; 

    setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', segments: [] }]);

    const historyForApi = messages
      .filter(msg => msg.sender === 'user' || (msg.sender === 'ai' && msg.segments.length > 0)) 
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',

        content: msg.segments
                 .filter(seg => seg.type === 'text') 
                 .map(seg => seg.content)
                 .join(''),
      }))

    try {
      const payload = {
        message: messageText,
        history: historyForApi,
        ...settings,
      };

      const queryParams = new URLSearchParams({ data: JSON.stringify(payload) });
      const eventSource = new EventSource(`${API_URL}?${queryParams.toString()}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          if (parsedData.chunk) {
            const currentId = currentAiMessageIdRef.current;
            if (currentId) {

              accumulatedChunksRef.current[currentId] += parsedData.chunk;

              const newSegments = parseMessageContent(accumulatedChunksRef.current[currentId]);

              setMessages(prevMessages =>
                prevMessages.map(msg =>
                  msg.id === currentId
                    ? {
                        ...msg,

                        segments: newSegments.map((newSeg, index) => {
                            const oldSeg = msg.segments[index];
                            if (newSeg.type === 'think' && oldSeg && oldSeg.type === 'think') {
                                return { ...newSeg, isExpanded: oldSeg.isExpanded }; 
                            }
                            return newSeg; 
                        })
                       }
                    : msg
                )
              );
            }
          }
        } catch (e) {
          console.error("Ошибка парсинга SSE данных:", e, "Data:", event.data);
          setError("Ошибка обработки ответа от AI.");
          if (eventSourceRef.current) eventSourceRef.current.close();
          setIsLoading(false);
        }
      };

      eventSource.onerror = (err) => {
        console.error("Ошибка EventSource:", err);
        setError(err.eventPhase === EventSource.CLOSED ? 'Соединение с сервером закрыто.' : 'Ошибка соединения с сервером.');
        if (eventSource.readyState === EventSource.CLOSED) {
             console.log("EventSource был закрыт.");
        } else {
            console.log(`EventSource state: ${eventSource.readyState}`);
        }
        eventSource.close();
        eventSourceRef.current = null;
        setIsLoading(false);

        currentAiMessageIdRef.current = null;

        if (currentAiMessageIdRef.current && accumulatedChunksRef.current[currentAiMessageIdRef.current]) {
             delete accumulatedChunksRef.current[currentAiMessageIdRef.current];
        }
      };

      eventSource.addEventListener('end', () => {
        console.log("SSE stream ended.");
        eventSource.close();
        eventSourceRef.current = null;
        setIsLoading(false);

        if (currentAiMessageIdRef.current && accumulatedChunksRef.current[currentAiMessageIdRef.current]) {

            delete accumulatedChunksRef.current[currentAiMessageIdRef.current];
        }
        currentAiMessageIdRef.current = null;
      });

      eventSource.addEventListener('error', (event) => {
          console.error("SSE stream error event:", event.data);
          try {
            const errorData = JSON.parse(event.data);
            setError(`Ошибка от AI: ${errorData.error || 'Неизвестная ошибка'}`);
          } catch {
            setError("Неизвестная ошибка во время ответа AI.");
          }
          eventSource.close();
          eventSourceRef.current = null;
          setIsLoading(false);
          if (currentAiMessageIdRef.current && accumulatedChunksRef.current[currentAiMessageIdRef.current]) {
             delete accumulatedChunksRef.current[currentAiMessageIdRef.current];
           }
          currentAiMessageIdRef.current = null;
      });

    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      setError(`Не удалось отправить сообщение: ${error.message || error}`);
      setIsLoading(false);
      currentAiMessageIdRef.current = null;
       if (currentAiMessageIdRef.current && accumulatedChunksRef.current[currentAiMessageIdRef.current]) {
          delete accumulatedChunksRef.current[currentAiMessageIdRef.current];
        }
    }

  }, [currentInput, isLoading, messages, settings]); 

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        console.log("Закрытие SSE соединения при размонтировании App...");
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        settings={settings}
        onSettingsChange={setSettings}
        onClearChat={handleClearChat} 
      />
      <ChatInterface

        messages={messages}
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        isLoading={isLoading}
        error={error}
        handleSend={handleSend}

        currentAiMessageId={currentAiMessageIdRef.current}
        onToggleThinkBlock={handleToggleThinkBlock}
      />
    </div>
  );
}

export default App;