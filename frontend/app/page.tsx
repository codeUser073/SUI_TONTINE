'use client';

import { useState } from 'react';
import { ConnectButton } from './components/ConnectButton';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { 
  Users, 
  Coins, 
  Target, 
  TrendingUp, 
  PlusCircleIcon, 
  Shield, 
  User, 
  Trophy, 
  Zap,
  Clock,
  Crown,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { mockAvailableLottos, mockStats } from './src/data/mockLottos';
import { Lotto, LottoStatus } from './src/types/tontine';
import { formatNumber, formatCurrency } from './src/utils/formatting';

export default function Home() {
  const [availableLottos] = useState<Lotto[]>(mockAvailableLottos);

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xl font-bold">Yield Lotto</span>
            </Link>
            {/* Connect Wallet */}
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-primary-600/20 text-primary-400 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span>100% Winner Lotto with Staking Yield</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            Win Big with Zero Risk on
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent"> Sui</span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Join a yield lotto where everyone gets their deposit back, but one lucky winner takes home all the staking rewards! 
            No risk, maximum reward potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Create Lotto
              </Button>
            </Link>
            
            <Link href="/join">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Users className="w-5 h-5 mr-2" />
                Join Lotto
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <User className="w-5 h-5 mr-2" />
                My Lottos
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Available Lottos Dashboard */}
        <div className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Available Lotto Rooms</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Join any of these active lotto rooms. Everyone gets their deposit back, winner takes all the staking rewards!
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Active Lottos</CardTitle>
                <Trophy className="h-4 w-4 text-primary-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{mockStats.activeLottos}</div>
                <p className="text-xs text-green-400">+12% this week</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-primary-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(mockStats.totalParticipants)}</div>
                <p className="text-xs text-green-400">+8% this week</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Lottos Completed</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{mockStats.completedLottos}</div>
                <p className="text-xs text-green-400">+15% this week</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Total Yield Won</CardTitle>
                <Coins className="h-4 w-4 text-primary-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(mockStats.totalYieldWon)} SUI</div>
                <p className="text-xs text-green-400">+23% this week</p>
              </CardContent>
            </Card>
          </div>

          {/* Available Lottos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableLottos.map((lotto) => (
              <Card key={lotto.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-white">{lotto.name}</CardTitle>
                      <p className="text-white/70 text-sm">{lotto.description}</p>
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
                        <span className="text-white/70 text-sm">Entry Fee</span>
                      </div>
                      <p className="text-white font-medium">
                        {lotto.contributionAmount} {lotto.coinType}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-primary-400" />
                        <span className="text-white/70 text-sm">Total Pool</span>
                      </div>
                      <p className="text-white font-medium">
                        {lotto.maxParticipants * lotto.contributionAmount} {lotto.coinType}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-primary-400" />
                        <span className="text-white/70 text-sm">Created</span>
                      </div>
                      <p className="text-white font-medium text-sm">
                        {getTimeAgo(lotto.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white/70">Potential Yield:</span>
                      <span className="text-white font-bold">
                        ~{formatCurrency(lotto.maxParticipants * lotto.contributionAmount * 0.05)} {lotto.coinType}
                      </span>
                    </div>

                    <Link href={`/join/${lotto.id}`}>
                      <Button className="w-full bg-primary-600 hover:bg-primary-700">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Join Lotto
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create New Lotto CTA */}
          <div className="text-center mt-12">
            <Card className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 backdrop-blur-sm border-primary-500/20">
              <CardContent className="py-8">
                <Trophy className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Don't see what you're looking for?</h3>
                <p className="text-white/70 mb-6">
                  Create your own lotto room and invite friends to join!
                </p>
                <Link href="/create">
                  <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Create New Lotto
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}