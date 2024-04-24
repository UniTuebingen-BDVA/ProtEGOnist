import DetailNodes from './detailNodes';
import DetailLinks from './detailLinks';
import { useAtom } from 'jotai';
import { linkAtom, nodeAtom } from './detailStore';


interface DetailNodeLinkProps {
}

const DetailNodeLink = (props: DetailNodeLinkProps) => {
    const [nodes] = useAtom(nodeAtom);
    const [links] = useAtom(linkAtom);
    return (
      <g>
        <DetailLinks links={links}/>
        <DetailNodes nodes={nodes}/> 
      </g>
    );
}

export default DetailNodeLink;