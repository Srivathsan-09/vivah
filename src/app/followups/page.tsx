'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle2, AlertCircle, Calendar, Plus, Trash2, Edit } from 'lucide-react';
import { getFollowUps, getProposals, completeFollowUp, deleteFollowUp } from '../../services/storage';
import { FollowUp, Proposal } from '../../types';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { FollowUpModal } from '../../components/modals/FollowUpModal';

export default function FollowUpsPage() {
  const { showToast } = useToast();
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming' | 'completed'>('today');

  const [modalState, setModalState] = useState<{ isOpen: boolean; proposalId: string; existing?: FollowUp }>({
    isOpen: false,
    proposalId: '',
  });

  const loadData = () => {
    setFollowups(getFollowUps());
    setProposals(getProposals());
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const overdue = followups.filter((f) => f.status === 'Pending' && f.dueDate < todayStr);
  const today = followups.filter((f) => f.status === 'Pending' && f.dueDate === todayStr);
  const upcoming = followups.filter((f) => f.status === 'Pending' && f.dueDate > todayStr);
  const completed = followups.filter((f) => f.status === 'Completed');

  const handleComplete = (id: string) => {
    completeFollowUp(id);
    showToast('Follow-up Completed', 'Marked follow-up as finished.');
    loadData();
  };

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    followupId?: string;
  }>({ isOpen: false });

  const handleDelete = (id: string) => {
    setDeleteConfirmModal({ isOpen: true, followupId: id });
  };

  const currentList =
    activeTab === 'overdue'
      ? overdue
      : activeTab === 'today'
      ? today
      : activeTab === 'upcoming'
      ? upcoming
      : completed;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/60 shadow-sm">
          <h1 className="font-serif font-bold text-2xl text-slate-900">Follow-up Manager</h1>
          <p className="text-xs font-medium text-slate-700 mt-0.5">Never miss a planned call, meeting, or family reminder</p>
        </div>

        {proposals.length > 0 && (
          <button
            onClick={() => setModalState({ isOpen: true, proposalId: proposals[0].id })}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-md shadow-rose-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Follow-up</span>
          </button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="relative">
        <div className="flex border-b border-slate-200 overflow-x-auto bg-white rounded-2xl p-1 shadow-sm text-xs font-semibold scrollbar-none no-scrollbar pr-8">
          {[
            { id: 'overdue', label: `Overdue (${overdue.length})`, count: overdue.length, badgeColor: 'bg-rose-500 text-white' },
            { id: 'today', label: `Due Today (${today.length})`, count: today.length, badgeColor: 'bg-amber-500 text-white' },
            { id: 'upcoming', label: `Upcoming (${upcoming.length})`, count: upcoming.length },
            { id: 'completed', label: `Completed (${completed.length})`, count: completed.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        {/* Visual Scroll Arrow Hint for Mobile */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/90 to-transparent rounded-r-2xl pointer-events-none flex items-center justify-end pr-1.5 text-slate-400 font-bold text-xs">
          ›
        </div>
      </div>

      {/* List Content */}
      {currentList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-2">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-serif font-bold text-slate-800 text-lg">No follow-ups in this section</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All reminders in this category have been attended to or cleared.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((flw) => {
            const prop = proposals.find((p) => p.id === flw.proposalId);
            return (
              <div
                key={flw.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <Link
                        href={`/proposals/${flw.proposalId}`}
                        className="font-serif font-bold text-slate-900 text-base hover:text-rose-600 transition-colors"
                      >
                        {prop?.fullName || 'Proposal Profile'}
                      </Link>
                      <p className="text-xs text-slate-500">Contact: {flw.contactName}</p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        flw.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : flw.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {flw.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800">"{flw.reason}"</p>

                  {flw.notes && <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">"{flw.notes}"</p>}

                  <div className="text-[11px] text-slate-400 mt-3 flex items-center justify-between">
                    <span>Due Date: {formatDate(flw.dueDate)}</span>
                    {flw.completedAt && <span className="text-emerald-600">Completed {formatDate(flw.completedAt)}</span>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/proposals/${flw.proposalId}`}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
                  >
                    View Proposal
                  </Link>

                  <div className="flex items-center gap-2">
                    {flw.status === 'Pending' && (
                      <button
                        onClick={() => handleComplete(flw.id)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    )}
                    <button
                      onClick={() => setModalState({ isOpen: true, proposalId: flw.proposalId, existing: flw })}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(flw.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalState.isOpen && (
        <FollowUpModal
          isOpen={modalState.isOpen}
          proposalId={modalState.proposalId}
          existingFollowUp={modalState.existing}
          onClose={() => setModalState({ isOpen: false, proposalId: '' })}
          onSaved={loadData}
        />
      )}

      {/* Custom Delete Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">Delete Follow-up Reminder?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this scheduled follow-up reminder?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmModal({ isOpen: false })}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmModal.followupId) {
                    deleteFollowUp(deleteConfirmModal.followupId);
                    showToast('Deleted', 'Follow-up removed.');
                    loadData();
                  }
                  setDeleteConfirmModal({ isOpen: false });
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
