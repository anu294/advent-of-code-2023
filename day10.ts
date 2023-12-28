"use strict";

const { match } = require("assert");
const Graph = require("./graph");
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input10.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

const enum Direction {
  North = "north",
  East = "east",
  South = "south",
  West = "west",
}
type Keys = "|" | "-" | "L" | "J" | "F" | "7" | "S" | ".";
type DirectionKeys = Exclude<Keys, ".">;
const directions: Record<DirectionKeys, Direction[]> = {
  "|": [Direction.North, Direction.South],
  "-": [Direction.East, Direction.West],
  L: [Direction.North, Direction.East],
  J: [Direction.North, Direction.West],
  F: [Direction.South, Direction.East],
  "7": [Direction.South, Direction.West],
  S: [Direction.North, Direction.South, Direction.East, Direction.West],
};

const graph = new Graph();

const doesConnect = (
  key1: DirectionKeys,
  key2: DirectionKeys,
  dir1: Direction,
  dir2: Direction
) => {
  return directions[key1].includes(dir1) && directions[key2].includes(dir2);
};

const findNeighbors = (x: number, y: number, matrix: Keys[][]) => {
  const neighbors: Record<Direction, number[] | null> = {
    [Direction.North]: null,
    [Direction.South]: null,
    [Direction.East]: null,
    [Direction.West]: null,
  };
  const rowLen = matrix[0].length,
    colLen = matrix.length;
  if (x !== rowLen - 1) neighbors[Direction.East] = [x + 1, y];
  if (x !== 0) neighbors[Direction.West] = [x - 1, y];
  if (y !== 0) neighbors[Direction.North] = [x, y - 1];
  if (y !== colLen - 1) neighbors[Direction.South] = [x, y + 1];
  return neighbors;
};
const findConnectedNeighbors = (x: number, y: number, matrix: Keys[][]) => {
  const connectedNeighbors: Record<Direction, number[] | null> = {
    [Direction.North]: null,
    [Direction.South]: null,
    [Direction.East]: null,
    [Direction.West]: null,
  };
  const { east, west, north, south } = findNeighbors(x, y, matrix);
  if (
    east &&
    matrix[y][x + 1] !== "." &&
    doesConnect(
      matrix[y][x] as DirectionKeys,
      matrix[y][x + 1] as DirectionKeys,
      Direction.East,
      Direction.West
    )
  )
    connectedNeighbors[Direction.East] = east;
  if (
    west &&
    matrix[y][x - 1] !== "." &&
    doesConnect(
      matrix[y][x] as DirectionKeys,
      matrix[y][x - 1] as DirectionKeys,
      Direction.West,
      Direction.East
    )
  )
    connectedNeighbors[Direction.West] = west;
  if (
    north &&
    matrix[y - 1][x] !== "." &&
    doesConnect(
      matrix[y][x] as DirectionKeys,
      matrix[y - 1][x] as DirectionKeys,
      Direction.North,
      Direction.South
    )
  )
    connectedNeighbors[Direction.North] = north;
  if (
    south &&
    matrix[y + 1][x] !== "." &&
    doesConnect(
      matrix[y][x] as DirectionKeys,
      matrix[y + 1][x] as DirectionKeys,
      Direction.South,
      Direction.North
    )
  )
    connectedNeighbors[Direction.South] = south;
  return connectedNeighbors;
};

const dfs = (
  matrix: Keys[][],
  visited: boolean[][],
  xStart: number,
  yStart: number
) => {
  const paths: string[][] = [];
  const stack: [number, number, string[]][] = []; // [x, y, length]
  stack.push([
    xStart,
    yStart,
    [`${xStart}-${yStart}-${matrix[yStart][xStart]}`],
  ]);

  while (stack.length > 0) {
    const [x, y, path] = stack.pop()!;
    const key = matrix[y][x];

    if (key === ".") continue;

    if (visited[y][x]) {
      if (key === "S") {
        paths.push(path);
        continue;
      } else continue;
    }

    visited[y][x] = true;

    const neighbors = findConnectedNeighbors(x, y, matrix);

    for (const direction of Object.keys(neighbors) as Direction[]) {
      const neighbor = neighbors[direction];
      if (neighbor) {
        const [xNext, yNext] = neighbor;
        stack.push([
          xNext,
          yNext,
          [...path, `${xNext}-${yNext}-${matrix[yNext][xNext]}`],
        ]);
      }
    }
  }
  return paths;
};
const findPositionOf = (key: Keys, matrix: Keys[][]) => {
  let x = 0,
    y = 0;
  for (let i = 0; i < matrix.length; i++) {
    const index = matrix[i].indexOf(key);
    if (index !== -1) {
      x = index;
      y = i;
      break;
    }
  }
  return [x, y];
};
const getAreaOutsidePath = (path: string[], matrix: Keys[][]) => {
  const drawing = Array.from({ length: matrix.length }, () =>
    Array.from({ length: matrix[0].length }, () => ".")
  );

  console.log("path", path);
  path.forEach((path) => {
    const coord = path[0].split("-").map((x) => parseInt(x));
    //drawing[coord[1]][coord[0]] = matrix[coord[1]][coord[0]];
  });
  const visited = new Set<string>();
  const queue = [`0-0-${matrix[0][0]}`];
  while (queue.length > 0) {
    const [x, y] = queue
      .pop()!
      .split("-")
      .map((x) => parseInt(x));
    const curr = `${x}-${y}-${matrix[y][x]}`;
    if (path.includes(curr)) {
      continue;
    }
    if (visited.has(curr)) continue;
    const neighbors: number[][] = Object.values(
      findNeighbors(x, y, matrix)
    ).filter((n) => n !== null) as number[][];
    queue.push(
      ...neighbors.map((n) => `${n[0]}-${n[1]}-${matrix[n[1]][n[0]]}`)
    );
    visited.add(`${x}-${y}-${matrix[y][x]}`);
    drawing[y][x] = "O";
  }
  fs.writeFileSync(
    "outputDay10.txt",
    drawing.map((row) => row.join("")).join("\n")
  );
  return visited.size;
};
const getLargestCycle = (matrix: Keys[][]) => {
  const visited: boolean[][] = Array.from({ length: matrix.length }, () =>
    Array.from({ length: matrix[0].length }, () => false)
  );
  const [xStart, yStart] = findPositionOf("S", matrix);
  console.log("Starting x, y", xStart, yStart);

  const paths = dfs(matrix, visited, xStart, yStart);
  return paths.reduce((a, b) => (a.length > b.length ? a : b)); // return the longest path
};

const main = (totalLines: number, sketchString: string[]) => {
  //create array of . with length as many cols in row
  const padding: Keys[] = Array.from(
    { length: sketchString[0].length + 2 },
    () => "."
  );
  const matrix: Keys[][] = [
    ...[padding],
    ...sketchString.map((line) => [".", ...line.split(""), "."] as Keys[]),
    ...[padding],
  ];
  console.log("matrix", matrix);
  const largestCycle = getLargestCycle(matrix);
  const areaOutsidePath = getAreaOutsidePath(largestCycle, matrix);
  console.log("Solution 1: ", (largestCycle.length - 1) / 2);
  console.log(
    "Solution 2: ",
    areaOutsidePath,
    padding.length * matrix.length,
    padding.length * matrix.length - areaOutsidePath - largestCycle.length + 1
  );
};
readInput();
