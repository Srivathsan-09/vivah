import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProposalStatus, HoroscopeStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString?: string): string {
  if (!timeString) return '';
  return timeString;
}

export function getStatusBadgeClass(status: ProposalStatus): string {
  switch (status) {
    case 'New':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Contacted':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'Information Pending':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Horoscope Pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Under Consideration':
      return 'bg-yellow-50 text-yellow-800 border-yellow-300';
    case 'Meeting Planned':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Shortlisted':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    case 'On Hold':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Closed':
      return 'bg-gray-100 text-gray-600 border-gray-300';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getHoroscopeStatusBadgeClass(status: HoroscopeStatus): string {
  switch (status) {
    case 'Matched':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Partially Matched':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Checking':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Pending':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Not Matched':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Not Provided':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    case 'Not Applicable':
      return 'bg-gray-50 text-gray-500 border-gray-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}
