'use client';

import React, { useState, useEffect } from 'react';
import { X, User, GraduationCap, Globe, Users, Phone, Shield, Sparkles } from 'lucide-react';
import { Proposal, ProposalStatus, ContactRelationship } from '../../types';
import { checkDuplicate, getSources } from '../../services/storage';
import { DuplicateAlertModal } from './DuplicateAlertModal';
import { useToast } from '../ui/Toast';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (proposalData: any, primaryContact?: any) => void;
  initialProposal?: Proposal;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProposal,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'personal' | 'career' | 'matrimony' | 'family' | 'contact' | 'status'>('personal');

  // Form State
  const [formData, setFormData] = useState<Partial<Proposal>>({
    fullName: '',
    gender: 'Male',
    dob: '',
    age: 28,
    height: "5' 9\"",
    location: '',
    religion: 'Hindu',
    community: '',
    motherTongue: '',
    maritalStatus: 'Never Married',
    highestEducation: '',
    college: '',
    profession: '',
    company: '',
    workLocation: '',
    income: '',
    matrimonyPlatform: 'Sai Sankara Matrimony',
    profileId: '',
    profileUrl: '',
    dateReceived: new Date().toISOString().split('T')[0],
    initialImpression: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    siblings: '',
    familyLocation: '',
    status: 'New',
    shortlisted: false,
    photoUrl: '',
  });

  // Primary Contact State
  const [contactData, setContactData] = useState({
    name: '',
    relationship: 'Father' as ContactRelationship,
    phone: '',
    whatsapp: '',
    email: '',
  });

  // Duplicate Check Alert State
  const [duplicateAlert, setDuplicateAlert] = useState<{
    isOpen: boolean;
    reason: string;
    matchedProposal?: Proposal;
  }>({ isOpen: false, reason: '' });

  const sources = getSources();

  useEffect(() => {
    if (initialProposal) {
      setFormData(initialProposal);
    } else {
      setFormData({
        fullName: '',
        gender: 'Male',
        dob: '',
        age: 28,
        height: "5' 9\"",
        location: '',
        religion: 'Hindu',
        community: '',
        motherTongue: '',
        maritalStatus: 'Never Married',
        highestEducation: '',
        college: '',
        profession: '',
        company: '',
        workLocation: '',
        income: '',
        matrimonyPlatform: 'Sai Sankara Matrimony',
        profileId: '',
        profileUrl: '',
        dateReceived: new Date().toISOString().split('T')[0],
        initialImpression: '',
        fatherName: '',
        fatherOccupation: '',
        motherName: '',
        motherOccupation: '',
        siblings: '',
        familyLocation: '',
        status: 'New',
        shortlisted: false,
        photoUrl: '',
      });
      setContactData({
        name: '',
        relationship: 'Father',
        phone: '',
        whatsapp: '',
        email: '',
      });
    }
  }, [initialProposal, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof Proposal, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent, skipDuplicateCheck = false) => {
    e.preventDefault();

    const finalFormData = {
      ...formData,
      fullName: (formData.fullName && formData.fullName.trim()) ? formData.fullName.trim() : 'Unnamed Proposal',
      location: (formData.location && formData.location.trim()) ? formData.location.trim() : 'Not Specified',
    };

    // Duplicate Check
    if (!skipDuplicateCheck && finalFormData.fullName !== 'Unnamed Proposal') {
      const dupResult = checkDuplicate(
        contactData.phone,
        finalFormData.matrimonyPlatform || 'Other',
        finalFormData.profileId || '',
        finalFormData.fullName,
        initialProposal?.id
      );

      if (dupResult.isDuplicate && dupResult.matchedProposal) {
        setDuplicateAlert({
          isOpen: true,
          reason: dupResult.reason || 'Possible duplicate found.',
          matchedProposal: dupResult.matchedProposal,
        });
        return;
      }
    }

    // Save
    onSave(finalFormData, contactData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">
              {initialProposal ? 'Edit Proposal' : 'Add New Proposal'}
            </h2>
            <p className="text-xs text-slate-500">Fill in proposal details and family contacts</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-section Tab Bar */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-100/50 px-4 text-xs font-medium scrollbar-none">
          {[
            { id: 'personal', label: 'Personal', icon: User },
            { id: 'career', label: 'Education & Career', icon: GraduationCap },
            { id: 'matrimony', label: 'Matrimony Info', icon: Globe },
            { id: 'family', label: 'Family', icon: Users },
            { id: 'contact', label: 'Contact', icon: Phone },
            { id: 'status', label: 'Status', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-rose-600 text-rose-600 font-semibold bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              {/* Proposal Type Direction Selector */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-semibold text-slate-800 mb-2">Proposal Type / Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('proposalType', 'Received')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      (formData.proposalType || 'Received') === 'Received'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Received Proposal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('proposalType', 'Requested')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      formData.proposalType === 'Requested'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Requested (Sent Out)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender || 'Male'}
                    onChange={(e) => handleInputChange('gender', e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={formData.age || 28}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Height</label>
                  <input
                    type="text"
                    value={formData.height || ''}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder={`e.g. 5' 10"`}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. Chennai, Tamil Nadu"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Religion</label>
                  <input
                    type="text"
                    value={formData.religion || ''}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    placeholder="e.g. Hindu"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Community / Caste</label>
                  <input
                    type="text"
                    value={formData.community || ''}
                    onChange={(e) => handleInputChange('community', e.target.value)}
                    placeholder="e.g. Brahmin - Iyer"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mother Tongue</label>
                  <input
                    type="text"
                    value={formData.motherTongue || ''}
                    onChange={(e) => handleInputChange('motherTongue', e.target.value)}
                    placeholder="e.g. Tamil"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marital Status</label>
                  <select
                    value={formData.maritalStatus || 'Never Married'}
                    onChange={(e) => handleInputChange('maritalStatus', e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  >
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Awaiting Divorce">Awaiting Divorce</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Image URL (Optional)</label>
                <input
                  type="text"
                  value={formData.photoUrl || ''}
                  onChange={(e) => handleInputChange('photoUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION & CAREER */}
          {activeTab === 'career' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Highest Education</label>
                  <input
                    type="text"
                    value={formData.highestEducation || ''}
                    onChange={(e) => handleInputChange('highestEducation', e.target.value)}
                    placeholder="e.g. M.S. in Computer Science"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College / University</label>
                  <input
                    type="text"
                    value={formData.college || ''}
                    onChange={(e) => handleInputChange('college', e.target.value)}
                    placeholder="e.g. IIT Madras"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Profession / Job Title</label>
                  <input
                    type="text"
                    value={formData.profession || ''}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g. Microsoft"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Location</label>
                  <input
                    type="text"
                    value={formData.workLocation || ''}
                    onChange={(e) => handleInputChange('workLocation', e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Income</label>
                  <input
                    type="text"
                    value={formData.income || ''}
                    onChange={(e) => handleInputChange('income', e.target.value)}
                    placeholder="e.g. ₹28 LPA"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATRIMONY INFORMATION */}
          {activeTab === 'matrimony' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Matrimony Source / Platform</label>
                  <select
                    value={formData.matrimonyPlatform || 'BharatMatrimony'}
                    onChange={(e) => handleInputChange('matrimonyPlatform', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  >
                    {sources.map((src) => (
                      <option key={src.id} value={src.name}>
                        {src.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Profile ID</label>
                  <input
                    type="text"
                    value={formData.profileId || ''}
                    onChange={(e) => handleInputChange('profileId', e.target.value)}
                    placeholder="e.g. BM948201"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Received</label>
                  <input
                    type="date"
                    value={formData.dateReceived || ''}
                    onChange={(e) => handleInputChange('dateReceived', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Web URL</label>
                  <input
                    type="text"
                    value={formData.profileUrl || ''}
                    onChange={(e) => handleInputChange('profileUrl', e.target.value)}
                    placeholder="https://www.shaadi.com/..."
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Family Impression</label>
                <textarea
                  rows={3}
                  value={formData.initialImpression || ''}
                  onChange={(e) => handleInputChange('initialImpression', e.target.value)}
                  placeholder="e.g. Polite communication, solid educational background..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: FAMILY DETAILS */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={formData.fatherName || ''}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    placeholder="e.g. R. Sundaram"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Father's Occupation</label>
                  <input
                    type="text"
                    value={formData.fatherOccupation || ''}
                    onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                    placeholder="e.g. Retired Bank Manager (SBI)"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={formData.motherName || ''}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    placeholder="e.g. S. Lakshmi"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mother's Occupation</label>
                  <input
                    type="text"
                    value={formData.motherOccupation || ''}
                    onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                    placeholder="e.g. Homemaker"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Siblings Details</label>
                  <input
                    type="text"
                    value={formData.siblings || ''}
                    onChange={(e) => handleInputChange('siblings', e.target.value)}
                    placeholder="e.g. 1 Elder Sister (Married, USA)"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Family Native Location</label>
                  <input
                    type="text"
                    value={formData.familyLocation || ''}
                    onChange={(e) => handleInputChange('familyLocation', e.target.value)}
                    placeholder="e.g. Chennai (Adyar)"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT INFORMATION */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 text-blue-800 rounded-xl text-xs border border-blue-100">
                Provide primary contact details for instant family outreach. Additional contacts can be added on the Proposal Detail page.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={contactData.name}
                    onChange={(e) => setContactData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Mr. R. Sundaram"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={contactData.relationship}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, relationship: e.target.value as ContactRelationship }))
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={contactData.phone}
                    onChange={(e) => setContactData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98401 23456"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={contactData.whatsapp}
                    onChange={(e) => setContactData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+91 98401 23456"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={contactData.email}
                    onChange={(e) => setContactData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@gmail.com"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PROPOSAL STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Proposal Status</label>
                  <select
                    value={formData.status || 'New'}
                    onChange={(e) => handleInputChange('status', e.target.value as ProposalStatus)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Information Pending">Information Pending</option>
                    <option value="Horoscope Pending">Horoscope Pending</option>
                    <option value="Under Consideration">Under Consideration</option>
                    <option value="Meeting Planned">Meeting Planned</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.shortlisted || false}
                      onChange={(e) => handleInputChange('shortlisted', e.target.checked)}
                      className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                    />
                    <span className="text-sm font-semibold text-slate-800">Add to Shortlist immediately</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            {activeTab !== 'personal' && (
              <button
                type="button"
                onClick={() => {
                  const tabs: any = ['personal', 'career', 'matrimony', 'family', 'contact', 'status'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Previous Step
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>

            {activeTab !== 'status' ? (
              <button
                type="button"
                onClick={() => {
                  const tabs: any = ['personal', 'career', 'matrimony', 'family', 'contact', 'status'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                }}
                className="px-5 py-2 text-xs font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => handleFormSubmit(e)}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-500 shadow-md shadow-rose-900/20 transition-all"
              >
                {initialProposal ? 'Save Changes' : 'Create Proposal'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate Alert Warning Dialog */}
      {duplicateAlert.matchedProposal && (
        <DuplicateAlertModal
          isOpen={duplicateAlert.isOpen}
          reason={duplicateAlert.reason}
          matchedProposal={duplicateAlert.matchedProposal}
          onViewExisting={() => {
            setDuplicateAlert({ isOpen: false, reason: '' });
            onClose();
            window.location.href = `/proposals/${duplicateAlert.matchedProposal?.id}`;
          }}
          onContinueAnyway={() => {
            setDuplicateAlert({ isOpen: false, reason: '' });
            const fakeEvent = { preventDefault: () => {} } as any;
            handleFormSubmit(fakeEvent, true);
          }}
          onCancel={() => setDuplicateAlert({ isOpen: false, reason: '' })}
        />
      )}
    </div>
  );
};
