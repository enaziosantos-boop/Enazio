import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, PenTool } from 'lucide-react';

interface SignatureCanvasProps {
  label: string;
  initialValue?: string | null;
  onChange: (dataUrl: string | null) => void;
  height?: number;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  label,
  initialValue,
  onChange,
  height = 140,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialValue && initialValue.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasContent(true);
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  useEffect(() => {
    initCanvas();

    // Resize observer to handle dynamic accordion openings
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      initCanvas();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [initCanvas]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasContent(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasContent(false);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-blue-800" />
          {label}
        </label>
        {hasContent && (
          <button
            type="button"
            onClick={clearCanvas}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Limpar Assinatura
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-blue-500 transition overflow-hidden shadow-xs"
        style={{ height: `${height}px` }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />
        {!hasContent && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="text-xs text-slate-400 font-medium">
              Assine aqui com o dedo ou mouse
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
