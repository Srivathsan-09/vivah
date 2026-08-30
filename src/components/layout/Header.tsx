'use client';

import React from 'react';
import { Menu, Plus, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenAddProposal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenAddProposal }) => {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-sm relative">
      {/* Left: Mobile Sidebar Toggle Menu Button */}
      <div className="flex items-center gap-1.5 sm:gap-3 z-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Vivah Brand Calligraphic Logo (Mobile & Desktop) */}
      <Link
        href="/"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <img
          src="/vivah-logo.png"
          alt="Vivah"
          className="h-7 sm:h-8 md:h-9 w-auto object-contain drop-shadow-sm"
        />
      </Link>

      {/* Right: Quick Actions (Background Switcher + Add Proposal) */}
      <div className="flex items-center gap-1.5 sm:gap-2 z-0">
        {/* Quick Background Switcher Toggle */}
        <button
          onClick={() => {
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
            const current = localStorage.getItem('matrimony_crm_bg_image') || (isMobile ? '/bg-matrimony-mobile.jpg' : '/bg-matrimony-1.jpg');
            let nextBg = 'none';

            if (isMobile) {
              nextBg = current === '/bg-matrimony-mobile.jpg' ? 'none' : '/bg-matrimony-mobile.jpg';
            } else {
              if (current === '/bg-matrimony-1.jpg') nextBg = '/bg-matrimony-2.jpg';
              else if (current === '/bg-matrimony-2.jpg') nextBg = 'none';
              else nextBg = '/bg-matrimony-1.jpg';
            }

            localStorage.setItem('matrimony_crm_bg_image', nextBg);
            const settings = JSON.parse(localStorage.getItem('matrimony_crm_settings') || '{}');
            settings.bgImage = nextBg;
            localStorage.setItem('matrimony_crm_settings', JSON.stringify(settings));

            window.dispatchEvent(new Event('storage'));
          }}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"
          title="Switch Matrimony Background Wallpaper"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Quick Add Proposal Button */}
        <button
          onClick={onOpenAddProposal}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs sm:text-sm transition-all shadow-sm shadow-rose-900/10 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Proposal</span>
        </button>
      </div>
    </header>
  );
};
