'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Copy, Share2, QrCode, Users, Calendar, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { InvitationData } from '../src/hooks/useTontine';

interface InvitationGeneratorProps {
  tontineData: InvitationData;
  onClose?: () => void;
}

export function InvitationGenerator({ tontineData, onClose }: InvitationGeneratorProps) {
  const [invitationUrl, setInvitationUrl] = useState(tontineData.invitationUrl);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(tontineData.qrCodeDataUrl || '');

  useEffect(() => {
    // Use the invitation URL from tontineData if available
    if (tontineData.invitationUrl) {
      setInvitationUrl(tontineData.invitationUrl);
    } else {
      // Fallback: generate invitation URL
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/join?code=${tontineData.invitationCode}`;
      setInvitationUrl(url);
    }

    // Use QR code from tontineData if available
    if (tontineData.qrCodeDataUrl) {
      setQrCodeDataUrl(tontineData.qrCodeDataUrl);
    }
  }, [tontineData]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const shareInvitation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${tontineData.tontineName}`,
          text: `Join my tontine: ${tontineData.tontineName}`,
          url: invitationUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard(invitationUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            <Share2 className="w-6 h-6 mr-2" />
            Invite Participants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tontine Info */}
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-white">{tontineData.tontineName}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary-400" />
                <span className="text-white/70">{tontineData.maxParticipants} participants</span>
              </div>
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-primary-400" />
                <span className="text-white/70">{tontineData.contributionAmount} {tontineData.coinType}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-primary-400" />
                <span className="text-white/70">Every {tontineData.deadlineInterval} days</span>
              </div>
            </div>
          </div>

          {/* Invitation Code */}
          <div className="space-y-2">
            <Label className="text-white">Invitation Code</Label>
            <div className="flex space-x-2">
              <Input
                value={tontineData.invitationCode}
                readOnly
                className="bg-white/10 border-white/20 text-white font-mono"
              />
              <Button
                onClick={() => copyToClipboard(tontineData.invitationCode)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Invitation URL */}
          <div className="space-y-2">
            <Label className="text-white">Invitation Link</Label>
            <div className="flex space-x-2">
              <Input
                value={invitationUrl}
                readOnly
                className="bg-white/10 border-white/20 text-white text-sm"
              />
              <Button
                onClick={() => copyToClipboard(invitationUrl)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* QR Code */}
          {qrCodeDataUrl && (
            <div className="text-center space-y-2">
              <Label className="text-white">QR Code</Label>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <Button
              onClick={shareInvitation}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Invitation
            </Button>
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
