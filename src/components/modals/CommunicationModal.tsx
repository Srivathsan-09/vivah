'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, MessageSquare, Video, Mail, Users, Send } from 'lucide-react';
import { ProposalContact, CommunicationMethod, CommunicationDirection } from '../../types';
import { getContacts, addCommunication } from '../../services/storage';
import { useToast } from '../ui/Toast';
import { CustomSelect } from '../ui/CustomSelect';

interface CommunicationModalProps {
  isOpen: boolean;
  proposalId: string;
  proposalName: string;
  onClose: () => void;
  onSaved: () => void;
}

export const CommunicationModal: React.FC<CommunicationModalProps> = ({
  isOpen,
  proposalId,
  proposalName,
  onClose,
  onSaved,
}) => {
  const { showToast } = useToast();
  const contacts = getContacts(proposalId);

  const [method, setMethod] = useState<CommunicationMethod>('Phone Call');
  const [direction, setDirection] = useState<CommunicationDirection>('Outgoing');
  const [contactPerson, setContactPerson] = useState('');
  const [summary, setSummary] = useState('');
  const [detailedNotes, setDetailedNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    if (contacts.length > 0) {
      setContactPerson(`${contacts[0].name} (${contacts[0].relationship})`);
    } else {
      setContactPerson('Father / Primary Contact');
    }
  }, [proposalId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!summary.trim()) {
      showToast('Validation Error', 'Please write a brief summary of the conversation.', 'error');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    addCommunication({
      proposalId,
      date: todayStr,
      time: timeStr,
      contactPerson,
      method,
      direction,
      summary: summary.trim(),
      detailedNotes: detailedNotes.trim() || undefined,
      nextAction: nextAction.trim() || undefined,
      followUpDate: followUpDate || undefined,
    });

    showToast('Conversation Recorded', `Logged ${method} with ${contactPerson}.`);
    onSaved();
    onClose();
  };

  const methodIcons: Record<CommunicationMethod, any> = {
    'Phone Call': Phone,
    WhatsApp: MessageSquare,
    SMS: MessageSquare,
    'Video Call': Video,
    Email: Mail,
    'In-person Meeting': Users,
    Other: Send,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-lg">Log Quick Conversation</h3>
            <p className="text-xs text-slate-500">Record call or meeting with {proposalName} family</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Method Selectors */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Communication Method</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                'Phone Call',
                'WhatsApp',
                'In-person Meeting',
                'Video Call',
                'SMS',
                'Email',
                'Other',
              ].map((m) => {
                const Icon = methodIcons[m as CommunicationMethod] || Phone;
                const isSelected = method === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m as CommunicationMethod)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50 text-rose-700 font-semibold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="truncate w-full text-center text-[11px]">{m}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direction & Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <CustomSelect
                label="Direction"
                value={direction}
                onChange={(val) => setDirection(val as CommunicationDirection)}
                options={[
                  { value: 'Outgoing', label: 'Outgoing (We Called / Sent)' },
                  { value: 'Incoming', label: 'Incoming (They Called / Sent)' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Mr. Sundaram (Father)"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Conversation Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Discussed education, career, and sent horoscope over WhatsApp"
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
            />
          </div>

          {/* Detailed Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Discussion Notes (Optional)</label>
            <textarea
              rows={3}
              value={detailedNotes}
              onChange={(e) => setDetailedNotes(e.target.value)}
              placeholder="Add key highlights or specific details mentioned..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:border-rose-500 outline-none"
            />
          </div>

          {/* Next Action & Optional Followup Date */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-semibold text-slate-800">Follow-up Action (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Next Action Required</label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Wait for horoscope feedback"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg outline-none"
                />
              </div>
            </div>
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
              Save Conversation (&lt; 30s)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
