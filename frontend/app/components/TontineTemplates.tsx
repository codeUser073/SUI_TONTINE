'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CreateTontineForm, CoinType } from '../src/types/tontine';
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
  formData: Partial<CreateTontineForm>;
  color: string;
}

interface TontineTemplatesProps {
  onSelectTemplate: (template: Partial<CreateTontineForm>) => void;
}

const templates: TontineTemplate[] = [
  {
    id: 'vacation',
    name: 'Vacation Fund',
    description: 'Save for your dream vacation with friends',
    icon: <Plane className="w-6 h-6" />,
    color: 'bg-blue-500',
    formData: {
      name: 'Vacation Fund 2024',
      description: 'Let\'s save together for an amazing vacation!',
      maxParticipants: 8,
      contributionAmount: 50,
      deadlineInterval: 30,
      coinType: CoinType.SUI,
    }
  },
  {
    id: 'house',
    name: 'House Down Payment',
    description: 'Collective savings for home ownership',
    icon: <Home className="w-6 h-6" />,
    color: 'bg-green-500',
    formData: {
      name: 'House Fund',
      description: 'Building our future home together',
      maxParticipants: 12,
      contributionAmount: 200,
      deadlineInterval: 30,
      coinType: CoinType.USDC,
    }
  },
  {
    id: 'education',
    name: 'Education Fund',
    description: 'Support education expenses',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'bg-purple-500',
    formData: {
      name: 'Education Fund',
      description: 'Investing in our children\'s future',
      maxParticipants: 10,
      contributionAmount: 100,
      deadlineInterval: 30,
      coinType: CoinType.USDC,
    }
  },
  {
    id: 'car',
    name: 'Car Purchase',
    description: 'Save for a new vehicle',
    icon: <Car className="w-6 h-6" />,
    color: 'bg-red-500',
    formData: {
      name: 'Car Fund',
      description: 'New wheels for the family',
      maxParticipants: 6,
      contributionAmount: 300,
      deadlineInterval: 30,
      coinType: CoinType.USDC,
    }
  },
  {
    id: 'wedding',
    name: 'Wedding Fund',
    description: 'Celebrate your special day',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-pink-500',
    formData: {
      name: 'Wedding Fund',
      description: 'Making our dream wedding come true',
      maxParticipants: 15,
      contributionAmount: 150,
      deadlineInterval: 30,
      coinType: CoinType.USDC,
    }
  },
  {
    id: 'business',
    name: 'Business Investment',
    description: 'Start your entrepreneurial journey',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'bg-orange-500',
    formData: {
      name: 'Business Fund',
      description: 'Funding our startup dreams',
      maxParticipants: 20,
      contributionAmount: 500,
      deadlineInterval: 30,
      coinType: CoinType.USDC,
    }
  }
];

export function TontineTemplates({ onSelectTemplate }: TontineTemplatesProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Choose a Template</h3>
        <p className="text-white/70">Start with a pre-configured darte or create your own</p>
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
                  <span className="text-white/60">Amount:</span>
                  <span className="text-white font-medium">
                    {template.formData.contributionAmount} {template.formData.coinType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Frequency:</span>
                  <span className="text-white font-medium">Monthly</span>
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
          Or create a custom darte with your own parameters
        </p>
      </div>
    </div>
  );
}
