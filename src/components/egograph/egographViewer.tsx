
import  {useEffect, useRef} from 'react'
import EgographBundle from './egoGraphBundle'
import { Paper} from '@mui/material'
import { useDimensions } from '../../UtilityFunctions'
import {useAtom} from 'jotai'
import { bundleGroupSizeAtom, graphSVGSizeAtom } from './networkStore';


function EgoGraphViewer() {
    const refEgo = useRef(null)
    const {width, height} = useDimensions(refEgo)
    const [svgSize, setSVGSize] = useAtom(graphSVGSizeAtom)
    const [bundleGroupSize]=useAtom(bundleGroupSizeAtom)

    useEffect(() => {
        setSVGSize({width: width, height: height})
    }, [height, width])

    return (
             <Paper ref={refEgo}  style={{ width: '100%', height:"100%", alignItems: "center", justifyContent: "center", margin:0, padding:0 }} > 
                <svg width={svgSize.width} height={svgSize.height-10} viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}>
                    <g transform={`translate(${(svgSize.width-bundleGroupSize.width)/2},${(svgSize.height-bundleGroupSize.height)/2})`}>
                        <EgographBundle x={0} y={0}/>
                    </g>
                </svg>
            </Paper>
        
    )
}
export default EgoGraphViewer;
