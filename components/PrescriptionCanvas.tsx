'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';

interface PrescriptionCanvasProps {
  onSave?: (imageDataUrl: string, jsonData: string) => void;
  initialJsonUrl?: string | null;
  readOnly?: boolean;
}

export default function PrescriptionCanvas({ 
  onSave, 
  initialJsonUrl,
  readOnly = false 
}: PrescriptionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<'draw' | 'eraser'>('draw');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);

  const saveHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
    setHasChanges(true);
  }, []);

  const undo = useCallback(() => {
    if (!fabricRef.current || historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const json = historyRef.current[historyIndexRef.current];
    fabricRef.current.loadFromJSON(json).then(() => {
      fabricRef.current?.renderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
    });
  }, []);

  const redo = useCallback(() => {
    if (!fabricRef.current || historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const json = historyRef.current[historyIndexRef.current];
    fabricRef.current.loadFromJSON(json).then(() => {
      fabricRef.current?.renderAll();
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  }, []);

  const clearCanvas = useCallback(() => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = '#ffffff';
    saveHistory();
  }, [saveHistory]);

  const handleSave = useCallback(async () => {
    if (!fabricRef.current || !onSave) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      const imageDataUrl = fabricRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });
      const jsonData = JSON.stringify(fabricRef.current.toJSON());
      
      await onSave(imageDataUrl, jsonData);
      setSaveStatus('success');
      setHasChanges(false);
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: '#ffffff',
      width: container.clientWidth,
      height: 400,
    });

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;

    canvas.on('path:created', () => {
      saveHistory();
    });

    fabricRef.current = canvas;
    saveHistory();

    const handleResize = () => {
      if (!fabricRef.current || !containerRef.current) return;
      fabricRef.current.setDimensions({
        width: containerRef.current.clientWidth,
        height: 400,
      });
      fabricRef.current.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricRef.current) return;

    if (readOnly) {
      fabricRef.current.isDrawingMode = false;
      return;
    }

    fabricRef.current.isDrawingMode = true;
    
    if (activeTool === 'draw') {
      fabricRef.current.freeDrawingBrush = new fabric.PencilBrush(fabricRef.current);
      fabricRef.current.freeDrawingBrush.color = brushColor;
      fabricRef.current.freeDrawingBrush.width = brushSize;
    } else if (activeTool === 'eraser') {
      fabricRef.current.freeDrawingBrush = new fabric.PencilBrush(fabricRef.current);
      fabricRef.current.freeDrawingBrush.color = '#ffffff';
      fabricRef.current.freeDrawingBrush.width = brushSize * 5;
    }
  }, [activeTool, brushColor, brushSize, readOnly]);

  useEffect(() => {
    if (!fabricRef.current || !initialJsonUrl || readOnly) return;

    fetch(initialJsonUrl)
      .then(res => res.json())
      .then(json => {
        fabricRef.current?.loadFromJSON(json).then(() => {
          fabricRef.current?.renderAll();
          saveHistory();
        });
      })
      .catch(console.error);
  }, [initialJsonUrl, readOnly, saveHistory]);

  if (readOnly) {
    return (
      <div ref={containerRef} style={{ border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
        <canvas ref={canvasRef} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTool('draw')}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              backgroundColor: activeTool === 'draw' ? '#2563eb' : '#e5e7eb',
              color: activeTool === 'draw' ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Draw
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              backgroundColor: activeTool === 'eraser' ? '#2563eb' : '#e5e7eb',
              color: activeTool === 'eraser' ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Eraser
          </button>
        </div>

        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          style={{ width: '2.5rem', height: '2rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', cursor: 'pointer' }}
          disabled={activeTool === 'eraser'}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={{ width: '5rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              opacity: canUndo ? 1 : 0.5,
            }}
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              opacity: canRedo ? 1 : 0.5,
            }}
          >
            Redo
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div ref={containerRef} style={{ border: '1px solid #d1d5db', borderRadius: '0.25rem', backgroundColor: '#ffffff' }}>
        <canvas ref={canvasRef} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {hasChanges && (
            <span style={{ fontSize: '0.875rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
              Unsaved changes
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {saveStatus === 'success' && (
            <span style={{ fontSize: '0.875rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '1rem' }}>✓</span> Saved!
            </span>
          )}
          {saveStatus === 'error' && (
            <span style={{ fontSize: '0.875rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '1rem' }}>✗</span> Failed to save
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isSaving ? '#9ca3af' : '#16a34a',
              color: 'white',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {isSaving && (
              <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
            )}
            {isSaving ? 'Saving...' : 'Save Prescription'}
          </button>
        </div>
      </div>
    </div>
  );
}