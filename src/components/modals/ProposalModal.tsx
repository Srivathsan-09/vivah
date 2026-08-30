'use client';

import React, { useState, useEffect } from 'react';
import { X, User, GraduationCap, Globe, Users, Phone, Shield, Sparkles, Upload } from 'lucide-react';
import { Proposal, ProposalStatus, ContactRelationship } from '../../types';
import { checkDuplicate, getSources } from '../../services/storage';
import { DuplicateAlertModal } from './DuplicateAlertModal';
import { useToast } from '../ui/Toast';
import { CustomSelect } from '../ui/CustomSelect';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[85vh] max-h-[580px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
              {initialProposal ? 'Edit Proposal' : 'Add New Proposal'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Fill in proposal details and family contacts</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-section Tab Bar with scroll indicator */}
        <div className="relative border-b border-slate-200 bg-slate-100/50 flex-shrink-0">
          <div className="flex overflow-x-auto px-3 text-xs font-medium scrollbar-none no-scrollbar pr-8">
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
                  className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors flex-shrink-0 text-xs ${
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
          {/* Subtle scroll hint gradient overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-200/90 to-transparent pointer-events-none flex items-center justify-end pr-1 text-slate-500 font-bold text-xs">
            ›
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'personal' && (
            <div className="space-y-3.5">
              <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-800 mb-1.5">Proposal Type / Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('proposalType', 'Received')}
                    className={`py-1.5 sm:py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                    className={`py-1.5 sm:py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      formData.proposalType === 'Requested'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Requested (Sent)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Gender"
                    value={formData.gender || 'Male'}
                    onChange={(val) => handleInputChange('gender', val as any)}
                    options={['Male', 'Female', 'Other']}
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={formData.age || 28}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Height</label>
                  <input
                    type="text"
                    value={formData.height || ''}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder={`e.g. 5' 10"`}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Current Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. Chennai, Tamil Nadu"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Religion</label>
                  <input
                    type="text"
                    value={formData.religion || ''}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    placeholder="e.g. Hindu"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Community / Caste</label>
                  <input
                    type="text"
                    value={formData.community || ''}
                    onChange={(e) => handleInputChange('community', e.target.value)}
                    placeholder="e.g. Brahmin - Iyer"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Mother Tongue</label>
                  <input
                    type="text"
                    value={formData.motherTongue || ''}
                    onChange={(e) => handleInputChange('motherTongue', e.target.value)}
                    placeholder="e.g. Tamil"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Marital Status"
                    value={formData.maritalStatus || 'Never Married'}
                    onChange={(val) => handleInputChange('maritalStatus', val as any)}
                    options={['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce']}
                  />
                </div>
              </div>

              {/* Upload Candidate Photo (Boy / Girl Image) */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Candidate Photo (Boy / Girl Image Upload)</span>
                  {formData.photoUrl && <span className="text-[10px] text-emerald-600 font-bold">✓ Image Uploaded</span>}
                </label>
                <div className="flex items-center gap-3">
                  {formData.photoUrl ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                      <img src={formData.photoUrl} alt="Candidate Photo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleInputChange('photoUrl', '')}
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white flex-shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            handleInputChange('photoUrl', event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION & CAREER */}
          {activeTab === 'career' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Highest Education</label>
                  <input
                    type="text"
                    value={formData.highestEducation || ''}
                    onChange={(e) => handleInputChange('highestEducation', e.target.value)}
                    placeholder="e.g. M.S. in Computer Science"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">College / University</label>
                  <input
                    type="text"
                    value={formData.college || ''}
                    onChange={(e) => handleInputChange('college', e.target.value)}
                    placeholder="e.g. IIT Madras"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Profession / Job Title</label>
                  <input
                    type="text"
                    value={formData.profession || ''}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g. Microsoft"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Work Location</label>
                  <input
                    type="text"
                    value={formData.workLocation || ''}
                    onChange={(e) => handleInputChange('workLocation', e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Annual Income</label>
                  <input
                    type="text"
                    value={formData.income || ''}
                    onChange={(e) => handleInputChange('income', e.target.value)}
                    placeholder="e.g. ₹28 LPA"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MATRIMONY INFORMATION */}
          {activeTab === 'matrimony' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <CustomSelect
                    label="Matrimony Source / Platform"
                    value={formData.matrimonyPlatform || 'BharatMatrimony'}
                    onChange={(val) => handleInputChange('matrimonyPlatform', val)}
                    options={sources.map((s) => ({ value: s.name, label: s.name }))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Profile ID</label>
                  <input
                    type="text"
                    value={formData.profileId || ''}
                    onChange={(e) => handleInputChange('profileId', e.target.value)}
                    placeholder="e.g. BM948201"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Date Received</label>
                  <input
                    type="date"
                    value={formData.dateReceived || ''}
                    onChange={(e) => handleInputChange('dateReceived', e.target.value)}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Original Profile Link (URL)</label>
                  <input
                    type="text"
                    value={formData.profileUrl || ''}
                    onChange={(e) => handleInputChange('profileUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Horoscope Match"
                    value={formData.horoscopeMatch || 'Pending'}
                    onChange={(val) => handleInputChange('horoscopeMatch', val as any)}
                    options={['Pending', 'Very Good', 'OK', 'Not ok']}
                  />
                </div>

                {/* Upload Horoscope Chart Image */}
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl sm:col-span-2">
                  <label className="block text-[11px] sm:text-xs font-semibold text-indigo-900 mb-1.5 flex items-center justify-between">
                    <span>Horoscope Box / Chart Image Upload</span>
                    {formData.horoscopeImageUrl && <span className="text-[10px] text-indigo-600 font-bold">✓ Chart Uploaded</span>}
                  </label>
                  <div className="flex items-center gap-3">
                    {formData.horoscopeImageUrl ? (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-indigo-200 flex-shrink-0 bg-white">
                        <img src={formData.horoscopeImageUrl} alt="Horoscope Chart" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleInputChange('horoscopeImageUrl', '')}
                          className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl border-2 border-dashed border-indigo-300 flex items-center justify-center text-indigo-400 bg-white flex-shrink-0">
                        <Upload className="w-5 h-5" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              handleInputChange('horoscopeImageUrl', event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FAMILY DETAILS */}
          {activeTab === 'family' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={formData.fatherName || ''}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    placeholder="e.g. S. Ramanathan"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Father's Occupation</label>
                  <input
                    type="text"
                    value={formData.fatherOccupation || ''}
                    onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                    placeholder="e.g. Retired Bank Officer"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={formData.motherName || ''}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    placeholder="e.g. R. Lakshmi"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Mother's Occupation</label>
                  <input
                    type="text"
                    value={formData.motherOccupation || ''}
                    onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                    placeholder="e.g. Homemaker"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Siblings</label>
                  <input
                    type="text"
                    value={formData.siblings || ''}
                    onChange={(e) => handleInputChange('siblings', e.target.value)}
                    placeholder="e.g. 1 Elder Sister (Married)"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Native Place / Hometown</label>
                  <input
                    type="text"
                    value={formData.familyLocation || ''}
                    onChange={(e) => handleInputChange('familyLocation', e.target.value)}
                    placeholder="e.g. Kumbakonam, TN"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT INFORMATION */}
          {activeTab === 'contact' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-rose-800">
                Primary family contact for quick calling and WhatsApp reminders.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={contactData.name || ''}
                    onChange={(e) => setContactData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. S. Ramanathan (Father)"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Relationship"
                    value={contactData.relationship || 'Father'}
                    onChange={(val) => setContactData((prev) => ({ ...prev, relationship: val as any }))}
                    options={[
                      { value: 'Father', label: 'Father' },
                      { value: 'Mother', label: 'Mother' },
                      { value: 'Brother', label: 'Brother' },
                      { value: 'Sister', label: 'Sister' },
                      { value: 'Uncle', label: 'Uncle' },
                      { value: 'Self', label: 'Self' },
                      { value: 'Broker', label: 'Broker / Mediator' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={contactData.phone || ''}
                    onChange={(e) => setContactData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. +91 98401 23456"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">WhatsApp Number (Optional)</label>
                  <input
                    type="text"
                    value={contactData.whatsapp || ''}
                    onChange={(e) => setContactData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="e.g. +91 98401 23456"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: STATUS & STAGE */}
          {activeTab === 'status' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <CustomSelect
                    label="Proposal Stage / Status"
                    value={formData.status || 'New'}
                    onChange={(val) => handleInputChange('status', val as any)}
                    options={[
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
                    ]}
                  />
                </div>

                <div className="flex items-center pt-2 sm:pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.shortlisted || false}
                      onChange={(e) => handleInputChange('shortlisted', e.target.checked)}
                      className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">Add to Shortlist immediately</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>

              {activeTab !== 'personal' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: any = ['personal', 'career', 'matrimony', 'family', 'contact', 'status'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  ← Prev
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {activeTab !== 'status' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: any = ['personal', 'career', 'matrimony', 'family', 'contact', 'status'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Next →
                </button>
              )}

              <button
                type="button"
                onClick={(e) => handleFormSubmit(e)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-500 shadow-sm shadow-rose-900/20 transition-all whitespace-nowrap"
              >
                {initialProposal ? 'Save Changes' : 'Create Proposal'}
              </button>
            </div>
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
