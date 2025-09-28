'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletInfo } from '../src/hooks/useWallet';
import { useTontine } from '../src/hooks/useTontine';
import { CreateLottoForm, CoinType } from '../src/types/tontine';
import { InvitationGenerator } from '../components/InvitationGenerator';
import { TontineTemplates } from '../components/TontineTemplates';
import { 
  Users, 
  Coins, 
  Calendar, 
  Target, 
  Plus, 
  ArrowLeft,
  Save,
  Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../src/utils/formatting';

export default function CreateLotto() {
  const router = useRouter();
  const { currentAccount } = useWalletInfo();
  const { createTontine, isLoading, invitationData, clearInvitationData } = useTontine();
  const [formData, setFormData] = useState<CreateLottoForm>({
    name: '',
    description: '',
    maxParticipants: 12,
    contributionAmount: 1,
    coinType: CoinType.SUI,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const coinSelectRef = useRef<HTMLButtonElement>(null);

  // Handle dropdown scrolling
  const handleDropdownOpen = (isOpen: boolean, triggerElement?: HTMLElement) => {
    if (isOpen && triggerElement) {
      setTimeout(() => {
        const rect = triggerElement.getBoundingClientRect();
        const dropdownHeight = 200;
        const viewportHeight = window.innerHeight;
        const dropdownBottom = rect.bottom + dropdownHeight;
        
        if (dropdownBottom > viewportHeight) {
          const desiredBottomPosition = viewportHeight - 200;
          const currentDropdownBottom = rect.bottom + dropdownHeight;
          const scrollAmount = currentDropdownBottom - desiredBottomPosition;
          
          window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  // TODO: Implement form input handlers
  const handleInputChange = (field: keyof CreateLottoForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ Enhanced calculation helpers for lotto
  const calculateTotalPool = () => {
    return formData.maxParticipants * formData.contributionAmount;
  };

  const calculatePotentialYield = () => {
    // Estimate 5% annual yield (simplified calculation)
    const totalPool = calculateTotalPool();
    return totalPool * 0.05; // 5% of total pool as potential yield
  };

  const calculateWinnerPayout = () => {
    return formData.contributionAmount + calculatePotentialYield();
  };

  // Handle template selection
  const handleSelectTemplate = (templateData: Partial<CreateLottoForm>) => {
    setFormData(prev => ({
      ...prev,
      ...templateData
    }));
    setShowTemplates(false);
    toast.success('Template applied! You can modify the parameters below.');
  };

  // ✅ Enhanced lotto creation with payment confirmation
  const handleCreateLotto = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Enhanced validation
    if (!formData.name.trim()) {
      toast.error('Please enter a lotto name');
      return;
    }

    if (formData.name.length < 3) {
      toast.error('Lotto name must be at least 3 characters long');
      return;
    }

    if (formData.maxParticipants < 2) {
      toast.error('Minimum 2 participants required');
      return;
    }

    if (formData.maxParticipants > 50) {
      toast.error('Maximum 50 participants allowed');
      return;
    }

    if (formData.contributionAmount <= 0) {
      toast.error('Contribution amount must be greater than 0');
      return;
    }

    if (formData.contributionAmount > 10000) {
      toast.error('Contribution amount cannot exceed 10,000 tokens');
      return;
    }

    // Show payment confirmation
    setShowPaymentConfirmation(true);
  };


  const handleConfirmPayment = async () => {
    setIsCreating(true);
    setShowPaymentConfirmation(false); // Hide the modal immediately
    
    try {
      console.log('🎯 Starting payment confirmation...');
      console.log('📋 Form data:', formData);
      console.log('👤 Current account:', currentAccount?.address);
      console.log('🔗 Wallet connected:', !!currentAccount);
      
      // Show loading toast
      toast.loading('Creating your Yield Lotto...', { id: 'creating-lotto' });
      
      console.log('⏳ Calling createTontine function...');
      const result = await createTontine(formData);
      console.log('🎉 Lotto creation result received:', result);
      
      // Dismiss loading toast and show success
      toast.dismiss('creating-lotto');
      toast.success('🎉 Yield Lotto created successfully! Redirecting...');
      
      // Immediately redirect to the lotto room
      if (result.invitation?.lottoId) {
        console.log('🔄 Redirecting to lotto room:', result.invitation.lottoId);
        console.log('🌐 Redirect URL:', `/lotto/${result.invitation.lottoId}`);
        
        // Use replace instead of push to avoid back button issues
        router.replace(`/lotto/${result.invitation.lottoId}`);
      } else {
        console.warn('⚠️ No lotto ID found in result, staying on create page');
        console.log('🔍 Full result for debugging:', result);
        toast.error('Lotto created but could not redirect. Please check your lotto manually.');
      }
      
    } catch (error) {
      console.error('💥 Failed to create lotto:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
        formData,
        currentAccount: currentAccount?.address
      });
      toast.error(`Failed to create lotto: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
      setShowPaymentConfirmation(false);
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
                  You need to connect your wallet to create a lotto.
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
              {/* Show InvitationGenerator if invitation data is available */}
              {invitationData && (
              <InvitationGenerator 
                lottoData={invitationData} 
                onClose={clearInvitationData}
              />
              )}
              
              {/* Show Payment Confirmation Modal */}
              {showPaymentConfirmation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-md w-full">
                    <CardHeader>
                      <CardTitle className="text-xl text-white flex items-center">
                        <Coins className="w-6 h-6 mr-2 text-primary-400" />
                        Confirm Payment
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        You're about to create a lotto and pay the entry fee as the first participant.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Lotto Summary */}
                      <div className="bg-white/5 rounded-lg p-4 space-y-3">
                        <h4 className="text-white font-medium">{formData.name}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-white/70">Participants:</span>
                            <div className="text-white font-medium">{formData.maxParticipants}</div>
                          </div>
                          <div>
                            <span className="text-white/70">Entry Fee:</span>
                            <div className="text-white font-medium">{formData.contributionAmount} {formData.coinType}</div>
                          </div>
                          <div>
                            <span className="text-white/70">Total Pool:</span>
                            <div className="text-white font-medium">{formData.maxParticipants * formData.contributionAmount} {formData.coinType}</div>
                          </div>
                          <div>
                            <span className="text-white/70">Your Payment:</span>
                            <div className="text-white font-bold">{formData.contributionAmount} {formData.coinType}</div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="w-5 h-5 text-green-400" />
                          <span className="text-green-400 font-medium">Zero Risk Guarantee</span>
                        </div>
                        <p className="text-white/70 text-sm">
                          You'll get your {formData.contributionAmount} {formData.coinType} back regardless of the outcome. 
                          Only the staking yield is at stake!
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => setShowPaymentConfirmation(false)}
                          variant="outline"
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConfirmPayment}
                          disabled={isCreating || isLoading}
                          className="flex-1 bg-primary-600 hover:bg-primary-700"
                        >
                          {isCreating || isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Coins className="w-4 h-4 mr-2" />
                              Pay & Create
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-primary-600/20 text-primary-400 px-4 py-2 rounded-full text-sm font-medium">
              <Plus className="w-4 h-4" />
              <span>Create Yield Lotto</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white">New Yield Lotto</h1>
            <p className="text-white/70">
              Create a yield lotto where everyone gets their deposit back, but one winner takes all the staking rewards!
            </p>
          </div>

          {/* Templates Section */}
          {showTemplates && (
            <div className="mb-8">
              <TontineTemplates onSelectTemplate={handleSelectTemplate} />
            </div>
          )}

          {/* Custom Form Toggle */}
          {showTemplates && (
            <div className="text-center mb-8">
              <Button
                onClick={() => setShowTemplates(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Create Custom Lotto
              </Button>
            </div>
          )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Lotto Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Weekend Getaway Lotto"
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the purpose of this lotto..."
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="participants" className="text-white">Number of Participants</Label>
                      <Input
                        id="participants"
                        type="number"
                        min="2"
                        max="50"
                        value={formData.maxParticipants}
                        onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-white">Contribution Amount</Label>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          min="1"
                          step="0.5"
                          value={formData.contributionAmount}
                          onChange={(e) => handleInputChange('contributionAmount', parseFloat(e.target.value) || 0)}
                          className="bg-white/10 border-white/20 text-white pr-16"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 text-sm">
                          {formData.coinType}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coin" className="text-white">Crypto Type</Label>
                      <Select
                        value={formData.coinType}
                        onValueChange={(value) => handleInputChange('coinType', value as CoinType)}
                        onOpenChange={(isOpen) => {
                          handleDropdownOpen(isOpen, coinSelectRef.current || undefined);
                        }}
                      >
                        <SelectTrigger ref={coinSelectRef} className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent 
                          position="popper" 
                          side="bottom" 
                          sideOffset={4} 
                          avoidCollisions={false}
                          align="start"
                          className="bg-white/10 backdrop-blur-sm border-white/20 text-white z-50 max-h-60 overflow-y-auto rounded-lg"
                        >
                          <SelectItem value={CoinType.SUI} className="text-white hover:bg-white/15 focus:bg-white/15 transition-colors duration-200">SUI</SelectItem>
                          <SelectItem value={CoinType.USDC} className="text-white hover:bg-white/15 focus:bg-white/15 transition-colors duration-200">USDC</SelectItem>
                          <SelectItem value={CoinType.USDT} className="text-white hover:bg-white/15 focus:bg-white/15 transition-colors duration-200">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
                
                
                <Button
                  onClick={handleCreateLotto}
                  disabled={isCreating || isLoading || !formData.name.trim()}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  {isCreating || isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Lotto
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Lotto Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Participants:</span>
                    <span className="text-white font-medium">{formData.maxParticipants}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Entry Fee:</span>
                    <span className="text-white font-medium">
                      {formData.contributionAmount} {formData.coinType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Pool:</span>
                    <span className="text-white font-medium">
                      {calculateTotalPool()} {formData.coinType}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/70">Potential Yield:</span>
                    <span className="text-white font-medium">
                      ~{formatCurrency(calculatePotentialYield())} {formData.coinType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Winner Payout:</span>
                    <span className="text-white font-medium">
                      {formatCurrency(calculateWinnerPayout())} {formData.coinType}
                    </span>
                  </div>
                  
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between">
                      <span className="text-white/70">Everyone Gets Back:</span>
                      <span className="text-white font-bold text-lg">
                        {formData.contributionAmount} {formData.coinType}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white">How it works?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-white/70">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Each participant contributes the same amount</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Funds are automatically staked to earn yield</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>One winner is selected to receive all the yield</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Everyone else gets their deposit back - zero risk!</p>
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
