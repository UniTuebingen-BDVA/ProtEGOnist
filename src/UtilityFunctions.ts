import { RefObject, useMemo, useSyncExternalStore } from "react"

export function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInRadians: number
) {
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians)
    };
}


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

export { useDimensions }