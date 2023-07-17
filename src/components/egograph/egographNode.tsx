import {PrimitiveAtom, useSetAtom} from "jotai";
import {layoutNode} from "./egolayout.ts";

type egographNodeProps = {
    nodeAtom: PrimitiveAtom<layoutNode>,
    centerPoint: { x: number, y: number },
    nodeRadius: number,
    fill: string;
}
export const EgographNode = (props: egographNodeProps) => {
    const {nodeAtom, centerPoint, nodeRadius,fill} = props;
    const setNode = useSetAtom(nodeAtom);
    return (<circle
        onMouseEnter={() => {
            setNode((oldValue) => ({...oldValue, hovered: true}))
        }}
        onMouseLeave={() => {
            setNode((oldValue) => ({...oldValue, hovered: false}))
        }}
        cx={centerPoint.x}
        cy={centerPoint.y}
        r={nodeRadius}
        fill={fill}
        stroke={"black"}/>)
}