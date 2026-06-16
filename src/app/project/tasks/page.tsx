'use client';

import { PermissionGuard, ActionGuard } from '@/components/permission-guard';

import React, { useState } from 'react';
import { useERP } from '@/context/erp-context';
import { 
  Plus, Check, Search, Calendar, User, Clock, Trash,
  AlertCircle, CheckSquare, ClipboardList, X
} from 'lucide-react';
import { Task } from '@/types/erp';

const STAGES = [
  { key: 'todo', label: 'To Do', color: 'border-t-zinc-400 bg-zinc-50/20 dark:bg-zinc-950/10' },
  { key: 'in_progress', label: 'In Progress', color: 'border-t-zinc-900 dark:border-t-zinc-100 bg-zinc-50/20 dark:bg-zinc-950/10' },
  { key: 'review', label: 'Quality Review', color: 'border-t-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10' },
  { key: 'done', label: 'Done', color: 'border-t-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10' }
] as const;

export default function Tasks() {
  const { tasks, addTask, updateTaskStatus, projects, users, t } = useERP();
  
  const [selectedProjId, setSelectedProjId] = useState('proj1');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [hours, setHours] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedProjId) return;

    addTask({
      project_id: selectedProjId,
      name,
      description: desc,
      priority,
      assignee_id: assigneeId || undefined,
      due_date: dueDate,
      hours_estimate: Number(hours) || 0
    });

    // Reset
    setName('');
    setDesc('');
    setPriority('medium');
    setAssigneeId('');
    setDueDate('');
    setHours('');
    setIsAdding(false);
  };

  const activeProject = projects.find(p => p.id === selectedProjId) || projects[0];

  const filteredTasks = tasks.filter(t => 
    t.project_id === selectedProjId &&
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <PermissionGuard module="project">
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto min-h-screen text-xs">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{t("Tasks Kanban Board")}</h1>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t("Organize workflows and timelines for active team members.")}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Project selector */}
          <select 
            value={selectedProjId}
            onChange={(e) => setSelectedProjId(e.target.value)}
            className="saas-input w-48"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="saas-button-primary flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> {t("Add Task")}
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-6 space-y-5 max-w-3xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{t("Add Task to")} {activeProject?.name}</h3>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-650"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Task Title *")}</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lay steel truss foundations"
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Assignee")}</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="saas-input"
              >
                <option value="">{t("-- Assign Employee --")}</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Task Priority")}</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="saas-input"
              >
                <option value="low">{t("Low Priority")}</option>
                <option value="medium">{t("Medium Priority")}</option>
                <option value="high">{t("High Priority")}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Due Date")}</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="saas-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Estimated Hours")}</label>
              <input 
                type="number" 
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="40"
                className="saas-input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("Detailed Description")}</label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t("Provide scope details, quality constraints, safety warnings...")}
              className="saas-input h-auto py-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="saas-button-secondary"
            >
              {t("Cancel")}
            </button>
            <button 
              type="submit"
              className="saas-button-primary"
            >
              {t("Save Task")}
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative w-48">
        <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-550" />
        <input 
          type="text" 
          placeholder={t("Search task title...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="saas-input pl-8"
        />
      </div>

      {/* Kanban Board columns layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {STAGES.map((stage) => {
          const stageTasks = filteredTasks.filter(t => t.status === stage.key);
          return (
            <div 
              key={stage.key} 
              className={`rounded-xl border-t-2 border border-zinc-200/50 bg-zinc-50/20 dark:border-zinc-800 dark:bg-zinc-950/20 p-3.5 min-h-[450px] flex flex-col`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200/50 dark:border-zinc-850">
                <h3 className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                  {stage.label}
                </h3>
                <span className="rounded bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
                  {stageTasks.length}
                </span>
              </div>

              {/* Tasks list */}
              <div className="flex-1 space-y-3 pr-1 overflow-y-auto max-h-[500px]">
                {stageTasks.map((t) => {
                  const assignee = users.find(u => u.id === t.assignee_id);
                  return (
                    <div 
                      key={t.id} 
                      className="group saas-card p-3.5 relative hover:border-zinc-400 dark:hover:border-zinc-700"
                    >
                      <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-100 leading-snug">
                        {t.name}
                      </h4>
                      {t.description && (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      {/* Meta information tags */}
                      <div className="mt-3 flex items-center justify-between text-[9px]">
                        <span className={`rounded px-1.5 py-0.5 font-bold uppercase ${
                          t.priority === 'high' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 border border-rose-200/20' :
                          t.priority === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 border border-amber-200/20' :
                          'bg-zinc-50 text-zinc-650 dark:bg-zinc-800/60 border border-zinc-200/20'
                        }`}>
                          {t.priority}
                        </span>

                        <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-550 font-medium">
                          <Clock className="h-3 w-3" />
                          <span>{t.hours_estimate}h est</span>
                        </div>
                      </div>

                      {/* Assignee & Date */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-200/50 dark:border-zinc-850 flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-550">
                        {t.due_date && (
                            <span suppressHydrationWarning className="flex items-center gap-1 font-medium">
                              <Calendar className="h-3 w-3" />
                              {new Date(t.due_date).toLocaleDateString()}
                            </span>
                        )}
                        {assignee && (
                          <div className="flex items-center gap-1">
                            <img src={assignee.avatar_url} alt="" className="h-4.5 w-4.5 rounded-full object-cover border border-zinc-200/50 dark:border-zinc-800" />
                            <span className="font-semibold text-zinc-500 truncate max-w-[80px]">{assignee.full_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Move controls simulator */}
                      <div className="mt-2.5 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                        {stage.key !== 'todo' && (
                          <button
                            onClick={() => {
                              const prevIdx = STAGES.findIndex(s => s.key === stage.key) - 1;
                              if (prevIdx >= 0) updateTaskStatus(t.id, STAGES[prevIdx].key);
                            }}
                            className="rounded px-1.5 py-0.5 text-[9px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition"
                            title="Move back"
                          >
                            ◀
                          </button>
                        )}
                        {stage.key !== 'done' && (
                          <button
                            onClick={() => {
                              const nextIdx = STAGES.findIndex(s => s.key === stage.key) + 1;
                              if (nextIdx < STAGES.length) updateTaskStatus(t.id, STAGES[nextIdx].key);
                            }}
                            className="rounded px-1.5 py-0.5 text-[9px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition"
                            title="Move next"
                          >
                            ▶
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
                {stageTasks.length === 0 && (
                  <div className="h-20 rounded-lg border border-dashed border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-500">
                    No tasks here.
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






