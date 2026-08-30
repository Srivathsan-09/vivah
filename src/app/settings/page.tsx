'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Settings as SettingsIcon,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import {
  getSources,
  addSource,
  deleteSource,
  exportData,
  importData,
  resetDemoData,
  clearAllData,
  getSettings,
  updateSettings,
} from '../../services/storage';
import { MatrimonySource, AppSettings, AppBackupData } from '../../types';
import { useToast } from '../../components/ui/Toast';

export default function SettingsPage() {
  const { showToast } = useToast();

  const [sources, setSources] = useState<MatrimonySource[]>([]);
  const [newSourceName, setNewSourceName] = useState('');
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());

  // Import Modal State
  const [importModal, setImportModal] = useState<{
    isOpen: boolean;
    data?: AppBackupData;
    fileName?: string;
  }>({ isOpen: false });

  const loadData = () => {
    setSources(getSources());
    setSettingsState(getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    addSource(newSourceName.trim());
    setNewSourceName('');
    showToast('Source Added', `Added custom platform "${newSourceName}".`);
    loadData();
  };

  const handleDeleteSource = (id: string, name: string) => {
    if (confirm(`Remove matrimony source "${name}"?`)) {
      deleteSource(id);
      showToast('Source Removed', `Deleted source "${name}".`);
      loadData();
    }
  };

  const handleExportJSON = () => {
    const data = exportData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const link = document.createElement('a');
    link.href = url;
    link.download = `matrimony-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Data Exported', 'Downloaded complete JSON data backup file.');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        if (!parsedData || !Array.isArray(parsedData.proposals)) {
          showToast('Invalid File', 'Selected file is not a valid Matrimony backup JSON.', 'error');
          return;
        }
        setImportModal({ isOpen: true, data: parsedData, fileName: file.name });
      } catch {
        showToast('JSON Syntax Error', 'Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleExecuteImport = (mode: 'replace' | 'merge') => {
    if (!importModal.data) return;

    const res = importData(importModal.data, mode);
    if (res.success) {
      showToast('Import Successful', res.message);
      setImportModal({ isOpen: false });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      showToast('Import Failed', res.message, 'error');
    }
  };

  const handleResetDemo = () => {
    if (confirm('Reset application data back to 15 default demo proposals? All manual edits will be overwritten.')) {
      resetDemoData();
      showToast('Demo Data Reloaded', 'Restored 15 demo proposals.');
      setTimeout(() => window.location.reload(), 500);
    }
  };

  const handleClearAll = () => {
    if (confirm('CAUTION: Clear all proposals, notes, and contacts permanently? This cannot be undone.')) {
      clearAllData();
      showToast('All Data Cleared', 'LocalStorage emptied.');
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif font-bold text-2xl text-slate-900">Application Settings</h1>
        <p className="text-xs text-slate-500">Manage data backups, custom proposal sources, and UI preferences</p>
      </div>

      {/* SECTION 1: DATA BACKUP & RESTORE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-base">Data Backup & LocalStorage Management</h3>
            <p className="text-xs text-slate-500">Export or import complete application data via offline JSON files</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Export Data Backup</h4>
              <p className="text-xs text-slate-500 mt-1">
                Download all proposals, contacts, horoscopes, communications, notes, and activity history into a single JSON file.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 text-rose-400" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Import Backup JSON</h4>
              <p className="text-xs text-slate-500 mt-1">
                Restore data from a previously saved JSON backup file with merge or replace options.
              </p>
            </div>
            <label className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors text-center">
              <Upload className="w-4 h-4" />
              <span>Select JSON File</span>
              <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
        </div>

        {/* Reset & Clear Data Section */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleResetDemo}
            className="py-2 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Sample Demo Data (15 Proposals)</span>
          </button>

          <button
            onClick={handleClearAll}
            className="py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* SECTION: BACKGROUND THEME SELECTOR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-base">Matrimonial Background Image</h3>
            <p className="text-xs text-slate-500">Choose your preferred Indian matrimony background wallpaper</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Option 1: Wedding Ritual 1 (Desktop Only) */}
          <div
            onClick={() => {
              const updated = updateSettings({ bgImage: '/bg-matrimony-1.jpg' });
              setSettingsState(updated);
              showToast('Background Updated', 'Applied Wedding Ritual 1 background.');
              window.dispatchEvent(new Event('storage'));
            }}
            className={`hidden sm:block p-3 rounded-2xl border-2 cursor-pointer transition-all space-y-2 group overflow-hidden ${
              (settings.bgImage || '/bg-matrimony-1.jpg') === '/bg-matrimony-1.jpg'
                ? 'border-rose-600 bg-rose-50/30 shadow-md ring-2 ring-rose-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="h-28 rounded-xl overflow-hidden relative shadow-inner bg-slate-100">
              <img src="/bg-matrimony-1.jpg" alt="Wedding Ritual 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {(settings.bgImage || '/bg-matrimony-1.jpg') === '/bg-matrimony-1.jpg' && (
                <div className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full shadow">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="px-1">
              <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                <span>Wedding Ritual 1</span>
                {(settings.bgImage || '/bg-matrimony-1.jpg') === '/bg-matrimony-1.jpg' && (
                  <span className="text-[10px] text-rose-600 font-semibold">Active</span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Silver bowl traditional ritual (Desktop)</p>
            </div>
          </div>

          {/* Option 2: Wedding Ceremony 2 (Desktop Only) */}
          <div
            onClick={() => {
              const updated = updateSettings({ bgImage: '/bg-matrimony-2.jpg' });
              setSettingsState(updated);
              showToast('Background Updated', 'Applied Wedding Ceremony 2 background.');
              window.dispatchEvent(new Event('storage'));
            }}
            className={`hidden sm:block p-3 rounded-2xl border-2 cursor-pointer transition-all space-y-2 group overflow-hidden ${
              settings.bgImage === '/bg-matrimony-2.jpg'
                ? 'border-rose-600 bg-rose-50/30 shadow-md ring-2 ring-rose-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="h-28 rounded-xl overflow-hidden relative shadow-inner bg-slate-100">
              <img src="/bg-matrimony-2.jpg" alt="Wedding Ceremony 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {settings.bgImage === '/bg-matrimony-2.jpg' && (
                <div className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full shadow">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="px-1">
              <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                <span>Wedding Ceremony 2</span>
                {settings.bgImage === '/bg-matrimony-2.jpg' && (
                  <span className="text-[10px] text-rose-600 font-semibold">Active</span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Toe ring floral ceremony (Desktop)</p>
            </div>
          </div>

          {/* Option 3: Kanyadaan Portrait (Mobile Only) */}
          <div
            onClick={() => {
              const updated = updateSettings({ bgImage: '/bg-matrimony-mobile.jpg' });
              setSettingsState(updated);
              showToast('Background Updated', 'Applied Kanyadaan Portrait background.');
              window.dispatchEvent(new Event('storage'));
            }}
            className={`block sm:hidden p-3 rounded-2xl border-2 cursor-pointer transition-all space-y-2 group overflow-hidden ${
              settings.bgImage === '/bg-matrimony-mobile.jpg' || settings.bgImage === '/bg-matrimony-3.jpg'
                ? 'border-rose-600 bg-rose-50/30 shadow-md ring-2 ring-rose-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="h-28 rounded-xl overflow-hidden relative shadow-inner bg-slate-100">
              <img src="/bg-matrimony-mobile.jpg" alt="Kanyadaan Portrait" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {(settings.bgImage === '/bg-matrimony-mobile.jpg' || settings.bgImage === '/bg-matrimony-3.jpg') && (
                <div className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full shadow">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="px-1">
              <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                <span>Kanyadaan Portrait</span>
                {(settings.bgImage === '/bg-matrimony-mobile.jpg' || settings.bgImage === '/bg-matrimony-3.jpg') && (
                  <span className="text-[10px] text-rose-600 font-semibold">Active</span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Mobile portrait ritual (Mobile)</p>
            </div>
          </div>

          {/* Option 4: Clean Light Mode (All Devices) */}
          <div
            onClick={() => {
              const updated = updateSettings({ bgImage: 'none' });
              setSettingsState(updated);
              showToast('Background Updated', 'Applied Clean Minimal Light Theme.');
              window.dispatchEvent(new Event('storage'));
            }}
            className={`p-3 rounded-2xl border-2 cursor-pointer transition-all space-y-2 group overflow-hidden ${
              settings.bgImage === 'none'
                ? 'border-rose-600 bg-rose-50/30 shadow-md ring-2 ring-rose-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="h-28 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-medium text-xs relative shadow-inner">
              <span>Minimal Slate</span>
              {settings.bgImage === 'none' && (
                <div className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full shadow">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="px-1">
              <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                <span>Minimal Clean</span>
                {settings.bgImage === 'none' && (
                  <span className="text-[10px] text-rose-600 font-semibold">Active</span>
                )}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Simple solid slate background</p>
            </div>
          </div>
        </div>
      </div>

      {/* IMPORT VALIDATION CHOICE MODAL */}
      {importModal.isOpen && importModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-base">Import Backup Confirmed</h3>
                  <p className="text-xs text-slate-500">{importModal.fileName}</p>
                </div>
              </div>
              <button onClick={() => setImportModal({ isOpen: false })} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <p className="font-semibold text-slate-800">
                Found {importModal.data.proposals?.length || 0} proposals in backup file.
              </p>
              <p className="text-slate-500">Choose how you want to handle existing data in LocalStorage:</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleExecuteImport('replace')}
                className="w-full p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs text-left shadow-sm transition-all"
              >
                <div className="font-bold">Replace Existing Data completely</div>
                <div className="text-[11px] opacity-80">Wipes current storage and replaces with JSON contents.</div>
              </button>

              <button
                onClick={() => handleExecuteImport('merge')}
                className="w-full p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs text-left transition-all"
              >
                <div className="font-bold">Merge with Existing Data</div>
                <div className="text-[11px] text-slate-500">Adds new proposals without overwriting existing records.</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
