import DetailNodes from './detailNodes';
import DetailLinks from './detailLinks';


interface DetailNodeLinkProps {
}

// example data for DetailNodes
const nodes = [
  { id: 'A', cx: 100, cy: 100, fill: 'red', size: 10 },
  { id: 'B', cx: 150, cy: 150, fill: 'blue', size: 10 },
  { id: 'C', cx: 200, cy: 200, fill: 'green', size: 10 },
  { id: 'D', cx: 100, cy: 250, fill: 'yellow', size: 10 },
  { id: 'E', cx: 150, cy: 200, fill: 'purple', size: 10 }
];

// example data for DetailLinks
const links = [
  { id: 'A-B', x1: 100, y1: 100, x2: 150, y2: 150 },
  { id: 'B-C', x1: 150, y1: 150, x2: 200, y2: 200 },
  { id: 'C-D', x1: 200, y1: 200, x2: 100, y2: 250 },
  { id: 'D-E', x1: 100, y1: 250, x2: 150, y2: 200 },
  { id: 'E-A', x1: 150, y1: 200, x2: 100, y2: 100 }
];
const DetailNodeLink = (props: DetailNodeLinkProps) => {
    return (
      <g>
        <DetailLinks links={links}/>
        <DetailNodes nodes={nodes}/> 
      </g>
    );
}

export default DetailNodeLink;