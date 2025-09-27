'use client';

import { useState, useEffect } from 'react';
import { useWalletInfo } from '../src/hooks/useWallet';
import { useTontine } from '../src/hooks/useTontine';
import { Tontine, TontineStatus } from '../src/types/tontine';
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
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [isLoadingTontines, setIsLoadingTontines] = useState(true);
  const [filter, setFilter] = useState<'all' | 'created' | 'joined' | 'active' | 'completed'>('all');

  // TODO: Implement tontines loading
  useEffect(() => {
    const loadTontines = async () => {
      if (!currentAccount) return;
      
      setIsLoadingTontines(true);
      try {
        const userTontines = await getUserTontines();
        setTontines(userTontines);
      } catch (error) {
        console.error('Failed to load tontines:', error);
        toast.error('Failed to load your tontines');
      } finally {
        setIsLoadingTontines(false);
      }
    };

    loadTontines();
  }, [currentAccount, getUserTontines]);

  // TODO: Implement contribution
  const handleContribute = async (tontineId: string) => {
    try {
      await contribute(tontineId, 'payment-coin-id');
      toast.success('Contribution successful!');
      // TODO: Refresh tontine data
    } catch (error) {
      console.error('Failed to contribute:', error);
      toast.error('Failed to contribute. Please try again.');
    }
  };

  // TODO: Implement beneficiary selection
  const handleSelectBeneficiary = async (tontineId: string) => {
    try {
      await selectBeneficiary(tontineId);
      toast.success('Beneficiary selected successfully!');
      // TODO: Refresh tontine data
    } catch (error) {
      console.error('Failed to select beneficiary:', error);
      toast.error('Failed to select beneficiary. Please try again.');
    }
  };

  // ✅ Enhanced status badge with proper TontineStatus enum
  const getStatusBadge = (status: TontineStatus) => {
    switch (status) {
      case TontineStatus.CREATED:
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Created</Badge>;
      case TontineStatus.ACTIVE:
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400">Active</Badge>;
      case TontineStatus.COMPLETED:
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Completed</Badge>;
      case TontineStatus.CANCELLED:
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // ✅ Check if user is the creator of a tontine
  const isCreator = (tontine: Tontine) => {
    return currentAccount?.address === tontine.creator;
  };

  // ✅ Check if user has contributed to current round
  const hasContributed = (tontine: Tontine) => {
    return tontine.paidParticipants.includes(currentAccount?.address || '');
  };

  // ✅ Check if user is a beneficiary
  const isBeneficiary = (tontine: Tontine) => {
    return tontine.beneficiaries.includes(currentAccount?.address || '');
  };

  // ✅ Filter tontines based on selected filter
  const filteredTontines = tontines.filter(tontine => {
    switch (filter) {
      case 'created':
        return isCreator(tontine);
      case 'joined':
        return !isCreator(tontine);
      case 'active':
        return tontine.status === TontineStatus.ACTIVE;
      case 'completed':
        return tontine.status === TontineStatus.COMPLETED;
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
                  You need to connect your wallet to view your tontines.
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
              <span className="text-white text-xl font-bold">Darte</span>
            </Link>
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  {currentAccount ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}` : 'Not connected'}
                </p>
                <p className="text-white/60 text-xs">
                  {tontines.length} dartes • {tontines.filter(t => t.status === TontineStatus.ACTIVE).length} active
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
                <CardTitle className="text-sm font-medium text-white/70">Total Dartes</CardTitle>
                <Target className="h-4 w-4 text-primary-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{tontines.length}</div>
                <p className="text-xs text-white/60">
                  {tontines.filter(t => isCreator(t)).length} created, {tontines.filter(t => !isCreator(t)).length} joined
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
                  {tontines.filter(t => t.status === TontineStatus.ACTIVE).length}
                </div>
                <p className="text-xs text-white/60">
                  {tontines.filter(t => t.status === TontineStatus.ACTIVE && !hasContributed(t)).length} need contribution
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
                  {tontines.filter(t => t.status === TontineStatus.COMPLETED).length}
                </div>
                <p className="text-xs text-white/60">
                  {tontines.filter(t => t.status === TontineStatus.COMPLETED && isBeneficiary(t)).length} as beneficiary
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Total Contributed</CardTitle>
                <Coins className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {tontines.reduce((sum, t) => sum + t.totalContributed, 0).toFixed(2)} SUI
                </div>
                <p className="text-xs text-white/60">
                  {tontines.filter(t => t.status === TontineStatus.COMPLETED && isBeneficiary(t)).length} rounds won
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
              All ({tontines.length})
            </Button>
            <Button
              variant={filter === 'created' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('created')}
              className={filter === 'created' ? 'bg-primary-600' : 'border-white/20 text-white hover:bg-white/10'}
            >
              <Crown className="w-4 h-4 mr-2" />
              Created ({tontines.filter(t => isCreator(t)).length})
            </Button>
            <Button
              variant={filter === 'joined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('joined')}
              className={filter === 'joined' ? 'bg-primary-600' : 'border-white/20 text-white hover:bg-white/10'}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Joined ({tontines.filter(t => !isCreator(t)).length})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
              className={filter === 'active' ? 'bg-primary-600' : 'border-white/20 text-white hover:bg-white/10'}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Active ({tontines.filter(t => t.status === TontineStatus.ACTIVE).length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'bg-primary-600' : 'border-white/20 text-white hover:bg-white/10'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed ({tontines.filter(t => t.status === TontineStatus.COMPLETED).length})
            </Button>
          </div>

          {/* Action Required Section */}
          {tontines.filter(t => t.status === TontineStatus.ACTIVE && !hasContributed(t)).length > 0 && (
            <Card className="bg-yellow-500/10 backdrop-blur-sm border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Action Required
                </CardTitle>
                <CardDescription className="text-yellow-300/70">
                  You have {tontines.filter(t => t.status === TontineStatus.ACTIVE && !hasContributed(t)).length} dartes that need your contribution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tontines
                    .filter(t => t.status === TontineStatus.ACTIVE && !hasContributed(t))
                    .slice(0, 3)
                    .map((tontine) => (
                      <div key={tontine.id} className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">{tontine.name}</h4>
                        <p className="text-white/70 text-sm mb-3">
                          Contribute {tontine.contributionAmount} {tontine.coinType}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleContribute(tontine.id)}
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

          {/* Tontines List */}
          <div className="space-y-6">
            {isLoadingTontines ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/70">Loading your dartes...</p>
              </div>
            ) : filteredTontines.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="text-center py-12">
                  <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Dartes Yet</h3>
                  <p className="text-white/70 mb-6">
                    You haven't created or joined any dartes yet.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/create">
                      <Button className="bg-primary-600 hover:bg-primary-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Darte
                      </Button>
                    </Link>
                    <Link href="/join">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Users className="w-4 h-4 mr-2" />
                        Join Darte
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTontines.map((tontine) => (
                  <Card key={tontine.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg text-white">{tontine.name}</CardTitle>
                            {isCreator(tontine) && (
                              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 text-xs">
                                Creator
                              </Badge>
                            )}
                            {isBeneficiary(tontine) && (
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 text-xs">
                                Beneficiary
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-white/70">
                            {tontine.description}
                          </CardDescription>
                        </div>
                        {getStatusBadge(tontine.status)}
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
                            {tontine.participants.length} / {tontine.maxParticipants}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4 text-primary-400" />
                            <span className="text-white/70 text-sm">Contribution</span>
                          </div>
                          <p className="text-white font-medium">
                            {tontine.contributionAmount} {tontine.coinType}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-primary-400" />
                            <span className="text-white/70 text-sm">Round</span>
                          </div>
                          <p className="text-white font-medium">
                            {tontine.currentRound} / {tontine.totalRounds}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-primary-400" />
                            <span className="text-white/70 text-sm">Next Deadline</span>
                          </div>
                          <p className="text-white font-medium text-sm">
                            {new Date(tontine.nextDeadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/20 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-white/70">Total Amount:</span>
                          <span className="text-white font-bold">
                            {tontine.maxParticipants * tontine.contributionAmount} {tontine.coinType}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          {tontine.status === TontineStatus.ACTIVE && (
                            <>
                              {!hasContributed(tontine) && (
                                <Button
                                  size="sm"
                                  onClick={() => handleContribute(tontine.id)}
                                  disabled={isLoading}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Coins className="w-4 h-4 mr-2" />
                                  Contribute
                                </Button>
                              )}
                              
                              {hasContributed(tontine) && (
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
                              
                              {isCreator(tontine) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSelectBeneficiary(tontine.id)}
                                  disabled={isLoading}
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  <Target className="w-4 h-4 mr-2" />
                                  Select Beneficiary
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
