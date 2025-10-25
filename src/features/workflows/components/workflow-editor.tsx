"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Save, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { WORKFLOW_TEMPLATES, getTemplateById } from "../templates";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function WorkflowEditor({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  // Fetch workflow data
  const { data: workflow, isLoading } = useQuery(trpc.workflows.getOne.queryOptions({ id: workflowId }));
  
  const [workflowName, setWorkflowName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [config, setConfig] = useState<Record<string, string>>({});
  
  // Initialize template from workflow data
  useEffect(() => {
    if (workflow?.template && !selectedTemplate) {
      setSelectedTemplate(workflow.template);
    }
  }, [workflow?.template, selectedTemplate]);
  
  const updateName = useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: () => {
        toast.success("Workflow name updated");
        queryClient.invalidateQueries(trpc.workflows.getOne.queryOptions({ id: workflowId }));
      },
    })
  );
  
  const updateTemplate = useMutation(
    trpc.workflows.updateTemplate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.workflows.getOne.queryOptions({ id: workflowId }));
      },
    })
  );
  
  const executeWorkflow = useMutation(
    trpc.workflows.execute.mutationOptions({
      onSuccess: () => {
        toast.success("Workflow execution started!");
        queryClient.invalidateQueries(trpc.workflows.getRuns.queryOptions({ workflowId }));
      },
      onError: (error) => toast.error(`Failed to execute: ${error.message}`),
    })
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading workflow...</div>
      </div>
    );
  }
  
  const template = selectedTemplate ? getTemplateById(selectedTemplate) : null;
  
  const handleSave = () => {
    if (workflowName && workflowName !== workflow?.name) {
      updateName.mutate({ id: workflowId, name: workflowName });
    }
  };
  
  const handleExecute = async () => {
    // Save template first if selected
    if (selectedTemplate && selectedTemplate !== workflow?.template) {
      await updateTemplate.mutateAsync({ id: workflowId, template: selectedTemplate });
    }
    
    executeWorkflow.mutate({ id: workflowId, config });
  };
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/workflows")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Input
                value={workflowName || workflow?.name || ""}
                onChange={(e) => setWorkflowName(e.target.value)}
                onBlur={handleSave}
                className="text-lg font-semibold border-none shadow-none h-auto p-0"
                placeholder="Workflow Name"
              />
              <p className="text-sm text-muted-foreground">
                Create workflow for making your work smoother
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave} disabled={updateName.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleExecute} disabled={executeWorkflow.isPending || !selectedTemplate}>
              <Play className="h-4 w-4 mr-2" />
              {executeWorkflow.isPending ? "Running..." : "Execute"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="runs">Execution History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {WORKFLOW_TEMPLATES.map((tpl) => (
                  <Card
                    key={tpl.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === tpl.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedTemplate(tpl.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-1 text-2xl">
                          {tpl.icons.map((icon, i) => (
                            <span key={i}>{icon}</span>
                          ))}
                        </div>
                        {selectedTemplate === tpl.id && (
                          <Badge>Selected</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{tpl.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {tpl.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                          Trigger: {tpl.config.trigger}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tpl.config.actions.map((action, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="configure" className="mt-6">
              {!selectedTemplate ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Select a template first to configure
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="max-w-2xl space-y-4">
                  {/* Connection Warning */}
                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>⚠️ Important:</strong> Make sure your integrations are connected and have valid tokens:
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                          <li>Go to <a href="/settings/integrations" className="underline font-semibold">Settings → Integrations</a></li>
                          <li>Check if Gmail, Calendar, and Drive show "Connected"</li>
                          <li>If not, or if tokens expired, click "Connect" to reconnect</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configure {template?.name}
                      </CardTitle>
                      <CardDescription>{template?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Gmail Config */}
                      {template?.category === "email" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="emailQuery">Email Search Query</Label>
                            <Input
                              id="emailQuery"
                              placeholder="is:unread from:example@gmail.com"
                              value={config.emailQuery || "is:unread"}
                              onChange={(e) => setConfig({ ...config, emailQuery: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                              Use Gmail search syntax to filter emails
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="maxResults">Max Results</Label>
                            <Input
                              id="maxResults"
                              type="number"
                              placeholder="10"
                              value={config.maxResults || "10"}
                              onChange={(e) => setConfig({ ...config, maxResults: e.target.value })}
                              min="1"
                              max="50"
                            />
                          </div>
                        </>
                      )}
                      
                      {/* Calendar Config */}
                      {template?.category === "calendar" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="meetingDuration">Meeting Duration (minutes)</Label>
                            <Select
                              value={config.meetingDuration || "30"}
                              onValueChange={(value) => setConfig({ ...config, meetingDuration: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="participants">Participants (comma-separated emails)</Label>
                            <Textarea
                              id="participants"
                              placeholder="person1@example.com, person2@example.com"
                              value={config.participants || ""}
                              onChange={(e) => setConfig({ ...config, participants: e.target.value })}
                            />
                          </div>
                        </>
                      )}
                      
                      {/* Drive Config */}
                      {template?.category === "drive" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="folderPath">Folder Path</Label>
                            <Input
                              id="folderPath"
                              placeholder="/Documents/Backups"
                              value={config.folderPath || ""}
                              onChange={(e) => setConfig({ ...config, folderPath: e.target.value })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="filePattern">File Pattern</Label>
                            <Input
                              id="filePattern"
                              placeholder="*.pdf, *.docx"
                              value={config.filePattern || ""}
                              onChange={(e) => setConfig({ ...config, filePattern: e.target.value })}
                            />
                          </div>
                        </>
                      )}
                      
                      <Button onClick={handleExecute} disabled={executeWorkflow.isPending} className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        {executeWorkflow.isPending ? "Executing..." : "Execute Workflow"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="runs" className="mt-6">
              <WorkflowRuns workflowId={workflowId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function WorkflowRuns({ workflowId }: { workflowId: string }) {
  const trpc = useTRPC();
  const { data: runs, isLoading, error } = useQuery({
    ...trpc.workflows.getRuns.queryOptions({ workflowId }),
    enabled: Boolean(workflowId),
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading execution history...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !runs || runs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No execution history yet. Run a workflow to see results here.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {runs.map((run: any) => (
        <Card key={run.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Execution {run.id.substring(0, 8)}
                </CardTitle>
                <CardDescription>
                  Started {new Date(run.startedAt).toLocaleString()}
                  {run.completedAt && ` • Completed ${new Date(run.completedAt).toLocaleString()}`}
                </CardDescription>
              </div>
              <Badge variant={run.status === "completed" ? "default" : run.status === "failed" ? "destructive" : "secondary"}>
                {run.status}
              </Badge>
            </div>
          </CardHeader>
          {(run.output || run.error) && (
            <CardContent>
              {run.error ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-destructive">
                    <strong>❌ Execution Failed</strong>
                  </div>
                  <div className="text-sm bg-destructive/10 p-3 rounded">
                    {run.error}
                  </div>
                  {run.error.includes("expired") && (
                    <div className="text-xs text-muted-foreground mt-2">
                      💡 <strong>Tip:</strong> Go to{" "}
                      <a href="/settings/integrations" className="underline">Settings → Integrations</a>
                      {" "}and reconnect Gmail to get a new token.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-medium">✅ Results:</div>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(run.output, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

