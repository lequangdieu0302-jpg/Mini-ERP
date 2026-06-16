'use client';

import React, { useState } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import { Product } from '@/types/erp';
import { MATERIAL_CATEGORIES } from '@/data/wms-seed';
import {
  Search, Plus, Filter, ChevronDown, ChevronUp, Download, Upload,
  Edit2, Trash2, X, AlertTriangle, CheckCircle, Info, Barcode
} from 'lucide-react';

export default function MaterialsCatalog() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useERP();
  const { products, saveProducts, warehouses } = useWMSState();

  // Local UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Toast notifications state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Field states
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formUom, setFormUom] = useState('Piece');
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCostPrice, setFormCostPrice] = useState(0);
  const [formSalePrice, setFormSalePrice] = useState(0);
  const [formMinQty, setFormMinQty] = useState(0);
  const [formMaxQty, setFormMaxQty] = useState(0);
  const [formCurrentQty, setFormCurrentQty] = useState(0);
  const [formBarcode, setFormBarcode] = useState('');
  const [formManufacturer, setFormManufacturer] = useState('');
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<Product['status']>('active');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  // Open modal for Create
  const handleCreateOpen = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku('');
    setFormCategory(MATERIAL_CATEGORIES[0]);
    setFormUom('Piece');
    setFormWarehouse(warehouses[0]?.id || '');
    setFormLocation('A-01-01');
    setFormCostPrice(0);
    setFormSalePrice(0);
    setFormMinQty(0);
    setFormMaxQty(0);
    setFormCurrentQty(0);
    setFormBarcode('');
    setFormManufacturer('');
    setFormSupplierId('');
    setFormDescription('');
    setFormStatus('active');
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleEditOpen = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku || '');
    setFormCategory(p.category_name || '');
    setFormUom(p.uom || 'Piece');
    setFormWarehouse(p.warehouse_id || '');
    setFormLocation(p.location || '');
    setFormCostPrice(p.cost_price);
    setFormSalePrice(p.sale_price);
    setFormMinQty(p.min_qty || 0);
    setFormMaxQty(p.max_qty || 0);
    setFormCurrentQty(p.current_qty);
    setFormBarcode(p.barcode || '');
    setFormManufacturer(p.manufacturer || '');
    setFormSupplierId(p.supplier_id || '');
    setFormDescription(p.description || '');
    setFormStatus(p.status || 'active');
    setModalOpen(true);
  };

  // Handle Save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName || !formSku) {
      showToast(t('Product Name and SKU are required.'));
      return;
    }

    if (editingProduct) {
      // Update
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formName,
            sku: formSku,
            category_name: formCategory,
            uom: formUom,
            warehouse_id: formWarehouse,
            location: formLocation,
            cost_price: Number(formCostPrice),
            sale_price: Number(formSalePrice),
            min_qty: Number(formMinQty),
            max_qty: Number(formMaxQty),
            current_qty: Number(formCurrentQty),
            barcode: formBarcode,
            manufacturer: formManufacturer,
            supplier_id: formSupplierId,
            description: formDescription,
            status: formStatus
          };
        }
        return p;
      });
      saveProducts(updated);
      showToast(t('Material updated successfully!'));
    } else {
      // Create
      const newProduct: Product = {
        id: `p${Date.now()}`,
        company_id: 'c8b671a8-ff69-42b7-a37a-77c86f7881c1',
        is_material: true,
        name: formName,
        sku: formSku,
        category_name: formCategory,
        uom: formUom,
        warehouse_id: formWarehouse,
        location: formLocation,
        cost_price: Number(formCostPrice),
        sale_price: Number(formSalePrice),
        min_qty: Number(formMinQty),
        max_qty: Number(formMaxQty),
        current_qty: Number(formCurrentQty),
        barcode: formBarcode,
        manufacturer: formManufacturer,
        supplier_id: formSupplierId,
        description: formDescription,
        status: formStatus,
        created_at: new Date().toISOString()
      };
      saveProducts([newProduct, ...products]);
      showToast(t('New material added to ledger!'));
    }
    setModalOpen(false);
  };

  // Delete
  const handleDeleteProduct = (id: string) => {
    if (confirm(t('Are you sure you want to delete this material from records?'))) {
      const updated = products.filter(p => p.id !== id);
      saveProducts(updated);
      showToast(t('Material removed from ledger.'));
    }
  };

  // Filters logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (p.barcode && p.barcode.includes(searchTerm));
    const matchesCategory = selectedCategory === 'All' || p.category_name === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!mounted) return null;

  return (
    <PermissionGuard module="inventory">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen text-xs select-none">
        
        {/* Toast alerts */}
        {toastMsg && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg shadow-xl font-bold border border-zinc-800 dark:border-zinc-200 animate-slide-up flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              {t('Materials Ledger Catalog')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
              {t('Maintain structural materials, item classification rules, costing values, and bin locations.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => showToast(t('Export feature coming soon!'))}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-650 dark:text-zinc-350 font-bold transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              {t('Export CSV')}
            </button>
            <button 
              onClick={() => showToast(t('Import templates coming soon!'))}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-650 dark:text-zinc-350 font-bold transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              {t('Import Ledger')}
            </button>
            <button 
              onClick={handleCreateOpen}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 rounded-lg font-bold transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t('Add New SKU')}
            </button>
          </div>
        </div>

        {/* Search, Filter & Tabs bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder={t('Search by material name, SKU, or barcode...')}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 outline-none text-zinc-800 dark:text-zinc-150 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              />
            </div>

            {/* Status Selector dropdown */}
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value as any); setCurrentPage(1); }}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 outline-none font-bold text-zinc-700 dark:text-zinc-300"
              >
                <option value="all">{t('All Statuses')}</option>
                <option value="active">{t('Active Only')}</option>
                <option value="inactive">{t('Inactive Only')}</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 outline-none font-bold text-zinc-700 dark:text-zinc-300"
              >
                <option value="All">{t('All Categories')}</option>
                {MATERIAL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Category Quick Pills */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 border-b border-zinc-100 dark:border-zinc-850">
            <button
              onClick={() => { setSelectedCategory('All'); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-full font-bold transition-all text-[10px] ${selectedCategory === 'All' ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'}`}
            >
              {t('All Categories')}
            </button>
            {MATERIAL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full font-bold transition-all text-[10px] whitespace-nowrap ${selectedCategory === cat ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="saas-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-450 dark:text-zinc-550 border-b border-zinc-250/20 dark:border-zinc-800/50 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-6"></th>
                  <th className="py-3.5 px-3">{t('SKU / Barcode')}</th>
                  <th className="py-3.5 px-3">{t('Material Name')}</th>
                  <th className="py-3.5 px-3">{t('Category')}</th>
                  <th className="py-3.5 px-3">{t('Depot / Bin Location')}</th>
                  <th className="py-3.5 px-3 text-right">{t('Cost Price')}</th>
                  <th className="py-3.5 px-3 text-right">{t('Current Qty')}</th>
                  <th className="py-3.5 px-3 text-center">{t('Status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-850/40">
                {displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-zinc-450 bg-zinc-50/10 dark:bg-zinc-900/5">
                      {t('No materials match current search queries.')}
                    </td>
                  </tr>
                ) : (
                  displayedProducts.map((p) => {
                    const isExpanded = expandedRow === p.id;
                    const isBelowMin = p.current_qty < p.min_qty;
                    const isCloseToMin = p.current_qty >= p.min_qty && p.current_qty <= p.min_qty * 1.25;

                    // Color code stock badge
                    let qtyColorClass = 'text-emerald-500 dark:text-emerald-450 font-bold';
                    let qtyBgClass = 'bg-emerald-50 dark:bg-emerald-950/20';
                    let stockStatusText = t('Stock Level OK');
                    if (isBelowMin) {
                      qtyColorClass = 'text-red-500 font-extrabold animate-pulse';
                      qtyBgClass = 'bg-red-50 dark:bg-red-950/20';
                      stockStatusText = t('CRITICAL LOW');
                    } else if (isCloseToMin) {
                      qtyColorClass = 'text-amber-500 font-bold';
                      qtyBgClass = 'bg-amber-50 dark:bg-amber-950/20';
                      stockStatusText = t('Close to Min');
                    }

                    const warehouse = warehouses.find(w => w.id === p.warehouse_id);

                    return (
                      <React.Fragment key={p.id}>
                        <tr 
                          onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                          className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/25 transition-colors cursor-pointer ${isExpanded ? 'bg-zinc-50/30 dark:bg-zinc-900/10' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5 text-zinc-450" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-zinc-450" />
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-mono font-bold text-zinc-850 dark:text-zinc-50">{p.sku}</div>
                            {p.barcode && (
                              <div className="flex items-center gap-1 text-[9px] text-zinc-400 mt-0.5">
                                <Barcode className="h-2.5 w-2.5" />
                                <span>{p.barcode}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-zinc-800 dark:text-zinc-200">{p.name}</td>
                          <td className="py-3.5 px-3">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-bold">
                              {p.category_name}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-zinc-750 dark:text-zinc-300">{warehouse ? warehouse.name : t('Unassigned')}</div>
                            <div className="text-[9px] text-zinc-450 font-mono mt-0.5">{p.location || t('No specific bin')}</div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                            ${p.cost_price.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className={`inline-flex flex-col items-end px-2 py-1 rounded-md ${qtyBgClass}`}>
                              <span className={`font-mono ${qtyColorClass}`}>{p.current_qty} {p.uom}</span>
                              <span className="text-[7px] font-bold uppercase tracking-wide text-zinc-400 mt-0.5">{stockStatusText}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-zinc-150 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                              {p.status === 'active' ? t('Active') : t('Inactive')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditOpen(p)}
                                className="p-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-600 dark:text-zinc-400"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isExpanded && (
                          <tr className="bg-zinc-50/30 dark:bg-zinc-900/10">
                            <td colSpan={9} className="py-4 px-8 border-t border-b border-zinc-200/40 dark:border-zinc-850/45">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Manufacturer / Brand')}</span>
                                  <p className="text-zinc-700 dark:text-zinc-300 font-semibold">{p.manufacturer || t('Not stated')}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Supplier Details')}</span>
                                  <p className="text-zinc-700 dark:text-zinc-300 font-semibold">{p.supplier_id || t('Direct Sourced')}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Sales Value')}</span>
                                  <p className="text-zinc-700 dark:text-zinc-300 font-mono font-semibold">${p.sale_price.toFixed(2)} / {p.uom}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Safety Limits (Min / Max)')}</span>
                                  <p className="text-zinc-700 dark:text-zinc-300 font-mono font-semibold">
                                    Min: {p.min_qty} | Max: {p.max_qty || t('No Limit')}
                                  </p>
                                </div>
                                <div className="col-span-1 md:col-span-4 space-y-1">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Detailed Remarks')}</span>
                                  <p className="text-zinc-650 dark:text-zinc-400 italic">
                                    {p.description || t('No detailed specifications loaded for this item.')}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination buttons */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-200/50 dark:border-zinc-800">
              <span className="text-zinc-450 font-medium">
                {t('Showing page')} <strong>{currentPage}</strong> {t('of')} <strong>{totalPages}</strong> ({filteredProducts.length} {t('materials')})
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-450 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  {t('Previous')}
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-450 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  {t('Next')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Form for Add/Edit */}
        {modalOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-850">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                  {editingProduct ? t('Edit SKU Properties') : t('Enroll New Material SKU')}
                </h3>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-450"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Material SKU Name *')}</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Portland Cement Grade 42.5"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600"
                    />
                  </div>

                  {/* SKU / Part Number */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('SKU Part Number *')}</label>
                    <input
                      type="text"
                      required
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="e.g. CEM-PORT-42"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Material Group Category')}</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 font-bold"
                    >
                      {MATERIAL_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* UOM */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Unit of Measure (UOM)')}</label>
                    <input
                      type="text"
                      value={formUom}
                      onChange={(e) => setFormUom(e.target.value)}
                      placeholder="e.g. Bag (50kg), m³, Ton, Piece"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600"
                    />
                  </div>

                  {/* Depot selector */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Assigned Default Yard / Depot')}</label>
                    <select
                      value={formWarehouse}
                      onChange={(e) => setFormWarehouse(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 font-bold"
                    >
                      <option value="">{t('Unassigned')}</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bin Location */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Specific Bin / Location Code')}</label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. A-01-01"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600"
                    />
                  </div>

                  {/* Cost price */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Standard Unit Cost ($) *')}</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600 font-mono"
                    />
                  </div>

                  {/* Sale price */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Default List Sale Price ($)')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formSalePrice}
                      onChange={(e) => setFormSalePrice(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600 font-mono"
                    />
                  </div>

                  {/* Current stock (only editable when creating, or simple count adjustment) */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      {t('Opening Stock Qty')}
                    </label>
                    <input
                      type="number"
                      value={formCurrentQty}
                      onChange={(e) => setFormCurrentQty(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600 font-mono"
                    />
                  </div>

                  {/* Safety Stock Min */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Safety Stock Limit (Min Qty)')}</label>
                    <input
                      type="number"
                      value={formMinQty}
                      onChange={(e) => setFormMinQty(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600 font-mono"
                    />
                  </div>

                  {/* Max Stock Limit */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Maximum Capacity Qty')}</label>
                    <input
                      type="number"
                      value={formMaxQty}
                      onChange={(e) => setFormMaxQty(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600 font-mono"
                    />
                  </div>

                  {/* Barcode */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('EAN / Barcode / QR String')}</label>
                    <input
                      type="text"
                      value={formBarcode}
                      onChange={(e) => setFormBarcode(e.target.value)}
                      placeholder="e.g. 885002010111"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600"
                    />
                  </div>

                  {/* Manufacturer */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Manufacturer / Brand Name')}</label>
                    <input
                      type="text"
                      value={formManufacturer}
                      onChange={(e) => setFormManufacturer(e.target.value)}
                      placeholder="e.g. Sika, Posco"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('Ledger Status')}</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 font-bold"
                    >
                      <option value="active">{t('Active / In Circulation')}</option>
                      <option value="inactive">{t('Inactive / Deprecated')}</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t('SKU Description & Spec Sheets')}</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder={t('Enter detailed material specifications, packaging standards, and grade properties...')}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-zinc-850 dark:text-zinc-200 focus:border-zinc-400 dark:focus:border-zinc-600 resize-none"
                    />
                  </div>

                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200/50 dark:border-zinc-850 mt-4">
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
                    {t('Save SKU record')}
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
