'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Star,
  PhoneCall,
  FileText,
  Clock,
  ChevronDown,
  Trash2,
  Edit,
  ExternalLink,
  Check,
} from 'lucide-react';
import {
  getProposals,
  addProposal,
  getSources,
  getHoroscope,
  getCommunications,
  updateProposal,
  deleteProposal,
} from '../../services/storage';
import { Proposal, ProposalStatus, HoroscopeStatus, ProposalFilterParams } from '../../types';
import { formatDate, getStatusBadgeClass, getHoroscopeStatusBadgeClass } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { CommunicationModal } from '../../components/modals/CommunicationModal';
import { NoteModal } from '../../components/modals/NoteModal';
import { FollowUpModal } from '../../components/modals/FollowUpModal';
import { ProposalModal } from '../../components/modals/ProposalModal';

function ProposalsContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const sources = getSources();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') || 'All');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'All');
  const [horoscopeFilter, setHoroscopeFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [shortlistedFilter, setShortlistedFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<ProposalFilterParams['sortBy']>('recently_updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [editingProposal, setEditingProposal] = useState<Proposal | undefined>(undefined);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
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

  const loadProposals = () => {
    const params: ProposalFilterParams = {
      search,
      proposalType: typeFilter as any,
      status: statusFilter as any,
      horoscopeStatus: horoscopeFilter as any,
      source: sourceFilter,
      shortlistedOnly: shortlistedFilter,
      sortBy,
      sortOrder,
    };
    const results = getProposals(params);
    setProposals(results);
  };

  useEffect(() => {
    loadProposals();
  }, [search, typeFilter, statusFilter, horoscopeFilter, sourceFilter, shortlistedFilter, sortBy, sortOrder]);

  const handleToggleShortlist = (proposal: Proposal, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = updateProposal(proposal.id, { shortlisted: !proposal.shortlisted });
    if (updated) {
      showToast(
        updated.shortlisted ? 'Added to Shortlist' : 'Removed from Shortlist',
        `${proposal.fullName} ${updated.shortlisted ? 'shortlisted' : 'removed'}.`
      );
      loadProposals();
    }
  };

  const handleDeleteProposal = (proposal: Proposal, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete proposal for ${proposal.fullName}? All associated data will be removed.`)) {
      deleteProposal(proposal.id);
      showToast('Proposal Deleted', `Deleted proposal for ${proposal.fullName}.`);
      loadProposals();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Header Actions */}
      {/* Header Title Banner */}
      <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/60 shadow-sm inline-block">
        <h1 className="font-serif font-bold text-2xl text-slate-900">Proposal Management</h1>
        <p className="text-xs font-medium text-slate-700 mt-0.5">Filter, search, and track all matrimony proposals</p>
      </div>

      {/* Category Tab Bar (All vs Received vs Requested) */}
      <div className="relative">
        <div className="flex border-b border-slate-200 overflow-x-auto bg-white rounded-2xl p-1 shadow-sm text-xs font-semibold scrollbar-none no-scrollbar pr-8">
          {[
            { id: 'All', label: 'All Proposals' },
            { id: 'Received', label: 'Received Proposals' },
            { id: 'Requested', label: 'Requested (Sent Out)' },
          ].map((tab) => {
            const isActive = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm font-bold'
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

      {/* Filter Controls Card (Clean 2-Line Grid Layout) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-2.5">
        {/* Line 1: All Statuses (Left) | Sort By (Right) */}
        <div className="grid grid-cols-2 gap-2.5 items-center">
          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 pr-8 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl outline-none font-semibold text-slate-800 appearance-none cursor-pointer transition-all shadow-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
            >
              <option value="All" className="bg-white text-slate-900">All Statuses</option>
              <option value="New" className="bg-white text-slate-900">New</option>
              <option value="Contacted" className="bg-white text-slate-900">Contacted</option>
              <option value="Information Pending" className="bg-white text-slate-900">Info Pending</option>
              <option value="Horoscope Pending" className="bg-white text-slate-900">Horoscope Pending</option>
              <option value="Under Consideration" className="bg-white text-slate-900">Under Consideration</option>
              <option value="Meeting Planned" className="bg-white text-slate-900">Meeting Planned</option>
              <option value="Shortlisted" className="bg-white text-slate-900">Shortlisted</option>
              <option value="On Hold" className="bg-white text-slate-900">On Hold</option>
              <option value="Rejected" className="bg-white text-slate-900">Rejected</option>
              <option value="Closed" className="bg-white text-slate-900">Closed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 pr-8 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl outline-none font-semibold text-slate-800 appearance-none cursor-pointer transition-all shadow-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
            >
              <option value="recently_updated" className="bg-white text-slate-900">Sort: Recently Updated</option>
              <option value="recently_added" className="bg-white text-slate-900">Sort: Recently Added</option>
              <option value="name" className="bg-white text-slate-900">Sort: Name</option>
              <option value="age" className="bg-white text-slate-900">Sort: Age</option>
              <option value="status" className="bg-white text-slate-900">Sort: Status</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Line 2: All Horoscope (Left) | Shortlisted (Right) */}
        <div className="grid grid-cols-2 gap-2.5 items-center">
          {/* Horoscope Status Filter Dropdown */}
          <div className="relative">
            <select
              value={horoscopeFilter}
              onChange={(e) => setHoroscopeFilter(e.target.value)}
              className="w-full py-2 px-3 pr-8 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl outline-none font-semibold text-slate-800 appearance-none cursor-pointer transition-all shadow-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
            >
              <option value="All" className="bg-white text-slate-900">All Horoscope</option>
              <option value="Matched" className="bg-white text-slate-900">Matched</option>
              <option value="Partially Matched" className="bg-white text-slate-900">Partially Matched</option>
              <option value="Checking" className="bg-white text-slate-900">Checking</option>
              <option value="Pending" className="bg-white text-slate-900">Pending</option>
              <option value="Not Matched" className="bg-white text-slate-900">Not Matched</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Shortlisted Toggle Button + Reset Link */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShortlistedFilter(!shortlistedFilter)}
              className={`flex-1 py-2 px-3 rounded-2xl border transition-all text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs ${
                shortlistedFilter
                  ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
                  : 'bg-slate-50 hover:bg-slate-100/80 text-slate-800 border-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${shortlistedFilter ? 'fill-current' : ''}`} />
              <span>Shortlisted</span>
            </button>

            {(statusFilter !== 'All' || horoscopeFilter !== 'All' || sourceFilter !== 'All' || shortlistedFilter) && (
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setHoroscopeFilter('All');
                  setSourceFilter('All');
                  setShortlistedFilter(false);
                }}
                className="text-xs font-semibold text-rose-600 hover:underline px-1.5 whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Proposals Listing */}
      {proposals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-serif font-bold text-slate-800 text-lg">No matching proposals found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or filter selection to find proposals.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {proposals.map((prop) => {
            const horoscope = getHoroscope(prop.id);
            const comms = getCommunications(prop.id);
            const lastComm = comms[0];

            return (
              <div
                key={prop.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 font-bold text-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                        {prop.photoUrl ? (
                          <img src={prop.photoUrl} alt={prop.fullName} className="w-full h-full object-cover" />
                        ) : (
                          prop.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/proposals/${prop.id}`}
                          className="font-serif font-bold text-lg text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1"
                        >
                          {prop.fullName}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {prop.age} yrs • {prop.location}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{prop.highestEducation}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleToggleShortlist(prop, e)}
                      className={`p-2 rounded-xl transition-all ${
                        prop.shortlisted
                          ? 'bg-amber-100 text-amber-600'
                          : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'
                      }`}
                      title={prop.shortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                    >
                      <Star className={`w-4 h-4 ${prop.shortlisted ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Profession & Income */}
                  <div className="space-y-1 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="font-semibold text-slate-800 line-clamp-1">{prop.profession}</p>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>{prop.company || 'Private Firm'}</span>
                      {prop.income && <span className="font-medium text-slate-700">{prop.income}</span>}
                    </div>
                  </div>

                  {/* Status & Type Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        prop.proposalType === 'Requested'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {prop.proposalType === 'Requested' ? 'Requested (Sent)' : 'Received'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                        prop.status
                      )}`}
                    >
                      {prop.status}
                    </span>
                    {prop.horoscopeMatch && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          prop.horoscopeMatch === 'Very Good'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : prop.horoscopeMatch === 'OK'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : prop.horoscopeMatch === 'Not ok'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        Match: {prop.horoscopeMatch}
                      </span>
                    )}
                  </div>

                  {/* Platform & Date */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
                    <span>Source: {prop.matrimonyPlatform}</span>
                    <span>Received: {formatDate(prop.dateReceived)}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <Link
                    href={`/proposals/${prop.id}`}
                    className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
                  >
                    View Details
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCommModal({ isOpen: true, proposalId: prop.id, proposalName: prop.fullName })}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Log Call / Conversation"
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
                      onClick={() => {
                        setEditingProposal(prop);
                        setProposalModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Edit Proposal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProposal(prop, e)}
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
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Education & Profession</th>
                  <th className="py-3.5 px-4">Platform & ID</th>
                  <th className="py-3.5 px-4">Proposal Status</th>
                  <th className="py-3.5 px-4">Horoscope</th>
                  <th className="py-3.5 px-4">Received Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposals.map((prop) => {
                  const horoscope = getHoroscope(prop.id);
                  return (
                    <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => handleToggleShortlist(prop, e)}
                            className="text-slate-300 hover:text-amber-500"
                          >
                            <Star
                              className={`w-4 h-4 ${prop.shortlisted ? 'fill-amber-500 text-amber-500' : ''}`}
                            />
                          </button>
                          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 font-bold text-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                            {prop.photoUrl ? (
                              <img src={prop.photoUrl} alt={prop.fullName} className="w-full h-full object-cover" />
                            ) : (
                              prop.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/proposals/${prop.id}`}
                              className="font-bold text-slate-900 group-hover:text-rose-600 text-sm transition-colors"
                            >
                              {prop.fullName}
                            </Link>
                            <p className="text-slate-500">
                              {prop.age} yrs • {prop.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{prop.profession}</p>
                        <p className="text-slate-500">{prop.highestEducation}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{prop.matrimonyPlatform}</p>
                        <p className="text-slate-400 font-mono text-[11px]">{prop.profileId}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(
                            prop.status
                          )}`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getHoroscopeStatusBadgeClass(
                            horoscope.status
                          )}`}
                        >
                          {horoscope.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(prop.dateReceived)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/proposals/${prop.id}`}
                            className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() =>
                              setCommModal({ isOpen: true, proposalId: prop.id, proposalName: prop.fullName })
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Log Call"
                          >
                            <PhoneCall className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProposal(prop);
                              setProposalModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {proposalModalOpen && (
        <ProposalModal
          isOpen={proposalModalOpen}
          initialProposal={editingProposal}
          onClose={() => setProposalModalOpen(false)}
          onSave={(data, primaryContact) => {
            if (editingProposal) {
              updateProposal(editingProposal.id, data);
              showToast('Proposal Updated', 'Updated proposal details.');
            } else {
              addProposal(data, primaryContact);
              showToast('Proposal Saved', 'Proposal details saved.');
            }
            loadProposals();
          }}
        />
      )}

      {commModal.isOpen && (
        <CommunicationModal
          isOpen={commModal.isOpen}
          proposalId={commModal.proposalId}
          proposalName={commModal.proposalName}
          onClose={() => setCommModal({ isOpen: false, proposalId: '', proposalName: '' })}
          onSaved={loadProposals}
        />
      )}

      {noteModal.isOpen && (
        <NoteModal
          isOpen={noteModal.isOpen}
          proposalId={noteModal.proposalId}
          onClose={() => setNoteModal({ isOpen: false, proposalId: '' })}
          onSaved={loadProposals}
        />
      )}

      {followupModal.isOpen && (
        <FollowUpModal
          isOpen={followupModal.isOpen}
          proposalId={followupModal.proposalId}
          onClose={() => setFollowupModal({ isOpen: false, proposalId: '' })}
          onSaved={loadProposals}
        />
      )}
    </div>
  );
}

export default function ProposalsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading proposals...</div>}>
      <ProposalsContent />
    </Suspense>
  );
}
