
import  {useEffect, useRef} from 'react'
import Egograph from './egograph'
import { Paper} from '@mui/material'
import { useDimensions } from '../../UtilityFunctions'
import {useAtom} from 'jotai'
import {graphSVGSizeAtom} from './networkStore'


function EgoGraphViewer() {
    const refEgo = useRef(null)
    const {width, height} = useDimensions(refEgo)
    const [svgSize, setSVGSize] = useAtom(graphSVGSizeAtom)
    
    useEffect(() => {
        setSVGSize({width: width, height: height})
    }, [height, width])

    return (
             <Paper ref={refEgo}  style={{ width: '100%', height:"100%", alignItems: "center", justifyContent: "center", margin:0, padding:0 }} > 
                <svg width={svgSize.width} height={svgSize.height-10} viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}>
                    <g
                        transform={
                            'translate(' +
                            String(svgSize.width/2) +
                            ',' +
                            String(svgSize.height/2) +
                            ')'
                        }
                    >
                        <Egograph />
                    </g>
                </svg>
            </Paper>
        
    )
}
export default EgoGraphViewer;
