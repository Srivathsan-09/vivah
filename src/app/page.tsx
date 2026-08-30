'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  PauseCircle,
  XCircle,
  Plus,
  ArrowRight,
  PhoneCall,
  FileText,
  Calendar,
  Sparkles,
  Search,
  Trash2,
} from 'lucide-react';
import { getProposals, addProposal, getFollowUps, getCommunications, getHoroscope, completeFollowUp, deleteProposal } from '../services/storage';
import { Proposal, FollowUp } from '../types';
import { formatDate, getStatusBadgeClass, getHoroscopeStatusBadgeClass } from '../lib/utils';
import { useToast } from '../components/ui/Toast';
import { CommunicationModal } from '../components/modals/CommunicationModal';
import { NoteModal } from '../components/modals/NoteModal';
import { FollowUpModal } from '../components/modals/FollowUpModal';
import { ProposalModal } from '../components/modals/ProposalModal';

export default function Dashboard() {
  const { showToast } = useToast();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    proposal?: Proposal;
  }>({ isOpen: false });

  const [commModal, setCommModal] = useState<{ isOpen: boolean; proposalId: string; proposalName: string }>({
    isOpen: false,
    proposalId: '',
    proposalName: '',
  });
  const [noteModal, setNoteModal] = useState<{ isOpen: boolean; proposalId: string }>({
    isOpen: false,
    proposalId: '',
  });
  const [followupModal, setFollowupModal] = useState<{ isOpen: boolean; proposalId: string }>({
    isOpen: false,
    proposalId: '',
  });
  const [addProposalOpen, setAddProposalOpen] = useState(false);

  const loadDashboardData = () => {
    const props = getProposals();
    const flws = getFollowUps();
    setProposals(props);
    setFollowups(flws);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Stats Calculations
  const total = proposals.length;
  const receivedCount = proposals.filter((p) => (p.proposalType || 'Received') === 'Received').length;
  const requestedCount = proposals.filter((p) => p.proposalType === 'Requested').length;
  const newCount = proposals.filter((p) => p.status === 'New').length;
  const consideringCount = proposals.filter((p) => p.status === 'Under Consideration').length;
  const shortlistedCount = proposals.filter((p) => p.shortlisted || p.status === 'Shortlisted').length;
  const onHoldCount = proposals.filter((p) => p.status === 'On Hold').length;
  const rejectedCount = proposals.filter((p) => p.status === 'Rejected').length;
  const horoscopePendingCount = proposals.filter((p) => {
    const h = getHoroscope(p.id);
    return h.status === 'Pending' || h.status === 'Checking' || p.status === 'Horoscope Pending';
  }).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const followupsDueCount = followups.filter((f) => f.status === 'Pending' && f.dueDate <= todayStr).length;

  const overdueFollowups = followups.filter((f) => f.status === 'Pending' && f.dueDate < todayStr);
  const todayFollowups = followups.filter((f) => f.status === 'Pending' && f.dueDate === todayStr);
  const upcomingFollowups = followups.filter((f) => f.status === 'Pending' && f.dueDate > todayStr).slice(0, 4);

  const recentProposals = [...proposals]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const handleCompleteFollowUp = (id: string) => {
    completeFollowUp(id);
    showToast('Follow-up Completed', 'Marked follow-up task as complete.');
    loadDashboardData();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* Main Dashboard Layout */}
      <div className="space-y-4">
        <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/60 shadow-sm inline-block">
          <h2 className="font-serif font-bold text-xl text-slate-900">Recent Proposals</h2>
          <p className="text-xs font-medium text-slate-700 mt-0.5">Recently added or updated matrimony profiles</p>
        </div>

          {recentProposals.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-slate-800 text-lg">No proposals added yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Start organizing your matrimony journey by adding your first received proposal.
              </p>
              <button
                onClick={() => setAddProposalOpen(true)}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-900/20"
              >
                + Add First Proposal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentProposals.map((prop) => {
                const comms = getCommunications(prop.id);
                const lastComm = comms[0];
                const horoscope = getHoroscope(prop.id);

                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 font-bold text-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                            {prop.photoUrl ? (
                              <img src={prop.photoUrl} alt={prop.fullName} className="w-full h-full object-cover" />
                            ) : (
                              prop.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/proposals/${prop.id}`}
                              className="font-serif font-bold text-base text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1"
                            >
                              {prop.fullName}
                            </Link>
                            <p className="text-xs text-slate-500">
                              {prop.age} yrs • {prop.location}
                            </p>
                          </div>
                        </div>

                        {prop.shortlisted && (
                          <span className="p-1 rounded-lg bg-amber-100 text-amber-700" title="Shortlisted">
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          </span>
                        )}
                      </div>

                      {/* Profession & Platform */}
                      <div className="text-xs text-slate-600 mb-3 space-y-1">
                        <p className="font-medium text-slate-800 line-clamp-1">{prop.profession}</p>
                        <p className="text-slate-400">
                          Source: <span className="text-slate-600 font-medium">{prop.matrimonyPlatform}</span>
                        </p>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(
                            prop.status
                          )}`}
                        >
                          {prop.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getHoroscopeStatusBadgeClass(
                            horoscope.status
                          )}`}
                        >
                          Horo: {horoscope.status}
                        </span>
                      </div>

                      {/* Last Communication Info */}
                      {lastComm && (
                        <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 mb-4 border border-slate-100">
                          <p className="font-semibold text-slate-700 flex items-center gap-1 mb-0.5">
                            <PhoneCall className="w-3 h-3 text-rose-500" />
                            <span>Last Talked: {formatDate(lastComm.date)}</span>
                          </p>
                          <p className="text-slate-500 italic line-clamp-1">"{lastComm.summary}"</p>
                        </div>
                      )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                      <Link
                        href={`/proposals/${prop.id}`}
                        className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                      >
                        View Profile
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setCommModal({ isOpen: true, proposalId: prop.id, proposalName: prop.fullName })
                          }
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Log Conversation"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setNoteModal({ isOpen: true, proposalId: prop.id })}
                          className="p-2 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Add Note"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setFollowupModal({ isOpen: true, proposalId: prop.id })}
                          className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Schedule Follow-up"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmModal({ isOpen: true, proposal: prop })}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Proposal"
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
        </div>

      {/* Modals */}
      {commModal.isOpen && (
        <CommunicationModal
          isOpen={commModal.isOpen}
          proposalId={commModal.proposalId}
          proposalName={commModal.proposalName}
          onClose={() => setCommModal({ isOpen: false, proposalId: '', proposalName: '' })}
          onSaved={loadDashboardData}
        />
      )}

      {noteModal.isOpen && (
        <NoteModal
          isOpen={noteModal.isOpen}
          proposalId={noteModal.proposalId}
          onClose={() => setNoteModal({ isOpen: false, proposalId: '' })}
          onSaved={loadDashboardData}
        />
      )}

      {followupModal.isOpen && (
        <FollowUpModal
          isOpen={followupModal.isOpen}
          proposalId={followupModal.proposalId}
          onClose={() => setFollowupModal({ isOpen: false, proposalId: '' })}
          onSaved={loadDashboardData}
        />
      )}

      {addProposalOpen && (
        <ProposalModal
          isOpen={addProposalOpen}
          onClose={() => setAddProposalOpen(false)}
          onSave={(data, primaryContact) => {
            addProposal(data, primaryContact);
            loadDashboardData();
            showToast('Proposal Created', 'Successfully added proposal.');
          }}
        />
      )}

      {/* Custom Delete Proposal Confirmation Modal */}
      {deleteConfirmModal.isOpen && deleteConfirmModal.proposal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">Delete Proposal Profile?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete proposal for <span className="font-bold text-slate-800">{deleteConfirmModal.proposal.fullName}</span>? All associated data will be removed.
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
                  if (deleteConfirmModal.proposal) {
                    deleteProposal(deleteConfirmModal.proposal.id);
                    showToast('Proposal Deleted', `Removed proposal for ${deleteConfirmModal.proposal.fullName}.`);
                    loadDashboardData();
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
