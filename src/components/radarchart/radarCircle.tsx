import { useSpring, animated } from '@react-spring/web';
import { Tooltip } from '@mui/material';
import { intersectionDatum } from '../../egoGraphSchema';
import { getRadarAtom } from '../../apiCalls';
import { useAtom } from 'jotai';
import * as d3 from 'd3';
import { selectedProteinsAtom } from '../selectionTable/tableStore';
import AdvancedTooltip from '../advancedTooltip/advancedTooltip';

interface RadarCircleProps {
    id: string;
    index: number;
    intersectionDatum: intersectionDatum;
    arrayLength: number;
    GUIDE_CIRCLE_RADIUS: number;
    CIRCLE_RADIUS: number;
    colorScale: d3.ScaleOrdinal<string, unknown, never>;
    intersectionLengthScale: d3.ScaleLinear<number, number, never>;
    styleParam: any;
}

const RadarCircle = (props: RadarCircleProps) => {
    const {
        id,
        index,
        intersectionDatum,
        arrayLength,
        GUIDE_CIRCLE_RADIUS,
        CIRCLE_RADIUS,
        colorScale,
        intersectionLengthScale,
        styleParam
    } = props;
    const [_intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [selectedProteins, setSelectedProteins] =
        useAtom(selectedProteinsAtom);

    return (
        <AdvancedTooltip uniprotID={id} key={id}>
            <animated.circle
                key={id}
                r={
                    CIRCLE_RADIUS +
                    intersectionLengthScale(intersectionDatum.setSize) *
                        CIRCLE_RADIUS
                }
                fill={colorScale(intersectionDatum.classification)}
                fillOpacity={0.7}
                stroke={colorScale(intersectionDatum.classification)}
                style={{ ...styleParam }}
                strokeOpacity={0.8}
                strokeWidth={1}
                onClick={(event) => {
                    if (event.shiftKey) {
                        if (!selectedProteins.includes(id)) {
                            setSelectedProteins([...selectedProteins, id]);
                        }
                    } else {
                        getRadarData(id);
                    }
                }}
            />
        </AdvancedTooltip>
    );
};

export default RadarCircle;
