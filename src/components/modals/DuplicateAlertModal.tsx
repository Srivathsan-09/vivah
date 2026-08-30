'use client';

import React from 'react';
import { AlertTriangle, ExternalLink, ArrowRight, X } from 'lucide-react';
import { Proposal } from '../../types';

interface DuplicateAlertModalProps {
  isOpen: boolean;
  reason: string;
  matchedProposal: Proposal;
  onViewExisting: () => void;
  onContinueAnyway: () => void;
  onCancel: () => void;
}

export const DuplicateAlertModal: React.FC<DuplicateAlertModalProps> = ({
  isOpen,
  reason,
  matchedProposal,
  onViewExisting,
  onContinueAnyway,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg">Possible Duplicate Proposal</h3>
              <p className="text-xs text-slate-500">Duplicate detection check</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4">
          <p className="text-sm text-slate-600 mb-4">{reason}</p>

          {/* Existing Proposal Card */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0">
                {matchedProposal.photoUrl ? (
                  <img src={matchedProposal.photoUrl} alt={matchedProposal.fullName} className="w-full h-full object-cover" />
                ) : (
                  matchedProposal.fullName.charAt(0)
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-base">{matchedProposal.fullName}</h4>
                <p className="text-xs text-slate-600">
                  {matchedProposal.age} yrs • {matchedProposal.location}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Source: <span className="font-medium">{matchedProposal.matrimonyPlatform}</span> (ID: {matchedProposal.profileId})
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onViewExisting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <span>View Existing Proposal</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={onContinueAnyway}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
          >
            Continue & Create Duplicate
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 px-4 text-slate-400 hover:text-slate-600 text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
