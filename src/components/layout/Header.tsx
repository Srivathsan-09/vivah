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

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
    setIsMobileSearchOpen(false);
    router.push(`/proposals/${id}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between gap-4 shadow-sm">
      {/* Mobile Full-Width Search Bar Overlay */}
      {isMobileSearchOpen ? (
        <div className="flex sm:hidden items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search proposals, names..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearching(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setIsMobileSearchOpen(false);
              setSearchQuery('');
              setIsSearching(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold"
          >
            Cancel
          </button>

          {/* Autocomplete Search Dropdown for Mobile Overlay */}
          {isSearching && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="p-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Search Results ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">No proposals found</div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {searchResults.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => handleSelectProposal(prop.id)}
                      className="w-full p-3 text-left hover:bg-rose-50/50 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{prop.fullName}</p>
                        <p className="text-[11px] text-slate-500">
                          {prop.age} yrs • {prop.location} • {prop.matrimonyPlatform}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Search Icon Button */}
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden sm:block relative flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.trim() && setIsSearching(true)}
                placeholder="Search proposals by name, phone, location..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-100/80 border border-transparent rounded-xl focus:bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all"
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

            {/* Desktop Search Dropdown */}
            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="p-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-xs text-slate-500 text-center">No proposals found</div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {searchResults.map((prop) => (
                      <button
                        key={prop.id}
                        onClick={() => handleSelectProposal(prop.id)}
                        className="w-full p-3 text-left hover:bg-rose-50/50 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{prop.fullName}</p>
                          <p className="text-[11px] text-slate-500">
                            {prop.age} yrs • {prop.location} • {prop.matrimonyPlatform}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
