import React from 'react';

function SettingsPanel({ models = [], settings, onChange }) {
  const handleInputChange = (event) => {
    const { name, value, type } = event.target;

    const processedValue = type === 'range' || type === 'number' ? parseFloat(value) : value;
    onChange({ ...settings, [name]: processedValue });
  };

  const handleMaxTokensChange = (event) => {
    const { name, value } = event.target;
    const intValue = parseInt(value, 10);

    if (!isNaN(intValue) && intValue > 0) {
        onChange({ ...settings, [name]: intValue });
    } else if (value === '') {

         onChange({ ...settings, [name]: '' });
    }
  };

  const round = (value, decimals = 2) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  }

  return (
    <div className="settings-panel">
      <div className="setting-item">
        <label htmlFor="model-select">Модель:</label>
        <select
          id="model-select"
          name="model"
          value={settings.model}
          onChange={handleInputChange}
        >
          {models.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-item">
        <label htmlFor="temperature-slider">
            <span>Температура:</span>
            <span className="value-display">{round(settings.temperature, 2)}</span>
        </label>
        <input
          type="range"
          id="temperature-slider"
          name="temperature"
          min="0"
          max="2"
          step="0.01"
          value={settings.temperature}
          onChange={handleInputChange}
        />
      </div>

       <div className="setting-item">
        <label htmlFor="top-p-slider">
             <span>Top P:</span>
             <span className="value-display">{round(settings.topP, 2)}</span>
        </label>
        <input
          type="range"
          id="top-p-slider"
          name="topP"
          min="0"
          max="1"
          step="0.01"
          value={settings.topP}
          onChange={handleInputChange}
        />
      </div>

      <div className="setting-item">
        <label htmlFor="max-tokens-input">
            <span>Макс. токенов ответа:</span>
             <span className="value-display">{settings.maxTokens || 'auto'}</span>
        </label>
         {}
         <input
           type="number"
           id="max-tokens-input"
           name="maxTokens"
           min="1"
           max="41610" 
           step="1"
           value={settings.maxTokens}
           onChange={handleMaxTokensChange} 
           placeholder="Например, 8192"
         />
         {}
          <input
            type="range"
            aria-label="Max tokens slider (rough)" 
            name="maxTokens"
            min="50"
            max="32768" 
            step="50"
            value={settings.maxTokens}
            onChange={handleMaxTokensChange}
            style={{marginTop: '0.5rem'}} 
          />
      </div>
    </div>
  );
}

export default SettingsPanel;