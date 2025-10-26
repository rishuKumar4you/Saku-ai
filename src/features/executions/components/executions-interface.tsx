"use client";

import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  AlertCircleIcon,
  RefreshCwIcon,
  EyeIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ExecutionStatus } from '@/generated/prisma';
import { useState } from 'react';

export function ExecutionsInterface() {
  const trpc = useTRPC();
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  
  const { data: executions, isLoading, refetch } = useQuery(
    trpc.executions.getAll.queryOptions()
  );

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case ExecutionStatus.PENDING:
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case ExecutionStatus.RUNNING:
        return <RefreshCwIcon className="h-4 w-4 text-blue-500 animate-spin" />;
      case ExecutionStatus.COMPLETED:
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case ExecutionStatus.FAILED:
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case ExecutionStatus.CANCELLED:
        return <AlertCircleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case ExecutionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ExecutionStatus.RUNNING:
        return 'bg-blue-100 text-blue-800';
      case ExecutionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ExecutionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case ExecutionStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading executions...</div>
      </div>
    );
  }

  if (!executions || executions.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center py-12">
          <PlayIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Executions Yet</h3>
          <p className="text-muted-foreground">
            Execute a workflow to see execution history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Executions</h1>
        <p className="text-muted-foreground mt-2">
          View and monitor your workflow executions.
        </p>
      </div>

      <div className="space-y-4">
        {executions.map((execution) => (
          <Card key={execution.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(execution.status)}
                  <div>
                    <CardTitle className="text-lg">
                      {execution.workflow.name}
                    </CardTitle>
                    <CardDescription>
                      Started {formatDistanceToNow(new Date(execution.startedAt))} ago
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(execution.status)}>
                    {execution.status.toLowerCase()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedExecution(
                      selectedExecution === execution.id ? null : execution.id
                    )}
                  >
                    <EyeIcon className="h-4 w-4" />
                    {selectedExecution === execution.id ? 'Hide' : 'View'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {selectedExecution === execution.id && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Execution ID:</span>
                      <p className="text-muted-foreground font-mono text-xs">
                        {execution.id}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Started:</span>
                      <p className="text-muted-foreground">
                        {new Date(execution.startedAt).toLocaleString()}
                      </p>
                    </div>
                    {execution.completedAt && (
                      <div>
                        <span className="font-medium">Completed:</span>
                        <p className="text-muted-foreground">
                          {new Date(execution.completedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-muted-foreground">
                        {execution.completedAt 
                          ? `${Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s`
                          : formatDistanceToNow(new Date(execution.startedAt), { 
                              addSuffix: false 
                            })
                        }
                      </p>
                    </div>
                  </div>

                  {execution.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2">Error</h4>
                      <p className="text-red-700 text-sm">{execution.error}</p>
                    </div>
                  )}

                  {execution.result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">Results</h4>
                      <pre className="text-green-700 text-sm overflow-auto">
                        {JSON.stringify(execution.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {execution.logs && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Logs</h4>
                      <pre className="text-blue-700 text-sm overflow-auto">
                        {JSON.stringify(execution.logs, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
