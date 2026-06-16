'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React from 'react';
import { useERP } from '@/context/erp-context';
import { Users, Mail, Phone, MapPin, Award, Star } from 'lucide-react';

export default function Vendors() {
  const { vendors, t } = useERP();

  const getStarred = (rating: number) => {
    const stars = Math.round(rating);
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < stars ? 'fill-amber-450 text-amber-500' : 'text-zinc-200 dark:text-zinc-800'}`} 
      />
    ));
  };

  return (
    <PermissionGuard module="purchase">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Title */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{t("Suppliers & Vendor Board")}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t("Evaluate vendor ratings, delivery lead times, and contract pricing catalogs.")}</p>
        </div>
      </div>

      {/* Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="saas-card p-5 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold">
                {vendor.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-100">{vendor.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex gap-0.5">{getStarred(vendor.performance_rating)}</div>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-550 font-mono">({vendor.performance_rating.toFixed(2)})</span>
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div className="space-y-2 text-[10px] text-zinc-600 dark:text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-850 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{vendor.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span>{vendor.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{vendor.address || 'N/A'}</span>
              </div>
            </div>

            {/* Performance score detail */}
            <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-850/50 p-3 rounded-lg flex items-center gap-3">
              <Award className="h-5 w-5 text-zinc-600 dark:text-zinc-400 shrink-0" />
              <div>
                <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t("On-Time Delivery Rate")}</div>
                <div className="text-[11px] font-bold text-zinc-750 dark:text-zinc-300">{t("Projected:")} {vendor.performance_rating >= 4.5 ? t('Excellent (98%)') : t('Reliable (92%)')}</div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
    </PermissionGuard>
  );
}

