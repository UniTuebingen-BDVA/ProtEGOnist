interface EgoGraphBandProps {
    bandData: [
        string,
        {
            [key: string]: { id: string; pos: { x: number; y: number } }[];
        }
    ];
}

function getPath(
    start: { pos: { x: number; y: number } }[],
    end: { pos: { x: number; y: number } }[],
    flip = false
) {
    const centerOfArea = {
        x:
            (start[0]['pos']['x'] +
                end[0]['pos']['x'] +
                start[1]['pos']['x'] +
                end[1]['pos']['x']) /
            4,
        y:
            (start[0]['pos']['y'] +
                end[0]['pos']['y'] +
                start[1]['pos']['y'] +
                end[1]['pos']['y']) /
            4
    };
    const firstPos = flip ? start[0].pos : start[1].pos;
    const secondPos = flip ? start[1].pos : start[0].pos;
    const thirdPos = end[0].pos;
    const fourthPos = end[1].pos;
    return `M ${firstPos.x} ${firstPos.y}
         L ${secondPos.x} ${secondPos.y}
         Q ${centerOfArea.x} ${centerOfArea.y} ${thirdPos.x} ${thirdPos.y}
         L ${fourthPos.x} ${fourthPos.y}
         Q ${centerOfArea.x} ${centerOfArea.y} ${firstPos.x} ${firstPos.y}`;
}

const EgoGraphBand = (props: EgoGraphBandProps) => {
    const { bandData } = props;
    let pathData: { path: string; color: string }[] = [];
    if (Object.values(bandData[1]).length === 0) return null;
    if (Object.values(bandData[1]).length === 1) return null;
    if (Object.values(bandData[1]).length === 2) {
        const start = Object.values(bandData[1])[0];
        const end = Object.values(bandData[1])[1];
        pathData = [{ path: getPath(start, end, false), color: 'red' }];
    }
    if (Object.keys(bandData[1]).length === 3) {
        const start = Object.values(bandData[1])[0];
        const mid = Object.values(bandData[1])[1];
        const end = Object.values(bandData[1])[2];

        //make a path consisting of 3 bands, one for each pair of nodes
        //start to mid, mid to end, end to start
        // push start to mid
        pathData.push({ path: getPath(start, mid, true), color: 'coral' });
        // push mid to end
        pathData.push({ path: getPath(mid, end, true), color: 'coral' });
        // push end to start
        pathData.push({ path: getPath(end, start, true), color: 'coral' });
    }

    return pathData.map((pathDatum) => (
        <path
            d={pathDatum.path}
            className="band"
            stroke={pathDatum.color}
            opacity={0.7}
            strokeWidth="2"
            fill={pathDatum.color}
        />
    ));
};

export default EgoGraphBand;
