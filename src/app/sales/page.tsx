'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Plus, FileText, Printer, Check, Search, Trash2, 
  ShoppingCart, ShieldAlert, ArrowLeftRight, X
} from 'lucide-react';
import { SalesOrder, SalesOrderLine } from '@/types/erp';

export default function Sales() {
  const { salesOrders, customers, products, createSalesOrder, t } = useERP();
  
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCustId, setSelectedCustId] = useState('');
  
  // Line items state
  const [lines, setLines] = useState<{ productId: string; qty: number; discount: number }[]>([
    { productId: '', qty: 1, discount: 0 }
  ]);

  const [previewOrder, setPreviewOrder] = useState<SalesOrder | null>(null);

  const handleAddLine = () => {
    setLines([...lines, { productId: '', qty: 1, discount: 0 }]);
  };

  const handleRemoveLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: string, val: string | number) => {
    setLines(lines.map((line, i) => {
      if (i === idx) {
        return { ...line, [field]: val };
      }
      return line;
    }));
  };

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    lines.forEach((line) => {
      const prod = products.find(p => p.id === line.productId);
      if (prod) {
        const lineAmount = (prod.sale_price * line.qty) * (1 - line.discount / 100);
        subtotal += lineAmount;
      }
    });
    const tax = subtotal * 0.0885; // 8.85% NY Sales tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId || lines.some(l => !l.productId)) return;

    const { subtotal, tax, total } = calculateTotals();

    const orderLines: Partial<SalesOrderLine>[] = lines.map(l => {
      const prod = products.find(p => p.id === l.productId);
      return {
        product_id: l.productId,
        qty: l.qty,
        price_unit: prod?.sale_price || 0,
        discount: l.discount,
        amount: ((prod?.sale_price || 0) * l.qty) * (1 - l.discount / 100)
      };
    });

    createSalesOrder({
      customer_id: selectedCustId,
      amount_untaxed: subtotal,
      amount_tax: tax,
      amount_total: total
    }, orderLines);

    // Reset
    setSelectedCustId('');
    setLines([{ productId: '', qty: 1, discount: 0 }]);
    setIsCreating(false);
  };

  const totals = calculateTotals();

  return (
    <PermissionGuard module="sales">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Print PDF specific styles override */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-preview-modal, #print-preview-modal * { visibility: visible; }
          #print-preview-modal { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-550 tracking-tight">{t("Sales Orders & Quotations")}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t("Generate contractor client quotes and track order delivery.")}</p>
        </div>

        <button 
          onClick={() => { setIsCreating(!isCreating); setPreviewOrder(null); }}
          className="saas-button-primary flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> {t("Create Quotation")}
        </button>
      </div>

      {/* Create Quotation Form */}
      {isCreating && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-6 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t("Draft New Quotation")}</h3>
            <button 
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-zinc-400 hover:text-zinc-650"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-1.5 max-w-xs">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Select Customer *")}</label>
            <select
              required
              value={selectedCustId}
              onChange={(e) => setSelectedCustId(e.target.value)}
              className="saas-input"
            >
              <option value="">{t("-- Choose Client --")}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Line items section */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Line Items")}</h4>
            
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <select
                      required
                      value={line.productId}
                      onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                      className="saas-input"
                    >
                      <option value="">{t("-- Select Material --")}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (${p.sale_price}/{p.uom_id === 'uom5' ? t('ton') : t('unit')})</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={t("Quantity")}
                      value={line.qty}
                      onChange={(e) => handleLineChange(idx, 'qty', Number(e.target.value))}
                      className="saas-input"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder={t("Discount%")}
                      value={line.discount}
                      onChange={(e) => handleLineChange(idx, 'discount', Number(e.target.value))}
                      className="saas-input"
                    />
                  </div>

                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="text-rose-500 hover:text-rose-600 p-2 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-md transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="text-indigo-500 hover:text-indigo-600 font-bold text-[11px] flex items-center gap-1.5 mt-2"
            >
              + {t("Add Line Item")}
            </button>
          </div>

          {/* Subtotals & Submit */}
          <div className="flex flex-col sm:flex-row justify-between items-end border-t border-zinc-200/50 dark:border-zinc-800/50 pt-5 gap-4">
            
            {/* Display totals */}
            <div className="space-y-1.5 min-w-[220px]">
              <div className="flex justify-between text-zinc-450 dark:text-zinc-550">
                <span>{t("Subtotal:")}</span>
                <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-450 dark:text-zinc-550">
                <span>{t("NY Tax (8.85%):")}</span>
                <span className="font-semibold">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-200 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-1.5">
                <span>{t("Total:")}</span>
                <span className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50">${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="saas-button-secondary"
              >
                {t("Cancel")}
              </button>
              <button 
                type="submit"
                className="saas-button-primary flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" /> {t("Confirm Sale Order")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Orders List Table */}
      <div className="saas-card overflow-hidden">
        <table className="saas-table">
          <thead>
            <tr>
              <th>{t("Order Date")}</th>
              <th>{t("Customer")}</th>
              <th>{t("Status")}</th>
              <th className="text-right">{t("Amount")}</th>
              <th className="text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {salesOrders.map((order) => {
              const cust = customers.find(c => c.id === order.customer_id);
              return (
                <tr key={order.id}>
                  <td suppressHydrationWarning className="font-medium text-zinc-500">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="font-bold text-zinc-900 dark:text-zinc-50">
                    {cust?.name || 'Unknown Client'}
                  </td>
                  <td>
                    <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-955/20 dark:text-emerald-400 border border-emerald-250/20 dark:border-emerald-900/30">
                      {t("Confirmed Sale")}
                    </span>
                  </td>
                  <td suppressHydrationWarning className="text-right font-bold text-zinc-900 dark:text-zinc-550">
                    ${order.amount_total.toLocaleString()}
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setPreviewOrder(order)}
                      className="text-indigo-500 hover:text-indigo-600 font-bold inline-flex items-center gap-1 text-[11px]"
                    >
                      <Printer className="h-3.5 w-3.5" /> {t("PDF Statement")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PDF PRINT PREVIEW INTERACTIVE DIALOG MODAL */}
      {previewOrder && (() => {
        const cust = customers.find(c => c.id === previewOrder.customer_id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-zinc-200/50 bg-white shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950 overflow-hidden animate-in fade-in duration-200">
              
              {/* Modal control bar */}
              <div className="flex items-center justify-between border-b border-zinc-200/50 bg-zinc-50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t("Quotation Statement Viewer")}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="saas-button-primary flex items-center gap-1.5 h-8 text-[11px] px-3"
                  >
                    <Printer className="h-3.5 w-3.5" /> {t("Print / Save PDF")}
                  </button>
                  <button
                    onClick={() => setPreviewOrder(null)}
                    className="saas-button-secondary h-8 text-[11px] px-3"
                  >
                    {t("Close")}
                  </button>
                </div>
              </div>

              {/* Printable Invoice layout */}
              <div id="print-preview-modal" className="flex-1 overflow-y-auto p-8 bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-200 space-y-6">
                
                {/* Invoice header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">APEX CONSTRUCTION LTD</h2>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">100 Construction Blvd, New York, NY</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">T: +1-555-0100 | E: billing@apexconstruction.com</p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Sales Order</h1>
                    <p suppressHydrationWarning className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Date: {new Date(previewOrder.order_date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Ref: SO-{previewOrder.id.substring(0, 6).toUpperCase()}</p>
                  </div>
                </div>

                <hr className="border-zinc-200/50 dark:border-zinc-800/50" />

                {/* Billing Addresses info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[10px] leading-relaxed">
                  <div>
                    <span className="font-bold text-zinc-400 uppercase">Billed To:</span>
                    <h3 className="font-bold text-zinc-900 dark:text-white mt-1">{cust?.name}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">{cust?.address || 'No billing address provided.'}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">E: {cust?.email} | T: {cust?.phone}</p>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-400 uppercase">Payment Terms:</span>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Due within 30 days of invoicing (Net 30).</p>
                    <p className="text-zinc-500 dark:text-zinc-400">Method: Bank Direct Wire Transfer or Corporate check.</p>
                  </div>
                </div>

                {/* Items breakdown list */}
                <div className="border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-zinc-200/50 bg-zinc-50 dark:border-zinc-850 dark:bg-zinc-800/40 font-bold uppercase text-zinc-400">
                        <th className="px-4 py-2">Item Description</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-right">Qty</th>
                        <th className="px-4 py-2 text-right">Discount</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-250/30 dark:divide-zinc-800/30">
                      <tr>
                        <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">Portland Cement Grade 42.5 (Bulk)</td>
                        <td className="px-4 py-3 text-right">$12.50</td>
                        <td className="px-4 py-3 text-right">500 units</td>
                        <td className="px-4 py-3 text-right">0%</td>
                        <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-zinc-100">$6,250.00</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">Deformed Steel Rebar 16mm (Grade 60)</td>
                        <td className="px-4 py-3 text-right">$850.00</td>
                        <td className="px-4 py-3 text-right">5 metric tons</td>
                        <td className="px-4 py-3 text-right">5%</td>
                        <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-zinc-100">$4,037.50</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Document summary pricing math */}
                <div className="flex justify-end pt-4">
                  <div className="w-64 space-y-2 text-[10px]">
                    <div className="flex justify-between text-zinc-500">
                      <span>Untaxed Subtotal:</span>
                      <span className="font-semibold text-zinc-950 dark:text-white">${previewOrder.amount_untaxed.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>NY Sales Tax (8.85%):</span>
                      <span className="font-semibold text-zinc-950 dark:text-white">${previewOrder.amount_tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2 font-bold text-zinc-900 dark:text-white">
                      <span>Total Amount Due:</span>
                      <span className="text-xs font-bold text-indigo-500">${previewOrder.amount_total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="pt-12 text-[9px] text-zinc-400 dark:text-zinc-550 text-center leading-relaxed">
                  <p>Thank you for choosing Apex Construction Ltd for your material supply and engineering operations.</p>
                  <p className="font-semibold mt-1">Subject to standard terms & conditions. Invoices are valid for 30 days.</p>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

    </div>
    </PermissionGuard>
  );
}

