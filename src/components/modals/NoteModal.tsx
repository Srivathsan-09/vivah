'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { NoteCategory, Note } from '../../types';
import { addNote, updateNote, getProposal } from '../../services/storage';
import { useToast } from '../ui/Toast';
import { CustomSelect } from '../ui/CustomSelect';

interface NoteModalProps {
  isOpen: boolean;
  proposalId: string;
  existingNote?: Note;
  onClose: () => void;
  onSaved: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  proposalId,
  existingNote,
  onClose,
  onSaved,
}) => {
  const { showToast } = useToast();
  const proposal = getProposal(proposalId);

  const [text, setText] = useState('');
  const [category, setCategory] = useState<NoteCategory>('General');

  useEffect(() => {
    if (existingNote) {
      setText(existingNote.text);
      setCategory(existingNote.category);
    } else {
      setText('');
      setCategory('General');
    }
  }, [existingNote, proposalId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      showToast('Validation Error', 'Note text cannot be empty.', 'error');
      return;
    }

    if (existingNote) {
      updateNote(existingNote.id, text.trim(), category);
      showToast('Note Updated', 'Updated note details.');
    } else {
      addNote({
        proposalId,
        text: text.trim(),
        category,
      });
      showToast('Note Added', `Added new ${category} note.`);
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                {existingNote ? 'Edit Note' : 'Add Note'}
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
            <CustomSelect
              label="Category"
              value={category}
              onChange={(val) => setCategory(val as NoteCategory)}
              options={[
                { value: 'General', label: 'General' },
                { value: 'Family', label: 'Family Background' },
                { value: 'Career', label: 'Career & Finances' },
                { value: 'Horoscope', label: 'Horoscope & Astrology' },
                { value: 'Conversation', label: 'Conversation Summary' },
                { value: 'Decision', label: 'Decision Rationale' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your observations, family impressions, or details..."
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
              {existingNote ? 'Save Changes' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
