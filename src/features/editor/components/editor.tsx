"use client";
import { useState, useCallback, useEffect } from "react";
import { 
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    type Node,
    type Edge,
    type NodeChange,
    type EdgeChange,
    type Connection,
    Background,
    Controls,
    MiniMap,
    Panel,
} from "@xyflow/react";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useWorkflow } from "@/features/workflows/hooks/use-workflows";
import '@xyflow/react/dist/style.css';
import { nodeComponents } from "@/config/node-components";
import { AddNodeButton } from "./add-node-button";
import { EditorBottomBar } from "./editor-bottom-bar";
import { useSetAtom } from 'jotai';
import { editorAtom } from "../store/atoms";

export const EditorLoading = () => {
    return <LoadingView message="Loading editor..." />
};

export const EditorError = () => {
    return <ErrorView message="Error loading editor"/>
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow, isLoading, error } = useWorkflow(workflowId);

    const setEditor = useSetAtom(editorAtom);

    const [nodes, setNodes] = useState<Node[]>(workflow?.nodes || []);
    const [edges, setEdges] = useState<Edge[]>(workflow?.edges || []);

    // Update nodes and edges when workflow data changes
    useEffect(() => {
        if (workflow) {
            setNodes(workflow.nodes);
            setEdges(workflow.edges);
        }
    }, [workflow]);

    const onNodesChange = useCallback(
        (changes:NodeChange[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)), [],
    );
    
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)), [],
    );
    
    const onConnect = useCallback(
        (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)), [],
    );

    const onEdgeDoubleClick = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            event.stopPropagation();
            setEdges((edgesSnapshot) => edgesSnapshot.filter((e) => e.id !== edge.id));
        },
        [],
    );

    // Conditional returns must come after all hooks
    if (isLoading) {
        return <LoadingView message="Loading editor..." />;
    }

    if (error || !workflow) {
        return <ErrorView message="Error loading workflow" />;
    }

    return (
        <div className="size-full flex flex-col">
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeDoubleClick={onEdgeDoubleClick}
                    nodeTypes={nodeComponents}
                    defaultEdgeOptions={{
                        style: {
                            strokeWidth: 3,
                            stroke: '#3b82f6',
                        },
                    }}
                    fitView
                    snapGrid={[10, 10]}
                    snapToGrid
                    panOnScroll
                    panOnDrag= {false}
                    onInit={setEditor}
                    selectionOnDrag
                    proOptions={{
                        hideAttribution: true,   // hide the ReactFlow logo from the canvas
                    }}
                >   
                    <Background />
                    <Controls />
                    <MiniMap />
                    <Panel position="top-right">
                        <AddNodeButton/>
                    </Panel>
                </ReactFlow>
            </div>
            <EditorBottomBar workflowId={workflowId} />
        </div>
    );

};
 
