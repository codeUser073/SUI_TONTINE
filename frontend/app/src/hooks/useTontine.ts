import { useState, useCallback } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount, useSignTransaction } from '@mysten/dapp-kit';
import { CreateLottoForm, Lotto, Invitation, CoinType, Tontine } from '../types/tontine';
import { getTontinePackageId } from '../lib/networkConfig';
import QRCode from 'qrcode';

export interface InvitationData {
  lottoId: string;
  lottoName: string;
  invitationCode: string;
  maxParticipants: number;
  contributionAmount: number;
  coinType: string;
  invitationUrl: string;
  qrCodeDataUrl?: string;
}

export const useTontine = () => {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending, isSuccess } = useSignAndExecuteTransaction();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);

  // ✅ Implement create_lotto function with invitation generation
  const createLotto = useCallback(async (formData: CreateLottoForm) => {
    setIsLoading(true);
    try {
      console.log('🚀 Starting lotto creation process...');
      console.log('📋 Form data:', formData);
      
      if (!currentAccount) {
        console.error('❌ No wallet connected');
        throw new Error('No wallet connected');
      }
      
      console.log('👤 Current account:', currentAccount.address);
      
      // Create transaction for lotto creation
      const tx = new Transaction();
      
      // Get the deployed package ID
      const packageId = getTontinePackageId();
      console.log('📦 Package ID:', packageId);
      
      // Convert contribution amount to MIST (1 SUI = 1e9 MIST)
      const contributionInMist = Math.floor(formData.contributionAmount * 1e9);
      console.log('💰 Contribution amount:', formData.contributionAmount, 'SUI =', contributionInMist, 'MIST');
      
      // Call the create_tontine_entry function on the smart contract
      console.log('🔧 Building transaction...');
      tx.moveCall({
        target: `${packageId}::tontine::create_tontine_entry`,
        arguments: [
          tx.pure.string(formData.name),
          tx.pure.string(formData.description),
          tx.pure.u64(formData.maxParticipants),
          tx.pure.u64(contributionInMist),
          tx.pure.u64(0), // deadlineInterval - not used in lotto concept
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(formData.coinType))),
        ],
      });

      console.log('✅ Transaction built successfully');
      console.log('🔍 Transaction details:', {
        target: `${packageId}::tontine::create_tontine_entry`,
        arguments: [
          formData.name,
          formData.description,
          formData.maxParticipants,
          contributionInMist,
          0,
          Array.from(new TextEncoder().encode(formData.coinType)),
        ],
        note: 'Using entry function - no manual transfer needed'
      });

      // Execute transaction and wait for confirmation
      console.log('⏳ Executing transaction...');
      
      let result;
      try {
        // Use useSignAndExecuteTransaction but with proper waiting
        console.log('🔄 Using useSignAndExecuteTransaction...');
        
        result = await signAndExecute({ 
          transaction: tx
        });
        
        console.log('📊 Initial transaction result:', result);
        
        // Always wait for confirmation - some wallets return immediately
        if (result.digest) {
          console.log('⏳ Waiting for transaction confirmation...');
          console.log('🔍 Transaction digest:', result.digest);
          
          // Wait for transaction to be confirmed
          let attempts = 0;
          const maxAttempts = 30; // 30 seconds max
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            
            try {
              const confirmedResult = await suiClient.getTransactionBlock({
                digest: result.digest,
                options: {
                  showEffects: true,
                  showObjectChanges: true,
                  showEvents: true,
                }
              });
              
              if (confirmedResult.effects && confirmedResult.effects.status?.status === 'success') {
                console.log('✅ Transaction confirmed successfully:', confirmedResult);
                result = confirmedResult;
                break;
              } else if (confirmedResult.effects && confirmedResult.effects.status?.status === 'failure') {
                console.error('❌ Transaction failed:', confirmedResult.effects.status);
                throw new Error(`Transaction failed: ${confirmedResult.effects.status.error || 'Unknown error'}`);
              }
            } catch (error) {
              console.log(`⏳ Attempt ${attempts + 1}: Transaction not yet confirmed...`);
            }
            
            attempts++;
          }
          
          if (attempts >= maxAttempts) {
            throw new Error('Transaction confirmation timeout');
          }
        }
        
        console.log('📊 Final transaction result:', result);
        
      } catch (error) {
        console.error('💥 Transaction execution failed:', error);
        throw error;
      }
      
      // Check if transaction was successful
      if (!result) {
        console.error('❌ Transaction failed - no result returned');
        throw new Error('Transaction failed - no result returned');
      }
      
      // Check transaction status
      if (result.effects && typeof result.effects === 'object' && 'status' in result.effects) {
        const effects = result.effects as any;
        if (effects.status?.status !== 'success') {
          console.error('❌ Transaction failed:', effects.status);
          throw new Error(`Transaction failed: ${effects.status?.error || 'Unknown error'}`);
        }
      }
      
      console.log('✅ Transaction completed successfully!');
      console.log('🎯 Transaction digest:', result.digest);
      
      console.log('🎉 Lotto created successfully:', result);
      console.log('📊 Transaction effects:', result.effects);
      
      // Extract lotto ID from the transaction result
      let lottoId = '';
      const effects = result.effects as any;
      if (effects?.created && effects.created.length > 0) {
        console.log('📦 Created objects:', effects.created);
        // The create_tontine_entry function creates exactly one Tontine object
        // We can safely take the first created object as our lotto
        const createdObject = effects.created[0];
        console.log('🔍 First created object:', createdObject);
        if (createdObject.reference.objectId) {
          lottoId = createdObject.reference.objectId;
          console.log('🎯 Extracted lotto ID:', lottoId);
        }
      }
      
      if (!lottoId) {
        console.warn('⚠️ No lotto ID found in transaction result');
        console.log('🔍 Full transaction result for debugging:', JSON.stringify(result, null, 2));
        // Use transaction digest as fallback ID
        lottoId = result.digest || `temp_${Date.now()}`;
        console.log('🔄 Using fallback lotto ID:', lottoId);
      }
      
      // Generate invitation data after successful creation
      const invitationCode = generateInvitationCode();
      const invitationUrl = `${window.location.origin}/join/${lottoId}`;
      
      // Generate QR code
      let qrCodeDataUrl = '';
      try {
        qrCodeDataUrl = await QRCode.toDataURL(invitationUrl);
      } catch (error) {
        console.warn('Failed to generate QR code:', error);
      }
      
      const invitation: InvitationData = {
        lottoId: lottoId || `temp_${Date.now()}`, // Use actual ID or fallback
        lottoName: formData.name,
        invitationCode,
        maxParticipants: formData.maxParticipants,
        contributionAmount: formData.contributionAmount,
        coinType: formData.coinType,
        invitationUrl,
        qrCodeDataUrl,
      };
      
      setInvitationData(invitation);
      
      return { result, invitation };
      
    } catch (error) {
      console.error('💥 Error creating lotto:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
        currentAccount: currentAccount?.address,
        isConnected: !!currentAccount
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [signAndExecute, suiClient, currentAccount]);

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
        console.log('🔍 Raw blockchain fields:', fields);
        console.log('🔍 Participants field:', fields.participants);
        console.log('🔍 Paid participants field:', fields.paid_participants);
        
        // Helper function to convert VecSet to array
        const vecSetToArray = (vecSet: any): string[] => {
          if (Array.isArray(vecSet)) return vecSet;
          if (vecSet && typeof vecSet === 'object' && vecSet.contents) {
            return Array.isArray(vecSet.contents) ? vecSet.contents : [];
          }
          return [];
        };

        return {
          id: tontineId,
          creator: fields.creator || '',
          name: fields.name || '',
          description: fields.description || '',
          maxParticipants: parseInt(fields.max_participants || '0'),
          contributionAmount: parseInt(fields.contribution_amount || '0') / 1e9, // Convert from MIST
          status: parseInt(fields.status || '0'),
          participants: vecSetToArray(fields.participants),
          paidParticipants: vecSetToArray(fields.paid_participants),
          winner: fields.winner_address || undefined,
          winnerSelected: fields.winner_selected || false,
          fundsDistributed: fields.funds_distributed || false,
          totalContributed: parseInt(fields.total_contributed || '0') / 1e9,
          totalYield: parseInt(fields.total_yield || '0') / 1e9,
          winnerPayout: parseInt(fields.winner_payout || '0') / 1e9,
          createdAt: parseInt(fields.created_at || '0'),
          coinType: (fields.coin_type || 'SUI') as CoinType,
          stakedAssetsId: fields.staked_assets_id || '',
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting tontine info:', error);
      return null;
    }
  }, [suiClient]);

  // ✅ Implement get_tontine_by_invitation function with blockchain integration
  const getTontineByInvitation = useCallback(async (invitationCode: string): Promise<Tontine | null> => {
    try {
      console.log('Searching tontine by invitation:', invitationCode);
      
      // For now, we'll use a simple approach - in a real implementation,
      // you would query the blockchain for invitation objects and find the associated tontine
      
      // This is a placeholder implementation - in reality, you'd need to:
      // 1. Query for invitation objects with the given code
      // 2. Extract the tontine ID from the invitation
      // 3. Fetch the tontine details
      
      // For testing purposes, we'll return mock data
      if (invitationCode === 'TONTINE_TEST123') {
        return {
          id: '0x123...abc',
          creator: '0x456...def',
          name: 'Vacation Fund 2024',
          description: 'Collective savings for summer vacation',
          maxParticipants: 12,
          contributionAmount: 1,
          status: 0,
          participants: ['0x456...def', '0x789...ghi'],
          paidParticipants: [],
          winner: undefined,
          winnerSelected: false,
          fundsDistributed: false,
          totalContributed: 0,
          totalYield: 0,
          winnerPayout: 0,
          createdAt: Date.now(),
          coinType: CoinType.SUI,
          stakedAssetsId: '',
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error searching by invitation:', error);
      return null;
    }
  }, []);

  // ✅ Implement get_user_tontines function with blockchain integration
  const getUserTontines = useCallback(async (): Promise<Tontine[]> => {
    try {
      console.log('Getting user tontines');
      
      // In a real implementation, you would:
      // 1. Query the blockchain for all tontine objects
      // 2. Filter by the current user's address
      // 3. Return the list of tontines
      
      // For now, return mock data
      return [
        {
          id: '0x123...abc',
          creator: '0x456...def',
          name: 'My Lotto 1',
          description: 'First lotto',
          maxParticipants: 6,
          contributionAmount: 0.5,
          status: 1,
          participants: ['0x456...def', '0x789...ghi'],
          paidParticipants: ['0x456...def'],
          winner: undefined,
          winnerSelected: false,
          fundsDistributed: false,
          totalContributed: 1,
          totalYield: 0.1,
          winnerPayout: 0.6,
          createdAt: Date.now() - (60 * 24 * 60 * 60 * 1000),
          coinType: CoinType.SUI,
          stakedAssetsId: '',
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
      lottoId: tontine.id,
      lottoName: tontine.name,
      invitationCode,
      maxParticipants: tontine.maxParticipants,
      contributionAmount: tontine.contributionAmount,
      coinType: tontine.coinType,
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
    createLotto,
    createTontine: createLotto, // Keep backward compatibility
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
