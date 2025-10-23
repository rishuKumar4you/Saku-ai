import { useQueryStates } from "nuqs";
import { workflowsParams } from "../params";

export const useWorklowsParams = () => {
    
    return useQueryStates(workflowsParams);

};