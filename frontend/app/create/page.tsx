'use client';

import { useState, useRef } from 'react';
import { useWalletInfo } from '../src/hooks/useWallet';
import { useTontine } from '../src/hooks/useTontine';
import { CreateTontineForm, CoinType } from '../src/types/tontine';
import { InvitationGenerator } from '../components/InvitationGenerator';
import { 
  Users, 
  Coins, 
  Calendar, 
  Target, 
  Plus, 
  ArrowLeft,
  Save
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { TontineTemplates } from '../components/TontineTemplates';

export default function CreateTontine() {
  const { currentAccount } = useWalletInfo();
  const { createTontine, isLoading, invitationData, clearInvitationData } = useTontine();
  const [formData, setFormData] = useState<CreateTontineForm>({
    name: '',
    description: '',
    maxParticipants: 12,
    contributionAmount: 1,
    deadlineInterval: 30, // 30 days default
    coinType: CoinType.SUI,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const frequencySelectRef = useRef<HTMLButtonElement>(null);
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
  const handleInputChange = (field: keyof CreateTontineForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ Enhanced calculation helpers
  const calculateTotalDuration = () => {
    return formData.maxParticipants * formData.deadlineInterval;
  };

  const calculateTotalAmount = () => {
    return Math.round(formData.maxParticipants * formData.contributionAmount * 100) / 100;
  };

  const calculateMonthlyContribution = () => {
    const daysInMonth = 30;
    const contributionsPerMonth = daysInMonth / formData.deadlineInterval;
    return Math.round(contributionsPerMonth * formData.contributionAmount * 100) / 100;
  };

  const calculateEstimatedEndDate = () => {
    const totalDays = calculateTotalDuration();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + totalDays);
    return endDate.toLocaleDateString();
  };

  const getFrequencyText = () => {
    switch (formData.deadlineInterval) {
      case 7: return 'Weekly';
      case 15: return 'Bi-weekly';
      case 30: return 'Monthly';
      case 60: return 'Bi-monthly';
      case 90: return 'Quarterly';
      default: return `Every ${formData.deadlineInterval} days`;
    }
  };

  // Handle template selection
  const handleSelectTemplate = (templateData: Partial<CreateTontineForm>) => {
    setFormData(prev => ({
      ...prev,
      ...templateData
    }));
    setShowTemplates(false);
    toast.success('Template applied! You can modify the parameters below.');
  };

  // ✅ Enhanced tontine creation with validation
  const handleCreateTontine = async () => {
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Enhanced validation
    if (!formData.name.trim()) {
      toast.error('Please enter a tontine name');
      return;
    }

    if (formData.name.length < 3) {
      toast.error('Tontine name must be at least 3 characters long');
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

    setIsCreating(true);
            try {
              const result = await createTontine(formData);
              toast.success('🎉 Darte created successfully!');
              
              // The invitation data is automatically set in the useTontine hook
              // The InvitationGenerator will be shown automatically
              
            } catch (error) {
              console.error('Failed to create tontine:', error);
              toast.error('Failed to create tontine. Please try again.');
            } finally {
              setIsCreating(false);
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
                  You need to connect your wallet to create a tontine.
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
                  tontineData={invitationData} 
                  onClose={clearInvitationData}
                />
              )}
              
              <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-primary-600/20 text-primary-400 px-4 py-2 rounded-full text-sm font-medium">
              <Plus className="w-4 h-4" />
              <span>Create Darte</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white">New Darte</h1>
            <p className="text-white/70">
              Create a Darte and invite your friends to participate in this collective savings.
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
                Create Custom Darte
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
                    <Label htmlFor="name" className="text-white">Darte Name </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Vacation Fund 2024"
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the purpose of this tontine..."
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
                      <Label htmlFor="frequency" className="text-white">Contribution Frequency</Label>
                      <Select
                        value={formData.deadlineInterval.toString()}
                        onValueChange={(value) => handleInputChange('deadlineInterval', parseInt(value))}
                        onOpenChange={(isOpen) => {
                          handleDropdownOpen(isOpen, frequencySelectRef.current || undefined);
                        }}
                      >
                        <SelectTrigger ref={frequencySelectRef} className="bg-white/10 border-white/20 text-white">
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
                          <SelectItem value="7" className="text-white hover:bg-white/15 focus:bg-white/15 transition-colors duration-200">Weekly (7 days)</SelectItem>
                          <SelectItem value="15" className="text-white hover:bg-white/15 focus:bg-white/15 transition-colors duration-200">Bi-weekly (15 days)</SelectItem>
                          <SelectItem value="30" className="text-white hover:bg-white/15 focus:bg-white/15 transition-colors duration-200">Monthly (30 days)</SelectItem>
                          <SelectItem value="60" className="text-white hover:bg-white/15 focus:bg-white/15 transition-colors duration-200">Bi-monthly (60 days)</SelectItem>
                          <SelectItem value="90" className="text-white hover:bg-white/15 focus:bg-white/15 transition-colors duration-200">Quarterly (90 days)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                  onClick={handleCreateTontine}
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
                      Create Darte
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Darte Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Participants:</span>
                    <span className="text-white font-medium">{formData.maxParticipants}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Contribution:</span>
                    <span className="text-white font-medium">
                      {formData.contributionAmount} {formData.coinType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Frequency:</span>
                    <span className="text-white font-medium">
                      {getFrequencyText()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/70">Monthly Contribution:</span>
                    <span className="text-white font-medium">
                      ~{calculateMonthlyContribution()} {formData.coinType}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Duration:</span>
                    <span className="text-white font-medium">
                      {Math.round(calculateTotalDuration() / 30)} months
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/70">Estimated End:</span>
                    <span className="text-white font-medium text-sm">
                      {calculateEstimatedEndDate()}
                    </span>
                  </div>
                  
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between">
                      <span className="text-white/70">Total Amount:</span>
                      <span className="text-white font-bold text-lg">
                        {calculateTotalAmount() || 0} {formData.coinType}
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
                      <p>Each participant contributes the defined amount</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>At each deadline, one participant receives the total pot</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Rotation happens automatically</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Everything is transparent on the blockchain</p>
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
