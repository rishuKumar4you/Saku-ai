import { NodeProps } from "@xyflow/react";
import { MousePointer, MousePointerIcon } from "lucide-react";
import { BaseTriggerNode } from "../base-trigger-node";
import { memo } from "react";


export const ManualTriggerNode = memo((props: NodeProps) => {
    return (
        <>
            <BaseTriggerNode
                {...props}
                icon={MousePointerIcon}
                name="When clicking 'Execute workflow' "
            // status={nodeStatus}  //TODO
            // onSettings={handleOpenSettings} // TODO
                // onDoubleClick={handleOpenSettings} // TODO
                
            />
        </>
   ) 
});