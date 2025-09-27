// TODO: Define tontine types and interfaces

// Main tontine interface
export interface Tontine {
  id: string;
  creator: string;
  name: string;
  description: string;
  maxParticipants: number;
  contributionAmount: number;
  deadlineInterval: number; // in days , week , or month
  totalRounds: number;
  currentRound: number;
  status: TontineStatus;
  participants: string[];
  paidParticipants: string[];
  beneficiaries: string[];
  totalContributed: number;
  createdAt: number;
  nextDeadline: number;
  coinType: CoinType;
}

// TODO: Define tontine status enum
export enum TontineStatus {
  CREATED = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

// TODO: Define supported coin types
export enum CoinType {
  SUI = 'SUI',
  USDC = 'USDC',
  USDT = 'USDT',
}

// TODO: Define invitation interface
export interface Invitation {
  id: string;
  tontineId: string;
  inviter: string;
  invitee: string;
  invitationCode: string;
  invitationUrl: string;
  isUsed: boolean;
  createdAt: number;
  expiresAt: number;
}

// TODO: Define contribution interface
export interface Contribution {
  id: string;
  tontineId: string;
  participant: string;
  amount: number;
  round: number;
  timestamp: number;
}

// TODO: Define form interfaces
export interface CreateTontineForm {
  name: string;
  description: string;
  maxParticipants: number;
  contributionAmount: number;
  deadlineInterval: number; // in days
  coinType: CoinType;
}

export interface JoinTontineForm {
  invitationCode: string;
}

// TODO: Define statistics interface
export interface TontineStats {
  totalTontines: number;
  activeTontines: number;
  completedTontines: number;
  totalVolume: number;
  averageContribution: number;
}

// TODO: Define notification interface
export interface Notification {
  id: string;
  type: 'deadline_reminder' | 'contribution_received' | 'beneficiary_selected' | 'tontine_completed';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  tontineId?: string;
}

// TODO: Define user settings interface
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    deadlineReminders: boolean;
    contributionAlerts: boolean;
  };
  defaultCoinType: CoinType;
  language: string;
  timezone: string;
}

// TODO: Define API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// TODO: Define transaction interface
export interface Transaction {
  id: string;
  type: 'create' | 'join' | 'contribute' | 'distribute';
  tontineId: string;
  participant: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  txHash?: string;
}

// TODO: Define wallet interface
export interface WalletInfo {
  address: string;
  balance: number;
  coinType: CoinType;
  isConnected: boolean;
}
