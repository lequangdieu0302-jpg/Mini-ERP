'use client';

import React, { useState, useEffect } from 'react';
import { PermissionGuard } from '@/components/permission-guard';
import { useERP } from '@/context/erp-context';
import { useWMSState } from '@/hooks/use-wms-state';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import {
  Package, Warehouse, TrendingUp, AlertTriangle, ArrowLeftRight,
  ClipboardList, BadgeAlert, Calendar, History, BarChart3,
  Layers, PackagePlus, PackageMinus, Settings2
} from 'lucide-react';

export default function WMSDashboard() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { t } = useERP();
  const { warehouses } = useWMSState();

  // Dashboard Stats
  const [totalSKUs, setTotalSKUs] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [slowMovingCount, setSlowMovingCount] = useState(0);
  const [receivedToday, setReceivedToday] = useState(0);
  const [nearExpiryCount, setNearExpiryCount] = useState(0);

  // Exact database counts for quick cards
  const [receiptsCount, setReceiptsCount] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);
  const [transfersCount, setTransfersCount] = useState(0);
  const [countsCount, setCountsCount] = useState(0);
  const [batchesCount, setBatchesCount] = useState(0);

  // Dashboard Charts
  const [stockInOutData, setStockInOutData] = useState<any[]>([]);
  const [topIssued, setTopIssued] = useState<any[]>([]);
  const [topValued, setTopValued] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // 1. Stats from aggregate view
      const { data: statsData, error: statsErr } = await supabase
        .from('inventory_dashboard_stats')
        .select('*')
        .single();
      
      if (!statsErr && statsData) {
        setTotalSKUs(Number(statsData.total_skus) || 0);
        setTotalValue(Number(statsData.total_value) || 0);
        setLowStockCount(Number(statsData.low_stock_count) || 0);
        setSlowMovingCount(Number(statsData.slow_moving_count) || 0);
        setReceivedToday(Number(statsData.received_today) || 0);
      }

      // 2. Near expiry batches count (within 90 days from 2026-06-15)
      const referenceDateStr = '2026-06-15';
      const ninetyDaysLaterStr = '2026-09-13';
      const { count: expCount, error: expErr } = await supabase
        .from('batch_lots')
        .select('*', { count: 'exact', head: true })
        .gte('expiry_date', referenceDateStr)
        .lte('expiry_date', ninetyDaysLaterStr)
        .eq('status', 'available');

      if (!expErr) {
        setNearExpiryCount(expCount || 0);
      }

      // 3. Recent Receipts & Issues (last 7 days from 2026-06-15)
      const startDateStr = '2026-06-08';
      const endDateStr = '2026-06-15';

      const { data: recsData } = await supabase
        .from('stock_receipts')
        .select('*, lines:stock_receipt_lines(*)')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      const { data: issuesData } = await supabase
        .from('stock_issues')
        .select('*, lines:stock_issue_lines(*)')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      const recentReceipts = recsData || [];
      const recentIssues = issuesData || [];

      // Calculate Stock In vs Stock Out by Day (Last 7 Days)
      const referenceDate = new Date(endDateStr);
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(referenceDate);
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const inOutData = last7Days.map(date => {
        const inQty = recentReceipts
          .filter(r => r.date === date)
          .reduce((sum, r) => sum + r.lines.reduce((s: number, l: any) => s + l.qty, 0), 0);
        const outQty = recentIssues
          .filter(i => i.date === date)
          .reduce((sum, i) => sum + i.lines.reduce((s: number, l: any) => s + l.qty_issued, 0), 0);
        
        const dateObj = new Date(date);
        const dayLabel = dateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
        return { dateLabel: dayLabel, inQty, outQty };
      });
      setStockInOutData(inOutData);

      // 4. Calculate Top Issued Materials
      const productIssueQtyMap: Record<string, { name: string; qty: number }> = {};
      recentIssues.forEach(iss => {
        iss.lines.forEach((l: any) => {
          if (!productIssueQtyMap[l.product_id]) {
            productIssueQtyMap[l.product_id] = { name: l.product_name || 'Material', qty: 0 };
          }
          productIssueQtyMap[l.product_id].qty += Number(l.qty_issued) || 0;
        });
      });
      const topIssuedList = Object.values(productIssueQtyMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
      setTopIssued(topIssuedList);

      // 5. Fetch Top 10 High-Valued Items (approximated by quantity)
      const { data: topProds } = await supabase
        .from('products')
        .select('name, current_qty, cost_price')
        .order('current_qty', { ascending: false })
        .limit(10);
      
      const topValuedList = (topProds || [])
        .map(p => ({ name: p.name, value: p.cost_price * p.current_qty }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      setTopValued(topValuedList);

      // 6. Fetch exact counts (head: true) for the quick access cards
      const { count: recsCount } = await supabase.from('stock_receipts').select('*', { count: 'exact', head: true });
      setReceiptsCount(recsCount || 0);

      const { count: issCount } = await supabase.from('stock_issues').select('*', { count: 'exact', head: true });
      setIssuesCount(issCount || 0);

      const { count: trfsCount } = await supabase.from('stock_transfers').select('*', { count: 'exact', head: true });
      setTransfersCount(trfsCount || 0);

      const { count: cntsCount } = await supabase.from('stock_counts').select('*', { count: 'exact', head: true });
      setCountsCount(cntsCount || 0);

      const { count: batCount } = await supabase.from('batch_lots').select('*', { count: 'exact', head: true });
      setBatchesCount(batCount || 0);

      // 7. Fetch low stock products from view (limit 5 for dashboard)
      const { data: lowStockData } = await supabase
        .from('products_below_min_qty')
        .select('*')
        .limit(5);
      setLowStockProducts(lowStockData || []);

      // 8. Fetch recent 4 transactions for timeline
      const { data: txData } = await supabase
        .from('inventory_transactions')
        .select('*, product:products(name, sku), warehouse:warehouses(name)')
        .order('created_at', { ascending: false })
        .limit(4);

      const mappedTxns = (txData || []).map((t: any) => ({
        id: t.id,
        action: t.action,
        reference_no: t.reference_no,
        qty_change: Number(t.qty_change) || 0,
        qty_after: Number(t.qty_after) || 0,
        created_at: t.created_at,
        product_name: t.product ? t.product.name : 'Unknown Product',
        sku: t.product ? t.product.sku : '',
        warehouse_name: t.warehouse ? t.warehouse.name : 'Depot'
      }));
      setTransactionsList(mappedTxns);

    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchDashboardData();
    }
  }, [mounted]);

  // Maximum values for chart percentage scaling
  const maxInOut = Math.max(...stockInOutData.map(d => Math.max(d.inQty, d.outQty)), 1);
  const maxIssued = Math.max(...topIssued.map(d => d.qty), 1);
  const maxValued = Math.max(...topValued.map(d => d.value), 1);

  if (!mounted) return null;

  return (
    <PermissionGuard module="inventory">
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto min-h-screen text-xs select-none">
        
        {/* Header Title & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold mb-1">
              <span>{t('Dieule ERP')}</span>
              <span>/</span>
              <span className="text-zinc-650 dark:text-zinc-350">{t('Warehouse Management')}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
              <Warehouse className="h-6 w-6 text-zinc-950 dark:text-white" />
              {t('Warehouse Operations Control Room')}
            </h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-450 mt-1">
              {t('Real-time tracking of materials ledger, batch expiration cycles, and stock distribution.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 font-medium border border-emerald-200/30 dark:border-emerald-900/30 font-mono text-[9px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('System Live & Synchronized')}
            </span>
          </div>
        </div>

        {/* Quick Access Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link href="/inventory/materials" className="wms-nav-card group">
            <Layers className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold mt-2">{t('Material Catalog')}</span>
            <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono mt-0.5">{totalSKUs} SKU</span>
          </Link>
          <Link href="/inventory/stock-in" className="wms-nav-card group">
            <PackagePlus className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold mt-2">{t('Goods Receipt (Stock-In)')}</span>
            <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono mt-0.5">{receiptsCount} slips</span>
          </Link>
          <Link href="/inventory/stock-out" className="wms-nav-card group">
            <PackageMinus className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold mt-2">{t('Goods Issue (Stock-Out)')}</span>
            <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono mt-0.5">{issuesCount} slips</span>
          </Link>
          <Link href="/inventory/transfers" className="wms-nav-card group">
            <ArrowLeftRight className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold mt-2">{t('Inter-Warehouse Transfer')}</span>
            <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono mt-0.5">{transfersCount} orders</span>
          </Link>
          <Link href="/inventory/stock-count" className="wms-nav-card group">
            <ClipboardList className="h-5 w-5 text-violet-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold mt-2">{t('Inventory Audit Count')}</span>
            <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono mt-0.5">{countsCount} sheets</span>
          </Link>
          <Link href="/inventory/batch-serial" className="wms-nav-card group">
            <BadgeAlert className="h-5 w-5 text-sky-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold mt-2">{t('Batch Lot & Serials')}</span>
            <span className="text-[9px] text-zinc-450 dark:text-zinc-550 font-mono mt-0.5">{batchesCount} batches</span>
          </Link>
        </div>

        {/* Stats Row (Grid-cols-6 for detailed executive summary) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="wms-stat-card bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Total Stock Value')}</span>
              <div className="p-1 rounded-md bg-zinc-200/30 dark:bg-zinc-800/30 text-zinc-800 dark:text-zinc-100">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-mono">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-1">{t('Across all active depots')}</p>
            </div>
          </div>

          <div className="wms-stat-card bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Total SKUs Listed')}</span>
              <div className="p-1 rounded-md bg-zinc-200/30 dark:bg-zinc-800/30 text-zinc-800 dark:text-zinc-100">
                <Package className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-mono">
                {totalSKUs}
              </span>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-1">{t('Unique part numbers')}</p>
            </div>
          </div>

          <div className="wms-stat-card bg-gradient-to-br from-zinc-50 to-red-50/20 dark:from-zinc-900 dark:to-red-950/10 border-red-500/20">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Below Safety stock')}</span>
              <div className="p-1 rounded-md bg-red-100 dark:bg-red-950/40 text-red-500">
                <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-lg md:text-xl font-black tracking-tight font-mono ${lowStockCount > 0 ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-50'}`}>
                {lowStockCount}
              </span>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-1">{t('Requires urgent PO order')}</p>
            </div>
          </div>

          <div className="wms-stat-card bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Incoming Today')}</span>
              <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500">
                <PackagePlus className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-mono">
                +{receivedToday}
              </span>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-1">{t('Units received at yard')}</p>
            </div>
          </div>

          <div className="wms-stat-card bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Slow Moving SKUs')}</span>
              <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-950/40 text-amber-500">
                <Layers className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg md:text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight font-mono">
                {slowMovingCount}
              </span>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-1">{t('Exceeding max capacity')}</p>
            </div>
          </div>

          <div className="wms-stat-card bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Near Expiry')}</span>
              <div className="p-1 rounded-md bg-sky-100 dark:bg-sky-950/40 text-sky-500">
                <Calendar className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-lg md:text-xl font-black tracking-tight font-mono ${nearExpiryCount > 0 ? 'text-amber-500 font-bold' : 'text-zinc-900 dark:text-zinc-50'}`}>
                {nearExpiryCount}
              </span>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-1">{t('Batches expiring < 90d')}</p>
            </div>
          </div>
        </div>

        {/* Charts & Analytical Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Stock In vs Stock Out Timeline (Last 7 Days) */}
          <div className="saas-card p-5 space-y-4 col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{t('Stock Inbound & Outbound Movement Ledger')}</h3>
                <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-0.5">{t('Daily cumulative volumes for the last 7 calendar days')}</p>
              </div>
              <div className="flex items-center gap-3 font-mono text-[9px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded bg-emerald-500"></span>
                  <span className="text-zinc-650 dark:text-zinc-400">{t('Inbound')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded bg-rose-500"></span>
                  <span className="text-zinc-650 dark:text-zinc-400">{t('Outbound')}</span>
                </div>
              </div>
            </div>

            {/* Custom Bar Charts */}
            <div className="h-56 flex items-end justify-between gap-2 pt-4 px-2">
              {stockInOutData.map((d, i) => {
                const inPercent = (d.inQty / maxInOut) * 100;
                const outPercent = (d.outQty / maxInOut) * 100;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full group">
                    <div className="w-full flex-1 flex items-end justify-center gap-1.5 relative">
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 p-2 rounded text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-zinc-250/30">
                        <p className="font-bold border-b border-zinc-800 dark:border-zinc-200 pb-0.5 mb-1">{d.dateLabel}</p>
                        <p className="text-emerald-500 font-bold">In: +{d.inQty}</p>
                        <p className="text-rose-500 font-bold">Out: -{d.outQty}</p>
                      </div>

                      {/* Inbound bar */}
                      <div 
                        style={{ height: `${Math.max(inPercent, 3)}%` }} 
                        className={`w-3.5 rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-400 dark:from-emerald-700 dark:to-emerald-500 transition-all duration-500 ${d.inQty === 0 ? 'opacity-20' : 'opacity-100'}`}
                      />
                      {/* Outbound bar */}
                      <div 
                        style={{ height: `${Math.max(outPercent, 3)}%` }} 
                        className={`w-3.5 rounded-t-sm bg-gradient-to-t from-rose-600 to-rose-450 dark:from-rose-700 dark:to-rose-500 transition-all duration-500 ${d.outQty === 0 ? 'opacity-20' : 'opacity-100'}`}
                      />
                    </div>

                    <span className="text-[9px] font-semibold font-mono text-zinc-450 dark:text-zinc-500 mt-3">{d.dateLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column sidebar: Top Stock Values & Issued */}
          <div className="space-y-6">
            
            {/* Top 5 Valued Items */}
            <div className="saas-card p-5 space-y-3.5">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{t('Top 5 Capitalized Stocks')}</h3>
                <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-0.5">{t('Highest value on-hand (cost_price * qty)')}</p>
              </div>

              <div className="space-y-3 pt-1">
                {topValued.map((item, idx) => {
                  const percent = (item.value / maxValued) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[130px]">{item.name}</span>
                        <span className="font-mono text-zinc-800 dark:text-zinc-100 font-bold">${item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-zinc-750 to-zinc-950 dark:from-zinc-600 dark:to-white rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 5 Issued Materials */}
            <div className="saas-card p-5 space-y-3.5">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{t('Top 5 Fast-Moving Issued Materials')}</h3>
                <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-0.5">{t('Total stock-out volume issued for works')}</p>
              </div>

              <div className="space-y-3 pt-1">
                {topIssued.length === 0 ? (
                  <p className="text-center py-4 text-zinc-400">{t('No issue history recorded.')}</p>
                ) : (
                  topIssued.map((item, idx) => {
                    const percent = (item.qty / maxIssued) * 100;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[130px]">{item.name}</span>
                          <span className="font-mono text-zinc-850 dark:text-zinc-100 font-bold">{item.qty} units</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${percent}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Low Stock Alerts & Recent Ledger Audit Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Low Stock Alert Table */}
          <div className="saas-card p-5 space-y-4 col-span-1 lg:col-span-2">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                {t('Safety Stock Level Breach Warning Room')}
              </h3>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-0.5">
                {t('Materials listed below are critically below designated safety margins.')}
              </p>
            </div>

            <div className="overflow-x-auto border border-zinc-200/50 dark:border-zinc-850 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-450 dark:text-zinc-500 font-bold border-b border-zinc-200/50 dark:border-zinc-850">
                    <th className="py-2.5 px-4">{t('SKU')}</th>
                    <th className="py-2.5 px-3">{t('Material Description')}</th>
                    <th className="py-2.5 px-3 font-mono text-right">{t('Current')}</th>
                    <th className="py-2.5 px-3 font-mono text-right">{t('Safety Min')}</th>
                    <th className="py-2.5 px-4 text-center">{t('Status Ratio')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-850/40">
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-zinc-450 font-medium bg-zinc-50/20 dark:bg-zinc-950/20">
                        {t('No safety stock breaches detected. All levels fully optimal.')}
                      </td>
                    </tr>
                  ) : (
                    lowStockProducts.map((p) => {
                      const ratio = Math.min((p.current_qty / p.min_qty) * 100, 100);
                      return (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                          <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-50">{p.sku}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-zinc-800 dark:text-zinc-200">{p.name}</div>
                            <div className="text-[9px] text-zinc-400 mt-0.5">{p.category_name}</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-right font-black text-red-500">{p.current_qty} {p.uom}</td>
                          <td className="py-3 px-3 font-mono text-right text-zinc-500">{p.min_qty} {p.uom}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3 justify-center">
                              <span className="text-[9px] font-mono text-red-500 font-black">{Math.round(ratio)}%</span>
                              <div className="h-2 w-20 bg-zinc-150 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${ratio}%` }} 
                                  className="h-full bg-red-500 rounded-full"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Audits Timeline */}
          <div className="saas-card p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                <History className="h-4 w-4 text-zinc-500" />
                {t('Audit Trail Timeline')}
              </h3>
              <p className="text-[9px] text-zinc-450 dark:text-zinc-550 mt-0.5">
                {t('Recent transactions and stock adjustments')}
              </p>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-zinc-200 dark:before:bg-zinc-800">
              {transactionsList.map((tx, idx) => {
                let badgeColor = 'bg-zinc-100 text-zinc-650 dark:bg-zinc-900 dark:text-zinc-400';
                if (tx.action === 'stock_in') badgeColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
                else if (tx.action === 'stock_out') badgeColor = 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450';
                else if (tx.action === 'transfer') badgeColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-450';
                else if (tx.action === 'adjustment') badgeColor = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';
                
                const timeFormatted = new Date(tx.created_at || '').toLocaleDateString('vi-VN', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div key={idx} className="flex gap-4 relative pl-7">
                    <span className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border border-white dark:border-zinc-950 bg-zinc-300 dark:bg-zinc-700"></span>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{tx.product_name}</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${badgeColor}`}>
                          {tx.action.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-zinc-400 font-mono">
                        <span>{tx.reference_no}</span>
                        <span>{timeFormatted}</span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5 text-[9px]">
                        <span className="text-zinc-500">{t('Qty Change:')} <strong className={tx.qty_change > 0 ? 'text-emerald-500' : 'text-rose-500 font-bold'}>{tx.qty_change > 0 ? `+${tx.qty_change}` : tx.qty_change}</strong></span>
                        <span className="text-zinc-400 font-mono">@{tx.warehouse_name || t('Depot')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-zinc-150 dark:border-zinc-850">
              <Link 
                href="/inventory/transactions"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-zinc-650 dark:text-zinc-350 font-bold transition-colors"
              >
                {t('View Detailed System Audit Trail')}
              </Link>
            </div>
          </div>

        </div>

      </div>
    </PermissionGuard>
  );
}
