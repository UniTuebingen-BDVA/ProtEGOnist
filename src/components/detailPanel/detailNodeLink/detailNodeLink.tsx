import DetailNodes from './detailNodes';


interface DetailNodeLinkProps {
}

// example data for DetailNodes
const nodes = [
  { id: 'A', cx: 100, cy: 100, fill: 'red', size: 10 },
  { id: 'B', cx: 150, cy: 150, fill: 'blue', size: 20 },
  { id: 'C', cx: 200, cy: 200, fill: 'green', size: 30 }
];
const DetailNodeLink = (props: DetailNodeLinkProps) => {
    return (
      <g>
        <DetailNodes nodes={nodes}/>
      </g>
    );
}

export default DetailNodeLink;