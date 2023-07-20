
import  {useEffect, useRef} from 'react'
import Egograph from './egograph.tsx'
import { useDimensions } from '../../UtilityFunctions.ts'
import { useAtom, useSetAtom } from 'jotai'
import { graphSizeAtom } from './networkStore.ts'

import { RefObject, useMemo, useSyncExternalStore } from "react"
// function subscribe(callback: (e: Event) => void) {
//     console.log("subscribing")
//     window.addEventListener("resize", callback)
//     return () => {
//       console.log("unsubscribing")
//       window.removeEventListener("resize", callback)
//     }
//   }
  
//   function useDimensions(ref: RefObject<HTMLElement>) {
//     const dimensions = useSyncExternalStore(
//       subscribe,
//       () => {
//         console.log("getting dimensions")
//         return (JSON.stringify({
//         width: ref.current?.offsetWidth ?? 0,
//         height: ref.current?.offsetHeight ?? 0,
//       }))}
//     )
//     return useMemo(() => JSON.parse(dimensions), [dimensions])
//   }
function EgoGraphViewer() {
    const refEgo = useRef(null)
    const {width, height} = useDimensions(refEgo)
// const setEgoWidth=useSetAtom(graphSizeAtom)
//     useEffect(()=>
//         setEgoWidth(width)
//     ,[width])


    return (
        <div ref={refEgo} style={{ width: '100%', height:"100%",alignItems: "center", justifyContent: "center", backgroundColor:"white" }} >
            <svg width={width} height={height}>
                <g
                    transform={
                        'translate(' +
                        String(width/2) +
                        ',' +
                        String(height/2) +
                        ')'
                    }
                >
                    {/* <Egograph /> */}
                </g>
            </svg>
        </div>
    )
}
export default EgoGraphViewer;
