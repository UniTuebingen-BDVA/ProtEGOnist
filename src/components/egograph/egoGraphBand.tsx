import React from 'react';

interface EgoGraphBandProps {
    bandData: [
        string,
        {
            [key: string]: { id: string; pos: { x: number; y: number } }[];
        }
    ];
}

const EgoGraphBand = (props: EgoGraphBandProps) => {
    const { bandData } = props;
    let path = '';
    if (Object.values(bandData[1]).length === 0) return null;
    if (Object.values(bandData[1]).length === 1) return null;
    if (Object.values(bandData[1]).length === 2) {
        const start = Object.values(bandData[1])[0];
        const end = Object.values(bandData[1])[1];
        path = `M ${start[0]['pos']['x']} ${start[0]['pos']['y']}L ${start[1]['pos']['x']} ${start[1]['pos']['y']} L ${end[1]['pos']['x']} ${end[1]['pos']['y']} L ${end[0]['pos']['x']} ${end[0]['pos']['y']} Z`;
    }
    if (Object.keys(bandData).length === 3) {
        const start = Object.values(bandData[1])[0];
        const mid = Object.values(bandData[1])[1];
        const end = Object.values(bandData[1])[2];
        path = `M ${start[0]['pos']['x']} ${start[0]['pos']['y']}L ${start[1]['pos']['x']} ${start[1]['pos']['y']} L ${mid[0]['pos']['x']} ${mid[0]['pos']['y']} L ${mid[1]['pos']['x']} ${mid[1]['pos']['y']} L ${end[0]['pos']['x']} ${end[0]['pos']['y']} L ${end[1]['pos']['x']} ${end[1]['pos']['y']} Z`;
    }
    return (
        <path
            d={path}
            className="band"
            stroke="black"
            strokeWidth="2"
            fill="red"
        />
    );
};

export default EgoGraphBand;
