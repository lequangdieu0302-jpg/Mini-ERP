'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Folder, FolderOpen, FileText, Plus, Search, 
  Trash2, Upload, FileSignature, Layers, Tag, X
} from 'lucide-react';
import { Document } from '@/types/erp';

const FOLDERS = [
  { id: 'f1', name: 'Blueprints & CAD Drawings', icon: FolderOpen },
  { id: 'f2', name: 'Vendor Contracts', icon: Folder },
  { id: 'f3', name: 'Safety Regulations', icon: Folder }
];

export default function Documents() {
  const { documents, addDocument, projects, t } = useERP();
  
  const [selectedFolderId, setSelectedFolderId] = useState('f1');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'dwg' | 'png' | 'doc'>('pdf');
  const [selectedProjId, setSelectedProjId] = useState('');
  const [fileSizeSim, setFileSizeSim] = useState('1024'); // in KB

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addDocument({
      name: name.includes('.') ? name : `${name}.${fileType}`,
      folder_id: selectedFolderId,
      file_type: fileType,
      project_id: selectedProjId || undefined,
      size: Number(fileSizeSim) * 1024 // convert to bytes
    });

    // Reset
    setName('');
    setSelectedProjId('');
    setFileSizeSim('1024');
    setIsAdding(false);
  };

  const getFileIcon = (type: string) => {
    return (
      <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-250/20 dark:border-indigo-850/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
        <FileText className="h-5 w-5" />
      </div>
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Filter files based on folder & search query
  const filteredDocs = documents.filter(doc => 
    doc.folder_id === selectedFolderId &&
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PermissionGuard module="documents">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-550">{t("Virtual File Cabinets")}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t("Store sub-contracts, CAD structural drawings directory and contracts files.")}</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="saas-button-primary inline-flex items-center gap-1.5 self-start md:self-auto"
        >
          {isAdding ? <X className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
          <span>{isAdding ? t('Close Builder') : t('Upload Document')}</span>
        </button>
      </div>

      {/* Add Document form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-5 max-w-xl animate-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-semibold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            {t("Upload Document Reference")}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Document Title *")}</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pillar Anchor Load Tests"
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("File Format Type")}</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="saas-input appearance-none bg-no-repeat bg-right pr-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200"
              >
                <option value="pdf">Acrobat PDF Statement (.pdf)</option>
                <option value="dwg">AutoCAD Blueprint CAD (.dwg)</option>
                <option value="png">Evidence Image Photo (.png)</option>
                <option value="doc">Word Statement Doc (.doc)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Link to Project")}</label>
              <select
                value={selectedProjId}
                onChange={(e) => setSelectedProjId(e.target.value)}
                className="saas-input appearance-none bg-no-repeat bg-right pr-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200"
              >
                <option value="">-- {t("General File")} --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Simulated File Size (KB)")}</label>
              <input 
                type="number" 
                value={fileSizeSim}
                className="saas-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-850">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="saas-button-secondary px-5"
            >
              {t("Cancel")}
            </button>
            <button 
              type="submit"
              className="saas-button-primary bg-indigo-600 hover:bg-indigo-505 text-white px-5"
            >
              {t("Save File")}
            </button>
          </div>
        </form>
      )}

      {/* Main directories dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side directories list */}
        <div className="saas-card p-3.5 space-y-1 bg-zinc-50/20 dark:bg-zinc-900/10">
          <span className="px-3 py-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">{t("Directories")}</span>
          {FOLDERS.map((f) => {
            const isActive = selectedFolderId === f.id;
            const Icon = isActive ? FolderOpen : Folder;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFolderId(f.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
                  isActive 
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-sm'
                    : 'text-zinc-655 hover:bg-zinc-50/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/40 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-550 dark:text-indigo-400' : 'text-zinc-450 dark:text-zinc-505'}`} />
                <span className="truncate">{t(f.name)}</span>
              </button>
            );
          })}
        </div>

        {/* Right side: files listings */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-400 dark:text-zinc-550" />
            <input 
              type="text" 
              placeholder={t("Search filenames...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="saas-input pl-9"
            />
          </div>

          {/* Files grid view */}
          {filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDocs.map((doc) => {
                const proj = projects.find(p => p.id === doc.project_id);
                return (
                  <div key={doc.id} className="saas-card p-5 flex flex-col justify-between gap-4">
                    
                    <div className="flex items-start gap-3.5">
                      {getFileIcon(doc.file_type)}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate leading-snug" title={doc.name}>
                          {doc.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider">
                          <Tag className="h-3 w-3 shrink-0" />
                          <span>Format: {doc.file_type} &bull; Size: {formatBytes(doc.size)}</span>
                        </div>
                      </div>
                    </div>

                    {proj && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <FileSignature className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">Linked: <strong className="text-zinc-700 dark:text-zinc-300">{proj.name}</strong></span>
                      </div>
                    )}

                    {/* Version Control codes */}
                    <div className="pt-3 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-between text-[10px] text-zinc-450 dark:text-zinc-500">
                      <div className="flex items-center gap-1 font-semibold">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{t("Revision: ")}<strong>Ver {doc.version || 1}</strong></span>
                      </div>
                      <span suppressHydrationWarning>{t("Uploaded: ")}{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/10 dark:bg-zinc-950/10 text-xs font-medium text-zinc-400 dark:text-zinc-600 flex flex-col items-center justify-center gap-2">
              <Folder className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
              <span>{t("No documents found in this directory. Click \"Upload Document\" to add files.")}</span>
            </div>
          )}

        </div>

      </div>

    </div>
    </PermissionGuard>
  );
}
