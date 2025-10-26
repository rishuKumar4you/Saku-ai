import {useReactFlow} from '@xyflow/react';
import {useEffect, useMemo, useState} from 'react';

export function useSelectedNode(nodeId?: string) {
  const {getNode} = useReactFlow();
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const checkSelection = () => {
      if (nodeId) {
        const node = getNode(nodeId);
        setIsSelected(node?.selected || false);
      }
    };

    checkSelection();

    // Check periodically for selection changes
    const interval = setInterval(checkSelection, 100);

    return () => clearInterval(interval);
  }, [nodeId, getNode]);

  return isSelected;
}
