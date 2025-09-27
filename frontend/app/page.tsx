'use client';
import { ConnectButton } from './components/ConnectButton';
import { Button } from './components/ui/button';
import { Card, CardContent,  CardHeader, CardTitle } from './components/ui/card';
import { Users, Coins, Target, TrendingUp, Amphora,  PlusCircleIcon, Shield, User } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Amphora className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xl font-bold">Darte</span>
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
            <Shield className="w-4 h-4" />
            <span>Decentralized Collective Savings</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            Decentralized Collective Savings on
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent"> Sui</span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Create collective savings pools with automatic beneficiary rotation. 
            Transparent, secure, and decentralized on the Sui blockchain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Create Darte
              </Button>
            </Link>
            
            <Link href="/join">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Users className="w-5 h-5 mr-2" />
                Join Darte
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <User className="w-5 h-5 mr-2" />
                My Dartes
              </Button>
            </Link>
          </div>
        </div>
        
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Active Dartes</CardTitle>
              <Target className="h-4 w-4 text-primary-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">24</div>
              <p className="text-xs text-green-400">+12% this week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-primary-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1,234</div>
              <p className="text-xs text-green-400">+8% this week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Dartes Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">5,678</div>
              <p className="text-xs text-green-400">+15% this week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Volume</CardTitle>
              <Coins className="h-4 w-4 text-primary-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12.5K SUI</div>
              <p className="text-xs text-green-400">+23% this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Darte Sui?</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Built on Sui blockchain for fast, secure, and transparent collective savings experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Built on Sui's high-performance blockchain for instant transactions and rotative savings.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Fair Play</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Transparent smart contracts ensure fair rotation and automatic prize distribution.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Real Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Participate in a rotative savings with real SUI tokens 
                </p>
              </CardContent>
            </Card>
        </div>
      </div>
      </main>
    </div>
  );
}