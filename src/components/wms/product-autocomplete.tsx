'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Product } from '@/types/erp';
import { Search, Loader2 } from 'lucide-react';
import { useERP } from '@/context/erp-context';

interface ProductAutocompleteProps {
  onSelect: (product: Product | null) => void;
  warehouseId?: string;
  placeholder?: string;
  excludeIds?: string[];
  className?: string;
  initialProductId?: string;
}

export default function ProductAutocomplete({
  onSelect,
  warehouseId,
  placeholder,
  excludeIds = [],
  className = '',
  initialProductId
}: ProductAutocompleteProps) {
  const { t } = useERP();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Load initial product if provided
  useEffect(() => {
    if (initialProductId) {
      const fetchInitial = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('products')
            .select('*, product_categories(name)')
            .eq('id', initialProductId)
            .single();
          if (!error && data) {
            const mapped = {
              ...data,
              category_name: (data as any).product_categories?.name || ''
            };
            setSelectedProduct(mapped);
            setQuery(`[${mapped.sku}] ${mapped.name}`);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchInitial();
    } else if (!selectedProduct) {
      setSelectedProduct(null);
      setQuery('');
    }
  }, [initialProductId]);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        let q = supabase
          .from('products')
          .select('*, product_categories(name)')
          .limit(10);

        if (query.trim()) {
          q = q.or(`name.ilike.%${query.trim()}%,sku.ilike.%${query.trim()}%,barcode.ilike.%${query.trim()}%`);
        }

        if (warehouseId) {
          q = q.eq('warehouse_id', warehouseId);
        }

        const { data, error } = await q;

        if (!error && data) {
          // Filter out excluded IDs
          const filtered = data.filter(p => !excludeIds.includes(p.id));
          const mapped = filtered.map((p: any) => ({
            ...p,
            category_name: p.product_categories?.name || ''
          }));
          setSuggestions(mapped);
        } else if (error) {
          console.error('Error fetching suggestions:', error);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen, warehouseId, excludeIds]);

  // Handle click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset query input to match selected product if any
        if (selectedProduct) {
          setQuery(`[${selectedProduct.sku}] ${selectedProduct.name}`);
        } else {
          setQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedProduct]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setQuery(`[${product.sku}] ${product.name}`);
    setIsOpen(false);
    onSelect(product);
  };

  const handleClear = () => {
    setSelectedProduct(null);
    setQuery('');
    onSelect(null);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onSelect(null);
              setSelectedProduct(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || t('Search product by name, SKU...')}
          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded px-2 py-1 outline-none text-zinc-850 dark:text-zinc-200 font-bold text-[10px] pr-8"
        />
        <div className="absolute right-2 top-1.5 flex items-center gap-1">
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 text-xs font-bold leading-none cursor-pointer"
            >
              ×
            </button>
          ) : (
            <Search className="h-3 w-3 text-zinc-400" />
          )}
        </div>
      </div>

      {isOpen && (suggestions.length > 0 || loading) && (
        <ul className="absolute z-50 w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded shadow-lg mt-1 max-h-60 overflow-y-auto text-[10px] divide-y divide-zinc-100 dark:divide-zinc-900">
          {loading && suggestions.length === 0 ? (
            <li className="py-2 px-3 text-zinc-450 dark:text-zinc-550 italic text-left">{t('Searching...')}</li>
          ) : (
            suggestions.map((p) => (
              <li
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                className="py-2 px-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer flex flex-col gap-0.5 text-left"
              >
                <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-200">
                  <span>{p.name}</span>
                  <span className="font-mono text-zinc-505">{p.sku}</span>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 dark:text-zinc-400">
                  <span>{t('Category:')} {p.category_name || p.category_id || '—'}</span>
                  <span>{t('Stock:')} <strong className="text-zinc-700 dark:text-zinc-300 font-mono">{p.current_qty} {p.uom_id || 'pcs'}</strong></span>
                </div>
                {p.location && (
                  <div className="text-[8.5px] text-zinc-400 dark:text-zinc-550">
                    {t('Location:')} {p.location}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      )}
      
      {isOpen && !loading && suggestions.length === 0 && query.trim() !== '' && (
        <div className="absolute z-50 w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded shadow-lg mt-1 p-3 text-center text-zinc-450 text-[10px]">
          {t('No products found')}
        </div>
      )}
    </div>
  );
}
