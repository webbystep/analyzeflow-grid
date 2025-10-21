interface Point {
  x: number;
  y: number;
}

export function smoothPath(points: Point[]): Point[] {
  if (points.length <= 2) return points;
  
  const smoothed: Point[] = [points[0]];
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    
    if (dx1 !== dx2 || dy1 !== dy2) {
      smoothed.push(curr);
    }
  }
  
  smoothed.push(points[points.length - 1]);
  return smoothed;
}

export function generateSVGPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  
  const smoothedPoints = smoothPath(points);
  let path = `M ${smoothedPoints[0].x} ${smoothedPoints[0].y}`;
  
  for (let i = 1; i < smoothedPoints.length; i++) {
    const curr = smoothedPoints[i];
    const prev = smoothedPoints[i - 1];
    
    if (i < smoothedPoints.length - 1) {
      const next = smoothedPoints[i + 1];
      const cornerRadius = 10;
      
      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;
      const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      
      const radius = Math.min(cornerRadius, len1 / 2, len2 / 2);
      
      const cp1x = curr.x - (dx1 / len1) * radius;
      const cp1y = curr.y - (dy1 / len1) * radius;
      
      const cp2x = curr.x + (dx2 / len2) * radius;
      const cp2y = curr.y + (dy2 / len2) * radius;
      
      path += ` L ${cp1x} ${cp1y}`;
      path += ` Q ${curr.x} ${curr.y} ${cp2x} ${cp2y}`;
    } else {
      path += ` L ${curr.x} ${curr.y}`;
    }
  }
  
  return path;
}

export function getPathMidpoint(pathString: string): { x: number; y: number } {
  const commands = pathString.match(/[ML]\s*[-\d.]+\s*[-\d.]+/g) || [];
  const points: Point[] = [];
  
  commands.forEach(cmd => {
    const coords = cmd.match(/[-\d.]+/g);
    if (coords && coords.length >= 2) {
      points.push({
        x: parseFloat(coords[0]),
        y: parseFloat(coords[1]),
      });
    }
  });
  
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  
  const midIndex = Math.floor(points.length / 2);
  return points[midIndex];
}
