
import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Pencil, RotateCcw, CheckCircle, Upload, Camera, Palette, X, Minus, Plus } from 'lucide-react';

interface DrawingBoardProps {
  onComplete: (imageData: string) => void;
  title: string;
  instruction: string;
}

type InputMode = 'draw' | 'upload' | 'camera';

const COLORS = [
  '#1e293b', // Black/Slate
  '#ef4444', // Red
  '#f59e0b', // Yellow/Orange
  '#10b981', // Green
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
];

const DrawingBoard: React.FC<DrawingBoardProps> = ({ onComplete, title, instruction }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<InputMode>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    initCanvas();
    return () => stopCamera();
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'draw') return;
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;
      ctx.lineWidth = brushSize;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || mode !== 'draw') return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => { drawImageToCanvas(img); setMode('draw'); };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setMode('camera');
    } catch (err) {
      alert('카메라 권한이 필요합니다.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const img = new Image();
        img.onload = () => { drawImageToCanvas(img); stopCamera(); setMode('draw'); };
        img.src = canvas.toDataURL('image/png');
      }
    }
  };

  const drawImageToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
      const ratio = Math.min(rect.width / img.width, rect.height / img.height);
      const x = (rect.width - img.width * ratio) / 2;
      const y = (rect.height - img.height * ratio) / 2;
      ctx.drawImage(img, x, y, img.width * ratio, img.height * ratio);
    }
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (canvas) onComplete(canvas.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-800">{title}</h2>
        <p className="text-slate-500 mt-1">{instruction}</p>
      </div>

      <div className="flex p-1 bg-slate-200/50 rounded-2xl w-fit mx-auto">
        <button onClick={() => { setMode('draw'); stopCamera(); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'draw' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Palette size={16} className="inline mr-1"/> 그리기</button>
        <button onClick={() => { fileInputRef.current?.click(); stopCamera(); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Upload size={16} className="inline mr-1"/> 사진</button>
        <button onClick={startCamera} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'camera' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}><Camera size={16} className="inline mr-1"/> 촬영</button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      <div className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-slate-100 aspect-square md:aspect-video flex items-center justify-center group">
        <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className={`w-full h-full cursor-crosshair ${mode === 'camera' ? 'hidden' : 'block'}`} />
        {mode === 'camera' && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
            <div className="absolute bottom-8 flex gap-6">
              <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full p-1 shadow-2xl"><div className="w-full h-full border-4 border-slate-200 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></div></button>
              <button onClick={() => { stopCamera(); setMode('draw'); }} className="w-20 h-20 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all"><X size={32} /></button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 bg-white p-5 rounded-[2rem] shadow-xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
            <button onClick={() => { setIsEraser(false); setMode('draw'); }} className={`p-3 rounded-xl transition-all ${!isEraser ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}><Pencil size={20} /></button>
            <button onClick={() => { setIsEraser(true); setMode('draw'); }} className={`p-3 rounded-xl transition-all ${isEraser ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}><Eraser size={20} /></button>
          </div>
          
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
            {COLORS.map(color => (
              <button key={color} onClick={() => { setBrushColor(color); setIsEraser(false); }} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${brushColor === color && !isEraser ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
          <button onClick={clearCanvas} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"><RotateCcw size={20} /></button>
          <button onClick={handleComplete} disabled={mode === 'camera'} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50">
            완료 <CheckCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingBoard;
