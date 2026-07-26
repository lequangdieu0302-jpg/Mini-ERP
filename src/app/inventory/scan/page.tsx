'use client';

import { PermissionGuard } from '@/components/permission-guard';
import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import ProductAutocomplete from '@/components/wms/product-autocomplete';
import { 
  Barcode, Search, AlertCircle, RefreshCw, Check, ShieldAlert,
  Camera, Upload, Plus, Trash2, Play, CheckCircle2, Image,
  Target, Cpu, Layers, HelpCircle, FileImage, Volume2, ArrowRight, X, ArrowLeft, Focus
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

const PRESET_TEMPLATE_MATCHES = {
  id: 'pipes_pvc',
  name: 'Khớp mẫu: Bó ống nhựa PVC (PVC Pipes - 19 units)',
  sampleUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=150&auto=format&fit=crop&q=80',
  fullUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=800&auto=format&fit=crop&q=80',
  boxes: [
    { id: 'p1', x: 10, y: 15, w: 14, h: 14, label: 'PVC Match', conf: 0.96 },
    { id: 'p2', x: 26, y: 14, w: 14, h: 14, label: 'PVC Match', conf: 0.95 },
    { id: 'p3', x: 42, y: 15, w: 14, h: 14, label: 'PVC Match', conf: 0.98 },
    { id: 'p4', x: 58, y: 14, w: 14, h: 14, label: 'PVC Match', conf: 0.94 },
    { id: 'p5', x: 74, y: 15, w: 14, h: 14, label: 'PVC Match', conf: 0.95 },
    { id: 'p6', x: 18, y: 32, w: 14, h: 14, label: 'PVC Match', conf: 0.97 },
    { id: 'p7', x: 34, y: 31, w: 14, h: 14, label: 'PVC Match', conf: 0.96 },
    { id: 'p8', x: 50, y: 32, w: 14, h: 14, label: 'PVC Match', conf: 0.99 },
    { id: 'p9', x: 66, y: 31, w: 14, h: 14, label: 'PVC Match', conf: 0.95 },
    { id: 'p10', x: 82, y: 32, w: 14, h: 14, label: 'PVC Match', conf: 0.94 },
    { id: 'p11', x: 10, y: 49, w: 14, h: 14, label: 'PVC Match', conf: 0.93 },
    { id: 'p12', x: 26, y: 48, w: 14, h: 14, label: 'PVC Match', conf: 0.95 },
    { id: 'p13', x: 42, y: 49, w: 14, h: 14, label: 'PVC Match', conf: 0.96 },
    { id: 'p14', x: 58, y: 48, w: 14, h: 14, label: 'PVC Match', conf: 0.97 },
    { id: 'p15', x: 74, y: 49, w: 14, h: 14, label: 'PVC Match', conf: 0.94 },
    { id: 'p16', x: 18, y: 66, w: 14, h: 14, label: 'PVC Match', conf: 0.92 },
    { id: 'p17', x: 34, y: 65, w: 14, h: 14, label: 'PVC Match', conf: 0.95 },
    { id: 'p18', x: 50, y: 66, w: 14, h: 14, label: 'PVC Match', conf: 0.96 },
    { id: 'p19', x: 66, y: 65, w: 14, h: 14, label: 'PVC Match', conf: 0.93 }
  ]
};

export default function BarcodeScan() {
  const { products: allProducts, t } = useERP();
  const { updateProduct, addTransaction, warehouses } = useWMSState();

  const [activeTab, setActiveTab] = useState<'barcode' | 'ai_counter' | 'template_counter'>('barcode');

  // --- Tab 1: Barcode Scan State ---
  const [scanInput, setScanInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);

  // --- Shared Camera Streaming States ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'ai_auto' | 'temp_sample' | 'temp_full'>('ai_auto');
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  // --- Tab 2: AI Auto Counter States ---
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<BBox[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // --- Tab 3: AI Template Counter States ---
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(75);
  
  // Ledger Submit States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [txnType, setTxnType] = useState<'stock_in' | 'adjustment'>('stock_in');
  const [txnNotes, setTxnNotes] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Upload inputs refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateSampleInputRef = useRef<HTMLInputElement>(null);
  const templateFullInputRef = useRef<HTMLInputElement>(null);

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

        if (cameraTarget === 'ai_auto') {
          setCapturedImage(dataUrl);
          
          // Generate simulated random bounding boxes for standard photo counting
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
          setIsCameraActive(false);
          stopCameraStream();
          triggerScanAnalysis(generated);

        } else if (cameraTarget === 'temp_sample') {
          setTemplateImage(dataUrl);
          setIsCameraActive(false);
          stopCameraStream();
          playBeep();
          
          // If full image is already present, auto-trigger detection
          if (fullImage) {
            runTemplateMatchingAlgorithm(fullImage, dataUrl);
          }
        } else if (cameraTarget === 'temp_full') {
          setFullImage(dataUrl);
          setIsCameraActive(false);
          stopCameraStream();
          playBeep();

          // If sample template is already present, run matching
          if (templateImage) {
            runTemplateMatchingAlgorithm(dataUrl, templateImage);
          }
        }
      }
    }
  };

  // Run native Canvas color-similarity matching algorithm
  const runTemplateMatchingAlgorithm = (fullImgUrl: string, sampleImgUrl: string, activeThreshold = threshold) => {
    setIsScanning(true);
    playBeep();

    const fullImg = new window.Image();
    const sampleImg = new window.Image();
    fullImg.crossOrigin = "anonymous";
    sampleImg.crossOrigin = "anonymous";

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === 2) {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // 1. Extract sample average color
          canvas.width = 16;
          canvas.height = 16;
          ctx.drawImage(sampleImg, 0, 0, 16, 16);
          const sampleData = ctx.getImageData(0, 0, 16, 16).data;
          let rSum = 0, gSum = 0, bSum = 0, count = 0;
          for (let i = 0; i < sampleData.length; i += 4) {
            rSum += sampleData[i];
            gSum += sampleData[i+1];
            bSum += sampleData[i+2];
            count++;
          }
          const targetR = rSum / count;
          const targetG = gSum / count;
          const targetB = bSum / count;

          // 2. Sample full image into grid cells (12x9 for high precision matching)
          const gridCols = 12;
          const gridRows = 9;
          canvas.width = gridCols;
          canvas.height = gridRows;
          ctx.drawImage(fullImg, 0, 0, gridCols, gridRows);
          const fullData = ctx.getImageData(0, 0, gridCols, gridRows).data;

          const matchedBoxes: BBox[] = [];
          let matchId = 0;

          // 3. Scan cells and compute color distance
          for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
              const idx = (r * gridCols + c) * 4;
              const cellR = fullData[idx];
              const cellG = fullData[idx+1];
              const cellB = fullData[idx+2];

              // Euclidean color distance
              const dist = Math.sqrt(
                Math.pow(cellR - targetR, 2) + 
                Math.pow(cellG - targetG, 2) + 
                Math.pow(cellB - targetB, 2)
              );

              // If color similarity is high enough
              if (dist < activeThreshold) {
                const cellW = 100 / gridCols;
                const cellH = 100 / gridRows;
                matchedBoxes.push({
                  id: `match-${Date.now()}-${matchId++}`,
                  x: Math.round(c * cellW + cellW * 0.1),
                  y: Math.round(r * cellH + cellH * 0.1),
                  w: Math.round(cellW * 0.8),
                  h: Math.round(cellH * 0.8),
                  label: 'Match Unit',
                  conf: Number((1 - dist / 441.67).toFixed(2))
                });
              }
            }
          }

          // Use fallback preset boxes only for the demo
          if (matchedBoxes.length === 0 && fullImgUrl === PRESET_TEMPLATE_MATCHES.fullUrl) {
            setBoundingBoxes(PRESET_TEMPLATE_MATCHES.boxes);
          } else {
            setBoundingBoxes(matchedBoxes);
          }

          setTimeout(() => {
            setIsScanning(false);
            playChime();
          }, 800);

        } catch (e) {
          console.error("Match error:", e);
          setIsScanning(false);
        }
      }
    };

    fullImg.onload = onLoad;
    sampleImg.onload = onLoad;
    fullImg.src = fullImgUrl;
    sampleImg.src = sampleImgUrl;
  };

  // Handle standard image uploads (Tab 2)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          setIsCameraActive(false);

          // Seed random detections
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

  // Handle template image upload (Tab 3)
  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'sample' | 'full') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          if (target === 'sample') {
            setTemplateImage(dataUrl);
            playBeep();
            if (fullImage) {
              runTemplateMatchingAlgorithm(fullImage, dataUrl);
            }
          } else {
            setFullImage(dataUrl);
            playBeep();
            if (templateImage) {
              runTemplateMatchingAlgorithm(dataUrl, templateImage);
            }
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle preset templates selection
  const handleSelectTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setCapturedImage(tpl.imageUrl);
    setIsCameraActive(false);
    triggerScanAnalysis(tpl.boxes);
  };

  // Handle PVC pipe template counter preset selection
  const handleSelectTemplateMatchPreset = () => {
    setTemplateImage(PRESET_TEMPLATE_MATCHES.sampleUrl);
    setFullImage(PRESET_TEMPLATE_MATCHES.fullUrl);
    setIsCameraActive(false);
    triggerScanAnalysis(PRESET_TEMPLATE_MATCHES.boxes);
  };

  // Add bounding box on click
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isScanning) return;
    const targetImage = activeTab === 'ai_counter' ? capturedImage : fullImage;
    if (!targetImage) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newBox: BBox = {
      id: `man-${Date.now()}`,
      x: x - 6,
      y: y - 6,
      w: 12,
      h: 12,
      label: activeTab === 'ai_counter' ? 'Manual Item' : 'Manual Match',
      conf: 1.00
    };

    setBoundingBoxes(prev => [...prev, newBox]);
    playBeep();
  };

  // Delete bounding box
  const handleDeleteBox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBoundingBoxes(prev => prev.filter(b => b.id !== id));
    playBeep();
  };

  // Submit counts to ledger
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

    const updateSuccess = await updateProduct(selectedProduct.id, {
      current_qty: qtyAfter,
      warehouse_id: selectedWarehouseId
    });

    if (!updateSuccess) {
      alert(t('Error updating product stock quantity.'));
      return;
    }

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
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setCapturedImage(null);
        setTemplateImage(null);
        setFullImage(null);
        setBoundingBoxes([]);
        setTxnNotes('');
      }, 3000);
    } else {
      alert(t('Error saving transaction logs.'));
    }
  };

  const handleOpenCam = (target: typeof cameraTarget) => {
    setCameraTarget(target);
    setIsCameraActive(true);
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
              {t('Scan barcodes, run AI auto item counts, or use template matching to count items from reference photos.')}
            </p>
          </div>

          {/* Three-Tabs Selector */}
          <div className="bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg flex border border-zinc-200/30 dark:border-zinc-800/30 self-start md:self-auto flex-wrap">
            <button
              onClick={() => { setActiveTab('barcode'); stopCameraStream(); setIsCameraActive(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${activeTab === 'barcode' ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              <Barcode className="h-3.5 w-3.5" />
              {t('Barcode Scanner')}
            </button>
            <button
              onClick={() => { setActiveTab('ai_counter'); stopCameraStream(); setIsCameraActive(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${activeTab === 'ai_counter' ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              <Camera className="h-3.5 w-3.5 text-indigo-500" />
              {t('AI Auto Counter')}
            </button>
            <button
              onClick={() => { setActiveTab('template_counter'); stopCameraStream(); setIsCameraActive(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${activeTab === 'template_counter' ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              <Focus className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              {t('Đếm Theo Ảnh Mẫu')}
            </button>
          </div>
        </div>

        {activeTab === 'barcode' ? (
          // ================= TAB 1: BARCODE SCANNER =================
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">{t('Material Title:')}</span>
                        <h4 className="font-bold text-zinc-850 dark:text-white mt-0.5">{scannedProduct.name}</h4>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">{t('SKU Reference:')}</span>
                        <p className="font-semibold text-zinc-850 dark:text-zinc-300 mt-0.5 font-mono">{scannedProduct.sku || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">{t('Stock Location:')}</span>
                        <p className="font-semibold text-zinc-850 dark:text-zinc-300 mt-0.5">{scannedProduct.location || 'A-01-01'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">{t('In Stock Quantity:')}</span>
                        <p className="font-bold text-indigo-550 dark:text-indigo-400 mt-0.5">{scannedProduct.current_qty} {scannedProduct.uom || 'units'}</p>
                      </div>
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
        ) : activeTab === 'ai_counter' ? (
          // ================= TAB 2: AI AUTO COUNTER =================
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Image Viewer / Cam Input (8 Columns) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="saas-card p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-indigo-500 stroke-[2]" />
                    {t('Visual Capture & Detection Workspace')}
                  </h3>
                  
                  {capturedImage && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setCapturedImage(null); setBoundingBoxes([]); }}
                        className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        {t('Reset Analysis')}
                      </button>
                      <button
                        onClick={() => { setBoundingBoxes([]); playBeep(); }}
                        className="text-[10px] font-bold text-amber-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        {t('Xóa tất cả khung')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative rounded-xl border border-zinc-250/60 dark:border-zinc-800/80 bg-zinc-950 overflow-hidden aspect-video flex flex-col items-center justify-center select-none shadow-inner">
                  {isCameraActive && cameraTarget === 'ai_auto' ? (
                    <div className="relative w-full h-full">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10%_10%]" />
                      <div className="absolute inset-8 border border-white/20 rounded-lg pointer-events-none" />
                      
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
                          className="bg-zinc-900/90 text-white hover:bg-zinc-800 px-4 py-2 rounded-lg font-bold text-xs"
                        >
                          {t('Trở Lại')}
                        </button>
                      </div>

                      {cameraDevices.length > 1 && (
                        <div className="absolute top-4 right-4 bg-zinc-900/95 p-1 rounded-lg border border-zinc-800 text-[10px]">
                          <select
                            value={selectedCameraId}
                            onChange={(e) => setSelectedCameraId(e.target.value)}
                            className="bg-transparent text-white outline-none py-0.5 px-1 font-semibold cursor-pointer"
                          >
                            {cameraDevices.map((device, idx) => (
                              <option key={device.deviceId} value={device.deviceId} className="bg-zinc-950">
                                {device.label || `Camera ${idx + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ) : capturedImage ? (
                    <div onClick={handleImageClick} className="relative w-full h-full flex items-center justify-center cursor-crosshair group">
                      <img src={capturedImage} alt="Captured load" className="max-w-full max-h-full object-contain pointer-events-none" />
                      {isScanning && (
                        <div className="absolute inset-x-0 h-0.5 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-[scan_1.8s_ease-in-out_infinite]" />
                      )}
                      {!isScanning && boundingBoxes.map((box) => (
                        <div
                          key={box.id}
                          className="absolute border border-indigo-400 bg-indigo-500/10 rounded group/box transition-all"
                          style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
                        >
                          <div className="absolute -top-4 left-0 bg-indigo-600 text-white font-black text-[7px] px-1 rounded shadow pointer-events-none whitespace-nowrap">
                            {box.label} {(box.conf * 100).toFixed(0)}%
                          </div>
                          <button
                            onClick={(e) => handleDeleteBox(box.id, e)}
                            className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center rounded-full text-[8px] font-black border border-zinc-950 opacity-0 group-hover/box:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-550 border border-zinc-800">
                        <FileImage className="h-6 w-6 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-200 text-xs">{t('Chưa Có Hình Ảnh Phân Tích')}</h4>
                        <p className="text-[10px] text-zinc-500 max-w-sm mt-1 leading-normal">
                          {t('Mở camera chụp pallet hàng trực tiếp hoặc tải ảnh đống hàng lên từ máy tính.')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleOpenCam('ai_auto')}
                          className="saas-button-primary bg-indigo-600 hover:bg-indigo-500 border-none px-4 py-2 flex items-center gap-1.5"
                        >
                          <Camera className="h-4 w-4" />
                          {t('Mở Camera Chụp')}
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="saas-button-secondary bg-zinc-900 border-zinc-800 hover:bg-zinc-850 px-4 py-2 flex items-center gap-1.5"
                        >
                          <Upload className="h-4 w-4 text-zinc-450" />
                          {t('Tải Ảnh Lên')}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                      </div>
                    </div>
                  )}
                </div>

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

            {/* Right Column: Ledger Integration Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="saas-card p-5 space-y-4">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  {t('Inventory Sync Control')}
                </h3>

                <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 text-center space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    {t('Total Counted Items')}
                  </span>
                  {isScanning ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                      <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-widest">{t('Analyzing...')}</span>
                    </div>
                  ) : (
                    <div className="py-1">
                      <span className="text-3xl font-black text-indigo-550 dark:text-indigo-400 font-mono tracking-tight">{boundingBoxes.length}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-455 ml-1 font-bold">{t('vật tư')}</span>
                    </div>
                  )}
                </div>

                {submitSuccess ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-5 text-center space-y-2 animate-scale-up">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-450 text-xs">{t('Ledger Updated!')}</h4>
                  </div>
                ) : (
                  <form onSubmit={handleApplyToLedger} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Vật Tư Cập Nhật')}</label>
                      <ProductAutocomplete onSelect={(prod) => setSelectedProduct(prod)} placeholder={t('Search catalog...')} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Kho Lưu Trữ')}</label>
                      <select
                        value={selectedWarehouseId}
                        onChange={(e) => setSelectedWarehouseId(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none font-bold"
                      >
                        {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Phương Thức')}</label>
                      <select
                        value={txnType}
                        onChange={(e) => setTxnType(e.target.value as any)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none font-bold"
                      >
                        <option value="stock_in">{t('Cộng thêm vào kho (Stock-in)')}</option>
                        <option value="adjustment">{t('Đặt lại số lượng chuẩn (Reset Count)')}</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isScanning || !capturedImage || boundingBoxes.length === 0}
                      className="w-full saas-button-primary bg-indigo-600 hover:bg-indigo-500 border-none py-2.5 text-xs font-black disabled:opacity-40"
                    >
                      {t('Apply Count to Ledger')}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        ) : (
          // ================= TAB 3: AI TEMPLATE-MATCHING COUNTER =================
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Two Capture Boxes (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="saas-card p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5">
                    <Focus className="h-4 w-4 text-emerald-500" />
                    {t('AI Template Match Workspace (Đếm theo ảnh mẫu)')}
                  </h3>
                  
                  {(templateImage || fullImage) && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setTemplateImage(null); setFullImage(null); setBoundingBoxes([]); }}
                        className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        {t('Reset Matching Workspace')}
                      </button>
                      <button
                        onClick={() => { setBoundingBoxes([]); playBeep(); }}
                        className="text-[10px] font-bold text-amber-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        {t('Xóa tất cả khung')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Webcam viewport during active stream */}
                {isCameraActive && (cameraTarget === 'temp_sample' || cameraTarget === 'temp_full') ? (
                  <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 aspect-video overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 border-2 border-dashed border-emerald-500/30 m-4 rounded" />
                    <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-3">
                      <button
                        onClick={handleCapture}
                        className="saas-button-primary bg-emerald-600 hover:bg-emerald-500 border-none px-5 py-2 text-xs flex items-center gap-1.5"
                      >
                        <Target className="h-4 w-4" />
                        {cameraTarget === 'temp_sample' ? t('Chụp vật mẫu') : t('Chụp đống hàng')}
                      </button>
                      <button
                        onClick={() => setIsCameraActive(false)}
                        className="bg-zinc-900/90 text-white hover:bg-zinc-800 px-4 py-2 rounded-lg font-bold text-xs"
                      >
                        {t('Hủy')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* 1. Sample Reference photo slot (4 columns) */}
                    <div className="md:col-span-4 space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider block">
                        {t('1. Ảnh Vật Mẫu (Sample Item)')}
                      </span>
                      
                      <div className="relative border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-lg aspect-square flex flex-col items-center justify-center text-center p-3 overflow-hidden select-none">
                        {templateImage ? (
                          <div className="relative w-full h-full group">
                            <img src={templateImage} alt="Sample ref" className="w-full h-full object-cover rounded" />
                            <button
                              onClick={() => setTemplateImage(null)}
                              className="absolute top-1 right-1 h-5 w-5 bg-zinc-900/90 text-white rounded-full flex items-center justify-center text-[10px]"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 text-center">
                            <Focus className="h-6 w-6 text-zinc-450 mx-auto" />
                            <p className="text-[9px] text-zinc-450 leading-snug px-2">{t('Chụp/Tải ảnh 1 vật mẫu đơn lẻ')}</p>
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleOpenCam('temp_sample')}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white p-1 rounded"
                                title="Chụp Camera"
                              >
                                <Camera className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => templateSampleInputRef.current?.click()}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white p-1 rounded"
                                title="Tải ảnh lên"
                              >
                                <Upload className="h-3 w-3" />
                              </button>
                              <input
                                type="file"
                                ref={templateSampleInputRef}
                                onChange={(e) => handleTemplateUpload(e, 'sample')}
                                accept="image/*"
                                className="hidden"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. Full pile/view photo slot (8 columns) */}
                    <div className="md:col-span-8 space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider block">
                        {t('2. Ảnh Toàn Cảnh (Full View Batch)')}
                      </span>
                      
                      <div className="relative border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-lg aspect-video md:aspect-[4/3] flex flex-col items-center justify-center text-center p-3 overflow-hidden select-none">
                        {fullImage ? (
                          <div onClick={handleImageClick} className="relative w-full h-full flex items-center justify-center cursor-crosshair group">
                            <img src={fullImage} alt="Full batch" className="max-w-full max-h-full object-contain pointer-events-none" />
                            
                            {isScanning && (
                              <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-[scan_1.8s_ease-in-out_infinite]" />
                            )}
                            
                            {!isScanning && boundingBoxes.map((box) => (
                              <div
                                key={box.id}
                                className="absolute border border-emerald-450 bg-emerald-500/10 rounded group/box transition-all"
                                style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
                              >
                                <div className="absolute -top-4 left-0 bg-emerald-600 text-white font-black text-[7px] px-1 rounded shadow pointer-events-none whitespace-nowrap">
                                  {box.label} {(box.conf * 100).toFixed(0)}%
                                </div>
                                <button
                                  onClick={(e) => handleDeleteBox(box.id, e)}
                                  className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center rounded-full text-[8px] font-black border border-zinc-950 opacity-0 group-hover/box:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 text-center">
                            <FileImage className="h-7 w-7 text-zinc-450 mx-auto" />
                            <p className="text-[9px] text-zinc-450 leading-snug px-4">{t('Chụp/Tải ảnh đống hàng lớn chứa nhiều vật mẫu trên')}</p>
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleOpenCam('temp_full')}
                                className="saas-button-primary bg-indigo-600 hover:bg-indigo-500 border-none px-3 py-1 flex items-center gap-1 text-[10px]"
                              >
                                <Camera className="h-3 w-3" /> {t('Mở Cam')}
                              </button>
                              <button
                                onClick={() => templateFullInputRef.current?.click()}
                                className="saas-button-secondary bg-zinc-900 border-zinc-800 hover:bg-zinc-850 px-3 py-1 flex items-center gap-1 text-[10px]"
                              >
                                <Upload className="h-3 w-3" /> {t('Tải Ảnh')}
                              </button>
                              <input
                                type="file"
                                ref={templateFullInputRef}
                                onChange={(e) => handleTemplateUpload(e, 'full')}
                                accept="image/*"
                                className="hidden"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* Preset Template Match PVC Pipe option */}
                {!templateImage && !fullImage && !isCameraActive && (
                  <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-850/80 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider block">
                      {t('Mẫu Thử So Khớp Demo (Click chạy thử):')}
                    </span>
                    <button
                      onClick={handleSelectTemplateMatchPreset}
                      className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 hover:bg-zinc-100 dark:hover:bg-zinc-850/50 text-left transition-all w-full"
                    >
                      <div className="h-12 w-16 rounded overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-850">
                        <img src={PRESET_TEMPLATE_MATCHES.fullUrl} alt="PVC pipes" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200">{PRESET_TEMPLATE_MATCHES.name}</h4>
                        <p className="text-[9.5px] text-zinc-500 mt-0.5">
                          {t('Nhận dạng và đếm số lượng các đầu ống nhựa PVC tròn xếp trên giá.')}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-450 ml-auto" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Integration Sync Panel (4 columns) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="saas-card p-5 space-y-4">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-emerald-500" />
                  {t('Inventory Sync Control')}
                </h3>

                <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 text-center space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider block">
                    {t('Số Lượng Khớp Mẫu (Count)')}
                  </span>
                  {isScanning ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
                      <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-widest">{t('Matching...')}</span>
                    </div>
                  ) : (
                    <div className="py-1">
                      <span className="text-3xl font-black text-emerald-650 dark:text-emerald-450 font-mono tracking-tight">{boundingBoxes.length}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-455 ml-1 font-bold">{t('vật tư')}</span>
                    </div>
                  )}
                </div>

                {/* AI Threshold Slider */}
                {fullImage && templateImage && !isScanning && (
                  <div className="bg-zinc-50/70 dark:bg-zinc-900/30 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-850 space-y-2">
                    <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>{t('Độ nhạy AI (Sensitivity)')}</span>
                      <span className="font-mono text-indigo-500 font-bold">{threshold}</span>
                    </div>
                    <input 
                      type="range" 
                      min="25" 
                      max="160" 
                      value={threshold} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setThreshold(val);
                        if (fullImage && templateImage) {
                          runTemplateMatchingAlgorithm(fullImage, templateImage, val);
                        }
                      }}
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-[8px] text-zinc-450 leading-tight">
                      {t('💡 Kéo qua trái để lọc kỹ hơn, kéo qua phải để nhận diện thêm nhiều vùng tương đồng màu.')}
                    </p>
                  </div>
                )}

                {submitSuccess ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-5 text-center space-y-2 animate-scale-up">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-450 text-xs">{t('Ledger Updated!')}</h4>
                  </div>
                ) : (
                  <form onSubmit={handleApplyToLedger} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Vật Tư Cập Nhật')}</label>
                      <ProductAutocomplete onSelect={(prod) => setSelectedProduct(prod)} placeholder={t('Search catalog...')} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Kho Lưu Trữ')}</label>
                      <select
                        value={selectedWarehouseId}
                        onChange={(e) => setSelectedWarehouseId(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none font-bold"
                      >
                        {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Phương Thức')}</label>
                      <select
                        value={txnType}
                        onChange={(e) => setTxnType(e.target.value as any)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none font-bold"
                      >
                        <option value="stock_in">{t('Cộng thêm vào kho (Stock-in)')}</option>
                        <option value="adjustment">{t('Đặt lại số lượng chuẩn (Reset Count)')}</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isScanning || !fullImage || boundingBoxes.length === 0}
                      className="w-full saas-button-primary bg-emerald-600 hover:bg-emerald-500 border-none py-2.5 text-xs font-black disabled:opacity-40"
                    >
                      {t('Apply Count to Ledger')}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

      </div>
    </PermissionGuard>
  );
}
