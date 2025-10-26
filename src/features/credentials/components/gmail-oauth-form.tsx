"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MailIcon, ExternalLinkIcon } from 'lucide-react';
import { useState } from 'react';

interface GmailOAuthFormProps {
  onSuccess: () => void;
}

export function GmailOAuthForm({ onSuccess }: GmailOAuthFormProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleGmailConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Redirect to Gmail OAuth endpoint
      window.location.href = '/api/auth/gmail';
    } catch (error) {
      console.error('Gmail OAuth error:', error);
      setIsConnecting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <MailIcon className="h-12 w-12 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Connect Gmail</h3>
            <p className="text-sm text-muted-foreground">
              Authorize access to your Gmail account to enable email triggers and sending.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <h4 className="font-medium text-sm">Permissions requested:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Read Gmail messages (for email triggers)</li>
              <li>• Send emails on your behalf</li>
              <li>• Manage Gmail labels</li>
            </ul>
          </div>

          <Button 
            onClick={handleGmailConnect}
            disabled={isConnecting}
            className="w-full"
          >
            <MailIcon className="h-4 w-4 mr-2" />
            {isConnecting ? 'Connecting...' : 'Connect Gmail'}
            <ExternalLinkIcon className="h-4 w-4 ml-2" />
          </Button>

          <p className="text-xs text-muted-foreground">
            You'll be redirected to Google to authorize the connection.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
