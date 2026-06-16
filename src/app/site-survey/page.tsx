'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState, useRef, useEffect } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Plus, Check, Navigation, MapPin, Camera, Edit2, 
  Trash2, Search, ClipboardList, PenTool, CheckCircle, X
} from 'lucide-react';
import { SiteSurvey } from '@/types/erp';

export default function SiteSurveyPage() {
  const { siteSurveys, addSiteSurvey, projects, t } = useERP();
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProjId, setSelectedProjId] = useState('');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [gpsLoading, setGpsLoading] = useState(false);

  // Drawing Canvas refs
  const sketchCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSketch, setIsDrawingSketch] = useState(false);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  // Initialize drawing contexts
  useEffect(() => {
    if (isAdding) {
      initCanvas(sketchCanvasRef.current, '#6366f1', 2.5);
      initCanvas(signatureCanvasRef.current, '#18181b', 1.8);
    }
  }, [isAdding]);

  const initCanvas = (canvas: HTMLCanvasElement | null, strokeColor: string, lineWidth: number) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Scale for high DPI
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.strokeStyle = strokeColor;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, canvasType: 'sketch' | 'sig') => {
    const canvas = canvasType === 'sketch' ? sketchCanvasRef.current : signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    
    if (canvasType === 'sketch') setIsDrawingSketch(true);
    else setIsDrawingSig(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, canvasType: 'sketch' | 'sig') => {
    const isDrawing = canvasType === 'sketch' ? isDrawingSketch : isDrawingSig;
    if (!isDrawing) return;

    const canvas = canvasType === 'sketch' ? sketchCanvasRef.current : signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = (canvasType: 'sketch' | 'sig') => {
    if (canvasType === 'sketch') setIsDrawingSketch(false);
    else setIsDrawingSig(false);
  };

  const clearCanvas = (canvasType: 'sketch' | 'sig') => {
    const canvas = canvasType === 'sketch' ? sketchCanvasRef.current : signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initCanvas(canvas, canvasType === 'sketch' ? '#6366f1' : '#18181b', canvasType === 'sketch' ? 2.5 : 1.8);
  };

  // Get GPS browser API location
  const handleGetLocation = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(6)));
          setLng(Number(pos.coords.longitude.toFixed(6)));
          setGpsLoading(false);
        },
        () => {
          // Fallback simulation coordinates
          setLat(40.7018);
          setLng(-73.9968);
          setGpsLoading(false);
        }
      );
    } else {
      setLat(40.7018);
      setLng(-73.9968);
      setGpsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjId) return;

    // Convert canvas sketches to base64 images if needed
    const sketchUrl = sketchCanvasRef.current?.toDataURL() || 'sketch-placeholder.png';
    const signatureUrl = signatureCanvasRef.current?.toDataURL() || 'sig-placeholder.png';

    addSiteSurvey({
      project_id: selectedProjId,
      notes,
      location_lat: Number(lat) || undefined,
      location_lng: Number(lng) || undefined,
      signature_url: signatureUrl,
      drawing_url: sketchUrl
    });

    // Reset
    setSelectedProjId('');
    setNotes('');
    setLat('');
    setLng('');
    setIsAdding(false);
  };

  return (
    <PermissionGuard module="project">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-550 tracking-tight">{t('Construction Site Surveys')}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t('Record topography notes, layout drawing updates, GPS tags and client sign-offs.')}</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="saas-button-primary flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> {t('Conduct New Survey')}
        </button>
      </div>

      {/* Survey form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-5 max-w-4xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t('Draft Site Survey Details')}</h3>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-650"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Target Project *')}</label>
              <select
                required
                value={selectedProjId}
                onChange={(e) => setSelectedProjId(e.target.value)}
                className="saas-input"
              >
                <option value="">{t('-- Choose Project --')}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* GPS tags */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('GPS Coordinates')}</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="number" 
                  step="any"
                  placeholder={t('Latitude')}
                  value={lat}
                  onChange={(e) => setLat(e.target.value === '' ? '' : Number(e.target.value))}
                  className="saas-input"
                />
                <input 
                  type="number" 
                  step="any"
                  placeholder={t('Longitude')}
                  value={lng}
                  onChange={(e) => setLng(e.target.value === '' ? '' : Number(e.target.value))}
                  className="saas-input"
                />
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gpsLoading}
                  className="saas-button-secondary flex items-center gap-1.5 shrink-0"
                >
                  <Navigation className="h-3.5 w-3.5" /> 
                  <span>{gpsLoading ? t('Reading GPS...') : t('Get Live GPS')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sketching Pad & Signature Pad section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Draw Sketch board */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PenTool className="h-4 w-4" /> {t('Layout Drawing sketch')}
                </label>
                <button 
                  type="button" 
                  onClick={() => clearCanvas('sketch')}
                  className="text-zinc-400 hover:text-zinc-655 font-bold"
                >
                  {t('Clear Sketch')}
                </button>
              </div>
              <canvas
                ref={sketchCanvasRef}
                onMouseDown={(e) => startDrawing(e, 'sketch')}
                onMouseMove={(e) => draw(e, 'sketch')}
                onMouseUp={() => stopDrawing('sketch')}
                onMouseLeave={() => stopDrawing('sketch')}
                className="w-full h-44 rounded-lg border border-zinc-200/50 bg-zinc-55/30 cursor-crosshair dark:border-zinc-850 dark:bg-zinc-900/10"
              />
            </div>

            {/* Signature Capture board */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit2 className="h-4 w-4" /> {t('Authorized Client Signature')}
                </label>
                <button 
                  type="button" 
                  onClick={() => clearCanvas('sig')}
                  className="text-zinc-400 hover:text-zinc-655 font-bold"
                >
                  {t('Clear Signature')}
                </button>
              </div>
              <canvas
                ref={signatureCanvasRef}
                onMouseDown={(e) => startDrawing(e, 'sig')}
                onMouseMove={(e) => draw(e, 'sig')}
                onMouseUp={() => stopDrawing('sig')}
                onMouseLeave={() => stopDrawing('sig')}
                className="w-full h-44 rounded-lg border border-zinc-200/50 bg-zinc-55/30 cursor-crosshair dark:border-zinc-850 dark:bg-zinc-900/10"
              />
            </div>

          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Observations / Survey Notes')}</label>
            <textarea 
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('Record structural defects, site access limitations, soil conditions...')}
              className="saas-input h-auto py-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="saas-button-secondary"
            >
              {t('Cancel')}
            </button>
            <button 
              type="submit"
              className="saas-button-primary"
            >
              {t('Save Report')}
            </button>
          </div>
        </form>
      )}

      {/* Grid of existing survey reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {siteSurveys.map((sv) => {
          const proj = projects.find(p => p.id === sv.project_id);
          return (
            <div key={sv.id} className="saas-card p-5 space-y-4 hover:border-zinc-350 dark:hover:border-zinc-700">
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-100">
                    {proj?.name || t('General Project')}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-550">
                    <MapPin className="h-3 w-3" />
                    <span>{t('GPS:')} <strong>{sv.location_lat}, {sv.location_lng}</strong></span>
                  </div>
                </div>
                <span suppressHydrationWarning className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">{new Date(sv.survey_date).toLocaleDateString()}</span>
              </div>

              <div className="text-xs leading-relaxed text-zinc-650 dark:text-zinc-400 italic bg-zinc-55/50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-200/10 dark:border-zinc-850/50">
                &ldquo;{sv.notes}&rdquo;
              </div>

              {/* Saved sketch canvas visual previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-850">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Survey sketch drawing')}</span>
                  <div className="mt-1.5 h-20 bg-zinc-55 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-850 rounded-lg overflow-hidden flex items-center justify-center">
                    {sv.drawing_url?.startsWith('data:') ? (
                      <img src={sv.drawing_url} alt="Drawing sketch" className="h-full w-full object-contain" />
                    ) : (
                      <PenTool className="h-5 w-5 text-zinc-300 dark:text-zinc-700" />
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Client Sign-off')}</span>
                  <div className="mt-1.5 h-20 bg-zinc-55 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-850 rounded-lg overflow-hidden flex items-center justify-center">
                    {sv.signature_url?.startsWith('data:') ? (
                      <img src={sv.signature_url} alt="Customer Signature" className="h-full w-full object-contain invert dark:invert-0" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
    </PermissionGuard>
  );
}
