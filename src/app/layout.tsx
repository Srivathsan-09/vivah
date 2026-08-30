'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { ToastProvider } from '../components/ui/Toast';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { ProposalModal } from '../components/modals/ProposalModal';
import { createProposal, getSettings } from '../services/storage';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addProposalOpen, setAddProposalOpen] = useState(false);
  const [bgImage, setBgImage] = useState<string>('/bg-matrimony-1.jpg');

  const updateBgFromStorage = () => {
    const s = getSettings();
    setBgImage(s?.bgImage || '/bg-matrimony-1.jpg');
  };

  useEffect(() => {
    updateBgFromStorage();
    window.addEventListener('storage', updateBgFromStorage);
    return () => window.removeEventListener('storage', updateBgFromStorage);
  }, []);

  const handleSaveNewProposal = (formData: any, primaryContact?: any) => {
    createProposal(formData, primaryContact);
    window.location.reload(); // Refresh view state
  };

  return (
    <html lang="en">
      <head>
        <title>Vivah - Matrimony Management</title>
        <meta name="description" content="Manage and track matrimonial proposals effortlessly" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-100 min-h-screen text-slate-900 flex font-sans relative">
        {/* Dynamic Matrimony Background Layer */}
        {bgImage && bgImage !== 'none' && (
          <>
            {/* Desktop Background (Landscape Wallpapers Only) */}
            <div
              className="hidden sm:block fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-fixed bg-no-repeat transition-all duration-500"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.35), rgba(248, 250, 252, 0.45)), url('${
                  bgImage === '/bg-matrimony-mobile.jpg' ? '/bg-matrimony-1.jpg' : bgImage
                }')`,
              }}
            />
            {/* Mobile Background (Portrait Kanyadaan Ritual Image 4 Only) */}
            <div
              className="block sm:hidden fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-fixed bg-no-repeat transition-all duration-500"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.30), rgba(248, 250, 252, 0.40)), url('/bg-matrimony-mobile.jpg')`,
              }}
            />
          </>
        )}

        <ToastProvider>
          <div className="flex w-full min-h-screen relative z-10">
            {/* Sidebar */}
            <Sidebar
              mobileOpen={mobileMenuOpen}
              setMobileOpen={setMobileMenuOpen}
              onOpenAddProposal={() => setAddProposalOpen(true)}
            />

            {/* Main Content Container */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
              <Header
                onOpenMobileMenu={() => setMobileMenuOpen(true)}
                onOpenAddProposal={() => setAddProposalOpen(true)}
              />
              <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
            </div>
          </div>

          {/* Global Add Proposal Modal */}
          {addProposalOpen && (
            <ProposalModal
              isOpen={addProposalOpen}
              onClose={() => setAddProposalOpen(false)}
              onSave={handleSaveNewProposal}
            />
          )}
        </ToastProvider>
      </body>
    </html>
  );
}
