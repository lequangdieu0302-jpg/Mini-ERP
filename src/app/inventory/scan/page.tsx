'use client';

import { PermissionGuard } from '@/components/permission-guard';
import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import ProductAutocomplete from '@/components/wms/product-autocomplete';
import { 
  Barcode, Search, AlertCircle, RefreshCw, Check, ShieldAlert,
  Camera, Upload, Plus, Trash2, Play, CheckCircle2, Image,
  Target, Cpu, Layers, HelpCircle, FileImage, Volume2, ArrowRight, X, ArrowLeft
} from 'lucide-react';
import { Product } from '@/types/erp';

interface BBox {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  w: number; // percentage width
  h: number; // percentage height
  label: string;
  conf: number;
}

const PRESET_TEMPLATES = [
  {
    id: 'cement',
    name: 'Pallet bao xi măng (Concrete Pallet - 12 bags)',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
    boxes: [
      { id: 'b1', x: 15, y: 22, w: 22, h: 14, label: 'Cement Bag', conf: 0.95 },
      { id: 'b2', x: 40, y: 21, w: 22, h: 14, label: 'Cement Bag', conf: 0.94 },
      { id: 'b3', x: 65, y: 22, w: 21, h: 14, label: 'Cement Bag', conf: 0.96 },
      { id: 'b4', x: 12, y: 39, w: 24, h: 16, label: 'Cement Bag', conf: 0.97 },
      { id: 'b5', x: 38, y: 38, w: 24, h: 16, label: 'Cement Bag', conf: 0.98 },
      { id: 'b6', x: 64, y: 39, w: 24, h: 16, label: 'Cement Bag', conf: 0.94 },
      { id: 'b7', x: 10, y: 59, w: 26, h: 18, label: 'Cement Bag', conf: 0.95 },
      { id: 'b8', x: 37, y: 58, w: 26, h: 18, label: 'Cement Bag', conf: 0.93 },
      { id: 'b9', x: 65, y: 59, w: 26, h: 18, label: 'Cement Bag', conf: 0.96 },
      { id: 'b10', x: 22, y: 78, w: 28, h: 18, label: 'Cement Bag', conf: 0.92 },
      { id: 'b11', x: 52, y: 78, w: 28, h: 18, label: 'Cement Bag', conf: 0.95 },
      { id: 'b12', x: 40, y: 5, w: 20, h: 12, label: 'Cement Bag', conf: 0.91 }
    ]
  },
  {
    id: 'steel',
    name: 'Bó thép cây tròn (Steel Rebar - 8 bundles)',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    boxes: [
      { id: 's1', x: 20, y: 25, w: 14, h: 14, label: 'Rebar Bundle', conf: 0.98 },
      { id: 's2', x: 40, y: 28, w: 14, h: 14, label: 'Rebar Bundle', conf: 0.97 },
      { id: 's3', x: 60, y: 26, w: 14, h: 14, label: 'Rebar Bundle', conf: 0.99 },
      { id: 's4', x: 25, y: 45, w: 15, h: 15, label: 'Rebar Bundle', conf: 0.96 },
      { id: 's5', x: 45, y: 48, w: 15, h: 15, label: 'Rebar Bundle', conf: 0.95 },
      { id: 's6', x: 65, y: 46, w: 15, h: 15, label: 'Rebar Bundle', conf: 0.97 },
      { id: 's7', x: 35, y: 68, w: 16, h: 16, label: 'Rebar Bundle', conf: 0.94 },
      { id: 's8', x: 55, y: 70, w: 16, h: 16, label: 'Rebar Bundle', conf: 0.96 }
    ]
  },
  {
    id: 'boxes',
    name: 'Thùng các-tông lưu kho (Storage Boxes - 15 units)',
    imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&auto=format&fit=crop&q=80',
    boxes: [
      { id: 'x1', x: 10, y: 15, w: 15, h: 20, label: 'Box Unit', conf: 0.94 },
      { id: 'x2', x: 28, y: 15, w: 15, h: 20, label: 'Box Unit', conf: 0.93 },
      { id: 'x3', x: 46, y: 15, w: 15, h: 20, label: 'Box Unit', conf: 0.95 },
      { id: 'x4', x: 64, y: 15, w: 15, h: 20, label: 'Box Unit', conf: 0.92 },
      { id: 'x5', x: 12, y: 40, w: 16, h: 22, label: 'Box Unit', conf: 0.96 },
      { id: 'x6', x: 30, y: 40, w: 16, h: 22, label: 'Box Unit', conf: 0.97 },
      { id: 'x7', x: 48, y: 40, w: 16, h: 22, label: 'Box Unit', conf: 0.95 },
      { id: 'x8', x: 66, y: 40, w: 16, h: 22, label: 'Box Unit', conf: 0.94 },
      { id: 'x9', x: 14, y: 66, w: 17, h: 24, label: 'Box Unit', conf: 0.93 },
      { id: 'x10', x: 32, y: 66, w: 17, h: 24, label: 'Box Unit', conf: 0.91 },
      { id: 'x11', x: 50, y: 66, w: 17, h: 24, label: 'Box Unit', conf: 0.94 },
      { id: 'x12', x: 68, y: 66, w: 17, h: 24, label: 'Box Unit', conf: 0.95 },
      { id: 'x13', x: 82, y: 15, w: 14, h: 20, label: 'Box Unit', conf: 0.89 },
      { id: 'x14', x: 83, y: 40, w: 15, h: 22, label: 'Box Unit', conf: 0.91 },
      { id: 'x15', x: 84, y: 66, w: 15, h: 24, label: 'Box Unit', conf: 0.90 }
    ]
  }
];

export default function BarcodeScan() {
  const { products: allProducts, t } = useERP();
  const { updateProduct, addTransaction, warehouses } = useWMSState();

  const [activeTab, setActiveTab] = useState<'barcode' | 'ai_counter'>('barcode');

  // --- Tab 1: Barcode Scan State ---
  const [scanInput, setScanInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);

  // --- Tab 2: AI Photo Counter State ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<BBox[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
  // Apply counts to ledger states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [txnType, setTxnType] = useState<'stock_in' | 'adjustment'>('stock_in');
  const [txnNotes, setTxnNotes] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Synthesize Beep and Chime Audio using Web Audio API ---
  const playBeep = () => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn(e);
    }
  };

  const playChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      playTone(523.25, ctx.currentTime, 0.1); // C5
      playTone(659.25, ctx.currentTime + 0.08, 0.1); // E5
      playTone(783.99, ctx.currentTime + 0.16, 0.15); // G5
      playTone(1046.50, ctx.currentTime + 0.24, 0.25); // C6
    } catch (e) {
      console.warn(e);
    }
  };

  // --- Barcode lookup ---
  const handleBarcodeLookup = (code: string) => {
    setErrorMessage('');
    setScanSuccess(false);
    
    const prod = allProducts.find(p => p.barcode === code || p.sku === code);
    if (prod) {
      setScannedProduct(prod);
      setScanSuccess(true);
      playBeep();
    } else {
      setScannedProduct(null);
      setErrorMessage(t('No material item matched that barcode/SKU code.'));
    }
  };

  // --- Webcam streaming management ---
  useEffect(() => {
    if (isCameraActive) {
      const startCamera = async () => {
        try {
          const constraints: MediaStreamConstraints = {
            video: selectedCameraId 
              ? { deviceId: { exact: selectedCameraId } }
              : { facingMode: 'environment' }
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          // Enumerate devices to allow camera selection
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setCameraDevices(videoDevices);
        } catch (err) {
          console.error("Error accessing camera:", err);
          setIsCameraActive(false);
          alert(t("Could not access camera. Please check camera permissions or upload an image instead."));
        }
      };
      startCamera();
    } else {
      stopCameraStream();
    }
    return () => stopCameraStream();
  }, [isCameraActive, selectedCameraId]);

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Set default warehouse
  useEffect(() => {
    if (warehouses && warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouseId]);

  // --- Trigger Scanning laser effect and load bounding boxes ---
  const triggerScanAnalysis = (boxesToLoad: BBox[]) => {
    setIsScanning(true);
    setBoundingBoxes([]);
    
    // Web Audio Scanner start sweep sound
    playBeep();

    setTimeout(() => {
      setIsScanning(false);
      setBoundingBoxes(boxesToLoad);
      playChime(); // completed scanner sound
    }, 1800);
  };

  // Handle Capture from live webcam
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setIsCameraActive(false);
        stopCameraStream();

        // Generate simulated random bounding boxes for the newly captured custom image
        const generated = [];
        const numBoxes = Math.floor(Math.random() * 8) + 6; // 6 to 13 items
        for (let i = 0; i < numBoxes; i++) {
          generated.push({
            id: `rand-${Date.now()}-${i}`,
            x: 25 + Math.random() * 45,
            y: 25 + Math.random() * 45,
            w: 12,
            h: 12,
            label: 'Detected Item',
            conf: Number((0.85 + Math.random() * 0.14).toFixed(2))
          });
        }
        triggerScanAnalysis(generated);
      }
    }
  };

  // Handle Image upload from local disk
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          setIsCameraActive(false);

          // Generate simulated random bounding boxes
          const generated = [];
          const numBoxes = Math.floor(Math.random() * 9) + 7;
          for (let i = 0; i < numBoxes; i++) {
            generated.push({
              id: `upload-${Date.now()}-${i}`,
              x: 20 + Math.random() * 50,
              y: 20 + Math.random() * 50,
              w: 13,
              h: 13,
              label: 'Detected Item',
              conf: Number((0.87 + Math.random() * 0.12).toFixed(2))
            });
          }
          triggerScanAnalysis(generated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle selecting a demo template
  const handleSelectTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setCapturedImage(tpl.imageUrl);
    setIsCameraActive(false);
    triggerScanAnalysis(tpl.boxes);
  };

  // --- Add a new bounding box on image click ---
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isScanning || !capturedImage) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newBox: BBox = {
      id: `man-${Date.now()}`,
      x: x - 6, // center the box on click
      y: y - 6,
      w: 12,
      h: 12,
      label: 'Manual Item',
      conf: 1.00
    };

    setBoundingBoxes(prev => [...prev, newBox]);
    playBeep();
  };

  // Delete a bounding box
  const handleDeleteBox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent adding a box on click
    setBoundingBoxes(prev => prev.filter(b => b.id !== id));
    playBeep();
  };

  // --- Apply Count to Database Ledger ---
  const handleApplyToLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert(t('Please select a product first.'));
      return;
    }
    if (!selectedWarehouseId) {
      alert(t('Please select a warehouse first.'));
      return;
    }

    const countedQty = boundingBoxes.length;
    let qtyBefore = Number(selectedProduct.current_qty) || 0;
    let qtyChange = countedQty;
    let qtyAfter = qtyBefore + countedQty;

    if (txnType === 'adjustment') {
      qtyAfter = countedQty;
      qtyChange = countedQty - qtyBefore;
    }

    // 1. Update product quantity in database
    const updateSuccess = await updateProduct(selectedProduct.id, {
      current_qty: qtyAfter,
      warehouse_id: selectedWarehouseId
    });

    if (!updateSuccess) {
      alert(t('Error updating product stock quantity.'));
      return;
    }

    // 2. Add transaction record to logs
    const txnSuccess = await addTransaction({
      company_id: selectedProduct.company_id,
      product_id: selectedProduct.id,
      action: txnType === 'stock_in' ? 'stock_in' : 'adjustment',
      reference_no: `AI-COUNT-${Date.now().toString().slice(-6)}`,
      warehouse_id: selectedWarehouseId,
      qty_before: qtyBefore,
      qty_change: qtyChange,
      qty_after: qtyAfter,
      value_change: qtyChange * (selectedProduct.cost_price || 0),
      notes: txnNotes || t('AI-Powered visual item counting capture')
    });

    if (txnSuccess) {
      setSubmitSuccess(true);
      playChime();
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setCapturedImage(null);
        setBoundingBoxes([]);
        setTxnNotes('');
      }, 3000);
    } else {
      alert(t('Error saving transaction logs.'));
    }
  };

  return (
    <PermissionGuard module="inventory">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 gap-4">
          <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-550 tracking-tight">
              {t('Visual Inventory Scanning Tools')}
            </h1>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              {t('Scan barcodes or use AI-powered image analysis to count and lookup materials instantly.')}
            </p>
          </div>

          {/* Tabs switch */}
          <div className="bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg flex border border-zinc-200/30 dark:border-zinc-800/30 self-start md:self-auto">
            <button
              onClick={() => { setActiveTab('barcode'); stopCameraStream(); setIsCameraActive(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${activeTab === 'barcode' ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              <Barcode className="h-3.5 w-3.5" />
              {t('Barcode Scanner')}
            </button>
            <button
              onClick={() => { setActiveTab('ai_counter'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${activeTab === 'ai_counter' ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              <Camera className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
              {t('AI Photo Counter')}
            </button>
          </div>
        </div>

        {activeTab === 'barcode' ? (
          // ================= TAB 1: BARCODE SCANNER =================
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Live Camera Simulator */}
            <div className="saas-card p-5 space-y-5">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 uppercase tracking-wider">
                {t('Live Camera Simulator')}
              </h3>
              
              <div className="relative aspect-video rounded-xl bg-zinc-950 border border-zinc-850 overflow-hidden flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
                <Barcode className="h-10 w-10 text-zinc-700 animate-bounce mb-2" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-650">{t('Scan Window Active')}</span>
                
                {scanSuccess && (
                  <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 animate-in fade-in duration-150">
                    <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center mb-2">
                      <Check className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold tracking-wider">{t('MATERIAL SCAN SUCCESSFUL')}</span>
                    <span className="text-[10px] text-emerald-300 mt-0.5">{scannedProduct?.name}</span>
                    <button 
                      onClick={() => setScanSuccess(false)}
                      className="mt-4 rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-[10px] font-semibold transition"
                    >
                      {t('Scan Another Item')}
                    </button>
                  </div>
                )}
              </div>

              {/* Quick simulation buttons */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Demo Barcode Shortcuts:')}</span>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={() => { setScanInput('885002010111'); handleBarcodeLookup('885002010111'); }}
                    className="saas-button-secondary h-8 px-2.5 text-[11px]"
                  >
                    {t('Cement (885002010111)')}
                  </button>
                  <button 
                    onClick={() => { setScanInput('885002010222'); handleBarcodeLookup('885002010222'); }}
                    className="saas-button-secondary h-8 px-2.5 text-[11px]"
                  >
                    {t('Rebar (885002010222)')}
                  </button>
                  <button 
                    onClick={() => { setScanInput('885002010333'); handleBarcodeLookup('885002010333'); }}
                    className="saas-button-secondary h-8 px-2.5 text-[11px]"
                  >
                    {t('Sand (885002010333)')}
                  </button>
                </div>
              </div>
            </div>

            {/* Scanned product details card */}
            <div className="space-y-4">
              <div className="saas-card p-5 space-y-4">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 uppercase tracking-wider">{t('Material Lookup Details')}</h3>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={t('Enter barcode or SKU code manually...')} 
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    className="saas-input flex-1"
                  />
                  <button
                    onClick={() => handleBarcodeLookup(scanInput)}
                    className="saas-button-primary flex items-center gap-1.5"
                  >
                    <Search className="h-3.5 w-3.5" /> {t('Lookup')}
                  </button>
                </div>

                {errorMessage && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg p-3 text-rose-600 dark:text-rose-450 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {scannedProduct ? (
                  <div className="space-y-4 pt-3 border-t border-zinc-200/50 dark:border-zinc-850 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Material Title:')}</span>
                        <h4 className="font-bold text-zinc-850 dark:text-white mt-0.5">{scannedProduct.name}</h4>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('SKU Reference:')}</span>
                        <p className="font-semibold text-zinc-850 dark:text-zinc-300 mt-0.5 font-mono">{scannedProduct.sku || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Stock Location:')}</span>
                        <p className="font-semibold text-zinc-850 dark:text-zinc-300 mt-0.5">{scannedProduct.location || 'A-01-01'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('In Stock Quantity:')}</span>
                        <p className="font-bold text-indigo-550 dark:text-indigo-400 mt-0.5">{scannedProduct.current_qty} {scannedProduct.uom || 'units'}</p>
                      </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-850 text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      <p><strong>{t('Description')}</strong>: {scannedProduct.description || t('No description listed.')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-400 text-[10px]">
                    <Search className="h-6 w-6 stroke-1 text-zinc-300 mb-1" />
                    <span>{t('Lookup results will be shown here.')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // ================= TAB 2: AI PHOTO COUNTER =================
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Image Viewer / Cam Input (8 Columns) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="saas-card p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-indigo-500 stroke-[2]" />
                    {t('Visual Capture & Detection Workspace')}
                  </h3>
                  
                  {capturedImage && (
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setBoundingBoxes([]);
                        stopCameraStream();
                        setIsCameraActive(false);
                      }}
                      className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {t('Reset Analysis')}
                    </button>
                  )}
                </div>

                {/* Main Media Screen Container */}
                <div className="relative rounded-xl border border-zinc-250/60 dark:border-zinc-800/80 bg-zinc-950 overflow-hidden aspect-video flex flex-col items-center justify-center select-none shadow-inner">
                  {isCameraActive ? (
                    // 1. Live Camera Stream
                    <div className="relative w-full h-full">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                      
                      {/* Grid overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10%_10%]" />
                      <div className="absolute inset-8 border border-white/20 rounded-lg pointer-events-none" />
                      
                      {/* Control Overlays */}
                      <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-3">
                        <button
                          onClick={handleCapture}
                          className="saas-button-primary bg-indigo-600 hover:bg-indigo-500 border-none px-5 py-2 text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/35"
                        >
                          <Target className="h-4 w-4" />
                          {t('Chụp và Đếm')}
                        </button>
                        <button
                          onClick={() => setIsCameraActive(false)}
                          className="bg-zinc-900/90 text-white hover:bg-zinc-800 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          {t('Trở Lại')}
                        </button>
                      </div>

                      {/* Camera Selector Dropdown */}
                      {cameraDevices.length > 1 && (
                        <div className="absolute top-4 right-4 bg-zinc-900/95 p-1 rounded-lg border border-zinc-800 text-[10px]">
                          <select
                            value={selectedCameraId}
                            onChange={(e) => setSelectedCameraId(e.target.value)}
                            className="bg-transparent text-white outline-none py-0.5 px-1 font-semibold cursor-pointer"
                          >
                            {cameraDevices.map((device, index) => (
                              <option key={device.deviceId} value={device.deviceId} className="bg-zinc-950">
                                {device.label || `Camera ${index + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ) : capturedImage ? (
                    // 2. Active Captured/Uploaded Image Workspace
                    <div 
                      onClick={handleImageClick}
                      className="relative w-full h-full flex items-center justify-center cursor-crosshair group"
                    >
                      <img 
                        src={capturedImage} 
                        alt="Captured load" 
                        className="max-w-full max-h-full object-contain pointer-events-none"
                      />

                      {/* Scanning laser line overlay */}
                      {isScanning && (
                        <div className="absolute inset-x-0 h-0.5 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-[scan_1.8s_ease-in-out_infinite]" />
                      )}

                      {/* Render Bounding Boxes */}
                      {!isScanning && boundingBoxes.map((box) => (
                        <div
                          key={box.id}
                          className="absolute border border-indigo-400 bg-indigo-500/10 rounded group/box transition-all"
                          style={{
                            left: `${box.x}%`,
                            top: `${box.y}%`,
                            width: `${box.w}%`,
                            height: `${box.h}%`
                          }}
                        >
                          {/* Label tag */}
                          <div className="absolute -top-4 left-0 bg-indigo-600 text-white font-black text-[7px] px-1 rounded shadow pointer-events-none whitespace-nowrap">
                            {box.label} {(box.conf * 100).toFixed(0)}%
                          </div>

                          {/* Delete box hover button */}
                          <button
                            onClick={(e) => handleDeleteBox(box.id, e)}
                            className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center rounded-full text-[8px] font-black border border-zinc-950 opacity-0 group-hover/box:opacity-100 transition-opacity"
                            title="Xóa"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {/* Instructions HUD */}
                      {!isScanning && (
                        <div className="absolute top-2 left-2 bg-zinc-950/85 backdrop-blur-md px-2 py-1 rounded border border-zinc-800 pointer-events-none text-[8.5px] text-zinc-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {t('💡 Click anywhere on image to ADD boxes. Hover over box and click "×" to REMOVE.')}
                        </div>
                      )}
                    </div>
                  ) : (
                    // 3. Initial Empty State / Choose Source
                    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-550 border border-zinc-800">
                        <FileImage className="h-6 w-6 text-indigo-400" />
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-zinc-200 text-xs">{t('Chưa Có Hình Ảnh Phân Tích')}</h4>
                        <p className="text-[10px] text-zinc-500 max-w-sm mt-1 leading-normal">
                          {t('Mở camera để chụp pallet hàng trực tiếp, tải lên tệp ảnh từ máy tính hoặc bấm thử nhanh các mẫu demo bên dưới.')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => setIsCameraActive(true)}
                          className="saas-button-primary bg-indigo-600 hover:bg-indigo-500 border-none px-4 py-2 flex items-center gap-1.5"
                        >
                          <Camera className="h-4 w-4" />
                          {t('Mở Camera Chụp')}
                        </button>
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="saas-button-secondary bg-zinc-900 border-zinc-800 hover:bg-zinc-850 px-4 py-2 flex items-center gap-1.5"
                        >
                          <Upload className="h-4 w-4 text-zinc-400" />
                          {t('Tải Ảnh Lên')}
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Templates Selector section */}
                {!capturedImage && !isCameraActive && (
                  <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-850/80 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      {t('Mẫu Demo Đếm Nhanh (Click để thử ngay):')}
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {PRESET_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => handleSelectTemplate(tpl)}
                          className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 hover:bg-zinc-100 dark:hover:bg-zinc-850/50 text-left transition-all"
                        >
                          <div className="h-10 w-12 rounded bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
                            <img src={tpl.imageUrl} alt={tpl.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="truncate">
                            <h5 className="font-bold text-zinc-800 dark:text-zinc-300 truncate">{tpl.name.split(' ')[0]}</h5>
                            <span className="text-[9px] text-zinc-450 mt-0.5 block">{t('AI Count:')} {tpl.boxes.length}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Ledger Integration Panel (4 Columns) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="saas-card p-5 space-y-4">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  {t('Inventory Sync Control')}
                </h3>

                {/* Analysis KPI HUD */}
                <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 text-center space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    {t('Total Counted Items (Số lượng đếm)')}
                  </span>
                  
                  {isScanning ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                      <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-widest">{t('Analyzing...')}</span>
                    </div>
                  ) : (
                    <div className="py-1">
                      <span className="text-3xl font-black text-indigo-550 dark:text-indigo-400 font-mono tracking-tight">
                        {boundingBoxes.length}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-450 ml-1 font-bold">
                        {t('vật tư')}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-[9.5px] text-zinc-450 dark:text-zinc-450 pt-1 border-t border-zinc-200/30 dark:border-zinc-800/40">
                    {boundingBoxes.filter(b => b.id.startsWith('man-')).length > 0 ? (
                      <span className="text-amber-500 font-bold">
                        {t('Đã sửa đổi thủ công (+')}
                        {boundingBoxes.filter(b => b.id.startsWith('man-')).length}
                        {t(' hộp)')}
                      </span>
                    ) : (
                      <span>{t('Đếm tự động hoàn toàn bằng AI')}</span>
                    )}
                  </div>
                </div>

                {submitSuccess ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-5 text-center space-y-2 animate-scale-up">
                    <div className="h-10 w-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/25">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-450 text-xs">{t('Ledger Updated Successfully!')}</h4>
                    <p className="text-[9.5px] text-emerald-600 dark:text-emerald-500 leading-normal">
                      {t('Cập nhật số lượng mới')} <strong>{boundingBoxes.length}</strong> {t('vào kho lưu trữ thành công.')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleApplyToLedger} className="space-y-4">
                    
                    {/* Material Select Autocomplete */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        {t('Vật Tư Cập Nhật')}
                      </label>
                      <ProductAutocomplete
                        onSelect={(prod) => setSelectedProduct(prod)}
                        placeholder={t('Search material catalog...')}
                      />
                      {selectedProduct && (
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex justify-between">
                          <span>{t('Current stock:')} <strong className="font-semibold">{selectedProduct.current_qty} {selectedProduct.uom || 'units'}</strong></span>
                          <span>{t('SKU:')} <strong className="font-mono">{selectedProduct.sku}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Warehouse dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        {t('Kho Lưu Trữ')}
                      </label>
                      <select
                        value={selectedWarehouseId}
                        onChange={(e) => setSelectedWarehouseId(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 font-bold"
                      >
                        {warehouses.map(wh => (
                          <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                        ))}
                      </select>
                    </div>

                    {/* Method Choice */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        {t('Phương Thức Cập Nhật')}
                      </label>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <label className={`border rounded-lg p-2.5 flex flex-col justify-between cursor-pointer transition-all ${txnType === 'stock_in' ? 'border-indigo-500 bg-indigo-500/5 text-indigo-550 dark:text-indigo-400 font-bold' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 text-zinc-500'}`}>
                          <input 
                            type="radio" 
                            name="txn_type" 
                            value="stock_in" 
                            checked={txnType === 'stock_in'}
                            onChange={() => setTxnType('stock_in')}
                            className="hidden"
                          />
                          <span className="text-[10px]">{t('Cộng thêm vào kho')}</span>
                          <span className="text-[8px] text-zinc-450 mt-1 font-medium">{t('(Stock-In Transaction)')}</span>
                        </label>

                        <label className={`border rounded-lg p-2.5 flex flex-col justify-between cursor-pointer transition-all ${txnType === 'adjustment' ? 'border-indigo-500 bg-indigo-500/5 text-indigo-550 dark:text-indigo-400 font-bold' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 text-zinc-500'}`}>
                          <input 
                            type="radio" 
                            name="txn_type" 
                            value="adjustment"
                            checked={txnType === 'adjustment'}
                            onChange={() => setTxnType('adjustment')}
                            className="hidden"
                          />
                          <span className="text-[10px]">{t('Đặt lại số lượng chuẩn')}</span>
                          <span className="text-[8px] text-zinc-450 mt-1 font-medium">{t('(Set Total Count)')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        {t('Ghi chú điều chỉnh')}
                      </label>
                      <textarea
                        value={txnNotes}
                        onChange={(e) => setTxnNotes(e.target.value)}
                        placeholder={t('Enter notes like shipment code, batch number...')}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 leading-normal min-h-12"
                      />
                    </div>

                    {/* Apply Button */}
                    <button
                      type="submit"
                      disabled={isScanning || !capturedImage || boundingBoxes.length === 0}
                      className="w-full saas-button-primary bg-indigo-600 hover:bg-indigo-500 border-none py-2.5 text-xs font-black shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4" />
                      {t('Apply Count to Ledger')}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Canvas for grabbing webcam image */}
        <canvas ref={canvasRef} className="hidden" />

      </div>
    </PermissionGuard>
  );
}
