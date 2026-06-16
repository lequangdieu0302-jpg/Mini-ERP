'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { Plus, Star, Search, Check, CornerDownLeft } from 'lucide-react';
import { CRMLead } from '@/types/erp';

const STAGES = [
  { key: 'new', label: 'New', color: 'border-t-zinc-400 bg-zinc-50/10' },
  { key: 'qualified', label: 'Qualified', color: 'border-t-indigo-500 bg-indigo-50/10' },
  { key: 'proposition', label: 'Proposition', color: 'border-t-amber-500 bg-amber-50/10' },
  { key: 'won', label: 'Won', color: 'border-t-emerald-500 bg-emerald-50/10' },
  { key: 'lost', label: 'Lost', color: 'border-t-rose-500 bg-rose-50/10' }
] as const;

export default function CRM() {
  const { leads, addLead, updateLead, customers, t } = useERP();
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [selectedCust, setSelectedCust] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [revenue, setRevenue] = useState('');
  const [probability, setProbability] = useState('50');
  const [priority, setPriority] = useState('2');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    addLead({
      name: newTitle,
      customer_id: selectedCust || undefined,
      contact_name: contactName,
      email,
      phone,
      expected_revenue: Number(revenue) || 0,
      probability: Number(probability) || 50,
      priority: Number(priority) || 2,
      notes,
      status: 'new'
    });

    setNewTitle('');
    setSelectedCust('');
    setContactName('');
    setEmail('');
    setPhone('');
    setRevenue('');
    setProbability('50');
    setPriority('2');
    setNotes('');
    setIsAdding(false);
  };

  const getStarred = (count: number) => {
    return Array.from({ length: 3 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < count ? 'fill-zinc-800 text-zinc-800 dark:fill-zinc-200 dark:text-zinc-200' : 'text-zinc-200 dark:text-zinc-800'}`} 
      />
    ));
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.contact_name && l.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PermissionGuard module="crm">
    <div className="p-4 md:p-8 space-y-5 md:space-y-6 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{t("Opportunities Pipeline")}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-0.5">{t("Manage pipeline pipelines and sales opportunities.")}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-zinc-400" />
            <input 
              type="text" 
              placeholder={t("Search opportunities...")} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="saas-input pl-8.5"
            />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="saas-button-primary h-8.5 text-[11px] flex items-center gap-1.5 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" /> {t("New Opportunity")}
          </button>
        </div>
      </div>

      {/* Add form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-4 max-w-3xl animate-in slide-in-from-top duration-250">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-550 uppercase tracking-wider">{t("Create New Opportunity")}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t("Opportunity Title *")}</label>
              <input 
                type="text" 
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Hudson Residential Drywall"
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t("Customer")}</label>
              <select 
                value={selectedCust} 
                onChange={(e) => setSelectedCust(e.target.value)}
                className="saas-input text-xs"
              >
                <option value="">{t("-- Choose Client --")}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t("Contact Person")}</label>
              <input 
                type="text" 
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t("Email Address")}</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t("Phone")}</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t("Expected Revenue ($)")}</label>
              <input 
                type="number" 
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t("Probability (%)")}</label>
              <input 
                type="number" 
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-500">{t("Priority Stars")}</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="saas-input text-xs"
              >
                <option value="1">{t("1 Star")}</option>
                <option value="2">{t("2 Stars")}</option>
                <option value="3">{t("3 Stars")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-500">{t("Opportunity Notes")}</label>
            <textarea 
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("Notes...")}
              className="w-full rounded-lg border border-zinc-200 p-2.5 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="saas-button-secondary text-[11px]"
            >
              {t("Cancel")}
            </button>
            <button 
              type="submit"
              className="saas-button-primary text-[11px]"
            >
              {t("Save Opportunity")}
            </button>
          </div>
        </form>
      )}

      {/* Kanban Grid (Linear aesthetic: flat card panel columns, no dropshadows, neat typography) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 items-start">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter(l => l.status === stage.key);
          const stageRevenue = stageLeads.reduce((acc, l) => acc + l.expected_revenue, 0);

          return (
            <div 
              key={stage.key} 
              className={`rounded-xl border-t-2 border border-zinc-200/80 bg-zinc-50/30 dark:border-zinc-850 dark:bg-zinc-950/20 p-4 min-h-[460px] flex flex-col`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-zinc-200/40 dark:border-zinc-800/40">
                <div>
                  <h3 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
                    {t(stage.label)}
                  </h3>
                  <span className="text-[9px] text-zinc-400 mt-0.5 block" suppressHydrationWarning>${stageRevenue.toLocaleString()} {t("expected")}</span>
                </div>
                <span className="rounded bg-zinc-200/50 dark:bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold text-zinc-500">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards stack */}
              <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[500px] pr-0.5">
                {stageLeads.map((lead) => {
                  const cust = customers.find(c => c.id === lead.customer_id);
                  return (
                    <div 
                      key={lead.id} 
                      className="saas-card p-4 relative group"
                    >
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                        {lead.name}
                      </h4>
                      {cust && (
                        <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-bold block mt-1">
                          {cust.name}
                        </span>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <span suppressHydrationWarning className="font-bold text-zinc-800 dark:text-zinc-200">
                          ${lead.expected_revenue.toLocaleString()}
                        </span>
                        <div className="flex gap-0.5">{getStarred(lead.priority)}</div>
                      </div>

                      {/* Move action triggers inside card */}
                      <div className="mt-3.5 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[9px] text-zinc-400">
                        <span className="truncate max-w-[80px]">
                          {lead.contact_name || t("No contact")}
                        </span>
                        
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition duration-150">
                          {stage.key !== 'new' && (
                            <button
                              onClick={() => {
                                const prevIdx = STAGES.findIndex(s => s.key === stage.key) - 1;
                                if (prevIdx >= 0) updateLead(lead.id, { status: STAGES[prevIdx].key });
                              }}
                              className="text-zinc-400 hover:text-zinc-700"
                            >
                              ◀
                            </button>
                          )}
                          {stage.key !== 'won' && stage.key !== 'lost' && (
                            <>
                              <button
                                onClick={() => updateLead(lead.id, { status: 'won' })}
                                className="text-emerald-500 font-bold"
                              >
                                {t("Won")}
                              </button>
                              <button
                                onClick={() => {
                                  const nextIdx = STAGES.findIndex(s => s.key === stage.key) + 1;
                                  if (nextIdx < STAGES.length) updateLead(lead.id, { status: STAGES[nextIdx].key });
                                }}
                                className="text-zinc-400 hover:text-zinc-700"
                              >
                                ▶
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
                {stageLeads.length === 0 && (
                  <div className="h-16 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center text-[10px] text-zinc-400 italic bg-zinc-50/20">
                    {t("No leads listed.")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
    </PermissionGuard>
  );
}
