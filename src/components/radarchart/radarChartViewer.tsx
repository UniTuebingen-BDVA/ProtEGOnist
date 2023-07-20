
import  {useRef} from 'react'
import { intersectionDatum } from '../../egoGraphSchema';
import RadarChart from './radarChart.tsx'
import { RefObject, useMemo, useSyncExternalStore } from "react"

// import { useDimensions } from '../../UtilityFunctions.ts'


function subscribe(callback: (e: Event) => void) {
    console.log("subscribing")
    window.addEventListener("resize", callback)
    return () => {
      console.log("unsubscribing")
      window.removeEventListener("resize", callback)
    }
  }
  
  function useDimensions(ref: RefObject<HTMLElement>) {
    const dimensions = useSyncExternalStore(
      subscribe,
      () => {
        console.log("getting dimensions")
        return (JSON.stringify({
        width: ref.current?.offsetWidth ?? 0,
        height: ref.current?.offsetHeight ?? 0,
      }))}
    )
    return useMemo(() => JSON.parse(dimensions), [dimensions])
  }

interface RadarChartViewerProps {
    intersectionData: { [name: string | number]: intersectionDatum };
    tarNode: string;
}

function RadarChartViewer(props: RadarChartViewerProps) {
    const ref = useRef(null)
    const {width, height} = useDimensions(ref)

    return (
        <div ref={ref} style={{ width: '100%', height:"100%", display:"flex", textAlign:"center", alignItems: "center", justifyContent: "center", backgroundColor:"white" }} >
            <svg style={{"display":"flex"}} width={width*0.99} height={height*0.99} viewBox={`0 0 ${width*2} ${height*2}`}>
                <g
                    transform={
                        'translate(' +
                        String(width) +
                        ',' +
                        String(height) +
                        ')'
                    }
                >
                    <RadarChart
                        intersectionData={props.intersectionData}
                        tarNode={props.tarNode}
                        baseRadius={width/2}
                    />
                </g>
            </svg>
        </div>
    )
}
export default RadarChartViewer;



