import { useAtom } from 'jotai';
import DetailView from '../detailView.tsx';
import DetailNodeLink from './detailNodeLink.tsx';

interface DetailNodeLinkViewerProps {
}

function DetailNodeLinkViewer(props: DetailNodeLinkViewerProps) {
  const detailBusy = false //useAtom(detailNodeLinkBusyAtom);

  const svgSize = { width: 500, height: 290, percentWidth: 100};
  const nodeLink =()=>(<DetailNodeLink
  />)
  return (
    <DetailView
            content={nodeLink}
            title={`Node Link View of selected Nodes`}
            name='Detail Node-Link Diagram'
            infoContent={'detailNodeLink'}
            busy={detailBusy}
            contentSize={svgSize}
        />
  );
}

export default DetailNodeLinkViewer;