'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWalletInfo } from '../../src/hooks/useWallet';
import { useTontine } from '../../src/hooks/useTontine';
import { Lotto, LottoStatus, CoinType } from '../../src/types/tontine';
import { ConnectButton } from '../../components/ConnectButton';
import { 
  Users, 
  Coins, 
  Target, 
  Trophy,
  ArrowLeft,
  Share2,
  Copy,
  CheckCircle,
  Clock,
  Crown,
  Shield
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function LottoRoom() {
  const params = useParams();
  const router = useRouter();
  const { currentAccount } = useWalletInfo();
  const { getTontineInfo, contribute, selectBeneficiary, isLoading } = useTontine();
  const [lotto, setLotto] = useState<Lotto | null>(null);
  const [isLoadingLotto, setIsLoadingLotto] = useState(true);
  const [isContributing, setIsContributing] = useState(false);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [copied, setCopied] = useState(false);

  const lottoId = params.id as string;

  useEffect(() => {
    if (lottoId) {
      loadLotto();
    }
  }, [lottoId]);

  const loadLotto = async () => {
    setIsLoadingLotto(true);
    try {
      const lottoData = await getTontineInfo(lottoId);
      if (lottoData) {
        setLotto(lottoData);
      } else {
        toast.error('Lotto not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading lotto:', error);
      toast.error('Failed to load lotto');
      router.push('/');
    } finally {
      setIsLoadingLotto(false);
    }
  };

  const handleContribute = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!lotto) return;

    setIsContributing(true);
    try {
      // In a real implementation, you would pass the actual coin object
      // For now, we'll simulate the contribution
      await contribute(lottoId, 'mock-coin-id');
      toast.success('🎉 Contribution successful!');
      await loadLotto(); // Refresh lotto data
    } catch (error) {
      console.error('Failed to contribute:', error);
      toast.error('Failed to contribute. Please try again.');
    } finally {
      setIsContributing(false);
    }
  };

  const handleSelectWinner = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!lotto) return;

    setIsSelectingWinner(true);
    try {
      await selectBeneficiary(lottoId);
      toast.success('🎉 Winner selected!');
      await loadLotto(); // Refresh lotto data
    } catch (error) {
      console.error('Failed to select winner:', error);
      toast.error('Failed to select winner. Please try again.');
    } finally {
      setIsSelectingWinner(false);
    }
  };

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/join/${lottoId}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy invite link');
    }
  };

  const getStatusBadge = (status: LottoStatus) => {
    switch (status) {
      case LottoStatus.CREATED:
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Open</Badge>;
      case LottoStatus.ACTIVE:
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400">Active</Badge>;
      case LottoStatus.COMPLETED:
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Completed</Badge>;
      case LottoStatus.CANCELLED:
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Debug: Log the lotto data structure
  if (lotto) {
    console.log('🔍 Lotto data structure:', lotto);
    console.log('🔍 Participants type:', typeof lotto.participants, lotto.participants);
    console.log('🔍 Paid participants type:', typeof lotto.paidParticipants, lotto.paidParticipants);
  }

  const isCreator = currentAccount && lotto && currentAccount.address === lotto.creator;
  const isParticipant = currentAccount && lotto && Array.isArray(lotto.participants) && lotto.participants.includes(currentAccount.address);
  const hasContributed = currentAccount && lotto && Array.isArray(lotto.paidParticipants) && lotto.paidParticipants.includes(currentAccount.address);
  const allParticipantsPaid = lotto && Array.isArray(lotto.paidParticipants) && lotto.paidParticipants.length === lotto.maxParticipants;
  const canSelectWinner = isCreator && allParticipantsPaid && !lotto.winnerSelected;

  if (isLoadingLotto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/70">Loading lotto...</p>
        </div>
      </div>
    );
  }

  if (!lotto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">Lotto Not Found</CardTitle>
            <CardDescription className="text-white/70 text-center">
              The lotto you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full bg-primary-600 hover:bg-primary-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-white text-xl font-bold">{lotto.name}</h1>
                <p className="text-white/70 text-sm">{getStatusBadge(lotto.status)}</p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Lotto Overview */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-primary-400" />
                Lotto Overview
              </CardTitle>
              <CardDescription className="text-white/70">
                {lotto.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    <span className="text-white/70">Participants</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {Array.isArray(lotto.participants) ? lotto.participants.length : 0} / {lotto.maxParticipants}
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Coins className="w-5 h-5 text-primary-400" />
                    <span className="text-white/70">Entry Fee</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {lotto.contributionAmount} {lotto.coinType}
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="w-5 h-5 text-primary-400" />
                    <span className="text-white/70">Total Pool</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {lotto.maxParticipants * lotto.contributionAmount} {lotto.coinType}
                  </p>
                </div>
              </div>

              {/* Zero Risk Guarantee */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Zero Risk Guarantee</span>
                </div>
                <p className="text-white/70 text-sm">
                  Everyone gets their {lotto.contributionAmount} {lotto.coinType} back regardless of the outcome. 
                  Only the staking yield is at stake!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contribution Section */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  Contribute
                </CardTitle>
                <CardDescription className="text-white/70">
                  Pay your entry fee to participate in the lotto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!currentAccount ? (
                  <div className="text-center space-y-4">
                    <p className="text-white/70">Connect your wallet to contribute</p>
                    <ConnectButton />
                  </div>
                ) : hasContributed ? (
                  <div className="text-center space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                    <p className="text-green-400 font-medium">You've already contributed!</p>
                    <p className="text-white/70 text-sm">
                      You'll get your {lotto.contributionAmount} {lotto.coinType} back when the lotto ends.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Entry Fee:</span>
                        <span className="text-white font-bold">
                          {lotto.contributionAmount} {lotto.coinType}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleContribute}
                      disabled={isContributing || isLoading}
                      className="w-full bg-primary-600 hover:bg-primary-700"
                    >
                      {isContributing || isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Contributing...
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4 mr-2" />
                          Contribute {lotto.contributionAmount} {lotto.coinType}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Winner Selection */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Winner Selection
                </CardTitle>
                <CardDescription className="text-white/70">
                  Select the winner when all participants have contributed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lotto.winnerSelected ? (
                  <div className="text-center space-y-4">
                    <Crown className="w-12 h-12 text-yellow-400 mx-auto" />
                    <p className="text-yellow-400 font-medium">Winner Selected!</p>
                    <p className="text-white/70 text-sm">
                      Winner: {lotto.winner?.slice(0, 6)}...{lotto.winner?.slice(-4)}
                    </p>
                  </div>
                ) : canSelectWinner ? (
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Ready to select winner</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleSelectWinner}
                      disabled={isSelectingWinner || isLoading}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isSelectingWinner || isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Selecting...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Select Winner
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <Clock className="w-12 h-12 text-white/30 mx-auto" />
                    <p className="text-white/70">
                      {allParticipantsPaid 
                        ? "Waiting for creator to select winner"
                        : `Waiting for ${lotto.maxParticipants - (Array.isArray(lotto.paidParticipants) ? lotto.paidParticipants.length : 0)} more contributions`
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invite Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Invite Friends
              </CardTitle>
              <CardDescription className="text-white/70">
                Share this lotto with friends to fill it up faster
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1 bg-white/5 rounded-lg p-3">
                  <p className="text-white/70 text-sm mb-1">Invite Link:</p>
                  <p className="text-white font-mono text-sm break-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/join/${lottoId}` : ''}
                  </p>
                </div>
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
