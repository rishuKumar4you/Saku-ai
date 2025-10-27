-- CreateEnum
CREATE TYPE "TriggerStatus" AS ENUM ('ACTIVE', 'STOPPED');

-- CreateTable
CREATE TABLE "workflow_trigger" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "triggerType" "NodeType" NOT NULL,
    "status" "TriggerStatus" NOT NULL DEFAULT 'ACTIVE',
    "config" JSONB NOT NULL,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_trigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_trigger_workflowId_nodeId_key" ON "workflow_trigger"("workflowId", "nodeId");

-- AddForeignKey
ALTER TABLE "workflow_trigger" ADD CONSTRAINT "workflow_trigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
