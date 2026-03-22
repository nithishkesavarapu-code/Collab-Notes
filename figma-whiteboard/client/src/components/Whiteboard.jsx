import React, { useRef, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import Toolbar from './Toolbar';

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef(null);
  
  // Drawing state
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(5);

  const socket = useSocket();

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const context = canvas.getContext('2d');
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    const handleResize = () => {
        const r = canvas.parentElement.getBoundingClientRect();
        canvas.width = r.width * dpr;
        canvas.height = r.height * dpr;
        context.scale(dpr, dpr);
        context.lineCap = 'round';
        context.lineJoin = 'round';
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Socket setup
  useEffect(() => {
    if (!socket) return;
    
    socket.emit('join-board', 'main-board', 'TestUser');

    // Load initial board state from Postgres
    socket.emit('load-board', 'main-board', (response) => {
        if (response && response.canvas_state) {
            const img = new Image();
            img.onload = () => {
                contextRef.current.save();
                contextRef.current.setTransform(1, 0, 0, 1, 0, 0);
                contextRef.current.drawImage(img, 0, 0);
                contextRef.current.restore();
            };
            img.src = response.canvas_state;
        }
    });

    const handleDrawStroke = ({ startPoint, endPoint, activeTool, activeColor, size }) => {
      drawOnCanvas(startPoint, endPoint, activeTool, activeColor, size, false);
    };

    const handleClearBoard = () => {
      const canvas = canvasRef.current;
      contextRef.current.save();
      contextRef.current.setTransform(1, 0, 0, 1, 0, 0);
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      contextRef.current.restore();
    };

    socket.on('draw-stroke', handleDrawStroke);
    socket.on('clear-board', handleClearBoard);

    return () => {
      socket.off('draw-stroke', handleDrawStroke);
      socket.off('clear-board', handleClearBoard);
    };
  }, [socket]);

  // Periodic Auto-Save
  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            socket.emit('save-board', 'main-board', dataUrl);
        }
    }, 5000); // Save to postgres every 5 seconds
    
    return () => clearInterval(interval);
  }, [socket]);

  // Drawing functions
  const drawOnCanvas = (start, end, drawTool, drawColor, drawSize, emit = true) => {
    const ctx = contextRef.current;
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    
    ctx.strokeStyle = drawTool === 'eraser' ? '#121212' : drawColor;
    ctx.lineWidth = drawSize;
    ctx.stroke();
    ctx.closePath();

    if (emit && socket) {
      socket.emit('draw-stroke', {
        startPoint: start,
        endPoint: end,
        activeTool: drawTool,
        activeColor: drawColor,
        size: drawSize
      });
    }
  };

  const startDraw = (e) => {
    const coords = getCoordinates(e);
    lastPos.current = coords;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !lastPos.current) return;
    e.preventDefault();
    
    const currentCoords = getCoordinates(e);
    
    drawOnCanvas(
        lastPos.current, 
        currentCoords, 
        tool, 
        color, 
        brushSize, 
        true
    );
    
    lastPos.current = currentCoords;
  };

  const finishDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const getCoordinates = (e) => {
    if (e.touches && e.touches[0]) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.save();
    contextRef.current.setTransform(1, 0, 0, 1, 0, 0);
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    contextRef.current.restore();
    if (socket) socket.emit('clear-board');
  };

  return (
    <div className="whiteboard-container">
      <Toolbar 
        currentTool={tool} setTool={setTool}
        color={color} setColor={setColor}
        brushSize={brushSize} setBrushSize={setBrushSize}
        clearCanvas={clearCanvas}
      />
      <canvas
        ref={canvasRef}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={finishDraw}
        onMouseOut={finishDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={finishDraw}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
