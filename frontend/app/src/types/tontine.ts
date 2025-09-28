// Types for 100% Winner Lotto (Yield Lotto) on Sui

// Main lotto interface - represents a single-round yield lotto
export interface Lotto {
  id: string;
  creator: string;
  name: string;
  description: string;
  maxParticipants: number;
  contributionAmount: number; // Amount each participant must contribute
  status: LottoStatus;
  participants: string[]; // List of participant addresses
  paidParticipants: string[]; // Participants who have contributed
  winner?: string; // Winner address (if selected)
  winnerSelected: boolean;
  fundsDistributed: boolean;
  totalContributed: number; // Total amount in the pool
  totalYield: number; // Yield earned from staking
  winnerPayout: number; // Amount winner receives (contribution + yield)
  createdAt: number;
  coinType: CoinType;
  stakedAssetsId: string; // ID of staked assets
}

// Lotto status enum
export enum LottoStatus {
  CREATED = 0,    // Lotto created, accepting participants
  ACTIVE = 1,     // All participants joined, collecting contributions
  COMPLETED = 2,  // Winner selected and funds distributed
  CANCELLED = 3,  // Lotto cancelled
}

// Supported coin types
export enum CoinType {
  SUI = 'SUI',
  USDC = 'USDC',
  USDT = 'USDT',
}

// Invitation interface
export interface Invitation {
  id: string;
  lottoId: string;
  inviter: string;
  invitee: string;
  invitationCode: string;
  invitationUrl: string;
  isUsed: boolean;
  createdAt: number;
  expiresAt: number;
}

// Contribution interface
export interface Contribution {
  id: string;
  lottoId: string;
  participant: string;
  amount: number;
  timestamp: number;
}

// Form interfaces
export interface CreateLottoForm {
  name: string;
  description: string;
  maxParticipants: number;
  contributionAmount: number;
  coinType: CoinType;
}

export interface JoinLottoForm {
  invitationCode: string;
}

// Statistics interface
export interface LottoStats {
  totalLottos: number;
  activeLottos: number;
  completedLottos: number;
  totalVolume: number;
  averageContribution: number;
  totalYieldGenerated: number;
}

// Notification interface
export interface Notification {
  id: string;
  type: 'contribution_received' | 'winner_selected' | 'lotto_completed' | 'invitation_received';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  lottoId?: string;
}

// User settings interface
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    contributionAlerts: boolean;
    winnerNotifications: boolean;
  };
  defaultCoinType: CoinType;
  language: string;
  timezone: string;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Transaction interface
export interface Transaction {
  id: string;
  type: 'create' | 'join' | 'contribute' | 'distribute';
  lottoId: string;
  participant: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  txHash?: string;
}

// Wallet interface
export interface WalletInfo {
  address: string;
  balance: number;
  coinType: CoinType;
  isConnected: boolean;
}

// Legacy type aliases for backward compatibility
export type Tontine = Lotto;
export type TontineStatus = LottoStatus;
export type CreateTontineForm = CreateLottoForm;
export type JoinTontineForm = JoinLottoForm;
export type TontineStats = LottoStats;
