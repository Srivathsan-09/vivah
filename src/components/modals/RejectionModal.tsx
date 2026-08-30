'use client';

import React, { useState } from 'react';
import { X, XCircle } from 'lucide-react';
import { RejectionReason } from '../../types';
import { updateProposal, getProposal } from '../../services/storage';
import { useToast } from '../ui/Toast';
import { CustomSelect } from '../ui/CustomSelect';

interface RejectionModalProps {
  isOpen: boolean;
  proposalId: string;
  onClose: () => void;
  onSaved: () => void;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  proposalId,
  onClose,
  onSaved,
}) => {
  const { showToast } = useToast();
  const proposal = getProposal(proposalId);

  const [rejectionReason, setRejectionReason] = useState<RejectionReason>('Horoscope');
  const [rejectionNotes, setRejectionNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProposal(proposalId, {
      status: 'Rejected',
      rejectionReason,
      rejectionNotes: rejectionNotes.trim() || undefined,
    });

    showToast('Status Updated', `${proposal?.fullName}'s proposal marked as Rejected.`);
    onSaved();
    onClose();
  };

  const reasonOptions: RejectionReason[] = [
    'Horoscope',
    'Location',
    'Career',
    'Family',
    'Compatibility',
    'Personal Preference',
    'No Response',
    'Family Decision',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg">Mark Proposal as Rejected</h3>
              <p className="text-xs text-slate-500">{proposal?.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <CustomSelect
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(val) => setRejectionReason(val as RejectionReason)}
              options={reasonOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Rejection Notes / Details</label>
            <textarea
              rows={3}
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              placeholder="e.g. Horoscopes did not match according to family astrologer, or location mismatch..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
            />
          </div>

          <div className="p-3 bg-rose-50 rounded-xl text-xs text-rose-800 border border-rose-100">
            Note: All previous conversation logs, notes, and activity history for {proposal?.fullName} will be safely preserved.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-500 shadow-sm"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
