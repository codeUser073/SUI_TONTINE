'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '../../src/utils/formatting';
import { useParams } from 'next/navigation';
import { useWalletInfo } from '../../src/hooks/useWallet';
import { useTontine } from '../../src/hooks/useTontine';
import { ConnectButton } from '../../components/ConnectButton';
import { 
  Users, 
  Coins, 
  Target, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Zap,
  Crown
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { mockAvailableLottos } from '../../src/data/mockLottos';
import { Lotto, LottoStatus } from '../../src/types/tontine';

export default function JoinLottoPage() {
  const params = useParams();
  const lottoId = params?.id as string;
  const { currentAccount } = useWalletInfo();
  const { contribute, isLoading } = useTontine();
  const [lotto, setLotto] = useState<Lotto | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (lottoId) {
      // Find the lotto from mock data
      const foundLotto = mockAvailableLottos.find(l => l.id === lottoId);
      if (foundLotto) {
        setLotto(foundLotto);
      }
    }
  }, [lottoId]);

  const handleJoinLotto = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!lotto) {
      toast.error('Lotto not found');
      return;
    }

    if (lotto.participants.length >= lotto.maxParticipants) {
      toast.error('This lotto is full');
      return;
    }

    setIsJoining(true);
    try {
      // For now, we'll use a placeholder coin ID
      // In a real implementation, you would get the user's SUI coin ID
      const paymentCoinId = 'placeholder-coin-id';
      await contribute(lotto.id, paymentCoinId);
      toast.success('Successfully joined the lotto!');
      // TODO: Redirect to dashboard or lotto details
    } catch (error) {
      console.error('Failed to join lotto:', error);
      toast.error('Failed to join lotto. Please try again.');
    } finally {
      setIsJoining(false);
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

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (!lotto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-white">Lotto Not Found</CardTitle>
                <CardDescription className="text-white/70">
                  The lotto you're looking for doesn't exist or has been removed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xl font-bold">Yield Lotto</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back Button */}
          <Link href="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Available Lottos
            </Button>
          </Link>

          {/* Lotto Details */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl text-white">{lotto.name}</CardTitle>
                  <CardDescription className="text-white/70 text-lg">
                    {lotto.description}
                  </CardDescription>
                </div>
                {getStatusBadge(lotto.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    <span className="text-white/70">Participants</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {lotto.participants.length} / {lotto.maxParticipants}
                  </div>
                  <div className="text-sm text-white/60">
                    {lotto.maxParticipants - lotto.participants.length} spots remaining
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Coins className="w-5 h-5 text-primary-400" />
                    <span className="text-white/70">Entry Fee</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {lotto.contributionAmount} {lotto.coinType}
                  </div>
                  <div className="text-sm text-white/60">
                    One-time payment
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-primary-400" />
                    <span className="text-white/70">Total Pool</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {lotto.maxParticipants * lotto.contributionAmount} {lotto.coinType}
                  </div>
                  <div className="text-sm text-white/60">
                    When full
                  </div>
                </div>
              </div>

              {/* Yield Information */}
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-6 border border-green-500/20">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Yield Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-white/70 text-sm mb-1">Potential Annual Yield</div>
                    <div className="text-2xl font-bold text-green-400">~5% APY</div>
                  </div>
                  <div>
                    <div className="text-white/70 text-sm mb-1">Estimated Winner Reward</div>
                    <div className="text-2xl font-bold text-green-400">
                      ~{formatCurrency(lotto.maxParticipants * lotto.contributionAmount * 0.05)} {lotto.coinType}
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Shield className="w-6 h-6 text-primary-400 mr-2" />
                  How This Lotto Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Pay Entry Fee</h4>
                        <p className="text-white/70 text-sm">
                          Contribute {lotto.contributionAmount} {lotto.coinType} to join this lotto.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Funds Get Staked</h4>
                        <p className="text-white/70 text-sm">
                          All contributions are automatically staked to earn yield on Sui.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Winner Selected</h4>
                        <p className="text-white/70 text-sm">
                          When full, one participant is randomly selected as the winner.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Zero Risk Payout</h4>
                        <p className="text-white/70 text-sm">
                          Winner gets deposit + all yield. Everyone else gets their deposit back.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <div className="border-t border-white/20 pt-6">
                {!currentAccount ? (
                  <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto" />
                    <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
                    <p className="text-white/70">
                      You need to connect your wallet to join this lotto.
                    </p>
                    <ConnectButton />
                  </div>
                ) : lotto.participants.length >= lotto.maxParticipants ? (
                  <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                    <h3 className="text-xl font-bold text-white">Lotto Full</h3>
                    <p className="text-white/70">
                      This lotto has reached its maximum number of participants.
                    </p>
                    <Link href="/">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Find Another Lotto
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Ready to Join?</h3>
                      <p className="text-white/70 mb-4">
                        You'll contribute <strong>{lotto.contributionAmount} {lotto.coinType}</strong> and have a chance to win all the staking rewards!
                      </p>
                      <Button
                        onClick={handleJoinLotto}
                        disabled={isJoining || isLoading}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isJoining || isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Crown className="w-5 h-5 mr-2" />
                            Join Lotto - {lotto.contributionAmount} {lotto.coinType}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
