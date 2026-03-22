import React from 'react';
import { PenTool, Eraser } from 'lucide-react';

const COLORS = ['#FFFFFF', '#FF3B30', '#4CD964', '#007AFF', '#FFCC00', '#FF9500'];

export default function Toolbar({ currentTool, setTool, color, setColor, brushSize, setBrushSize, clearCanvas }) {
  return (
    <div className="toolbar">
      
      {/* Tools */}
      <div className="tool-group">
        <button 
          onClick={() => setTool('pen')}
          className={`tool-btn ${currentTool === 'pen' ? 'active' : ''}`}
        >
          <PenTool size={22} />
        </button>
        <button 
          onClick={() => setTool('eraser')}
          className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
        >
          <Eraser size={22} />
        </button>
      </div>

      {/* Colors */}
      <div className={`color-group ${currentTool === 'eraser' ? 'disabled' : ''}`}>
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`color-btn ${color === c ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Brush Size */}
      <div className="size-group">
        <input 
          type="range" 
          min="2" 
          max="30" 
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="size-slider"
        />
        <div className="size-value">{brushSize}px</div>
        
        <button 
          onClick={clearCanvas}
          className="tool-btn"
          style={{ marginLeft: '1rem', color: '#EF4444' }}
          title="Clear Canvas"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
