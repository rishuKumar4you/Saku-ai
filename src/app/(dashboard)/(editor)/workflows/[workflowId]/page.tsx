import { WorkflowEditor } from "@/features/workflows/components/workflow-editor";
import { requireAuth } from "@/lib/auth-utils";

type Props = {
  params: Promise<{ workflowId: string }>;
};

export default async function WorkflowEditorPage({ params }: Props) {
  await requireAuth();
  const { workflowId } = await params;
  
  return <WorkflowEditor workflowId={workflowId} />;
}