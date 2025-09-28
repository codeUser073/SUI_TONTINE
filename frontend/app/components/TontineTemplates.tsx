'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CreateLottoForm, CoinType } from '../src/types/tontine';
import { 
  Plane, 
  Home, 
  GraduationCap, 
  Car, 
  Heart, 
  Briefcase,
  Users,
  Calendar,
  Coins
} from 'lucide-react';

interface TontineTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  formData: Partial<CreateLottoForm>;
  color: string;
}

interface TontineTemplatesProps {
  onSelectTemplate: (template: Partial<CreateLottoForm>) => void;
}

const templates: TontineTemplate[] = [
  {
    id: 'vacation',
    name: 'Vacation Lotto',
    description: 'Win a dream vacation with friends',
    icon: <Plane className="w-6 h-6" />,
    color: 'bg-blue-500',
    formData: {
      name: 'Vacation Lotto 2024',
      description: 'Let\'s win a vacation together!',
      maxParticipants: 8,
      contributionAmount: 50,
      coinType: CoinType.SUI,
    }
  },
  {
    id: 'house',
    name: 'House Down Payment',
    description: 'Win money for home ownership',
    icon: <Home className="w-6 h-6" />,
    color: 'bg-green-500',
    formData: {
      name: 'House Fund Lotto',
      description: 'Building our future home together',
      maxParticipants: 12,
      contributionAmount: 200,
      coinType: CoinType.USDC,
    }
  },
  {
    id: 'education',
    name: 'Education Lotto',
    description: 'Win funds for education expenses',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'bg-purple-500',
    formData: {
      name: 'Education Fund Lotto',
      description: 'Investing in our children\'s future',
      maxParticipants: 10,
      contributionAmount: 100,
      coinType: CoinType.USDC,
    }
  },
  {
    id: 'car',
    name: 'Car Purchase Lotto',
    description: 'Win money for a new vehicle',
    icon: <Car className="w-6 h-6" />,
    color: 'bg-red-500',
    formData: {
      name: 'Car Fund Lotto',
      description: 'New wheels for the family',
      maxParticipants: 6,
      contributionAmount: 300,
      coinType: CoinType.USDC,
    }
  },
  {
    id: 'wedding',
    name: 'Wedding Lotto',
    description: 'Win funds for your special day',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-pink-500',
    formData: {
      name: 'Wedding Fund Lotto',
      description: 'Making our dream wedding come true',
      maxParticipants: 15,
      contributionAmount: 150,
      coinType: CoinType.USDC,
    }
  },
  {
    id: 'business',
    name: 'Business Investment Lotto',
    description: 'Win startup funding',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'bg-orange-500',
    formData: {
      name: 'Business Fund Lotto',
      description: 'Funding our startup dreams',
      maxParticipants: 20,
      contributionAmount: 500,
      coinType: CoinType.USDC,
    }
  }
];

export function TontineTemplates({ onSelectTemplate }: TontineTemplatesProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Choose a Lotto Template</h3>
        <p className="text-white/70">Start with a pre-configured lotto or create your own</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
            onClick={() => onSelectTemplate(template.formData)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${template.color} text-white`}>
                  {template.icon}
                </div>
                <div>
                  <CardTitle className="text-lg text-white">{template.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-white/70 text-sm">{template.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Participants:</span>
                  <span className="text-white font-medium">{template.formData.maxParticipants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Entry Fee:</span>
                  <span className="text-white font-medium">
                    {template.formData.contributionAmount} {template.formData.coinType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Total Pool:</span>
                  <span className="text-white font-medium">
                    {(template.formData.maxParticipants || 0) * (template.formData.contributionAmount || 0)} {template.formData.coinType}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full bg-primary-600 hover:bg-primary-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template.formData);
                }}
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-white/50 text-sm">
          Or create a custom lotto with your own parameters
        </p>
      </div>
    </div>
  );
}
