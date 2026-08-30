'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Phone,
  PhoneCall,
  MessageSquare,
  FileText,
  Clock,
  Star,
  Edit,
  Trash2,
  Calendar,
  GraduationCap,
  Briefcase,
  Globe,
  Users,
  Shield,
  FileCheck,
  Activity as ActivityIcon,
  Plus,
  ArrowLeft,
  Upload,
  File,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  getProposal,
  getContacts,
  getCommunications,
  getHoroscope,
  getNotes,
  getStatusHistory,
  getActivities,
  updateProposal,
  addContact,
  deleteContact,
  updateHoroscope,
  deleteNote,
  deleteCommunication,
  deleteProposal,
} from '../../../services/storage';
import {
  Proposal,
  ProposalContact,
  Communication,
  Horoscope,
  Note,
  StatusHistory,
  Activity,
  ProposalStatus,
  HoroscopeStatus,
} from '../../../types';
import { formatDate, getStatusBadgeClass, getHoroscopeStatusBadgeClass } from '../../../lib/utils';
import { useToast } from '../../../components/ui/Toast';
import { ProposalModal } from '../../../components/modals/ProposalModal';
import { CommunicationModal } from '../../../components/modals/CommunicationModal';
import { NoteModal } from '../../../components/modals/NoteModal';
import { FollowUpModal } from '../../../components/modals/FollowUpModal';
import { RejectionModal } from '../../../components/modals/RejectionModal';

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | undefined>(undefined);
  const [contacts, setContacts] = useState<ProposalContact[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [horoscope, setHoroscopeState] = useState<Horoscope | undefined>(undefined);
  const [notes, setNotesState] = useState<Note[]>([]);
  const [statusHistory, setStatusHistoryState] = useState<StatusHistory[]>([]);
  const [activities, setActivitiesState] = useState<Activity[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'communication' | 'horoscope' | 'notes' | 'activity'>('overview');

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = React.useRef<HTMLDivElement>(null);

  const [editProposalOpen, setEditProposalOpen] = useState(false);
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);

  // Close status popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add Contact Form inline state
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState<Partial<ProposalContact>>({
    name: '',
    relationship: 'Father',
    phone: '',
    whatsapp: '',
    email: '',
    notes: '',
  });

  // Horoscope edit inline state
  const [editingHoroscope, setEditingHoroscope] = useState(false);
  const [horoscopeForm, setHoroscopeForm] = useState<Partial<Horoscope>>({});

  const reloadData = () => {
    const p = getProposal(proposalId);
    if (!p) {
      router.push('/proposals');
      return;
    }
    setProposal(p);
    setContacts(getContacts(proposalId));
    setCommunications(getCommunications(proposalId));
    const h = getHoroscope(proposalId);
    setHoroscopeState(h);
    setHoroscopeForm(h);
    setNotesState(getNotes(proposalId));
    setStatusHistoryState(getStatusHistory(proposalId));
    setActivitiesState(getActivities(100).filter((a) => a.proposalId === proposalId));
  };

  useEffect(() => {
    reloadData();
  }, [proposalId]);

  if (!proposal) {
    return <div className="p-8 text-center text-slate-500">Loading proposal details...</div>;
  }

  const handleStatusChange = (newStatus: ProposalStatus) => {
    if (newStatus === 'Rejected') {
      setRejectionModalOpen(true);
    } else {
      updateProposal(proposalId, { status: newStatus });
      showToast('Status Updated', `Proposal status changed to ${newStatus}.`);
      reloadData();
    }
  };

  const handleToggleShortlist = () => {
    const updated = updateProposal(proposalId, { shortlisted: !proposal.shortlisted });
    if (updated) {
      showToast(
        updated.shortlisted ? 'Added to Shortlist' : 'Removed from Shortlist',
        `${proposal.fullName} ${updated.shortlisted ? 'shortlisted' : 'removed'}.`
      );
      reloadData();
    }
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) {
      showToast('Validation Error', 'Name and Phone are required.', 'error');
      return;
    }
    addContact({
      proposalId,
      name: newContact.name,
      relationship: newContact.relationship as any,
      phone: newContact.phone,
      whatsapp: newContact.whatsapp || undefined,
      email: newContact.email || undefined,
      notes: newContact.notes || undefined,
    });
    setAddContactOpen(false);
    setNewContact({ name: '', relationship: 'Father', phone: '', whatsapp: '', email: '', notes: '' });
    showToast('Contact Added', `Added family contact ${newContact.name}.`);
    reloadData();
  };

  const handleDeleteContact = (id: string) => {
    if (confirm('Delete this contact?')) {
      deleteContact(id);
      showToast('Contact Removed', 'Deleted family contact.');
      reloadData();
    }
  };

  const handleSaveHoroscope = (e: React.FormEvent) => {
    e.preventDefault();
    updateHoroscope(proposalId, horoscopeForm);
    setEditingHoroscope(false);
    showToast('Horoscope Updated', 'Astrology and horoscope details saved.');
    reloadData();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Please upload a file smaller than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateHoroscope(proposalId, {
        documentName: file.name,
        documentDataUrl: dataUrl,
      });
      showToast('Document Uploaded', `Uploaded ${file.name} to local horoscope record.`);
      reloadData();
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = () => {
    if (confirm('Delete horoscope document?')) {
      updateHoroscope(proposalId, { documentName: undefined, documentDataUrl: undefined });
      showToast('Document Removed', 'Horoscope document deleted.');
      reloadData();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 animate-fade-in">
      {/* Top Back & Actions Pill Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-md shadow-sm border border-slate-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between">
        <Link
          href="/proposals"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to All Proposals</span>
        </Link>

        <button
          onClick={() => setDeleteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200/70 transition-all active:scale-95 shadow-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Proposal</span>
        </button>
      </div>

      {/* Main Header Banner Card (Full Width Utilization) */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        {/* Profile Info Section */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-100 text-rose-700 font-bold text-2xl sm:text-3xl flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0 border-2 border-rose-200">
            {proposal.photoUrl ? (
              <img src={proposal.photoUrl} alt={proposal.fullName} className="w-full h-full object-cover" />
            ) : (
              proposal.fullName.charAt(0)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 truncate">{proposal.fullName}</h1>
              <button
                onClick={handleToggleShortlist}
                className={`p-1.5 rounded-xl border transition-all flex-shrink-0 ${
                  proposal.shortlisted
                    ? 'bg-amber-100 text-amber-600 border-amber-300'
                    : 'text-slate-300 border-slate-200 hover:text-amber-500'
                }`}
                title={proposal.shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
              >
                <Star className={`w-4 h-4 ${proposal.shortlisted ? 'fill-amber-500' : ''}`} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium truncate">
              {proposal.age} yrs • {proposal.location} • {proposal.profession}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {proposal.matrimonyPlatform} {proposal.profileId ? `(Profile ID: ${proposal.profileId})` : ''}
            </p>
          </div>
        </div>

        {/* Action Control Bar (Full-Width Responsive 5-Column Grid - Zero Whitespace Gap) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-100 w-full text-xs">
          {/* 1. Custom Status Popover Dropdown (Zero Native Browser Picker) */}
          <div className="relative col-span-2 sm:col-span-1" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-between gap-1.5 transition-all shadow-xs ${getStatusBadgeClass(
                proposal.status
              )}`}
            >
              <span className="truncate">{proposal.status === 'Information Pending' ? 'Info Pending' : proposal.status}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {statusDropdownOpen && (
              <div className="absolute top-full left-0 right-0 sm:w-48 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-1.5 z-50 space-y-0.5 max-h-64 overflow-y-auto animate-scale-in">
                {[
                  'New',
                  'Contacted',
                  'Information Pending',
                  'Horoscope Pending',
                  'Under Consideration',
                  'Meeting Planned',
                  'Shortlisted',
                  'On Hold',
                  'Rejected',
                  'Closed',
                ].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      handleStatusChange(st as ProposalStatus);
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      proposal.status === st
                        ? 'bg-rose-50 text-rose-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{st === 'Information Pending' ? 'Info Pending' : st}</span>
                    {proposal.status === st && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Edit Proposal */}
          <button
            onClick={() => setEditProposalOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {/* 3. Add Conversation */}
          <button
            onClick={() => setCommModalOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Add Conversation</span>
          </button>

          {/* 4. Add Note */}
          <button
            onClick={() => {
              setEditingNote(undefined);
              setNoteModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>

          {/* 5. Follow-up */}
          <button
            onClick={() => setFollowupModalOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Follow-up</span>
          </button>
        </div>

        {/* Rejection Details Banner if Rejected */}
        {proposal.status === 'Rejected' && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-rose-800 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Proposal Rejected — Reason: {proposal.rejectionReason || 'Not Specified'}</span>
            </p>
            {proposal.rejectionNotes && <p className="text-rose-700 italic pl-5">"{proposal.rejectionNotes}"</p>}
          </div>
        )}
      </div>

      {/* Horizontal Slider Section Tabs Navigation */}
      <div className="relative bg-white rounded-2xl p-1 shadow-sm border border-slate-200/80">
        <div className="flex items-center overflow-x-auto text-xs font-semibold scrollbar-none no-scrollbar pr-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'contacts', label: `Contacts (${contacts.length})`, icon: Phone },
            { id: 'communication', label: `Communication (${communications.length})`, icon: PhoneCall },
            { id: 'horoscope', label: 'Horoscope', icon: FileCheck },
            { id: 'notes', label: `Notes (${notes.length})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        {/* Subtle scroll hint indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/90 to-transparent rounded-r-2xl pointer-events-none flex items-center justify-end pr-1 text-slate-400 font-bold text-xs">
          ›
        </div>
      </div>

      {/* TAB CONTENT PANELS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal & Demographics */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-rose-600" />
              <span>Personal & Demographics</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Full Name</span>
                <span className="font-semibold text-slate-800">{proposal.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Gender</span>
                <span className="font-semibold text-slate-800">{proposal.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Age & DOB</span>
                <span className="font-semibold text-slate-800">
                  {proposal.age} yrs {proposal.dob ? `(${formatDate(proposal.dob)})` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Height</span>
                <span className="font-semibold text-slate-800">{proposal.height || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Religion</span>
                <span className="font-semibold text-slate-800">{proposal.religion || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Community / Caste</span>
                <span className="font-semibold text-slate-800">{proposal.community || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Mother Tongue</span>
                <span className="font-semibold text-slate-800">{proposal.motherTongue || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Marital Status</span>
                <span className="font-semibold text-slate-800">{proposal.maritalStatus}</span>
              </div>
            </div>
          </div>

          {/* Education & Career */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="w-4 h-4 text-rose-600" />
              <span>Education & Career</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <span className="text-slate-400 block">Highest Education</span>
                <span className="font-semibold text-slate-800">{proposal.highestEducation}</span>
              </div>
              <div>
                <span className="text-slate-400 block">College / University</span>
                <span className="font-semibold text-slate-800">{proposal.college || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Profession</span>
                <span className="font-semibold text-slate-800">{proposal.profession}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Company</span>
                <span className="font-semibold text-slate-800">{proposal.company || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Work Location</span>
                <span className="font-semibold text-slate-800">{proposal.workLocation || proposal.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Annual Income</span>
                <span className="font-semibold text-slate-800 text-rose-600">{proposal.income || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Matrimony Profile Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe className="w-4 h-4 text-rose-600" />
              <span>Matrimony Platform Info</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Platform Source</span>
                <span className="font-semibold text-slate-800">{proposal.matrimonyPlatform}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Profile ID</span>
                <span className="font-semibold text-slate-800">{proposal.profileId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Date Received</span>
                <span className="font-semibold text-slate-800">{formatDate(proposal.dateReceived)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Profile Link</span>
                {proposal.profileUrl ? (
                  <a
                    href={proposal.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-400">N/A</span>
                )}
              </div>
            </div>

            {proposal.initialImpression && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 text-xs block mb-1">Initial Impression Notes</span>
                <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{proposal.initialImpression}"
                </p>
              </div>
            )}
          </div>

          {/* Family Information */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="w-4 h-4 text-rose-600" />
              <span>Family Background</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Father's Name</span>
                <span className="font-semibold text-slate-800">{proposal.fatherName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Father's Occupation</span>
                <span className="font-semibold text-slate-800">{proposal.fatherOccupation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Mother's Name</span>
                <span className="font-semibold text-slate-800">{proposal.motherName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Mother's Occupation</span>
                <span className="font-semibold text-slate-800">{proposal.motherOccupation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Siblings</span>
                <span className="font-semibold text-slate-800">{proposal.siblings || 'None / N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Native Location</span>
                <span className="font-semibold text-slate-800">{proposal.familyLocation || proposal.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-slate-900 text-lg">Family Contacts</h3>
            <button
              onClick={() => setAddContactOpen(!addContactOpen)}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Family Contact</span>
            </button>
          </div>

          {/* Inline Add Contact Form */}
          {addContactOpen && (
            <form onSubmit={handleAddContactSubmit} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
              <h4 className="font-semibold text-slate-900 text-sm">Add New Contact</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Name *</label>
                  <input
                    type="text"
                    required
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="e.g. Mr. R. Sundaram"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Relationship</label>
                  <select
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son/Daughter">Candidate Directly</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Relative">Relative</option>
                    <option value="Mediator">Mediator</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Phone *</label>
                  <input
                    type="text"
                    required
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+91 98401 23456"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">WhatsApp</label>
                  <input
                    type="text"
                    value={newContact.whatsapp}
                    onChange={(e) => setNewContact({ ...newContact, whatsapp: e.target.value })}
                    placeholder="+91 98401 23456"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1 font-medium">Email</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="email@gmail.com"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddContactOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-xs bg-rose-600 text-white rounded-xl font-semibold">
                  Save Contact
                </button>
              </div>
            </form>
          )}

          {/* Contacts List Grid */}
          {contacts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs">
              No contacts recorded for this proposal yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((cnt) => (
                <div key={cnt.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{cnt.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {cnt.relationship}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteContact(cnt.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                      title="Delete contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <p className="flex items-center gap-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cnt.phone}</span>
                    </p>
                    {cnt.whatsapp && (
                      <p className="flex items-center gap-2 text-emerald-700 font-mono">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{cnt.whatsapp}</span>
                      </p>
                    )}
                    {cnt.email && (
                      <p className="text-slate-500 text-[11px] truncate">Email: {cnt.email}</p>
                    )}
                    {cnt.notes && <p className="text-slate-500 text-[11px] italic">"{cnt.notes}"</p>}
                  </div>

                  {/* Quick Action Links */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`tel:${cnt.phone}`}
                      className="flex-1 py-1.5 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-rose-500" />
                      <span>Call</span>
                    </a>
                    {cnt.whatsapp && (
                      <a
                        href={`https://wa.me/${cnt.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 text-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMMUNICATION TIMELINE */}
      {activeTab === 'communication' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg">Communication Timeline</h3>
              <p className="text-xs text-slate-500">Complete chronological log of calls, meetings, and WhatsApp exchanges</p>
            </div>
            <button
              onClick={() => setCommModalOpen(true)}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>+ Add Conversation</span>
            </button>
          </div>

          {communications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs">
              No conversations recorded yet. Log your first telephone call or meeting above.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {communications.map((comm) => (
                <div key={comm.id} className="relative group">
                  {/* Timeline Dot Icon */}
                  <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shadow-md">
                    <PhoneCall className="w-3 h-3" />
                  </div>

                  {/* Activity Card */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-sm">{comm.contactPerson}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              comm.direction === 'Incoming'
                                ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {comm.direction} • {comm.method}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatDate(comm.date)} {comm.time ? `at ${comm.time}` : ''}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Delete conversation record?')) {
                            deleteCommunication(comm.id);
                            showToast('Deleted', 'Removed conversation log.');
                            reloadData();
                          }
                        }}
                        className="text-slate-300 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-slate-800">"{comm.summary}"</p>

                    {comm.detailedNotes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        {comm.detailedNotes}
                      </p>
                    )}

                    {/* Next Action & FollowUp */}
                    {(comm.nextAction || comm.followUpDate) && (
                      <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
                        {comm.nextAction && (
                          <span className="font-medium text-rose-600">Next Action: {comm.nextAction}</span>
                        )}
                        {comm.followUpDate && (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-semibold">
                            Follow-up: {formatDate(comm.followUpDate)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HOROSCOPE MODULE */}
      {activeTab === 'horoscope' && horoscope && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-lg">Horoscope & Astrological Compatibility</h3>
                <p className="text-xs text-slate-500">Record family determined astrology results and documents</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getHoroscopeStatusBadgeClass(
                    horoscope.status
                  )}`}
                >
                  Status: {horoscope.status}
                </span>

                <button
                  onClick={() => setEditingHoroscope(!editingHoroscope)}
                  className="py-1.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                >
                  {editingHoroscope ? 'Cancel' : 'Edit Astrology Info'}
                </button>
              </div>
            </div>

            {/* Edit Horoscope Form */}
            {editingHoroscope ? (
              <form onSubmit={handleSaveHoroscope} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Horoscope Status</label>
                    <select
                      value={horoscopeForm.status || 'Pending'}
                      onChange={(e) => setHoroscopeForm({ ...horoscopeForm, status: e.target.value as HoroscopeStatus })}
                      className="w-full px-3 py-2 border rounded-xl outline-none"
                    >
                      <option value="Not Provided">Not Provided</option>
                      <option value="Pending">Pending</option>
                      <option value="Checking">Checking</option>
                      <option value="Matched">Matched</option>
                      <option value="Partially Matched">Partially Matched</option>
                      <option value="Not Matched">Not Matched</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Time of Birth (TOB)</label>
                    <input
                      type="text"
                      value={horoscopeForm.tob || ''}
                      onChange={(e) => setHoroscopeForm({ ...horoscopeForm, tob: e.target.value })}
                      placeholder="e.g. 08:15 AM"
                      className="w-full px-3 py-2 border rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Place of Birth (POB)</label>
                    <input
                      type="text"
                      value={horoscopeForm.pob || ''}
                      onChange={(e) => setHoroscopeForm({ ...horoscopeForm, pob: e.target.value })}
                      placeholder="e.g. Chennai, Tamil Nadu"
                      className="w-full px-3 py-2 border rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Rasi (Zodiac)</label>
                    <input
                      type="text"
                      value={horoscopeForm.rasi || ''}
                      onChange={(e) => setHoroscopeForm({ ...horoscopeForm, rasi: e.target.value })}
                      placeholder="e.g. Mesha (Aries)"
                      className="w-full px-3 py-2 border rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nakshatra (Star)</label>
                    <input
                      type="text"
                      value={horoscopeForm.nakshatra || ''}
                      onChange={(e) => setHoroscopeForm({ ...horoscopeForm, nakshatra: e.target.value })}
                      placeholder="e.g. Bharani"
                      className="w-full px-3 py-2 border rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Compatibility Score</label>
                    <input
                      type="text"
                      value={horoscopeForm.compatibilityScore || ''}
                      onChange={(e) => setHoroscopeForm({ ...horoscopeForm, compatibilityScore: e.target.value })}
                      placeholder="e.g. 31 / 36"
                      className="w-full px-3 py-2 border rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Astrologer's Name</label>
                    <input
                      type="text"
                      value={horoscopeForm.astrologerName || ''}
                      onChange={(e) => setHoroscopeForm({ ...horoscopeForm, astrologerName: e.target.value })}
                      placeholder="e.g. Pandit Venkatraman"
                      className="w-full px-3 py-2 border rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Date Checked</label>
                    <input
                      type="date"
                      value={horoscopeForm.dateChecked || ''}
                      onChange={(e) => setHoroscopeForm({ ...horoscopeForm, dateChecked: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">Astrologer Notes & Recommendations</label>
                  <textarea
                    rows={3}
                    value={horoscopeForm.compatibilityNotes || ''}
                    onChange={(e) => setHoroscopeForm({ ...horoscopeForm, compatibilityNotes: e.target.value })}
                    placeholder="Details about Porutham, Doshas, Guna Milan score..."
                    className="w-full px-3 py-2 border rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingHoroscope(false)}
                    className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 text-xs bg-rose-600 text-white rounded-xl font-semibold">
                    Save Horoscope Details
                  </button>
                </div>
              </form>
            ) : (
              /* Horoscope Display View */
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Time of Birth</span>
                    <span className="font-bold text-slate-800">{horoscope.tob || 'Not specified'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Place of Birth</span>
                    <span className="font-bold text-slate-800">{horoscope.pob || 'Not specified'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Rasi (Zodiac)</span>
                    <span className="font-bold text-slate-800">{horoscope.rasi || 'Not specified'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Nakshatra (Star)</span>
                    <span className="font-bold text-slate-800">{horoscope.nakshatra || 'Not specified'}</span>
                  </div>
                </div>

                {horoscope.compatibilityScore && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-900 text-sm block">
                        Compatibility Score: {horoscope.compatibilityScore}
                      </span>
                      {horoscope.astrologerName && (
                        <span className="text-emerald-700">Checked by {horoscope.astrologerName}</span>
                      )}
                    </div>
                    {horoscope.dateChecked && (
                      <span className="text-emerald-700 text-[11px]">Checked on {formatDate(horoscope.dateChecked)}</span>
                    )}
                  </div>
                )}

                {horoscope.compatibilityNotes && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1">Astrologer Notes</h4>
                    <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      "{horoscope.compatibilityNotes}"
                    </p>
                  </div>
                )}

                {/* Horoscope Document Upload Section */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Horoscope Document / Chart Image</h4>

                  {proposal.horoscopeImageUrl && (
                    <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                      <p className="text-xs font-bold text-indigo-900">Horoscope Chart Image:</p>
                      <div className="max-w-md max-h-64 rounded-xl overflow-hidden border border-indigo-200 shadow-sm bg-white p-1">
                        <img src={proposal.horoscopeImageUrl} alt="Horoscope Chart" className="w-full h-full object-contain max-h-64 rounded-lg" />
                      </div>
                    </div>
                  )}

                  {horoscope.documentName && horoscope.documentDataUrl ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <File className="w-8 h-8 text-rose-500 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{horoscope.documentName}</p>
                          <p className="text-[11px] text-slate-400">Browser local storage document preview</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={horoscope.documentDataUrl}
                          download={horoscope.documentName}
                          className="py-1.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                        <button
                          onClick={handleDeleteDocument}
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-xl"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-rose-300 transition-colors">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">Upload Horoscope PDF or Image</p>
                      <p className="text-[11px] text-slate-400 mb-3">PDF, PNG, JPG (Max 5MB stored locally in browser)</p>
                      <label className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs cursor-pointer shadow-sm inline-block">
                        Browse File
                        <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-slate-900 text-lg">Proposal Notes</h3>
            <button
              onClick={() => {
                setEditingNote(undefined);
                setNoteModalOpen(true);
              }}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Note</span>
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs">
              No notes written for this proposal yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((n) => (
                <div key={n.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-200">
                      {n.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDate(n.createdAt)}</span>
                  </div>

                  <p className="text-xs text-slate-700 whitespace-pre-wrap">{n.text}</p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingNote(n);
                        setNoteModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete note?')) {
                          deleteNote(n.id);
                          showToast('Deleted', 'Note removed.');
                          reloadData();
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <h3 className="font-serif font-bold text-slate-900 text-lg">Proposal Audit & Activity Log</h3>
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            {activities.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-6">No recorded activity history.</div>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-3 last:border-none">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{act.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(act.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {editProposalOpen && (
        <ProposalModal
          isOpen={editProposalOpen}
          initialProposal={proposal}
          onClose={() => setEditProposalOpen(false)}
          onSave={() => {
            reloadData();
            showToast('Proposal Saved', 'Updated proposal details.');
          }}
        />
      )}

      {commModalOpen && (
        <CommunicationModal
          isOpen={commModalOpen}
          proposalId={proposalId}
          proposalName={proposal.fullName}
          onClose={() => setCommModalOpen(false)}
          onSaved={reloadData}
        />
      )}

      {noteModalOpen && (
        <NoteModal
          isOpen={noteModalOpen}
          proposalId={proposalId}
          existingNote={editingNote}
          onClose={() => setNoteModalOpen(false)}
          onSaved={reloadData}
        />
      )}

      {followupModalOpen && (
        <FollowUpModal
          isOpen={followupModalOpen}
          proposalId={proposalId}
          onClose={() => setFollowupModalOpen(false)}
          onSaved={reloadData}
        />
      )}

      {rejectionModalOpen && (
        <RejectionModal
          isOpen={rejectionModalOpen}
          proposalId={proposalId}
          onClose={() => setRejectionModalOpen(false)}
          onSaved={reloadData}
        />
      )}

      {/* Custom Delete Proposal Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">Delete Proposal Profile?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete proposal for <span className="font-bold text-slate-800">{proposal.fullName}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProposal(proposalId);
                  showToast('Proposal Deleted', 'Proposal removed permanently.');
                  router.push('/proposals');
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
