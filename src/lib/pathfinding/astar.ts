interface Point {
  x: number;
  y: number;
}

interface GridNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
  walkable: boolean;
}

class PriorityQueue<T> {
  private items: Array<{ item: T; priority: number }> = [];
  
  enqueue(item: T, priority: number) {
    this.items.push({ item, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }
  
  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function createGrid(
  width: number,
  height: number,
  gridSize: number
): GridNode[][] {
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);
  const grid: GridNode[][] = [];
  
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = {
        x,
        y,
        g: 0,
        h: 0,
        f: 0,
        parent: null,
        walkable: true,
      };
    }
  }
  
  return grid;
}

function markObstacles(
  grid: GridNode[][],
  obstacles: Array<{ x: number; y: number; width: number; height: number }>,
  gridSize: number,
  offsetX: number,
  offsetY: number
) {
  obstacles.forEach(obs => {
    const startX = Math.floor((obs.x - offsetX) / gridSize);
    const startY = Math.floor((obs.y - offsetY) / gridSize);
    const endX = Math.ceil((obs.x + obs.width - offsetX) / gridSize);
    const endY = Math.ceil((obs.y + obs.height - offsetY) / gridSize);
    
    for (let y = Math.max(0, startY); y < Math.min(grid.length, endY); y++) {
      for (let x = Math.max(0, startX); x < Math.min(grid[0]?.length || 0, endX); x++) {
        if (grid[y] && grid[y][x]) {
          grid[y][x].walkable = false;
        }
      }
    }
  });
}

function getNeighbors(node: GridNode, grid: GridNode[][]): GridNode[] {
  const neighbors: GridNode[] = [];
  const { x, y } = node;
  
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ];
  
  directions.forEach(({ dx, dy }) => {
    const newX = x + dx;
    const newY = y + dy;
    
    if (
      newY >= 0 && newY < grid.length &&
      newX >= 0 && newX < (grid[0]?.length || 0) &&
      grid[newY]?.[newX]?.walkable
    ) {
      neighbors.push(grid[newY][newX]);
    }
  });
  
  return neighbors;
}

function reconstructPath(endNode: GridNode, gridSize: number, offsetX: number, offsetY: number): Point[] {
  const path: Point[] = [];
  let current: GridNode | null = endNode;
  
  while (current) {
    path.unshift({
      x: current.x * gridSize + gridSize / 2 + offsetX,
      y: current.y * gridSize + gridSize / 2 + offsetY,
    });
    current = current.parent;
  }
  
  return path;
}

export function calculatePath(
  start: Point,
  end: Point,
  obstacles: Array<{ x: number; y: number; width: number; height: number }>,
  gridSize: number = 20
): Point[] {
  const minX = Math.min(start.x, end.x, ...obstacles.map(o => o.x)) - gridSize * 5;
  const minY = Math.min(start.y, end.y, ...obstacles.map(o => o.y)) - gridSize * 5;
  const maxX = Math.max(start.x, end.x, ...obstacles.map(o => o.x + o.width)) + gridSize * 5;
  const maxY = Math.max(start.y, end.y, ...obstacles.map(o => o.y + o.height)) + gridSize * 5;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  const grid = createGrid(width, height, gridSize);
  markObstacles(grid, obstacles, gridSize, minX, minY);
  
  const startGridX = Math.floor((start.x - minX) / gridSize);
  const startGridY = Math.floor((start.y - minY) / gridSize);
  const endGridX = Math.floor((end.x - minX) / gridSize);
  const endGridY = Math.floor((end.y - minY) / gridSize);
  
  if (!grid[startGridY]?.[startGridX] || !grid[endGridY]?.[endGridX]) {
    return [start, end];
  }
  
  const startNode = grid[startGridY][startGridX];
  const endNode = grid[endGridY][endGridX];
  
  const openSet = new PriorityQueue<GridNode>();
  const closedSet = new Set<GridNode>();
  
  startNode.g = 0;
  startNode.h = manhattanDistance(startNode, endNode);
  startNode.f = startNode.h;
  openSet.enqueue(startNode, startNode.f);
  
  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();
    if (!current) break;
    
    if (current === endNode) {
      return reconstructPath(endNode, gridSize, minX, minY);
    }
    
    closedSet.add(current);
    
    const neighbors = getNeighbors(current, grid);
    
    neighbors.forEach(neighbor => {
      if (closedSet.has(neighbor)) return;
      
      const tentativeG = current.g + 1;
      
      if (tentativeG < neighbor.g || neighbor.g === 0) {
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = manhattanDistance(neighbor, endNode);
        neighbor.f = neighbor.g + neighbor.h;
        openSet.enqueue(neighbor, neighbor.f);
      }
    });
  }
  
  return [start, end];
}
