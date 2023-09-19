import * as d3 from 'd3';

interface EgoGraphBandProps {
    radius: number;
    bandData: [
        string,
        {
            [key: string]: {
                id: string;
                graphCenterPos: { x: number; y: number };
                pos: { x: number; y: number };
            }[];
        }
    ];
}

function moveAlongCenter(x,y, radius, centerPos:{x:number, y:number}){
    const resultingPoint: [number, number] = scaleVectorToLength(
        x - centerPos.x,
        y - centerPos.y,
        radius
    );
    resultingPoint[0] += centerPos.x;
    resultingPoint[1] += centerPos.y;
    return resultingPoint
}

function scaleVectorToLength(
    x: number,
    y: number,
    scale: number
): [number, number] {
    const length = Math.sqrt(x * x + y * y);
    return [(x / length) * scale, (y / length) * scale];
}

function midPointControl(x:number,y:number, centerPos: {x:number, y: number}, factor:number){
    const midPointControl: [number, number] = [
        x +
            (x - centerPos.x) * factor,
        y +
            (y - centerPos.y) * factor
    ];
    return midPointControl
}

function generateArcAndMidpoints(firstPos, secondPos, radius, centerPos){
    const factor = 0.3;
    const arcFactor = 1.05;
    const arcFactor2 = 1.2;

    const firstSecondMidpoint = moveAlongCenter((firstPos[0] + secondPos[0]) / 2, (firstPos[1] + secondPos[1]) / 2, radius,centerPos)
    const firstSecondMidpointControl: [number, number] = midPointControl(firstSecondMidpoint[0], firstSecondMidpoint[1], centerPos, factor)
    const firstSecondMidpointControl2: [number, number] = midPointControl(firstSecondMidpoint[0], firstSecondMidpoint[1], centerPos, factor*2)
    firstSecondMidpoint[0] -= centerPos.x;
    firstSecondMidpoint[1] -= centerPos.y;
    firstSecondMidpoint[0] *= arcFactor2;
    firstSecondMidpoint[1] *= arcFactor2;
    firstSecondMidpoint[0] += centerPos.x;
    firstSecondMidpoint[1] += centerPos.y;

    const firstArcPos = moveAlongCenter(firstPos[0], firstPos[1], radius*arcFactor, centerPos)
    const firstArcPosControl = moveAlongCenter(firstPos[0], firstPos[1], radius*arcFactor*arcFactor2, centerPos)

    const secondArcPos = moveAlongCenter(secondPos[0], secondPos[1], radius*arcFactor, centerPos)
    const secondArcPosControl = moveAlongCenter(secondPos[0], secondPos[1], radius*arcFactor*arcFactor2, centerPos)

    return [firstSecondMidpoint, firstSecondMidpointControl, firstSecondMidpointControl2, firstArcPos, firstArcPosControl, secondArcPos, secondArcPosControl]
}

function getPath(
    start: {
        graphCenterPos: { x: number; y: number };
        pos: { x: number; y: number };
    }[],
    end: {
        graphCenterPos: { x: number; y: number };
        pos: { x: number; y: number };
    }[],
    flip: boolean,
    radius: number
) {
    
    const firstPos: [number, number] = flip
        ? [start[0].pos.x, start[0].pos.y]
        : [start[1].pos.x, start[1].pos.y];
    const secondPos: [number, number] = flip
        ? [start[1].pos.x, start[1].pos.y]
        : [start[0].pos.x, start[0].pos.y];

    const thirdPos: [number, number] = [end[0].pos.x, end[0].pos.y];
    const fourthPos: [number, number] = [end[1].pos.x, end[1].pos.y];

    const [firstSecondMidpoint, firstSecondMidpointControl, firstSecondMidpointControl2, firstArcPos, firstArcPosControl, secondArcPos, secondArcPosControl] = generateArcAndMidpoints(firstPos, secondPos,radius, start[0].graphCenterPos)

    const [thirdFourthMidpoint, thirdFourthMidpointControl, thirdFourthMidpointControl2, thirdArcPos, thirdArcPosControl, fourthArcPos, fourthArcPosControl] = generateArcAndMidpoints(thirdPos, fourthPos,radius, end[0].graphCenterPos)


    // build the d attributes by calculating the cubic bezier curve
    const basisSpline = d3.line().curve(d3.curveBasis);
    const curve = basisSpline([
        firstSecondMidpointControl,
        firstSecondMidpointControl2,
        thirdFourthMidpointControl2,
        thirdFourthMidpointControl
    ]);

    return [
        `
        ${curve}
        `,
        `M${firstArcPos[0]} ${firstArcPos[1]}
        C ${firstArcPosControl[0]} ${firstArcPosControl[1]} ${firstSecondMidpoint[0]} ${firstSecondMidpoint[1]} ${firstSecondMidpointControl[0]} ${firstSecondMidpointControl[1]}
        C ${firstSecondMidpoint[0]} ${firstSecondMidpoint[1]} ${secondArcPosControl[0]} ${secondArcPosControl[1]} ${secondArcPos[0]} ${secondArcPos[1]}
        L ${start[0].graphCenterPos.x} ${start[0].graphCenterPos.y}
        Z
        M${thirdArcPos[0]} ${thirdArcPos[1]}
        C ${thirdArcPosControl[0]} ${thirdArcPosControl[1]} ${thirdFourthMidpoint[0]} ${thirdFourthMidpoint[1]} ${thirdFourthMidpointControl[0]} ${thirdFourthMidpointControl[1]}
        C ${thirdFourthMidpoint[0]} ${thirdFourthMidpoint[1]} ${fourthArcPosControl[0]} ${fourthArcPosControl[1]} ${fourthArcPos[0]} ${fourthArcPos[1]}
        L ${end[0].graphCenterPos.x} ${end[0].graphCenterPos.y}
        Z
    `
    ];
}

const EgoGraphBand = (props: EgoGraphBandProps) => {
    const { bandData, radius } = props;
    let pathData: { path: string[]; color: string }[] = [];
    console.log('BD', bandData);
    if (Object.values(bandData[1]).length === 0) return null;
    if (Object.values(bandData[1]).length === 1) return null;
    if (Object.values(bandData[1]).length === 2) {
        const start = Object.values(bandData[1])[0];
        const end = Object.values(bandData[1])[1];
        pathData = [
            {
                path: getPath(start, end, false, radius),
                color: 'red'
            }
        ];
    }
    if (Object.keys(bandData[1]).length === 3) {
        const start = Object.values(bandData[1])[0];
        const mid = Object.values(bandData[1])[1];
        const end = Object.values(bandData[1])[2];

        //make a path consisting of 3 bands, one for each pair of nodes
        //start to mid, mid to end, end to start
        // push start to mid
        pathData.push({
            path: getPath(start, mid, true, radius),
            color: 'coral'
        });
        // push mid to end
        pathData.push({
            path: getPath(mid, end, true, radius),
            color: 'coral'
        });
        // push end to start
        pathData.push({
            path: getPath(end, start, true, radius),
            color: 'coral'
        });
    }

    return pathData.map((pathDatum) => (
        <>
            <path
                d={pathDatum.path[1]}
                className="band"
                stroke={pathDatum.color}
                opacity={0.7}
                strokeWidth="5"
                fill={pathDatum.color}
            />
            <path
                d={pathDatum.path[0]}
                className="band"
                stroke={pathDatum.color}
                opacity={0.7}
                strokeWidth="5"
                fill={'None'}
            />
        </>
    ));
};

export default EgoGraphBand;
