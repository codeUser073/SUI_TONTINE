import { useState, useCallback } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { CreateTontineForm, Tontine, Invitation, CoinType } from '../types/tontine';
import { getTontinePackageId } from '../lib/networkConfig';
import QRCode from 'qrcode';

export interface InvitationData {
  tontineId: string;
  tontineName: string;
  invitationCode: string;
  maxParticipants: number;
  contributionAmount: number;
  coinType: string;
  deadlineInterval: number;
  invitationUrl: string;
  qrCodeDataUrl?: string;
}

export const useTontine = () => {
  const suiClient = useSuiClient();
  const { mutate: signAndExecute, isPending, isSuccess } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);

  // ✅ Implement create_tontine function with invitation generation
  const createTontine = useCallback(async (formData: CreateTontineForm) => {
    setIsLoading(true);
    try {
      console.log('Creating tontine:', formData);
      
      // Create transaction for tontine creation
      const tx = new Transaction();
      
      // TODO: Replace with actual package ID when smart contract is deployed
      const packageId = getTontinePackageId();
      
      // Convert contribution amount to MIST (1 SUI = 1e9 MIST)
      const contributionInMist = Math.floor(formData.contributionAmount * 1e9);
      
      // Call the create_tontine function on the smart contract
      tx.moveCall({
        target: `${packageId}::tontine::create_tontine`,
        arguments: [
          tx.pure.string(formData.name),
          tx.pure.string(formData.description),
          tx.pure.u64(formData.maxParticipants),
          tx.pure.u64(contributionInMist),
          tx.pure.u64(formData.deadlineInterval * 24 * 60 * 60 * 1000), // Convert days to milliseconds
          tx.pure.string(formData.coinType),
        ],
      });

      // Execute the transaction
      const result = await signAndExecute({ transaction: tx });
      
      console.log('Tontine created successfully:', result);
      
      // Generate invitation data after successful creation
      const invitationCode = generateInvitationCode();
      const tontineId = `temp_${Date.now()}`; // Use temporary ID for now, will be replaced with actual tontine ID from smart contract
      const invitationUrl = `${window.location.origin}/join?code=${invitationCode}`;
      
      // Generate QR code
      let qrCodeDataUrl = '';
      try {
        qrCodeDataUrl = await QRCode.toDataURL(invitationUrl);
      } catch (error) {
        console.warn('Failed to generate QR code:', error);
      }
      
      const invitation: InvitationData = {
        tontineId,
        tontineName: formData.name,
        invitationCode,
        maxParticipants: formData.maxParticipants,
        contributionAmount: formData.contributionAmount,
        coinType: formData.coinType,
        deadlineInterval: formData.deadlineInterval,
        invitationUrl,
        qrCodeDataUrl,
      };
      
      setInvitationData(invitation);
      
      return { result, invitation };
      
    } catch (error) {
      console.error('Error creating tontine:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecute]);

  // ✅ Implement join_tontine function with smart contract integration
  const joinTontine = useCallback(async (invitationCode: string) => {
    setIsLoading(true);
    try {
      console.log('Joining tontine with code:', invitationCode);
      
      // First, get tontine info by invitation code
      const tontine = await getTontineByInvitation(invitationCode);
      if (!tontine) {
        throw new Error('Invalid invitation code');
      }
      
      // Create transaction for joining tontine
      const tx = new Transaction();
      const packageId = getTontinePackageId();
      
      // Call the join_tontine function on the smart contract
      tx.moveCall({
        target: `${packageId}::tontine::join_tontine`,
        arguments: [
          tx.pure.id(tontine.id),
          tx.pure.string(invitationCode),
        ],
      });
      
      // Execute the transaction
      const result = await signAndExecute({ transaction: tx });
      
      console.log('Successfully joined tontine:', result);
      return result;
      
    } catch (error) {
      console.error('Error joining tontine:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecute]);

  // ✅ Implement contribute function with smart contract integration
  const contribute = useCallback(async (tontineId: string, paymentCoinId: string) => {
    setIsLoading(true);
    try {
      console.log('Contributing to tontine:', tontineId, paymentCoinId);
      
      // Create transaction for contribution
      const tx = new Transaction();
      const packageId = getTontinePackageId();
      
      // Call the contribute function on the smart contract
      tx.moveCall({
        target: `${packageId}::tontine::contribute`,
        arguments: [
          tx.pure.id(tontineId),
          tx.pure.id(paymentCoinId),
        ],
      });
      
      // Execute the transaction
      const result = await signAndExecute({ transaction: tx });
      
      console.log('Successfully contributed to tontine:', result);
      return result;
      
    } catch (error) {
      console.error('Error contributing:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecute]);

  // ✅ Implement select_beneficiary function with smart contract integration
  const selectBeneficiary = useCallback(async (tontineId: string) => {
    setIsLoading(true);
    try {
      console.log('Selecting beneficiary for tontine:', tontineId);
      
      // Create transaction for beneficiary selection
      const tx = new Transaction();
      const packageId = getTontinePackageId();
      
      // Call the select_beneficiary function on the smart contract
      tx.moveCall({
        target: `${packageId}::tontine::select_beneficiary`,
        arguments: [
          tx.pure.id(tontineId),
        ],
      });
      
      // Execute the transaction
      const result = await signAndExecute({ transaction: tx });
      
      console.log('Successfully selected beneficiary:', result);
      return result;
      
    } catch (error) {
      console.error('Error selecting beneficiary:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecute]);

  // ✅ Implement get_tontine_info function with blockchain integration
  const getTontineInfo = useCallback(async (tontineId: string): Promise<Tontine | null> => {
    try {
      console.log('Getting tontine info for:', tontineId);
      
      // Fetch tontine object from blockchain
      const tontineObject = await suiClient.getObject({
        id: tontineId,
        options: { showContent: true }
      });
      
      if (tontineObject.data?.content?.dataType === 'moveObject') {
        const fields = tontineObject.data.content.fields as any;
        return {
          id: tontineId,
          creator: fields.creator || '',
          name: fields.name || '',
          description: fields.description || '',
          maxParticipants: parseInt(fields.max_participants || '0'),
          contributionAmount: parseInt(fields.contribution_amount || '0') / 1e9, // Convert from MIST
          deadlineInterval: parseInt(fields.deadline_interval || '0') / (24 * 60 * 60 * 1000), // Convert to days
          totalRounds: parseInt(fields.total_rounds || '0'),
          currentRound: parseInt(fields.current_round || '0'),
          status: parseInt(fields.status || '0'),
          participants: fields.participants || [],
          paidParticipants: fields.paid_participants || [],
          beneficiaries: fields.beneficiaries || [],
          totalContributed: parseInt(fields.total_contributed || '0') / 1e9,
          createdAt: parseInt(fields.created_at || '0'),
          nextDeadline: parseInt(fields.next_deadline || '0'),
          coinType: (fields.coin_type || 'SUI') as CoinType,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting tontine info:', error);
      return null;
    }
  }, [suiClient]);

  // TODO: Implement get_tontine_by_invitation function
  const getTontineByInvitation = useCallback(async (invitationCode: string): Promise<Tontine | null> => {
    try {
      // TODO: Search for tontine via invitation code
      console.log('Searching tontine by invitation:', invitationCode);
      
      // Mock data for testing
      if (invitationCode === 'TONTINE_TEST123') {
        return {
          id: '0x123...abc',
          creator: '0x456...def',
          name: 'Vacation Fund 2024',
          description: 'Collective savings for summer vacation',
          maxParticipants: 12,
          contributionAmount: 1,
          deadlineInterval: 30,
          totalRounds: 12,
          currentRound: 0,
          status: 0,
          participants: ['0x456...def', '0x789...ghi'],
          paidParticipants: [],
          beneficiaries: [],
          totalContributed: 0,
          createdAt: Date.now(),
          nextDeadline: Date.now() + (30 * 24 * 60 * 60 * 1000),
          coinType: CoinType.SUI,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error searching by invitation:', error);
      return null;
    }
  }, []);

  // TODO: Implement get_user_tontines function
  const getUserTontines = useCallback(async (): Promise<Tontine[]> => {
    try {
      // TODO: Fetch all user tontines from blockchain
      console.log('Getting user tontines');
      
      // Mock data for testing
      return [
        {
          id: '0x123...abc',
          creator: '0x456...def',
          name: 'My Tontine 1',
          description: 'First tontine',
          maxParticipants: 6,
          contributionAmount: 0.5,
          deadlineInterval: 15,
          totalRounds: 6,
          currentRound: 2,
          status: 1,
          participants: ['0x456...def', '0x789...ghi'],
          paidParticipants: ['0x456...def'],
          beneficiaries: ['0x789...ghi'],
          totalContributed: 1,
          createdAt: Date.now() - (60 * 24 * 60 * 60 * 1000),
          nextDeadline: Date.now() + (5 * 24 * 60 * 60 * 1000),
          coinType: CoinType.SUI,
        }
      ];
    } catch (error) {
      console.error('Error getting user tontines:', error);
      return [];
    }
  }, []);

  // ✅ Implement create_invitation function with smart contract integration
  const createInvitation = useCallback(async (tontineId: string, invitee: string) => {
    setIsLoading(true);
    try {
      console.log('Creating invitation for tontine:', tontineId, 'invitee:', invitee);
      
      // Create transaction for invitation creation
      const tx = new Transaction();
      const packageId = getTontinePackageId();
      
      // Call the create_invitation function on the smart contract
      tx.moveCall({
        target: `${packageId}::invitation::create_invitation`,
        arguments: [
          tx.pure.id(tontineId),
          tx.pure.address(invitee),
        ],
      });
      
      // Execute the transaction
      const result = await signAndExecute({ transaction: tx });
      
      console.log('Successfully created invitation:', result);
      return result;
      
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecute]);

  // ✅ Generate invitation data for display
  const generateInvitationData = useCallback(async (tontine: Tontine): Promise<InvitationData> => {
    const invitationCode = generateInvitationCode();
    const invitationUrl = `${window.location.origin}/join?code=${invitationCode}`;
    
    // Generate QR code
    let qrCodeDataUrl = '';
    try {
      qrCodeDataUrl = await QRCode.toDataURL(invitationUrl);
    } catch (error) {
      console.warn('Failed to generate QR code:', error);
    }
    
    return {
      tontineId: tontine.id,
      tontineName: tontine.name,
      invitationCode,
      maxParticipants: tontine.maxParticipants,
      contributionAmount: tontine.contributionAmount,
      coinType: tontine.coinType,
      deadlineInterval: tontine.deadlineInterval,
      invitationUrl,
      qrCodeDataUrl,
    };
  }, []);

  // ✅ Clear invitation data
  const clearInvitationData = useCallback(() => {
    setInvitationData(null);
  }, []);

  return {
    // State
    isLoading,
    isPending,
    isSuccess,
    invitationData,
    
    // Main actions
    createTontine,
    joinTontine,
    contribute,
    selectBeneficiary,
    
    // Data fetching
    getTontineInfo,
    getTontineByInvitation,
    getUserTontines,
    
    // Invitations
    createInvitation,
    generateInvitationData,
    clearInvitationData,
  };
};

// ✅ Helper function to generate invitation code
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'DARTE_';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
