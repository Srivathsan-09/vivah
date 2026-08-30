export type ProposalStatus =
  | 'New'
  | 'Contacted'
  | 'Information Pending'
  | 'Horoscope Pending'
  | 'Under Consideration'
  | 'Meeting Planned'
  | 'Shortlisted'
  | 'On Hold'
  | 'Rejected'
  | 'Closed';

export type RejectionReason =
  | 'Horoscope'
  | 'Location'
  | 'Career'
  | 'Family'
  | 'Compatibility'
  | 'Personal Preference'
  | 'No Response'
  | 'Family Decision'
  | 'Other';

export type HoroscopeStatus =
  | 'Not Provided'
  | 'Pending'
  | 'Checking'
  | 'Matched'
  | 'Partially Matched'
  | 'Not Matched'
  | 'Not Applicable';

export type CommunicationMethod =
  | 'Phone Call'
  | 'WhatsApp'
  | 'SMS'
  | 'Video Call'
  | 'Email'
  | 'In-person Meeting'
  | 'Other';

export type CommunicationDirection = 'Incoming' | 'Outgoing';

export type ContactRelationship =
  | 'Father'
  | 'Mother'
  | 'Son/Daughter'
  | 'Brother'
  | 'Sister'
  | 'Relative'
  | 'Mediator'
  | 'Other';

export type NoteCategory =
  | 'General'
  | 'Family'
  | 'Career'
  | 'Horoscope'
  | 'Conversation'
  | 'Decision';

export type Priority = 'Low' | 'Medium' | 'High';

export type FollowUpStatus = 'Pending' | 'Completed' | 'Rescheduled';

export interface ProposalContact {
  id: string;
  proposalId: string;
  name: string;
  relationship: ContactRelationship;
  phone: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
}

export interface Communication {
  id: string;
  proposalId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  contactPerson: string;
  method: CommunicationMethod;
  direction: CommunicationDirection;
  summary: string;
  detailedNotes?: string;
  nextAction?: string;
  followUpDate?: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Horoscope {
  id: string;
  proposalId: string;
  dob?: string;
  tob?: string;
  pob?: string;
  rasi?: string;
  nakshatra?: string;
  status: HoroscopeStatus;
  compatibilityScore?: string; // e.g., "30/36", "85%", etc.
  astrologerName?: string;
  dateChecked?: string;
  compatibilityNotes?: string;
  documentName?: string;
  documentDataUrl?: string; // base64 preview or file reference
  updatedAt: string;
}

export interface Note {
  id: string;
  proposalId: string;
  text: string;
  category: NoteCategory;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  proposalId: string;
  contactName: string;
  reason: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  notes?: string;
  status: FollowUpStatus;
  completedAt?: string;
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  proposalId: string;
  fromStatus: ProposalStatus;
  toStatus: ProposalStatus;
  timestamp: string;
  note?: string;
}

export interface Activity {
  id: string;
  proposalId: string;
  proposalName: string;
  type:
    | 'proposal_created'
    | 'proposal_edited'
    | 'contact_added'
    | 'conversation_added'
    | 'horoscope_updated'
    | 'note_added'
    | 'followup_scheduled'
    | 'followup_completed'
    | 'status_changed'
    | 'proposal_rejected'
    | 'proposal_shortlisted';
  description: string;
  timestamp: string;
}

export type ProposalType = 'Received' | 'Requested';

export interface Proposal {
  id: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  proposalType?: ProposalType; // 'Received' (Received from candidate family) | 'Requested' (Requested / Sent by our family)
  dob?: string;
  age: number;
  height?: string;
  location: string;
  religion?: string;
  community?: string;
  motherTongue?: string;
  maritalStatus: 'Never Married' | 'Divorced' | 'Widowed' | 'Awaiting Divorce';
  highestEducation: string;
  college?: string;
  profession: string;
  company?: string;
  workLocation?: string;
  income?: string;
  matrimonyPlatform: string;
  profileId: string;
  profileUrl?: string;
  dateReceived: string; // YYYY-MM-DD
  initialImpression?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  siblings?: string;
  familyLocation?: string;
  status: ProposalStatus;
  rejectionReason?: RejectionReason;
  rejectionNotes?: string;
  photoUrl?: string;
  horoscopeImageUrl?: string;
  horoscopeMatch?: 'Very Good' | 'OK' | 'Not ok' | 'Pending';
  shortlisted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MatrimonySource {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface AppSettings {
  dateFormat: string;
  defaultView: 'grid' | 'table';
  theme: 'light' | 'dark' | 'system';
  bgImage?: string; // '/bg-matrimony-1.jpg' | '/bg-matrimony-2.jpg' | 'none'
}

export interface AppBackupData {
  version: string;
  exportedAt: string;
  proposals: Proposal[];
  contacts: ProposalContact[];
  communications: Communication[];
  horoscopes: Horoscope[];
  notes: Note[];
  followUps: FollowUp[];
  statusHistory: StatusHistory[];
  activities: Activity[];
  sources: MatrimonySource[];
  settings: AppSettings;
}

export interface ProposalFilterParams {
  search?: string;
  proposalType?: ProposalType | 'All';
  status?: ProposalStatus | 'All';
  horoscopeStatus?: HoroscopeStatus | 'All';
  source?: string | 'All';
  location?: string | 'All';
  shortlistedOnly?: boolean;
  sortBy?: 'recently_added' | 'recently_updated' | 'name' | 'age' | 'next_followup' | 'status';
  sortOrder?: 'asc' | 'desc';
}
