"use client";

import { CredentialType } from '@/generated/prisma';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BrainIcon, 
  MailIcon, 
  KeyIcon, 
  PlusIcon, 
  CheckIcon, 
  XIcon,
  AlertCircleIcon 
} from 'lucide-react';
import { useState } from 'react';
import { ApiKeyForm } from '@/features/credentials/components/api-key-form';
import { GmailOAuthForm } from '@/features/credentials/components/gmail-oauth-form';

export function CredentialsInterface() {
  const [activeTab, setActiveTab] = useState('ai-services');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const { data: credentials, isLoading, refetch } = useQuery(trpc.credentials.getAll.queryOptions());
  
  const toggleActiveMutation = useMutation(
    trpc.credentials.toggleActive.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.credentials.getAll.queryOptions());
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.credentials.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.credentials.getAll.queryOptions());
      },
    })
  );

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this credential?')) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading credentials...</div>
      </div>
    );
  }

  const aiCredentials = credentials?.filter(c => 
    c.type === CredentialType.OPENAI_API_KEY || 
    c.type === CredentialType.GEMINI_API_KEY || 
    c.type === CredentialType.ANTHROPIC_API_KEY
  ) || [];

  const gmailCredential = credentials?.find(c => c.type === CredentialType.GMAIL_OAUTH);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Credentials</h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys and OAuth connections for workflow nodes.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-services" className="flex items-center gap-2">
            <BrainIcon className="h-4 w-4" />
            AI Services
          </TabsTrigger>
          <TabsTrigger value="email-services" className="flex items-center gap-2">
            <MailIcon className="h-4 w-4" />
            Email Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-services" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* OpenAI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainIcon className="h-5 w-5" />
                  OpenAI
                </CardTitle>
                <CardDescription>
                  API key for OpenAI models (GPT-4, GPT-3.5, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiCredentials.find(c => c.type === CredentialType.OPENAI_API_KEY) ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={aiCredentials.find(c => c.type === CredentialType.OPENAI_API_KEY)?.isActive ? "default" : "secondary"}>
                        {aiCredentials.find(c => c.type === CredentialType.OPENAI_API_KEY)?.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(
                            aiCredentials.find(c => c.type === CredentialType.OPENAI_API_KEY)!.id,
                            !aiCredentials.find(c => c.type === CredentialType.OPENAI_API_KEY)!.isActive
                          )}
                        >
                          {aiCredentials.find(c => c.type === CredentialType.OPENAI_API_KEY)?.isActive ? (
                            <XIcon className="h-4 w-4" />
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(aiCredentials.find(c => c.type === CredentialType.OPENAI_API_KEY)!.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {aiCredentials.find(c => c.type === CredentialType.OPENAI_API_KEY)?.name}
                    </p>
                  </div>
                ) : (
                  <ApiKeyForm 
                    type="OPENAI_API_KEY"
                    serviceName="OpenAI"
                    onSuccess={() => queryClient.invalidateQueries(trpc.credentials.getAll.queryOptions())}
                  />
                )}
              </CardContent>
            </Card>

            {/* Gemini */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainIcon className="h-5 w-5" />
                  Google Gemini
                </CardTitle>
                <CardDescription>
                  API key for Google Gemini models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiCredentials.find(c => c.type === CredentialType.GEMINI_API_KEY) ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={aiCredentials.find(c => c.type === CredentialType.GEMINI_API_KEY)?.isActive ? "default" : "secondary"}>
                        {aiCredentials.find(c => c.type === CredentialType.GEMINI_API_KEY)?.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(
                            aiCredentials.find(c => c.type === CredentialType.GEMINI_API_KEY)!.id,
                            !aiCredentials.find(c => c.type === CredentialType.GEMINI_API_KEY)!.isActive
                          )}
                        >
                          {aiCredentials.find(c => c.type === CredentialType.GEMINI_API_KEY)?.isActive ? (
                            <XIcon className="h-4 w-4" />
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(aiCredentials.find(c => c.type === CredentialType.GEMINI_API_KEY)!.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {aiCredentials.find(c => c.type === CredentialType.GEMINI_API_KEY)?.name}
                    </p>
                  </div>
                ) : (
                  <ApiKeyForm 
                    type="GEMINI_API_KEY"
                    serviceName="Google Gemini"
                    onSuccess={() => queryClient.invalidateQueries(trpc.credentials.getAll.queryOptions())}
                  />
                )}
              </CardContent>
            </Card>

            {/* Anthropic */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainIcon className="h-5 w-5" />
                  Anthropic
                </CardTitle>
                <CardDescription>
                  API key for Anthropic Claude models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiCredentials.find(c => c.type === CredentialType.ANTHROPIC_API_KEY) ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={aiCredentials.find(c => c.type === CredentialType.ANTHROPIC_API_KEY)?.isActive ? "default" : "secondary"}>
                        {aiCredentials.find(c => c.type === CredentialType.ANTHROPIC_API_KEY)?.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(
                            aiCredentials.find(c => c.type === CredentialType.ANTHROPIC_API_KEY)!.id,
                            !aiCredentials.find(c => c.type === CredentialType.ANTHROPIC_API_KEY)!.isActive
                          )}
                        >
                          {aiCredentials.find(c => c.type === CredentialType.ANTHROPIC_API_KEY)?.isActive ? (
                            <XIcon className="h-4 w-4" />
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(aiCredentials.find(c => c.type === CredentialType.ANTHROPIC_API_KEY)!.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {aiCredentials.find(c => c.type === CredentialType.ANTHROPIC_API_KEY)?.name}
                    </p>
                  </div>
                ) : (
                  <ApiKeyForm 
                    type="ANTHROPIC_API_KEY"
                    serviceName="Anthropic"
                    onSuccess={() => queryClient.invalidateQueries(trpc.credentials.getAll.queryOptions())}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email-services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailIcon className="h-5 w-5" />
                Gmail Integration
              </CardTitle>
              <CardDescription>
                OAuth connection for Gmail email services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gmailCredential ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={gmailCredential.isActive ? "default" : "secondary"}>
                      {gmailCredential.isActive ? "Connected" : "Disconnected"}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(gmailCredential.id, !gmailCredential.isActive)}
                      >
                        {gmailCredential.isActive ? (
                          <>
                            <XIcon className="h-4 w-4 mr-1" />
                            Disconnect
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(gmailCredential.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Connected to: {gmailCredential.name}</p>
                    {gmailCredential.scope && (
                      <p>Scopes: {gmailCredential.scope}</p>
                    )}
                    {gmailCredential.expiresAt && (
                      <p>Expires: {new Date(gmailCredential.expiresAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ) : (
                <GmailOAuthForm onSuccess={() => queryClient.invalidateQueries(trpc.credentials.getAll.queryOptions())} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
