import * as fs from "fs";

const Day21 = () => {
  let start: Position = [0, 1],
    end: Position = [0, 0];
  const readInput = () => {
    let inputString = "";
    let totalLines = 0;

    const rs = fs.createReadStream("inputs/input23.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  type SlipSymbol = ">" | "<" | "v" | "^";
  type Symbols = "." | "#" | SlipSymbol;
  type Layout = Symbols[][];

  type Position = [number, number];
  const Slip: Record<SlipSymbol, Dirs> = {
    ">": "R",
    "<": "L",
    "^": "U",
    "v": "D",
  };

  type AdjList = Map<string, Array<[Position, number]>>;
  type Dirs = "U" | "D" | "L" | "R";
  const DIR: Record<Dirs, [number, number]> = {
    U: [-1, 0],
    D: [1, 0],
    L: [0, -1],
    R: [0, 1],
  };

  const getNeighbors = (layout: Layout, [r, c]: Position): Position[] => {
    if (Object.keys(Slip).includes(layout[r][c])) {
      const [dr, dc] = DIR[Slip[layout[r][c] as SlipSymbol] as Dirs];
      return [[r + dr, c + dc] as Position];
    }
    return Object.values(DIR)
      .map(([dr, dc]) => [r + dr, c + dc] as Position)
      .filter(([nr, nc]) => layout[nr]?.[nc] && layout[nr][nc] !== "#");
  };

  const findPossiblePath = (layout: Layout, [r, c]: Position): number => {
    if (layout[r][c] === ".") {
      return Object.values(DIR).reduce(
        (count, [dr, dc]) =>
          count +
          (layout[r + dr]?.[c + dc] && layout[r + dr]?.[c + dc] !== "#" ? 1 : 0),
        0
      );
    }
    return 1;
  };

  const isJunction = (layout: Layout, rc: Position): boolean => {
    return (
      rc.join() === start.join() ||
      rc.join() === end.join() ||
      findPossiblePath(layout, rc) > 2
    );
  };

  const getJunctionNodes = (layout: Layout, rc: Position) => {
    const queue: Array<[Position, number]> = [[rc, 0]];
    const visited = new Set<string>();
    const junctionNodes: [Position, number][] = [];

    while (queue.length > 0) {
      const [rc, dist] = queue.shift()!;
      visited.add(rc.join());

      for (const n of getNeighbors(layout, rc)) {
        if (visited.has(n.join())) {
          continue;
        }

        if (isJunction(layout, n)) {
          junctionNodes.push([n, dist + 1]);
          continue;
        }

        queue.push([n, dist + 1]);
      }
    }
    return junctionNodes;
  };

  const createAdjList = (layout: Layout): AdjList => {
    const adjList = new Map<string, Array<[Position, number]>>();
    const queue: Position[] = [start];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const rc = queue.shift()!;
      if (visited.has(rc.join())) {
        continue;
      }

      visited.add(rc.join());

      for (const [n, weight] of getJunctionNodes(layout, rc)) {
        if (!adjList.has(rc.join())) {
          adjList.set(rc.join(), []);
        }
        adjList.get(rc.join())!.push([n, weight]);
        queue.push(n);
      }
    }

    return adjList;
  };

  const getLongestDistanceForVertice = (
    adjList: AdjList,
    curr: Position,
    distance: number = 0,
    seen: Set<string> = new Set<string>()
  ): number => {
    if (curr.join() === end.join())
      return distance;
    
    let maxDist = 0;
    seen.add(curr.join());

    for (const [neighbor, weight] of adjList.get(curr.join()) || []) {
      if (seen.has(neighbor.join())) {
        continue;
      }
      maxDist = Math.max(
        maxDist,
        getLongestDistanceForVertice(adjList, neighbor, distance + weight, seen)
      );
    }
    seen.delete(curr.join());
    return maxDist;
  };

  const getLayout = (layoutString: string) => {
    return layoutString
      .toString()
      .split("\n")
      .map((line) => line.split("") as Symbols[]);
  };

  const solve = (layoutString: string) => {
    const layout: Layout = getLayout(layoutString);
    layout[0][1] = "#";
    layout[layout.length - 1][layout[0].length - 2] = "#";
    start = [1, 1];
    end = [layout.length - 2, layout[0].length - 2];

    const adjList = createAdjList(layout);
    return getLongestDistanceForVertice(adjList, start) + 2;
  };

  const main = (layoutString: string) => {
    console.time();
    console.log("Solution 1:", solve(layoutString));
    console.timeEnd();
    console.time();
    console.log("Solution 2:", solve(layoutString.replace(/[<>^v]/g, ".")));
    console.timeEnd();
  };

  readInput();
};

Day21();
