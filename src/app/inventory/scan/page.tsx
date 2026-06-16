'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { Barcode, Search, AlertCircle, RefreshCw, Check, ShieldAlert } from 'lucide-react';
import { Product } from '@/types/erp';

export default function BarcodeScan() {
  const { products, t } = useERP();
  
  const [scanInput, setScanInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);

  const handleLookup = (code: string) => {
    setErrorMessage('');
    setScanSuccess(false);
    
    const prod = products.find(p => p.barcode === code || p.sku === code);
    if (prod) {
      setScannedProduct(prod);
      setScanSuccess(true);
    } else {
      setScannedProduct(null);
      setErrorMessage(t('No material item matched that barcode/SKU code.'));
    }
  };

  return (
    <PermissionGuard module="inventory">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Title */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-550 tracking-tight">{t('Barcode & QR Code Scanner')}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t('Simulate material check-ins using scanning hardware or camera scans.')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scanner Simulation box */}
        <div className="saas-card p-5 space-y-5">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 uppercase tracking-wider">{t('Live Camera Simulator')}</h3>
          
          {/* Simulated webcam scan zone */}
          <div className="relative aspect-video rounded-xl bg-zinc-950 border border-zinc-850 overflow-hidden flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            
            {/* Pulsing red laser line scanner */}
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
                onClick={() => { setScanInput('885002010111'); handleLookup('885002010111'); }}
                className="saas-button-secondary h-8 px-2.5 text-[11px]"
              >
                {t('Scan Cement (885002010111)')}
              </button>
              <button 
                onClick={() => { setScanInput('885002010222'); handleLookup('885002010222'); }}
                className="saas-button-secondary h-8 px-2.5 text-[11px]"
              >
                {t('Scan Rebar (885002010222)')}
              </button>
              <button 
                onClick={() => { setScanInput('885002010333'); handleLookup('885002010333'); }}
                className="saas-button-secondary h-8 px-2.5 text-[11px]"
              >
                {t('Scan Sand (885002010333)')}
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
                onClick={() => handleLookup(scanInput)}
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

            {scannedProduct && (
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
                    <p className="font-semibold text-zinc-850 dark:text-zinc-300 mt-0.5">{t('Brooklyn Main Yard')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('In Stock Quantity:')}</span>
                    <p className="font-bold text-indigo-550 dark:text-indigo-400 mt-0.5">{scannedProduct.current_qty} {t('units')}</p>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-850 text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  <p><strong>{t('Description')}</strong>: {scannedProduct.description || t('No description listed.')}</p>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>

    </div>
    </PermissionGuard>
  );
}

