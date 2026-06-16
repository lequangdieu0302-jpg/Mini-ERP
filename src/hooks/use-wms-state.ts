'use client';

import { useState, useEffect } from 'react';
import {
  Product, Warehouse, StockReceipt, StockIssue, StockTransfer,
  StockCount, BatchLot, InventoryTransaction
} from '@/types/erp';
import {
  WMS_PRODUCTS, WMS_WAREHOUSES, WMS_RECEIPTS, WMS_ISSUES,
  WMS_TRANSFERS, WMS_COUNTS, WMS_BATCHES, WMS_TRANSACTIONS
} from '@/data/wms-seed';

export function useWMSState() {
  const [products, setProducts] = useState<Product[]>(WMS_PRODUCTS);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(WMS_WAREHOUSES);
  const [receipts, setReceipts] = useState<StockReceipt[]>(WMS_RECEIPTS);
  const [issues, setIssues] = useState<StockIssue[]>(WMS_ISSUES);
  const [transfers, setTransferList] = useState<StockTransfer[]>(WMS_TRANSFERS);
  const [counts, setCounts] = useState<StockCount[]>(WMS_COUNTS);
  const [batches, setBatches] = useState<BatchLot[]>(WMS_BATCHES);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(WMS_TRANSACTIONS);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parseSafeArray = (key: string, fallback: any[]) => {
      try {
        const localVal = localStorage.getItem(key);
        if (localVal) {
          const parsed = JSON.parse(localVal);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
        localStorage.setItem(key, JSON.stringify(fallback));
      } catch(e) {
        console.warn('localStorage is not accessible:', e);
      }
      return fallback;
    };

    setProducts(parseSafeArray('wms_products', WMS_PRODUCTS));
    setWarehouses(parseSafeArray('wms_warehouses', WMS_WAREHOUSES));
    setReceipts(parseSafeArray('wms_receipts', WMS_RECEIPTS));
    setIssues(parseSafeArray('wms_issues', WMS_ISSUES));
    setTransferList(parseSafeArray('wms_transfers', WMS_TRANSFERS));
    setCounts(parseSafeArray('wms_counts', WMS_COUNTS));
    setBatches(parseSafeArray('wms_batches', WMS_BATCHES));
    setTransactions(parseSafeArray('wms_transactions', WMS_TRANSACTIONS));
  }, []);

  // Helpers to update and persist state
  const saveProducts = (newProds: Product[]) => {
    setProducts(newProds);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wms_products', JSON.stringify(newProds));
      }
    } catch(e) {}
  };

  const saveWarehouses = (newWH: Warehouse[]) => {
    setWarehouses(newWH);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wms_warehouses', JSON.stringify(newWH));
      }
    } catch(e) {}
  };

  const saveReceipts = (newRecs: StockReceipt[]) => {
    setReceipts(newRecs);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wms_receipts', JSON.stringify(newRecs));
      }
    } catch(e) {}
  };

  const saveIssues = (newIss: StockIssue[]) => {
    setIssues(newIss);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wms_issues', JSON.stringify(newIss));
      }
    } catch(e) {}
  };

  const saveTransfers = (newTrfs: StockTransfer[]) => {
    setTransferList(newTrfs);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wms_transfers', JSON.stringify(newTrfs));
      }
    } catch(e) {}
  };

  const saveCounts = (newCnts: StockCount[]) => {
    setCounts(newCnts);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wms_counts', JSON.stringify(newCnts));
      }
    } catch(e) {}
  };

  const saveBatches = (newBatches: BatchLot[]) => {
    setBatches(newBatches);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wms_batches', JSON.stringify(newBatches));
      }
    } catch(e) {}
  };

  const saveTransactions = (newTxns: InventoryTransaction[]) => {
    setTransactions(newTxns);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('wms_transactions', JSON.stringify(newTxns));
      }
    } catch(e) {}
  };

  const addTransaction = (txn: Omit<InventoryTransaction, 'id' | 'created_at'>) => {
    const newTx: InventoryTransaction = {
      ...txn,
      id: `tx${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const updated = [newTx, ...transactions];
    saveTransactions(updated);
  };

  return {
    products, saveProducts,
    warehouses, saveWarehouses,
    receipts, saveReceipts,
    issues, saveIssues,
    transfers, saveTransfers,
    counts, saveCounts,
    batches, saveBatches,
    transactions, saveTransactions,
    addTransaction
  };
}
