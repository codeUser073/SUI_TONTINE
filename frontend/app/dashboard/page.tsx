'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '../src/utils/formatting';
import { useWalletInfo } from '../src/hooks/useWallet';
import { useTontine } from '../src/hooks/useTontine';
import { Lotto, LottoStatus } from '../src/types/tontine';
import { ConnectButton } from '../components/ConnectButton';
import { 
  Users, 
  Coins, 
  Calendar, 
  Target, 
  TrendingUp,
  Plus,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Filter,
  Crown,
  UserPlus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { currentAccount } = useWalletInfo();
  const { getUserTontines, contribute, selectBeneficiary, isLoading } = useTontine();
  const [lottos, setLottos] = useState<Lotto[]>([]);
  const [isLoadingLottos, setIsLoadingLottos] = useState(true);
  const [filter, setFilter] = useState<'all' | 'created' | 'joined' | 'active' | 'completed'>('all');

  // TODO: Implement lottos loading
  useEffect(() => {
    const loadLottos = async () => {
      if (!currentAccount) return;
      
      setIsLoadingLottos(true);
      try {
        const userLottos = await getUserTontines();
        setLottos(userLottos);
      } catch (error) {
        console.error('Failed to load lottos:', error);
        toast.error('Failed to load your lottos');
      } finally {
        setIsLoadingLottos(false);
      }
    };

    loadLottos();
  }, [currentAccount, getUserTontines]);

  // TODO: Implement contribution
  const handleContribute = async (lottoId: string) => {
    try {
      // For now, we'll use a placeholder coin ID
      // In a real implementation, you would get the user's SUI coin ID
      const paymentCoinId = 'placeholder-coin-id';
      await contribute(lottoId, paymentCoinId);
      toast.success('Contribution successful!');
      // TODO: Refresh lotto data
    } catch (error) {
      console.error('Failed to contribute:', error);
      toast.error('Failed to contribute. Please try again.');
    }
  };

  // TODO: Implement winner selection
  const handleSelectWinner = async (lottoId: string) => {
    try {
      await selectBeneficiary(lottoId);
      toast.success('Winner selected successfully!');
      // TODO: Refresh lotto data
    } catch (error) {
      console.error('Failed to select winner:', error);
      toast.error('Failed to select winner. Please try again.');
    }
  };

  // ✅ Enhanced status badge with proper LottoStatus enum
  const getStatusBadge = (status: LottoStatus) => {
    switch (status) {
      case LottoStatus.CREATED:
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Created</Badge>;
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

  // ✅ Check if user is the creator of a lotto
  const isCreator = (lotto: Lotto) => {
    return currentAccount?.address === lotto.creator;
  };

  // ✅ Check if user has contributed to current round
  const hasContributed = (lotto: Lotto) => {
    return lotto.paidParticipants.includes(currentAccount?.address || '');
  };

  // ✅ Check if user is the winner
  const isWinner = (lotto: Lotto) => {
    return lotto.winner === currentAccount?.address;
  };

  // ✅ Filter lottos based on selected filter
  const filteredLottos = lottos.filter(lotto => {
    switch (filter) {
      case 'created':
        return isCreator(lotto);
      case 'joined':
        return !isCreator(lotto);
      case 'active':
        return lotto.status === LottoStatus.ACTIVE;
      case 'completed':
        return lotto.status === LottoStatus.COMPLETED;
      default:
        return true;
    }
  });

  // TODO: Implement wallet connection check
  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <Target className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <CardTitle className="text-2xl font-bold text-white">Connect Your Wallet</CardTitle>
                <CardDescription className="text-white/70">
                  You need to connect your wallet to view your lottos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
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
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
                <span className="text-white text-xl font-bold">Yield Lotto</span>
            </Link>
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  {currentAccount ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}` : 'Not connected'}
                </p>
                <p className="text-white/60 text-xs">
                  {lottos.length} lottos • {lottos.filter(t => t.status === LottoStatus.ACTIVE).length} active
                </p>
              </div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">My Dartes</h1>
              <p className="text-white/70">
                Manage your dartes and track your contributions.
              </p>
            </div>
            
            <Link href="/create">
              <Button className="bg-primary-600 hover:bg-primary-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Total Lottos</CardTitle>
                <Target className="h-4 w-4 text-primary-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{lottos.length}</div>
                <p className="text-xs text-white/60">
                  {lottos.filter(t => isCreator(t)).length} created, {lottos.filter(t => !isCreator(t)).length} joined
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Active</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {lottos.filter(t => t.status === LottoStatus.ACTIVE).length}
                </div>
                <p className="text-xs text-white/60">
                  {lottos.filter(t => t.status === LottoStatus.ACTIVE && !hasContributed(t)).length} need contribution
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {lottos.filter(t => t.status === LottoStatus.COMPLETED).length}
                </div>
                <p className="text-xs text-white/60">
                  {lottos.filter(t => t.status === LottoStatus.COMPLETED && isWinner(t)).length} as winner
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Total Pool Value</CardTitle>
                <Coins className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(lottos.reduce((sum, t) => sum + t.totalContributed, 0))} SUI
                </div>
                <p className="text-xs text-white/60">
                  {lottos.filter(t => t.status === LottoStatus.COMPLETED && isWinner(t)).length} lottos won
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-primary-600' : 'border-white/20 text-white hover:bg-white/10'}
            >
              <Filter className="w-4 h-4 mr-2" />
              All ({lottos.length})
            </Button>
            <Button
              variant={filter === 'created' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('created')}
              className={filter === 'created' ? 'bg-primary-600' : 'border-white/20 text-white hover:bg-white/10'}
            >
              <Crown className="w-4 h-4 mr-2" />
              Created ({lottos.filter(t => isCreator(t)).length})
            </Button>
            <Button
              variant={filter === 'joined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('joined')}
              className={filter === 'joined' ? 'bg-primary-600' : 'border-white/20 text-white hover:bg-white/10'}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Joined ({lottos.filter(t => !isCreator(t)).length})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
              className={filter === 'active' ? 'bg-primary-600' : 'border-white/20 text-white hover:bg-white/10'}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Active ({lottos.filter(t => t.status === LottoStatus.ACTIVE).length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'bg-primary-600' : 'border-white/20 text-white hover:bg-white/10'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed ({lottos.filter(t => t.status === LottoStatus.COMPLETED).length})
            </Button>
          </div>

          {/* Action Required Section */}
          {lottos.filter(t => t.status === LottoStatus.ACTIVE && !hasContributed(t)).length > 0 && (
            <Card className="bg-yellow-500/10 backdrop-blur-sm border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Action Required
                </CardTitle>
                <CardDescription className="text-yellow-300/70">
                  You have {lottos.filter(t => t.status === LottoStatus.ACTIVE && !hasContributed(t)).length} lottos that need your contribution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lottos
                    .filter(t => t.status === LottoStatus.ACTIVE && !hasContributed(t))
                    .slice(0, 3)
                    .map((lotto) => (
                      <div key={lotto.id} className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">{lotto.name}</h4>
                        <p className="text-white/70 text-sm mb-3">
                          Contribute {lotto.contributionAmount} {lotto.coinType}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleContribute(lotto.id)}
                          disabled={isLoading}
                          className="bg-yellow-600 hover:bg-yellow-700 w-full"
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          Contribute Now
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lottos List */}
          <div className="space-y-6">
            {isLoadingLottos ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/70">Loading your lottos...</p>
              </div>
            ) : filteredLottos.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="text-center py-12">
                  <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Lottos Yet</h3>
                  <p className="text-white/70 mb-6">
                    You haven't created or joined any lottos yet.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/create">
                      <Button className="bg-primary-600 hover:bg-primary-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Lotto
                      </Button>
                    </Link>
                    <Link href="/join">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Users className="w-4 h-4 mr-2" />
                        Join Lotto
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredLottos.map((lotto) => (
                  <Card key={lotto.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg text-white">{lotto.name}</CardTitle>
                            {isCreator(lotto) && (
                              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 text-xs">
                                Creator
                              </Badge>
                            )}
                            {isWinner(lotto) && (
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs">
                                Winner
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-white/70">
                            {lotto.description}
                          </CardDescription>
                        </div>
                        {getStatusBadge(lotto.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-primary-400" />
                            <span className="text-white/70 text-sm">Participants</span>
                          </div>
                          <p className="text-white font-medium">
                            {lotto.participants.length} / {lotto.maxParticipants}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4 text-primary-400" />
                            <span className="text-white/70 text-sm">Contribution</span>
                          </div>
                          <p className="text-white font-medium">
                            {lotto.contributionAmount} {lotto.coinType}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-primary-400" />
                            <span className="text-white/70 text-sm">Status</span>
                          </div>
                          <p className="text-white font-medium">
                            {lotto.status === LottoStatus.CREATED ? 'Open' : 
                             lotto.status === LottoStatus.ACTIVE ? 'Active' : 
                             lotto.status === LottoStatus.COMPLETED ? 'Completed' : 'Cancelled'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-primary-400" />
                            <span className="text-white/70 text-sm">Total Pool</span>
                          </div>
                          <p className="text-white font-medium text-sm">
                            {lotto.maxParticipants * lotto.contributionAmount} {lotto.coinType}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/20 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-white/70">Total Pool:</span>
                          <span className="text-white font-bold">
                            {lotto.maxParticipants * lotto.contributionAmount} {lotto.coinType}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          {lotto.status === LottoStatus.ACTIVE && (
                            <>
                              {!hasContributed(lotto) && (
                                <Button
                                  size="sm"
                                  onClick={() => handleContribute(lotto.id)}
                                  disabled={isLoading}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Coins className="w-4 h-4 mr-2" />
                                  Contribute
                                </Button>
                              )}
                              
                              {hasContributed(lotto) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="border-green-500/20 text-green-400"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Contributed
                                </Button>
                              )}
                              
                              {isCreator(lotto) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSelectWinner(lotto.id)}
                                  disabled={isLoading}
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <Target className="w-4 h-4 mr-2" />
                                  Select Winner
                                </Button>
                              )}
                            </>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
