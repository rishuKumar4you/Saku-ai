"use client";

import { CredentialType } from '@/generated/prisma';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { KeyIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ApiKeyFormProps {
  type: 'OPENAI_API_KEY' | 'GEMINI_API_KEY' | 'ANTHROPIC_API_KEY';
  serviceName: string;
  onSuccess: () => void;
}

export function ApiKeyForm({ type, serviceName, onSuccess }: ApiKeyFormProps) {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trpc = useTRPC();

  const upsertMutation = useMutation(
    trpc.credentials.upsertApiKey.mutationOptions({
      onSuccess: () => {
        toast.success(`${serviceName} API key saved successfully`);
        setName('');
        setApiKey('');
        onSuccess();
      },
      onError: (error: any) => {
        toast.error(`Failed to save API key: ${error.message}`);
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !apiKey.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    upsertMutation.mutate({
      type,
      name: name.trim(),
      apiKey: apiKey.trim(),
    });
  };

  const getApiKeyPlaceholder = () => {
    switch (type) {
      case CredentialType.OPENAI_API_KEY:
        return 'sk-...';
      case CredentialType.GEMINI_API_KEY:
        return 'AI...';
      case CredentialType.ANTHROPIC_API_KEY:
        return 'sk-ant-...';
      default:
        return 'Enter your API key';
    }
  };

  const getApiKeyHelpText = () => {
    switch (type) {
      case CredentialType.OPENAI_API_KEY:
        return 'Get your API key from https://platform.openai.com/api-keys';
      case CredentialType.GEMINI_API_KEY:
        return 'Get your API key from https://makersuite.google.com/app/apikey';
      case CredentialType.ANTHROPIC_API_KEY:
        return 'Get your API key from https://console.anthropic.com/';
      default:
        return 'Enter your API key';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Credential Name</Label>
            <Input
              id="name"
              type="text"
              placeholder={`My ${serviceName} Key`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder={getApiKeyPlaceholder()}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {getApiKeyHelpText()}
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            <KeyIcon className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save API Key'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
