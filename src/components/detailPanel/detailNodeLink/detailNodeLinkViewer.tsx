import { useAtom, useSetAtom } from 'jotai';
import DetailView from '../detailView.tsx';
import DetailNodeLink from './detailNodeLink.tsx';
import { getNodeLinkFromSelectionAtom } from '../../../apiCalls.ts';

interface DetailNodeLinkViewerProps {
}

function DetailNodeLinkViewer(props: DetailNodeLinkViewerProps) {
  const detailBusy = false //useAtom(detailNodeLinkBusyAtom);
  const getNodeLink = useSetAtom(getNodeLinkFromSelectionAtom)
  const svgSize = { width: 500, height: 290, percentWidth: 100};
  const nodeLink =()=>(<DetailNodeLink
    transform={`translate(${svgSize.width/2}, ${svgSize.height/2})`}
  />)
  return (
    <div>
    <DetailView
            content={nodeLink}
            title={`Node Link View of selected Nodes`}
            name='Detail Node-Link Diagram'
            infoContent={'detailNodeLink'}
            busy={detailBusy}
            contentSize={svgSize}
        />
    <button onClick={
      () => {
        getNodeLink()
      }
    
    }>DetailNodeLinkViewer</button>
    </div>
  );
}

export default DetailNodeLinkViewer;