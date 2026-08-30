'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { Priority, FollowUp } from '../../types';
import { addFollowUp, updateFollowUp, getProposal, getContacts } from '../../services/storage';
import { useToast } from '../ui/Toast';
import { CustomSelect } from '../ui/CustomSelect';

interface FollowUpModalProps {
  isOpen: boolean;
  proposalId: string;
  existingFollowUp?: FollowUp;
  onClose: () => void;
  onSaved: () => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  proposalId,
  existingFollowUp,
  onClose,
  onSaved,
}) => {
  const { showToast } = useToast();
  const proposal = getProposal(proposalId);
  const contacts = getContacts(proposalId);

  const [contactName, setContactName] = useState('');
  const [reason, setReason] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingFollowUp) {
      setContactName(existingFollowUp.contactName);
      setReason(existingFollowUp.reason);
      setDueDate(existingFollowUp.dueDate);
      setPriority(existingFollowUp.priority);
      setNotes(existingFollowUp.notes || '');
    } else {
      setContactName(contacts[0] ? `${contacts[0].name} (${contacts[0].relationship})` : 'Father / Family');
      setReason('');
      setDueDate(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]); // Default 2 days later
      setPriority('Medium');
      setNotes('');
    }
  }, [existingFollowUp, proposalId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      showToast('Validation Error', 'Please enter a follow-up reason.', 'error');
      return;
    }
    if (!dueDate) {
      showToast('Validation Error', 'Please select a due date.', 'error');
      return;
    }

    if (existingFollowUp) {
      updateFollowUp(existingFollowUp.id, {
        contactName,
        reason: reason.trim(),
        dueDate,
        priority,
        notes: notes.trim() || undefined,
      });
      showToast('Follow-up Updated', 'Follow-up details saved successfully.');
    } else {
      addFollowUp({
        proposalId,
        contactName,
        reason: reason.trim(),
        dueDate,
        priority,
        notes: notes.trim() || undefined,
        status: 'Pending',
      });
      showToast('Follow-up Scheduled', `Follow-up set for ${dueDate}.`);
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                {existingFollowUp ? 'Edit Follow-up' : 'Schedule Follow-up'}
              </h3>
              <p className="text-xs text-slate-500">{proposal?.fullName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Mr. Sundaram (Father)"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Purpose <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Call father to check horoscope matching result"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <CustomSelect
                label="Priority"
                value={priority}
                onChange={(val) => setPriority(val as Priority)}
                options={['Low', 'Medium', 'High']}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific context or reminders..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
            />
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
              {existingFollowUp ? 'Save Changes' : 'Schedule Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
