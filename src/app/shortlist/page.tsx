'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Users, Check, ArrowRight, PhoneCall, Sparkles, X } from 'lucide-react';
import { getProposals, getHoroscope, getCommunications, getNotes } from '../../services/storage';
import { Proposal } from '../../types';
import { formatDate, getStatusBadgeClass, getHoroscopeStatusBadgeClass } from '../../lib/utils';

export default function ShortlistPage() {
  const [shortlisted, setShortlisted] = useState<Proposal[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  useEffect(() => {
    const allProps = getProposals();
    const list = allProps.filter((p) => p.shortlisted || p.status === 'Shortlisted');
    setShortlisted(list);
    // Default select first 3 for comparison
    setSelectedForComparison(list.slice(0, 3).map((p) => p.id));
  }, []);

  const handleToggleSelect = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((item) => item !== id));
    } else {
      if (selectedForComparison.length >= 4) {
        alert('You can compare up to 4 proposals at a time.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, id]);
    }
  };

  const comparedProposals = shortlisted.filter((p) => selectedForComparison.includes(p.id));

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/60 shadow-sm">
          <h1 className="font-serif font-bold text-2xl text-slate-900 flex items-center gap-2">
            <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            <span>Shortlisted Proposals & Comparison</span>
          </h1>
          <p className="text-xs font-medium text-slate-700 mt-0.5">Compare top shortlisted candidates side-by-side to aid family decision making</p>
        </div>
      </div>

      {shortlisted.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
          <Star className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-serif font-bold text-slate-800 text-lg">No shortlisted proposals yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Star candidate proposals on the Proposals page to add them to your family shortlist.
          </p>
          <Link
            href="/proposals"
            className="inline-block py-2.5 px-5 rounded-xl bg-rose-600 text-white font-semibold text-xs"
          >
            Browse Proposals
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Candidate Selection Chips */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Select Proposals to Compare (Max 4):
            </h3>
            <div className="flex flex-wrap gap-2">
              {shortlisted.map((prop) => {
                const isSelected = selectedForComparison.includes(prop.id);
                return (
                  <button
                    key={prop.id}
                    onClick={() => handleToggleSelect(prop.id)}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[10px] ${isSelected ? 'bg-amber-500 text-white' : 'border border-slate-300'}`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>{prop.fullName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIDE-BY-SIDE COMPARISON MATRIX */}
          {comparedProposals.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Side-by-Side Comparison Matrix</span>
                </h3>
                <span className="text-xs text-slate-300 font-medium">Comparing {comparedProposals.length} Proposals</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    {/* Header Row: Candidates */}
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <td className="p-4 font-bold text-slate-500 uppercase tracking-wider w-40 min-w-[160px]">
                        Candidate
                      </td>
                      {comparedProposals.map((prop) => (
                        <td key={prop.id} className="p-4 min-w-[240px] border-l border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 font-bold text-lg flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                              {prop.photoUrl ? (
                                <img src={prop.photoUrl} alt={prop.fullName} className="w-full h-full object-cover" />
                              ) : (
                                prop.fullName.charAt(0)
                              )}
                            </div>
                            <div>
                              <Link href={`/proposals/${prop.id}`} className="font-bold text-slate-900 hover:text-rose-600 text-sm block">
                                {prop.fullName}
                              </Link>
                              <span className="text-slate-500">{prop.age} yrs</span>
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Row 2: Location */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">Location</td>
                      {comparedProposals.map((prop) => (
                        <td key={prop.id} className="p-4 border-l border-slate-100 font-medium text-slate-800">
                          {prop.location}
                        </td>
                      ))}
                    </tr>

                    {/* Row 3: Education */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">Education</td>
                      {comparedProposals.map((prop) => (
                        <td key={prop.id} className="p-4 border-l border-slate-100">
                          <p className="font-semibold text-slate-800">{prop.highestEducation}</p>
                          <p className="text-slate-500 text-[11px]">{prop.college || 'N/A'}</p>
                        </td>
                      ))}
                    </tr>

                    {/* Row 4: Profession & Income */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">Profession & Income</td>
                      {comparedProposals.map((prop) => (
                        <td key={prop.id} className="p-4 border-l border-slate-100">
                          <p className="font-semibold text-slate-800">{prop.profession}</p>
                          <p className="text-slate-500 text-[11px]">{prop.company || 'N/A'}</p>
                          {prop.income && <p className="text-rose-600 font-bold mt-1">{prop.income}</p>}
                        </td>
                      ))}
                    </tr>

                    {/* Row 5: Family Background */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">Family Background</td>
                      {comparedProposals.map((prop) => (
                        <td key={prop.id} className="p-4 border-l border-slate-100 text-[11px] space-y-0.5">
                          <p><span className="text-slate-400">Father:</span> {prop.fatherName || 'N/A'} ({prop.fatherOccupation || 'N/A'})</p>
                          <p><span className="text-slate-400">Mother:</span> {prop.motherName || 'N/A'}</p>
                          <p><span className="text-slate-400">Native:</span> {prop.familyLocation || prop.location}</p>
                        </td>
                      ))}
                    </tr>

                    {/* Row 6: Horoscope Status */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">Horoscope Status</td>
                      {comparedProposals.map((prop) => {
                        const h = getHoroscope(prop.id);
                        return (
                          <td key={prop.id} className="p-4 border-l border-slate-100">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getHoroscopeStatusBadgeClass(h.status)}`}>
                              {h.status}
                            </span>
                            {h.compatibilityScore && (
                              <p className="text-[11px] text-slate-600 font-semibold mt-1">Score: {h.compatibilityScore}</p>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 7: Last Conversation */}
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-slate-600 bg-slate-50/50">Last Conversation</td>
                      {comparedProposals.map((prop) => {
                        const comms = getCommunications(prop.id);
                        const lastComm = comms[0];
                        return (
                          <td key={prop.id} className="p-4 border-l border-slate-100 text-[11px] text-slate-600">
                            {lastComm ? (
                              <div>
                                <p className="font-semibold text-slate-800">{formatDate(lastComm.date)}</p>
                                <p className="italic text-slate-500">"{lastComm.summary}"</p>
                              </div>
                            ) : (
                              <span className="text-slate-400">No conversation logged</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 8: Proposal Status & View Action */}
                    <tr className="bg-slate-50/60">
                      <td className="p-4 font-semibold text-slate-600">Action & Status</td>
                      {comparedProposals.map((prop) => (
                        <td key={prop.id} className="p-4 border-l border-slate-200">
                          <div className="space-y-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(prop.status)}`}>
                              {prop.status}
                            </span>
                            <Link
                              href={`/proposals/${prop.id}`}
                              className="block py-2 text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                            >
                              View Full Proposal →
                            </Link>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
