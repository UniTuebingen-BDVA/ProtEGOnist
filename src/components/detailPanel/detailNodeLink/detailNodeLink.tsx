import DetailNodes from './detailNodes';
import DetailLinks from './detailLinks';
import { useAtom } from 'jotai';
import { linkAtom, nodeAtom } from './detailStore';


interface DetailNodeLinkProps {
}

/**
 * Renders the detail panel for node-link visualization.
 * @param {DetailNodeLinkProps} props - The props for the DetailNodeLink component.
 * @returns {JSX.Element} The rendered detail panel.
 */
const DetailNodeLink = () => {
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