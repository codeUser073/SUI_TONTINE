'use client';

import { useState } from 'react';
import { useWalletInfo } from '../src/hooks/useWallet';
import { useTontine } from '../src/hooks/useTontine';
import { Tontine } from '../src/types/tontine';
import { 
  Users, 
  Coins, 
  Calendar, 
  Target, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function JoinTontine() {
  const { currentAccount } = useWalletInfo();
  const { joinTontine, getTontineByInvitation, isLoading } = useTontine();
  const [invitationCode, setInvitationCode] = useState('');
  const [tontine, setTontine] = useState<Tontine | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // TODO: Implement invitation code search
  const handleSearchTontine = async () => {
    if (!invitationCode.trim()) {
      toast.error('Please enter an invitation code');
      return;
    }

    setIsSearching(true);
    try {
      const foundTontine = await getTontineByInvitation(invitationCode);
      if (foundTontine) {
        setTontine(foundTontine);
        toast.success('Tontine found!');
      } else {
        setTontine(null);
        toast.error('Tontine not found. Please check the invitation code.');
      }
    } catch (error) {
      console.error('Error searching tontine:', error);
      toast.error('Failed to search tontine. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // TODO: Implement join tontine
  const handleJoinTontine = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!tontine) {
      toast.error('Please search for a tontine first');
      return;
    }

    setIsJoining(true);
    try {
      await joinTontine(invitationCode);
      toast.success('Successfully joined the tontine!');
      // TODO: Redirect to tontine dashboard
    } catch (error) {
      console.error('Failed to join tontine:', error);
      toast.error('Failed to join tontine. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

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
                  You need to connect your wallet to join a Darte.
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-primary-600/20 text-primary-400 px-4 py-2 rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>Join Yield Lotto</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white">Join a Yield Lotto</h1>
            <p className="text-white/70">
              Enter an invitation code to join an existing lotto and have a chance to win all the staking rewards!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Search Form */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    Invitation Code
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Enter the invitation code you received from a lotto creator.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invitation" className="text-white">Invitation Code</Label>
                    <Input
                      id="invitation"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      placeholder="e.g., LOTTO_ABC12345"
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                  </div>

                  <Button
                    onClick={handleSearchTontine}
                    disabled={isSearching || !invitationCode.trim()}
                    className="w-full bg-primary-600 hover:bg-primary-700"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Search Lotto
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tontine Details */}
            <div className="space-y-6">
              {tontine ? (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                      Darte Found
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Review the details before joining.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{tontine.name}</h3>
                        <p className="text-white/70 text-sm">{tontine.description}</p>
                      </div>

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
                            <span className="text-white/70 text-sm">Status</span>
                          </div>
                          <p className="text-white font-medium">
                            {tontine.status === 0 ? 'Open' : tontine.status === 1 ? 'Active' : 'Completed'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-primary-400" />
                            <span className="text-white/70 text-sm">Total Pool</span>
                          </div>
                          <p className="text-white font-medium">{tontine.maxParticipants * tontine.contributionAmount} {tontine.coinType}</p>
                        </div>
                      </div>

                      <div className="border-t border-white/20 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Total Pool:</span>
                          <span className="text-white font-bold text-lg">
                            {tontine.maxParticipants * tontine.contributionAmount} {tontine.coinType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleJoinTontine}
                      disabled={isJoining || isLoading || tontine.participants.length >= tontine.maxParticipants}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isJoining || isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Joining...
                        </>
                      ) : tontine.participants.length >= tontine.maxParticipants ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Lotto Full
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Join Lotto
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">No Lotto Selected</CardTitle>
                    <CardDescription className="text-white/70">
                      Enter an invitation code to view lotto details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/50">
                        Search for a Lotto using an invitation code to see its details here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Help */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white">How to get an invitation?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-white/70">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Ask a friend who created a lotto for their invitation code</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Invitation codes look like: LOTTO_ABC12345</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Each code can only be used once</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Make sure you have enough tokens to contribute</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
