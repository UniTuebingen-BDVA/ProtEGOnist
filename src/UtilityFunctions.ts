export function polarToCartesian(centerX:number, centerY:number, radius:number, angleInRadians:number) {
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}