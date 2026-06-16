'use client';

import React, { useState } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import { Warehouse, Product } from '@/types/erp';
import {
  FolderSync, MapPin, Code, Archive, User, Plus, X, Edit2, Info,
  CheckCircle, ShieldCheck, Layers, Layers3
} from 'lucide-react';

export default function WarehousesManagement() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useERP();
  const { warehouses, saveWarehouses, products } = useWMSState();

  // Local UI States
  const [expandedWhId, setExpandedWhId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formType, setFormType] = useState<Warehouse['type']>('raw_materials');
  const [formManagerName, setFormManagerName] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateOpen = () => {
    setEditingWarehouse(null);
    setFormName('');
    setFormCode('');
    setFormAddress('');
    setFormType('raw_materials');
    setFormManagerName('Charlie Stock');
    setFormStatus('active');
    setModalOpen(true);
  };

  const handleEditOpen = (w: Warehouse) => {
    setEditingWarehouse(w);
    setFormName(w.name);
    setFormCode(w.code);
    setFormAddress(w.address || '');
    setFormType(w.type);
    setFormManagerName(w.manager_name || 'Charlie Stock');
    setFormStatus(w.status || 'active');
    setModalOpen(true);
  };

  const handleSaveWarehouse = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName || !formCode) {
      showToast(t('Name and Code are required.'));
      return;
    }

    if (editingWarehouse) {
      const updated = warehouses.map(w => {
        if (w.id === editingWarehouse.id) {
          return {
            ...w,
            name: formName,
            code: formCode,
            address: formAddress,
            type: formType,
            manager_name: formManagerName,
            status: formStatus
          };
        }
        return w;
      });
      saveWarehouses(updated);
      showToast(t('Depot details updated.'));
    } else {
      const newWh: Warehouse = {
        id: `w-${Date.now()}`,
        company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1',
        name: formName,
        code: formCode,
        address: formAddress,
        type: formType,
        manager_name: formManagerName,
        status: formStatus,
        created_at: new Date().toISOString()
      };
      saveWarehouses([...warehouses, newWh]);
      showToast(t('New depot created!'));
    }
    setModalOpen(false);
  };

  // Toggle status directly on card
  const toggleStatus = (id: string) => {
    const updated = warehouses.map(w => {
      if (w.id === id) {
        const nextStatus = w.status === 'active' ? 'inactive' : 'active';
        showToast(`${t('Warehouse')} ${w.code} ${t('is now')} ${t(nextStatus)}`);
        return { ...w, status: nextStatus as any };
      }
      return w;
    });
    saveWarehouses(updated);
  };

  // Get details for warehouse
  const getWarehouseStats = (warehouseId: string) => {
    const whProducts = products.filter(p => p.warehouse_id === warehouseId);
    const totalQty = whProducts.reduce((sum, p) => sum + p.current_qty, 0);
    const totalVal = whProducts.reduce((sum, p) => sum + (p.current_qty * p.cost_price), 0);
    return {
      skuCount: whProducts.length,
      totalQty,
      totalVal,
      items: whProducts
    };
  };

  if (!mounted) return null;

  return (
    <PermissionGuard module="inventory">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen text-xs select-none">
        
        {/* Toast alerts */}
        {toastMsg && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-955 rounded-lg shadow-xl font-bold border border-zinc-800 dark:border-zinc-200 animate-slide-up flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-500" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t('Multi-Warehouse Location Management')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
              {t('Set up dry yards, cold storage rooms, defective isolation bays, and structural warehouses.')}
            </p>
          </div>

          <div>
            <button 
              onClick={handleCreateOpen}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 rounded-lg font-bold transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t('Add Warehouse Depot')}
            </button>
          </div>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {warehouses.map((wh) => {
            const stats = getWarehouseStats(wh.id);
            const isExpanded = expandedWhId === wh.id;

            // Type color coding
            const whType = wh.type || 'raw_materials';
            let typeColor = 'bg-zinc-100 text-zinc-650 dark:bg-zinc-900 dark:text-zinc-400';
            if (whType === 'raw_materials') typeColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-450';
            else if (whType === 'finished_goods') typeColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
            else if (whType === 'tools') typeColor = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';
            else if (whType === 'defective') typeColor = 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455';
            else if (whType === 'quarantine') typeColor = 'bg-violet-50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-455';

            return (
              <div 
                key={wh.id} 
                className={`saas-card p-5 space-y-4 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 ${isExpanded ? 'ring-1 ring-zinc-400 dark:ring-zinc-700' : ''}`}
              >
                
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
                      <FolderSync className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-zinc-850 dark:text-zinc-50">{wh.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                        <Code className="h-3 w-3" />
                        <span>Code:</span>
                        <strong className="text-zinc-650 dark:text-zinc-350">{wh.code}</strong>
                      </div>
                    </div>
                  </div>

                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase tracking-wider ${typeColor}`}>
                    {whType.replace('_', ' ')}
                  </span>
                </div>

                {/* Info block */}
                <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-200/40 dark:border-zinc-850/50 font-mono text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">{t('SKUs Stocked')}</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-bold">{stats.skuCount} items</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">{t('Depot Valuation')}</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-bold">${stats.totalVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-2 text-[10px] text-zinc-650 dark:text-zinc-400">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{wh.address || t('No address')}</span>
                </div>

                {/* Manager */}
                <div className="flex items-center justify-between text-[10px] text-zinc-650 dark:text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-850">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{wh.manager_name || 'Charlie Stock'}</span>
                  </div>

                  <button
                    onClick={() => toggleStatus(wh.id)}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-bold transition-colors ${wh.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${wh.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {wh.status === 'active' ? t('Active') : t('Inactive')}
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setExpandedWhId(isExpanded ? null : wh.id)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-250 transition-colors"
                  >
                    <Layers3 className="h-3.5 w-3.5" />
                    {isExpanded ? t('Hide stock list') : t('View stock breakdown')}
                  </button>

                  <button
                    onClick={() => handleEditOpen(wh)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-250 transition-colors"
                  >
                    <Edit2 className="h-3 w-3" />
                    {t('Edit Depot')}
                  </button>
                </div>

                {/* Card Expansion - Stock Breakdown */}
                {isExpanded && (
                  <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-850 space-y-2 max-h-48 overflow-y-auto pr-1">
                    <h4 className="text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">{t('Material Inventory details')}</h4>
                    {stats.items.length === 0 ? (
                      <p className="text-[9.5px] text-zinc-400 dark:text-zinc-550 py-1 text-center font-medium">{t('Depot is currently empty.')}</p>
                    ) : (
                      stats.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-zinc-250/20 dark:border-zinc-850/20 last:border-0 font-mono text-[9px]">
                          <div className="flex items-center gap-2 truncate max-w-[170px]">
                            <Archive className="h-3 w-3 text-zinc-400 shrink-0" />
                            <span className="font-bold text-zinc-700 dark:text-zinc-350 truncate">{item.name}</span>
                          </div>
                          <span className="font-bold text-zinc-850 dark:text-zinc-150 shrink-0">{item.current_qty} {item.uom}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Modal Form for Add/Edit */}
        {modalOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-850 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
              
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-850">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-550">
                  {editingWarehouse ? t('Edit Depot Properties') : t('Enroll New Warehouse Depot')}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-450">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSaveWarehouse} className="p-5 space-y-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Warehouse Depot Name *')}</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Brooklyn Main Yard"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none"
                  />
                </div>

                {/* Code */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Depot Code (Short) *')}</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. BKL-01"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none font-mono"
                  />
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Storage Type')}</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none font-bold"
                  >
                    <option value="raw_materials">{t('Raw Materials Storage')}</option>
                    <option value="finished_goods">{t('Finished Goods Depot')}</option>
                    <option value="tools">{t('Tools & Asset Depot')}</option>
                    <option value="defective">{t('Defective Isolation Bay')}</option>
                    <option value="quarantine">{t('QC Holding Inspection')}</option>
                  </select>
                </div>

                {/* Manager Name */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Assigned Manager')}</label>
                  <input
                    type="text"
                    value={formManagerName}
                    onChange={(e) => setFormManagerName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Physical Address / GPS Location')}</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Operational Status')}</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none font-bold"
                  >
                    <option value="active">{t('Active Operations')}</option>
                    <option value="inactive">{t('Inactive / Suspended')}</option>
                  </select>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200/50 dark:border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-650 dark:text-zinc-350 font-bold transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-95 rounded-lg font-bold transition-opacity"
                  >
                    {t('Save Depot')}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </PermissionGuard>
  );
}
