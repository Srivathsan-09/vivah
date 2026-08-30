import {
  Proposal,
  ProposalContact,
  Communication,
  Horoscope,
  Note,
  FollowUp,
  StatusHistory,
  Activity,
  MatrimonySource,
  AppSettings,
  AppBackupData,
  ProposalFilterParams,
  ProposalStatus,
  RejectionReason,
} from '../types';
import {
  INITIAL_DEMO_BACKUP,
  INITIAL_SOURCES,
  INITIAL_SETTINGS,
  DEMO_PROPOSALS,
  DEMO_CONTACTS,
  DEMO_COMMUNICATIONS,
  DEMO_HOROSCOPES,
  DEMO_NOTES,
  DEMO_FOLLOWUPS,
  DEMO_STATUS_HISTORY,
  DEMO_ACTIVITIES,
} from '../data/demoData';

const KEYS = {
  INITIALIZED: 'matrimony_crm_initialized_clean_v4',
  PROPOSALS: 'matrimony_crm_proposals',
  CONTACTS: 'matrimony_crm_contacts',
  COMMUNICATIONS: 'matrimony_crm_communications',
  HOROSCOPES: 'matrimony_crm_horoscopes',
  NOTES: 'matrimony_crm_notes',
  FOLLOWUPS: 'matrimony_crm_followups',
  STATUS_HISTORY: 'matrimony_crm_status_history',
  ACTIVITIES: 'matrimony_crm_activities',
  SOURCES: 'matrimony_crm_sources',
  SETTINGS: 'matrimony_crm_settings',
};

// Helper for safe SSR / LocalStorage access
const isBrowser = () => typeof window !== 'undefined';

const getItem = <T>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading key ${key} from LocalStorage`, err);
    return fallback;
  }
};

const setItem = <T>(key: string, value: T): void => {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing key ${key} to LocalStorage`, err);
  }
};

export const initializeStorage = (forceReset = false): void => {
  if (!isBrowser()) return;
  const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
  if (!isInitialized || forceReset) {
    setItem(KEYS.PROPOSALS, INITIAL_DEMO_BACKUP.proposals);
    setItem(KEYS.CONTACTS, INITIAL_DEMO_BACKUP.contacts);
    setItem(KEYS.COMMUNICATIONS, INITIAL_DEMO_BACKUP.communications);
    setItem(KEYS.HOROSCOPES, INITIAL_DEMO_BACKUP.horoscopes);
    setItem(KEYS.NOTES, INITIAL_DEMO_BACKUP.notes);
    setItem(KEYS.FOLLOWUPS, INITIAL_DEMO_BACKUP.followUps);
    setItem(KEYS.STATUS_HISTORY, INITIAL_DEMO_BACKUP.statusHistory);
    setItem(KEYS.ACTIVITIES, INITIAL_DEMO_BACKUP.activities);
    setItem(KEYS.SOURCES, INITIAL_DEMO_BACKUP.sources);
    setItem(KEYS.SETTINGS, INITIAL_DEMO_BACKUP.settings);
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  }
};

// Auto initialize on module import in browser
if (isBrowser()) {
  initializeStorage();
}

// ----------------------------------------------------
// PROPOSALS
// ----------------------------------------------------

export const getProposals = (params?: ProposalFilterParams): Proposal[] => {
  initializeStorage();
  let list = getItem<Proposal[]>(KEYS.PROPOSALS, []);

  if (!params) return list;

  const { search, status, horoscopeStatus, source, location, shortlistedOnly, sortBy, sortOrder = 'desc' } = params;

  // Search filter
  if (search && search.trim()) {
    const query = search.toLowerCase().trim();
    const contacts = getItem<ProposalContact[]>(KEYS.CONTACTS, []);

    list = list.filter((p) => {
      const matchName = p.fullName.toLowerCase().includes(query);
      const matchLoc = p.location.toLowerCase().includes(query);
      const matchProf = p.profession.toLowerCase().includes(query);
      const matchPlatform = p.matrimonyPlatform.toLowerCase().includes(query);
      const matchProfileId = p.profileId.toLowerCase().includes(query);

      // Check contacts for matching phone or name
      const pContacts = contacts.filter((c) => c.proposalId === p.id);
      const matchContact = pContacts.some(
        (c) => c.name.toLowerCase().includes(query) || c.phone.includes(query)
      );

      return matchName || matchLoc || matchProf || matchPlatform || matchProfileId || matchContact;
    });
  }

  // Proposal Type filter (Received vs Requested)
  if (params?.proposalType && params.proposalType !== 'All') {
    list = list.filter((p) => (p.proposalType || 'Received') === params.proposalType);
  }

  // Status filter
  if (status && status !== 'All') {
    list = list.filter((p) => p.status === status);
  }

  // Horoscope status filter
  if (horoscopeStatus && horoscopeStatus !== 'All') {
    const horoscopes = getItem<Horoscope[]>(KEYS.HOROSCOPES, []);
    list = list.filter((p) => {
      const h = horoscopes.find((item) => item.proposalId === p.id);
      return h ? h.status === horoscopeStatus : horoscopeStatus === 'Not Provided';
    });
  }

  // Source filter
  if (source && source !== 'All') {
    list = list.filter((p) => p.matrimonyPlatform === source);
  }

  // Location filter
  if (location && location !== 'All') {
    list = list.filter((p) => p.location.toLowerCase().includes(location.toLowerCase()));
  }

  // Shortlisted filter
  if (shortlistedOnly) {
    list = list.filter((p) => p.shortlisted);
  }

  // Sorting
  if (sortBy) {
    const followups = getItem<FollowUp[]>(KEYS.FOLLOWUPS, []);

    list.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortBy === 'recently_added') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortBy === 'recently_updated') {
        valA = new Date(a.updatedAt).getTime();
        valB = new Date(b.updatedAt).getTime();
      } else if (sortBy === 'name') {
        valA = a.fullName.toLowerCase();
        valB = b.fullName.toLowerCase();
      } else if (sortBy === 'age') {
        valA = a.age;
        valB = b.age;
      } else if (sortBy === 'status') {
        valA = a.status;
        valB = b.status;
      } else if (sortBy === 'next_followup') {
        const nextA = followups
          .filter((f) => f.proposalId === a.id && f.status === 'Pending')
          .sort((f1, f2) => f1.dueDate.localeCompare(f2.dueDate))[0]?.dueDate || '9999-12-31';
        const nextB = followups
          .filter((f) => f.proposalId === b.id && f.status === 'Pending')
          .sort((f1, f2) => f1.dueDate.localeCompare(f2.dueDate))[0]?.dueDate || '9999-12-31';
        valA = nextA;
        valB = nextB;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return list;
};

export const getProposal = (id: string): Proposal | undefined => {
  const proposals = getItem<Proposal[]>(KEYS.PROPOSALS, []);
  return proposals.find((p) => p.id === id);
};

export const checkDuplicate = (
  phone?: string,
  matrimonyPlatform?: string,
  profileId?: string,
  fullName?: string,
  currentId?: string
): { isDuplicate: boolean; matchedProposal?: Proposal; reason?: string } => {
  const proposals = getItem<Proposal[]>(KEYS.PROPOSALS, []);
  const contacts = getItem<ProposalContact[]>(KEYS.CONTACTS, []);

  // Filter out current editing proposal if provided
  const targetProposals = proposals.filter((p) => p.id !== currentId);

  // Check 1: Phone number match in contacts or proposals
  if (phone && phone.trim()) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 7) {
      const matchedContact = contacts.find((c) => {
        if (c.proposalId === currentId) return false;
        const cPhone = c.phone.replace(/[^0-9]/g, '');
        return cPhone.includes(cleanPhone) || cleanPhone.includes(cPhone);
      });

      if (matchedContact) {
        const matchedProp = targetProposals.find((p) => p.id === matchedContact.proposalId);
        if (matchedProp) {
          return {
            isDuplicate: true,
            matchedProposal: matchedProp,
            reason: `Phone number ${phone} matches contact "${matchedContact.name}" for existing proposal ${matchedProp.fullName}.`,
          };
        }
      }
    }
  }

  // Check 2: Matrimony Platform + Profile ID
  if (matrimonyPlatform && profileId && profileId.trim()) {
    const matchedProp = targetProposals.find(
      (p) =>
        p.matrimonyPlatform.toLowerCase() === matrimonyPlatform.toLowerCase() &&
        p.profileId.toLowerCase().trim() === profileId.toLowerCase().trim()
    );
    if (matchedProp) {
      return {
        isDuplicate: true,
        matchedProposal: matchedProp,
        reason: `Profile ID "${profileId}" on ${matrimonyPlatform} already exists for ${matchedProp.fullName}.`,
      };
    }
  }

  // Check 3: Full Name + Phone match
  if (fullName && fullName.trim() && phone && phone.trim()) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const matchedProp = targetProposals.find((p) => {
      const sameName = p.fullName.toLowerCase().trim() === fullName.toLowerCase().trim();
      const pContacts = contacts.filter((c) => c.proposalId === p.id);
      const samePhone = pContacts.some((c) => c.phone.replace(/[^0-9]/g, '').includes(cleanPhone));
      return sameName && samePhone;
    });

    if (matchedProp) {
      return {
        isDuplicate: true,
        matchedProposal: matchedProp,
        reason: `Proposal with name "${fullName}" and matching phone number already exists.`,
      };
    }
  }

  return { isDuplicate: false };
};

export const createProposal = (
  proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>,
  primaryContact?: { name: string; relationship: any; phone: string; whatsapp?: string; email?: string }
): Proposal => {
  const proposals = getItem<Proposal[]>(KEYS.PROPOSALS, []);
  const now = new Date().toISOString();

  const newId = `prop-${Date.now()}`;
  const newProposal: Proposal = {
    proposalType: 'Received',
    ...proposalData,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };

  proposals.unshift(newProposal);
  setItem(KEYS.PROPOSALS, proposals);

  // Default Horoscope Record
  const horoscopes = getItem<Horoscope[]>(KEYS.HOROSCOPES, []);
  horoscopes.push({
    id: `horo-${Date.now()}`,
    proposalId: newId,
    dob: newProposal.dob || '',
    status: 'Pending',
    updatedAt: now,
  });
  setItem(KEYS.HOROSCOPES, horoscopes);

  // Primary Contact if provided
  if (primaryContact && primaryContact.name && primaryContact.phone) {
    const contacts = getItem<ProposalContact[]>(KEYS.CONTACTS, []);
    contacts.push({
      id: `cnt-${Date.now()}`,
      proposalId: newId,
      name: primaryContact.name,
      relationship: primaryContact.relationship || 'Father',
      phone: primaryContact.phone,
      whatsapp: primaryContact.whatsapp,
      email: primaryContact.email,
    });
    setItem(KEYS.CONTACTS, contacts);
  }

  // Initial Status History
  const statusHistory = getItem<StatusHistory[]>(KEYS.STATUS_HISTORY, []);
  statusHistory.push({
    id: `sth-${Date.now()}`,
    proposalId: newId,
    fromStatus: 'New',
    toStatus: newProposal.status,
    timestamp: now,
    note: 'Proposal created.',
  });
  setItem(KEYS.STATUS_HISTORY, statusHistory);

  // Log Activity
  logActivity(newId, newProposal.fullName, 'proposal_created', `Added new proposal for ${newProposal.fullName}`);

  return newProposal;
};

export const updateProposal = (id: string, updates: Partial<Proposal>): Proposal | undefined => {
  const proposals = getItem<Proposal[]>(KEYS.PROPOSALS, []);
  const index = proposals.findIndex((p) => p.id === id);

  if (index === -1) return undefined;

  const oldProp = proposals[index];
  const now = new Date().toISOString();

  // Status Change Tracking
  if (updates.status && updates.status !== oldProp.status) {
    const statusHistory = getItem<StatusHistory[]>(KEYS.STATUS_HISTORY, []);
    statusHistory.push({
      id: `sth-${Date.now()}`,
      proposalId: id,
      fromStatus: oldProp.status,
      toStatus: updates.status,
      timestamp: now,
      note: updates.rejectionNotes || `Status updated to ${updates.status}`,
    });
    setItem(KEYS.STATUS_HISTORY, statusHistory);

    if (updates.status === 'Rejected') {
      logActivity(id, oldProp.fullName, 'proposal_rejected', `Proposal rejected: ${updates.rejectionReason || 'Other'}`);
    } else if (updates.status === 'Shortlisted') {
      logActivity(id, oldProp.fullName, 'proposal_shortlisted', `Shortlisted ${oldProp.fullName}'s proposal`);
    } else {
      logActivity(id, oldProp.fullName, 'status_changed', `Status changed from ${oldProp.status} to ${updates.status}`);
    }
  } else {
    logActivity(id, oldProp.fullName, 'proposal_edited', `Updated proposal details for ${oldProp.fullName}`);
  }

  const updatedProposal: Proposal = {
    ...oldProp,
    ...updates,
    updatedAt: now,
  };

  proposals[index] = updatedProposal;
  setItem(KEYS.PROPOSALS, proposals);

  return updatedProposal;
};

export const deleteProposal = (id: string): boolean => {
  let proposals = getItem<Proposal[]>(KEYS.PROPOSALS, []);
  const target = proposals.find((p) => p.id === id);
  if (!target) return false;

  proposals = proposals.filter((p) => p.id !== id);
  setItem(KEYS.PROPOSALS, proposals);

  // Cleanup related entities
  setItem(KEYS.CONTACTS, getItem<ProposalContact[]>(KEYS.CONTACTS, []).filter((c) => c.proposalId !== id));
  setItem(KEYS.COMMUNICATIONS, getItem<Communication[]>(KEYS.COMMUNICATIONS, []).filter((c) => c.proposalId !== id));
  setItem(KEYS.HOROSCOPES, getItem<Horoscope[]>(KEYS.HOROSCOPES, []).filter((h) => h.proposalId !== id));
  setItem(KEYS.NOTES, getItem<Note[]>(KEYS.NOTES, []).filter((n) => n.proposalId !== id));
  setItem(KEYS.FOLLOWUPS, getItem<FollowUp[]>(KEYS.FOLLOWUPS, []).filter((f) => f.proposalId !== id));
  setItem(KEYS.STATUS_HISTORY, getItem<StatusHistory[]>(KEYS.STATUS_HISTORY, []).filter((s) => s.proposalId !== id));
  setItem(KEYS.ACTIVITIES, getItem<Activity[]>(KEYS.ACTIVITIES, []).filter((a) => a.proposalId !== id));

  return true;
};

// ----------------------------------------------------
// CONTACTS
// ----------------------------------------------------

export const getContacts = (proposalId?: string): ProposalContact[] => {
  const contacts = getItem<ProposalContact[]>(KEYS.CONTACTS, []);
  return proposalId ? contacts.filter((c) => c.proposalId === proposalId) : contacts;
};

export const addContact = (contact: Omit<ProposalContact, 'id'>): ProposalContact => {
  const contacts = getItem<ProposalContact[]>(KEYS.CONTACTS, []);
  const newContact: ProposalContact = {
    ...contact,
    id: `cnt-${Date.now()}`,
  };
  contacts.push(newContact);
  setItem(KEYS.CONTACTS, contacts);

  const prop = getProposal(contact.proposalId);
  if (prop) {
    logActivity(prop.id, prop.fullName, 'contact_added', `Added contact ${newContact.name} (${newContact.relationship})`);
  }

  return newContact;
};

export const updateContact = (id: string, updates: Partial<ProposalContact>): ProposalContact | undefined => {
  const contacts = getItem<ProposalContact[]>(KEYS.CONTACTS, []);
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  const updated = { ...contacts[index], ...updates };
  contacts[index] = updated;
  setItem(KEYS.CONTACTS, contacts);
  return updated;
};

export const deleteContact = (id: string): boolean => {
  let contacts = getItem<ProposalContact[]>(KEYS.CONTACTS, []);
  contacts = contacts.filter((c) => c.id !== id);
  setItem(KEYS.CONTACTS, contacts);
  return true;
};

// ----------------------------------------------------
// COMMUNICATIONS
// ----------------------------------------------------

export const getCommunications = (proposalId?: string): Communication[] => {
  const comms = getItem<Communication[]>(KEYS.COMMUNICATIONS, []);
  const filtered = proposalId ? comms.filter((c) => c.proposalId === proposalId) : comms;
  return filtered.sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime());
};

export const addCommunication = (comm: Omit<Communication, 'id' | 'createdAt'>): Communication => {
  const comms = getItem<Communication[]>(KEYS.COMMUNICATIONS, []);
  const newComm: Communication = {
    ...comm,
    id: `comm-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  comms.unshift(newComm);
  setItem(KEYS.COMMUNICATIONS, comms);

  const prop = getProposal(comm.proposalId);
  if (prop) {
    logActivity(
      prop.id,
      prop.fullName,
      'conversation_added',
      `Recorded ${comm.method} with ${comm.contactPerson}: "${comm.summary}"`
    );

    // Automatically create FollowUp if followUpDate is specified
    if (comm.followUpDate) {
      addFollowUp({
        proposalId: comm.proposalId,
        contactName: comm.contactPerson,
        reason: comm.nextAction || `Follow up after ${comm.method}`,
        dueDate: comm.followUpDate,
        priority: 'Medium',
        notes: comm.summary,
        status: 'Pending',
      });
    }
  }

  return newComm;
};

export const deleteCommunication = (id: string): boolean => {
  let comms = getItem<Communication[]>(KEYS.COMMUNICATIONS, []);
  comms = comms.filter((c) => c.id !== id);
  setItem(KEYS.COMMUNICATIONS, comms);
  return true;
};

// ----------------------------------------------------
// HOROSCOPE
// ----------------------------------------------------

export const getHoroscope = (proposalId: string): Horoscope => {
  const horoscopes = getItem<Horoscope[]>(KEYS.HOROSCOPES, []);
  let h = horoscopes.find((item) => item.proposalId === proposalId);
  if (!h) {
    const prop = getProposal(proposalId);
    h = {
      id: `horo-${Date.now()}`,
      proposalId,
      dob: prop?.dob || '',
      status: 'Pending',
      updatedAt: new Date().toISOString(),
    };
    horoscopes.push(h);
    setItem(KEYS.HOROSCOPES, horoscopes);
  }
  return h;
};

export const updateHoroscope = (proposalId: string, updates: Partial<Horoscope>): Horoscope => {
  const horoscopes = getItem<Horoscope[]>(KEYS.HOROSCOPES, []);
  const index = horoscopes.findIndex((h) => h.proposalId === proposalId);
  const now = new Date().toISOString();

  let updated: Horoscope;
  if (index !== -1) {
    updated = { ...horoscopes[index], ...updates, updatedAt: now };
    horoscopes[index] = updated;
  } else {
    updated = {
      id: `horo-${Date.now()}`,
      proposalId,
      status: 'Pending',
      ...updates,
      updatedAt: now,
    };
    horoscopes.push(updated);
  }
  setItem(KEYS.HOROSCOPES, horoscopes);

  const prop = getProposal(proposalId);
  if (prop) {
    logActivity(
      prop.id,
      prop.fullName,
      'horoscope_updated',
      `Updated horoscope status to "${updated.status}"${updated.compatibilityScore ? ` (Score: ${updated.compatibilityScore})` : ''}`
    );
  }

  return updated;
};

// ----------------------------------------------------
// NOTES
// ----------------------------------------------------

export const getNotes = (proposalId?: string): Note[] => {
  const notes = getItem<Note[]>(KEYS.NOTES, []);
  const filtered = proposalId ? notes.filter((n) => n.proposalId === proposalId) : notes;
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
  const notes = getItem<Note[]>(KEYS.NOTES, []);
  const now = new Date().toISOString();
  const newNote: Note = {
    ...note,
    id: `note-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  notes.unshift(newNote);
  setItem(KEYS.NOTES, notes);

  const prop = getProposal(note.proposalId);
  if (prop) {
    logActivity(prop.id, prop.fullName, 'note_added', `Added ${note.category} note: "${note.text.slice(0, 50)}..."`);
  }

  return newNote;
};

export const updateNote = (id: string, text: string, category: Note['category']): Note | undefined => {
  const notes = getItem<Note[]>(KEYS.NOTES, []);
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return undefined;

  const updated: Note = {
    ...notes[index],
    text,
    category,
    updatedAt: new Date().toISOString(),
  };
  notes[index] = updated;
  setItem(KEYS.NOTES, notes);
  return updated;
};

export const deleteNote = (id: string): boolean => {
  let notes = getItem<Note[]>(KEYS.NOTES, []);
  notes = notes.filter((n) => n.id !== id);
  setItem(KEYS.NOTES, notes);
  return true;
};

// ----------------------------------------------------
// FOLLOW-UPS
// ----------------------------------------------------

export const getFollowUps = (proposalId?: string): FollowUp[] => {
  const followups = getItem<FollowUp[]>(KEYS.FOLLOWUPS, []);
  const filtered = proposalId ? followups.filter((f) => f.proposalId === proposalId) : followups;
  return filtered.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
};

export const addFollowUp = (followUp: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp => {
  const followups = getItem<FollowUp[]>(KEYS.FOLLOWUPS, []);
  const newFollowUp: FollowUp = {
    ...followUp,
    id: `flw-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  followups.push(newFollowUp);
  setItem(KEYS.FOLLOWUPS, followups);

  const prop = getProposal(followUp.proposalId);
  if (prop) {
    logActivity(prop.id, prop.fullName, 'followup_scheduled', `Scheduled follow-up for ${followUp.dueDate}: ${followUp.reason}`);
  }

  return newFollowUp;
};

export const updateFollowUp = (id: string, updates: Partial<FollowUp>): FollowUp | undefined => {
  const followups = getItem<FollowUp[]>(KEYS.FOLLOWUPS, []);
  const index = followups.findIndex((f) => f.id === id);
  if (index === -1) return undefined;

  const updated = { ...followups[index], ...updates };
  followups[index] = updated;
  setItem(KEYS.FOLLOWUPS, followups);
  return updated;
};

export const completeFollowUp = (id: string): FollowUp | undefined => {
  const followups = getItem<FollowUp[]>(KEYS.FOLLOWUPS, []);
  const index = followups.findIndex((f) => f.id === id);
  if (index === -1) return undefined;

  const now = new Date().toISOString();
  const updated: FollowUp = {
    ...followups[index],
    status: 'Completed',
    completedAt: now,
  };
  followups[index] = updated;
  setItem(KEYS.FOLLOWUPS, followups);

  const prop = getProposal(updated.proposalId);
  if (prop) {
    logActivity(prop.id, prop.fullName, 'followup_completed', `Completed follow-up: "${updated.reason}"`);
  }

  return updated;
};

export const deleteFollowUp = (id: string): boolean => {
  let followups = getItem<FollowUp[]>(KEYS.FOLLOWUPS, []);
  followups = followups.filter((f) => f.id !== id);
  setItem(KEYS.FOLLOWUPS, followups);
  return true;
};

// ----------------------------------------------------
// STATUS HISTORY & ACTIVITIES
// ----------------------------------------------------

export const getStatusHistory = (proposalId: string): StatusHistory[] => {
  const history = getItem<StatusHistory[]>(KEYS.STATUS_HISTORY, []);
  return history
    .filter((h) => h.proposalId === proposalId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getActivities = (limit = 20): Activity[] => {
  const activities = getItem<Activity[]>(KEYS.ACTIVITIES, []);
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
};

const logActivity = (
  proposalId: string,
  proposalName: string,
  type: Activity['type'],
  description: string
): void => {
  const activities = getItem<Activity[]>(KEYS.ACTIVITIES, []);
  activities.unshift({
    id: `act-${Date.now()}`,
    proposalId,
    proposalName,
    type,
    description,
    timestamp: new Date().toISOString(),
  });
  setItem(KEYS.ACTIVITIES, activities.slice(0, 100)); // Limit to last 100 activities
};

// ----------------------------------------------------
// SOURCES & SETTINGS
// ----------------------------------------------------

export const getSources = (): MatrimonySource[] => {
  return getItem<MatrimonySource[]>(KEYS.SOURCES, INITIAL_SOURCES);
};

export const addSource = (name: string): MatrimonySource => {
  const sources = getSources();
  const newSource: MatrimonySource = {
    id: `src-${Date.now()}`,
    name,
    isDefault: false,
  };
  sources.push(newSource);
  setItem(KEYS.SOURCES, sources);
  return newSource;
};

export const deleteSource = (id: string): boolean => {
  let sources = getSources();
  sources = sources.filter((s) => s.id !== id);
  setItem(KEYS.SOURCES, sources);
  return true;
};

export const getSettings = (): AppSettings => {
  return getItem<AppSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
};

export const updateSettings = (updates: Partial<AppSettings>): AppSettings => {
  const current = getSettings();
  const updated = { ...current, ...updates };
  setItem(KEYS.SETTINGS, updated);
  return updated;
};

// ----------------------------------------------------
// BACKUP & RESTORE
// ----------------------------------------------------

export const exportData = (): AppBackupData => {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    proposals: getItem<Proposal[]>(KEYS.PROPOSALS, []),
    contacts: getItem<ProposalContact[]>(KEYS.CONTACTS, []),
    communications: getItem<Communication[]>(KEYS.COMMUNICATIONS, []),
    horoscopes: getItem<Horoscope[]>(KEYS.HOROSCOPES, []),
    notes: getItem<Note[]>(KEYS.NOTES, []),
    followUps: getItem<FollowUp[]>(KEYS.FOLLOWUPS, []),
    statusHistory: getItem<StatusHistory[]>(KEYS.STATUS_HISTORY, []),
    activities: getItem<Activity[]>(KEYS.ACTIVITIES, []),
    sources: getItem<MatrimonySource[]>(KEYS.SOURCES, []),
    settings: getItem<AppSettings>(KEYS.SETTINGS, INITIAL_SETTINGS),
  };
};

export const importData = (data: AppBackupData, mode: 'replace' | 'merge'): { success: boolean; message: string } => {
  try {
    if (!data || !Array.isArray(data.proposals)) {
      return { success: false, message: 'Invalid backup JSON file structure.' };
    }

    if (mode === 'replace') {
      setItem(KEYS.PROPOSALS, data.proposals || []);
      setItem(KEYS.CONTACTS, data.contacts || []);
      setItem(KEYS.COMMUNICATIONS, data.communications || []);
      setItem(KEYS.HOROSCOPES, data.horoscopes || []);
      setItem(KEYS.NOTES, data.notes || []);
      setItem(KEYS.FOLLOWUPS, data.followUps || []);
      setItem(KEYS.STATUS_HISTORY, data.statusHistory || []);
      setItem(KEYS.ACTIVITIES, data.activities || []);
      setItem(KEYS.SOURCES, data.sources || INITIAL_SOURCES);
      setItem(KEYS.SETTINGS, data.settings || INITIAL_SETTINGS);
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      return { success: true, message: `Successfully replaced data with ${data.proposals.length} proposals.` };
    } else {
      // Merge mode
      const currentProposals = getItem<Proposal[]>(KEYS.PROPOSALS, []);
      const existingIds = new Set(currentProposals.map((p) => p.id));

      const newProps = data.proposals.filter((p) => !existingIds.has(p.id));
      setItem(KEYS.PROPOSALS, [...currentProposals, ...newProps]);

      // Merge other arrays based on ID uniqueness
      const mergeArray = <T extends { id: string }>(key: string, importedArr?: T[]) => {
        if (!importedArr) return;
        const current = getItem<T[]>(key, []);
        const ids = new Set(current.map((item) => item.id));
        const added = importedArr.filter((item) => !ids.has(item.id));
        setItem(key, [...current, ...added]);
      };

      mergeArray(KEYS.CONTACTS, data.contacts);
      mergeArray(KEYS.COMMUNICATIONS, data.communications);
      mergeArray(KEYS.HOROSCOPES, data.horoscopes);
      mergeArray(KEYS.NOTES, data.notes);
      mergeArray(KEYS.FOLLOWUPS, data.followUps);
      mergeArray(KEYS.STATUS_HISTORY, data.statusHistory);
      mergeArray(KEYS.ACTIVITIES, data.activities);

      return { success: true, message: `Merged ${newProps.length} new proposals successfully.` };
    }
  } catch (err: any) {
    return { success: false, message: `Failed to import data: ${err.message}` };
  }
};

export const resetDemoData = (): void => {
  setItem(KEYS.PROPOSALS, DEMO_PROPOSALS);
  setItem(KEYS.CONTACTS, DEMO_CONTACTS);
  setItem(KEYS.COMMUNICATIONS, DEMO_COMMUNICATIONS);
  setItem(KEYS.HOROSCOPES, DEMO_HOROSCOPES);
  setItem(KEYS.NOTES, DEMO_NOTES);
  setItem(KEYS.FOLLOWUPS, DEMO_FOLLOWUPS);
  setItem(KEYS.STATUS_HISTORY, DEMO_STATUS_HISTORY);
  setItem(KEYS.ACTIVITIES, DEMO_ACTIVITIES);
  setItem(KEYS.SOURCES, INITIAL_SOURCES);
  setItem(KEYS.SETTINGS, INITIAL_SETTINGS);
  if (isBrowser()) localStorage.setItem(KEYS.INITIALIZED, 'true');
};

export const clearAllData = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.PROPOSALS);
  localStorage.removeItem(KEYS.CONTACTS);
  localStorage.removeItem(KEYS.COMMUNICATIONS);
  localStorage.removeItem(KEYS.HOROSCOPES);
  localStorage.removeItem(KEYS.NOTES);
  localStorage.removeItem(KEYS.FOLLOWUPS);
  localStorage.removeItem(KEYS.STATUS_HISTORY);
  localStorage.removeItem(KEYS.ACTIVITIES);
  localStorage.removeItem(KEYS.SOURCES);
  localStorage.removeItem(KEYS.SETTINGS);
  localStorage.setItem(KEYS.INITIALIZED, 'true');
};
