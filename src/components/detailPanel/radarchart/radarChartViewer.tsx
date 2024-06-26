import { intersectionDatum } from '../../../egoGraphSchema';
import RadarChart from './radarChart.tsx';
import { useAtom } from 'jotai';
import DetailView from '../detailView.tsx';
import { classifyByAtom, radarChartBusyAtom } from '../../../apiCalls.ts';
import { detailedSVGSizeAtom } from '../../../uiStore.tsx';

interface RadarChartViewerProps {
    intersectionData: { [name: string | number]: intersectionDatum };
    tarNode: string;
}

function RadarChartViewer(props: RadarChartViewerProps) {
    const [radarBusy] = useAtom(radarChartBusyAtom);
    const [classifyBy] = useAtom(classifyByAtom);

    const [svgSize] = useAtom(detailedSVGSizeAtom);
    const baseRadius=svgSize.width > svgSize.height
                            ? svgSize.height / 2
                            : svgSize.width / 2;
    return (
        <DetailView
            title={`Neighborhood of selected node (radar center) classified by ${classifyBy}`}
            name="Radar Chart"
            infoContent={'radarChart'}
            busy={radarBusy}
        >
            <svg
                preserveAspectRatio={'xMinYMin'}
                height={"90%"}
                viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
            >
                <RadarChart
                    intersectionData={props.intersectionData}
                    tarNode={props.tarNode}
                    baseRadius={baseRadius}
                    transform={`translate(${svgSize.width/2}, ${svgSize.height/2})`}
                />
            </svg>
        </DetailView>
    );
}

export default RadarChartViewer;
