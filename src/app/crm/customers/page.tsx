'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { Plus, Search, Building2, User, Mail, Phone, MapPin, CreditCard, Clock } from 'lucide-react';
import { Customer } from '@/types/erp';

export default function Customers() {
  const { customers, addCustomer, t } = useERP();
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [isCompany, setIsCompany] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addCustomer({
      name,
      email,
      phone,
      address,
      credit_limit: Number(creditLimit) || 0,
      is_company: isCompany
    });

    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCreditLimit('');
    setIsCompany(false);
    setIsAdding(false);
  };

  const filteredCust = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PermissionGuard module="crm">
    <div className="p-4 md:p-8 space-y-5 md:space-y-6 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-550 tracking-tight">{t('Customers Register')}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-0.5">{t('Manage directory details, address configurations, and contact histories.')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-zinc-400" />
            <input 
              type="text" 
              placeholder={t('Search directory...')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8.5 rounded-lg border border-zinc-200 bg-white pl-8.5 pr-3 text-[11px] outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="saas-button-primary h-8.5 text-[11px] flex items-center gap-1.5 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" /> {t('Add Customer')}
          </button>
        </div>
      </div>

      {/* Add Form (Notion-style form layout) */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-4 max-w-2xl animate-in slide-in-from-top duration-200">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-550 uppercase tracking-wider">{t('Register Customer Profile')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t('Customer / Company Name *')}</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('e.g. Acme Contracting Corp')}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t('Email Address')}</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@company.com"
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t('Phone')}</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t('Credit Limit ($)')}</label>
              <input 
                type="number" 
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-500">{t('Billing Address')}</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="saas-input"
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isComp"
              checked={isCompany}
              onChange={(e) => setIsCompany(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 h-4.5 w-4.5"
            />
            <label htmlFor="isComp" className="font-semibold text-zinc-700 dark:text-zinc-350 select-none">
              {t('This client represents an Organization / Company')}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="saas-button-secondary text-[11px]"
            >
              {t('Cancel')}
            </button>
            <button 
              type="submit"
              className="saas-button-primary text-[11px]"
            >
              {t('Add Customer')}
            </button>
          </div>
        </form>
      )}

      {/* Grid of profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCust.map((c) => (
          <div key={c.id} className="saas-card p-5 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-100 text-zinc-650 dark:bg-zinc-900 dark:text-zinc-400 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-800">
                {c.is_company ? <Building2 className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{c.name}</h3>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mt-0.5">
                  {c.is_company ? t('Corporate Organization') : t('Individual')}
                </span>
              </div>
            </div>

            {/* Profile detail */}
            <div className="space-y-2 text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-900 pt-3.5">
              {c.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
              )}
              {c.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>{c.phone}</span>
                </div>
              )}
              {c.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{c.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
                <CreditCard className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span suppressHydrationWarning>{t('Limit:')} ${c.credit_limit.toLocaleString()}</span>
              </div>
            </div>

            {/* Activity Box */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-200/50 dark:border-zinc-850 flex gap-2 items-start">
              <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-450 leading-relaxed italic">
                {t('Note on 2026-06-14: Client requested cement pricing list updates. Pipeline status synchronized.')}
              </p>
            </div>

          </div>
        ))}
      </div>

    </div>
    </PermissionGuard>
  );
}
