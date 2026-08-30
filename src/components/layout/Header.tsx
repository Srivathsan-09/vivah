'use client';

import React, { useState } from 'react';
import { Menu, Search, Plus, Bell, X, Phone, User, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProposals, getFollowUps } from '../../services/storage';
import { Proposal } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenAddProposal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenAddProposal }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Proposal[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Check follow-ups count
  const followups = getFollowUps();
  const todayStr = new Date().toISOString().split('T')[0];
  const dueFollowupsCount = followups.filter((f) => f.status === 'Pending' && f.dueDate <= todayStr).length;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const matches = getProposals({ search: query }).slice(0, 5);
    setSearchResults(matches);
  };

  const handleSelectProposal = (id: string) => {
    setSearchQuery('');
    setIsSearching(false);
    router.push(`/proposals/${id}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.trim() && setIsSearching(true)}
              placeholder="Search by name, phone, location, profile ID..."
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-100/80 border border-transparent rounded-xl focus:bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearching(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Search Dropdown */}
          {isSearching && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="p-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Search Results ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No matching proposals found for "{searchQuery}".
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {searchResults.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => handleSelectProposal(prop.id)}
                      className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                          {prop.photoUrl ? (
                            <img src={prop.photoUrl} alt={prop.fullName} className="w-full h-full object-cover" />
                          ) : (
                            prop.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-rose-600 transition-colors">
                            {prop.fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {prop.age} yrs • {prop.location} • {prop.matrimonyPlatform}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
              {searchResults.length > 0 && (
                <Link
                  href={`/proposals?search=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setIsSearching(false)}
                  className="block p-2.5 text-center text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border-t border-rose-100"
                >
                  View all search results →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Header Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Background Switcher Toggle */}
        <button
          onClick={() => {
            const current = localStorage.getItem('matrimony_crm_bg_image') || '/bg-matrimony-1.jpg';
            let nextBg = '/bg-matrimony-2.jpg';
            if (current === '/bg-matrimony-2.jpg') nextBg = '/bg-matrimony-mobile.jpg';
            else if (current === '/bg-matrimony-mobile.jpg') nextBg = 'none';
            else if (current === 'none') nextBg = '/bg-matrimony-1.jpg';

            localStorage.setItem('matrimony_crm_bg_image', nextBg);
            const settings = JSON.parse(localStorage.getItem('matrimony_crm_settings') || '{}');
            settings.bgImage = nextBg;
            localStorage.setItem('matrimony_crm_settings', JSON.stringify(settings));

            window.dispatchEvent(new Event('storage'));
          }}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1"
          title="Switch Matrimony Background Wallpaper"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Notifications for due followups */}
        <Link
          href="/followups"
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title="Follow-ups due"
        >
          <Bell className="w-5 h-5" />
          {dueFollowupsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {dueFollowupsCount}
            </span>
          )}
        </Link>

        {/* Quick Add Proposal Button */}
        <button
          onClick={onOpenAddProposal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all shadow-sm shadow-rose-900/10 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Proposal</span>
        </button>
      </div>
    </header>
  );
};
