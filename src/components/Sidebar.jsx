import React from 'react';
import SettingsPanel from './SettingsPanel';
import { FiTrash2 } from 'react-icons/fi'; 

const AVAILABLE_MODELS = [
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
    { value: 'deepseek-r1-distill-qwen-32b', label: 'Deepseek R1 Qwen 32B' },
    { value: 'qwen-qwq-32b', label: 'Qwen QWQ 32B' },
    { value: 'llama3-8b-8192', label: 'Llama3 8B'},
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B-IT'}
];

function Sidebar({ settings, onSettingsChange, onClearChat }) {
  return (
    <aside className="sidebar">
      {}
      <button onClick={onClearChat} className="clear-chat-button">
        <FiTrash2 /> Очистить чат
      </button>

      <h2>Настройки Groq</h2>
      <SettingsPanel
        models={AVAILABLE_MODELS}
        settings={settings}
        onChange={onSettingsChange}
      />
      {}
    </aside>
  );
}

export default Sidebar;
