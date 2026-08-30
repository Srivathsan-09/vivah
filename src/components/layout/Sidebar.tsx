'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Star,
  BarChart3,
  Settings,
  Heart,
  X,
  PlusCircle,
} from 'lucide-react';
import { getProposals, getFollowUps } from '../../services/storage';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenAddProposal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen, onOpenAddProposal }) => {
  const pathname = usePathname();

  // Dynamic counts for sidebar badges
  const [counts, setCounts] = React.useState({
    total: 0,
    new: 0,
    shortlisted: 0,
    followupsDue: 0,
  });

  React.useEffect(() => {
    const updateCounts = () => {
      const proposals = getProposals();
      const followups = getFollowUps();
      const todayStr = new Date().toISOString().split('T')[0];

      setCounts({
        total: proposals.length,
        new: proposals.filter((p) => p.status === 'New').length,
        shortlisted: proposals.filter((p) => p.shortlisted || p.status === 'Shortlisted').length,
        followupsDue: followups.filter((f) => f.status === 'Pending' && f.dueDate <= todayStr).length,
      });
    };

    updateCounts();
    const interval = setInterval(updateCounts, 2000);
    return () => clearInterval(interval);
  }, [pathname]);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    {
      label: 'Proposals',
      href: '/proposals',
      icon: Users,
      badge: counts.total,
    },
    {
      label: 'Follow-ups',
      href: '/followups',
      icon: Clock,
      badge: counts.followupsDue > 0 ? counts.followupsDue : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      label: 'Shortlist',
      href: '/shortlist',
      icon: Star,
      badge: counts.shortlisted > 0 ? counts.shortlisted : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const proposalSubLinks = [
    { label: 'All Proposals', href: '/proposals' },
    { label: 'Received Proposals', href: '/proposals?type=Received' },
    { label: 'Requested Proposals', href: '/proposals?type=Requested' },
    { label: 'New', href: '/proposals?status=New' },
    { label: 'Under Consideration', href: '/proposals?status=Under%20Consideration' },
    { label: 'Shortlisted', href: '/proposals?status=Shortlisted' },
    { label: 'On Hold', href: '/proposals?status=On%20Hold' },
    { label: 'Rejected', href: '/proposals?status=Rejected' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-900/30">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base tracking-wide text-white">Vivah</h1>
            <p className="text-[10px] text-slate-400 font-sans tracking-wider uppercase">Matrimony Proposal Manager</p>
          </div>
        </Link>

        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* Sub links for Proposals if active */}
              {item.href === '/proposals' && isActive && (
                <div className="ml-8 mt-1 space-y-1 border-l border-slate-800 pl-3">
                  {proposalSubLinks.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setMobileOpen(false)}
                      className="block text-xs py-1.5 text-slate-400 hover:text-rose-300 transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-500 font-medium">Single-User Personal Storage</p>
        <p className="text-[10px] text-slate-600">LocalStorage Active • Encrypted Offline</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
