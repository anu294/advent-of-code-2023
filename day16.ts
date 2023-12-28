"use strict";
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input16.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputs.length;
    main16(totalLines, inputs);
  });
};

const enum Dirs {
  North = "north",
  East = "east",
  South = "south",
  West = "west",
}
type MirrorType = "/" | "\\" | "|" | "-" | ".";
const pairs: Record<MirrorType, (Dirs | Dirs[])[][]> = {
  "/": [
    [Dirs.North, Dirs.East],
    [Dirs.West, Dirs.South],
  ],
  "\\": [
    [Dirs.North, Dirs.West],
    [Dirs.East, Dirs.South],
  ],
  "|": [
    [Dirs.West, [Dirs.North, Dirs.South]],
    [Dirs.East, [Dirs.North, Dirs.South]],
  ],
  "-": [
    [Dirs.North, [Dirs.West, Dirs.East]],
    [Dirs.South, [Dirs.West, Dirs.East]],
  ],
  ".": [],
};

const getOppositeDir = (dir: Dirs, mirrorType: MirrorType) => {
  const isOppDir = (el: Dirs | Dirs[]) => el !== dir;
  const foundPairAt = pairs[mirrorType].findIndex((pair) => pair.includes(dir));
  if (foundPairAt === -1) return [dir];
  return [pairs[mirrorType][foundPairAt].find(isOppDir)].flat() as Dirs[];
};

const getNextPos = (row: number, col: number, dir: Dirs) => {
  switch (dir) {
    case Dirs.North:
      return [row - 1, col];
    case Dirs.South:
      return [row + 1, col];
    case Dirs.East:
      return [row, col + 1];
    case Dirs.West:
      return [row, col - 1];
  }
};

const dfs = (
  layout: string[][],
  row: number,
  col: number,
  direction: Dirs,
  visited: Set<Dirs>[][]
) => {
  if (visited[row][col].has(direction)) return;
  const mirrorType = layout[row][col] as MirrorType;
  const oppositeDirs = getOppositeDir(direction, mirrorType);
  visited[row][col].add(direction);
  oppositeDirs.forEach((oppositeDir) => {
    const [nextRow, nextCol] = getNextPos(row, col, oppositeDir);
    if (
      nextRow < 0 ||
      nextRow >= layout.length ||
      nextCol < 0 ||
      nextCol >= layout[0].length
    )
      return;
    dfs(layout, nextRow, nextCol, oppositeDir, visited);
  });
};

const getEnergisedCells = (
  layout: MirrorType[][],
  { startRow, startCol, startDir }: Config
) => {
  const visited = Array.from({ length: layout.length }, () =>
    Array.from({ length: layout[0].length }, () => new Set<Dirs>())
  );
  const stack = [{ r: startRow, c: startCol, dir: startDir }];
  while (stack.length) {
    const { r, c, dir } = stack.pop()!;
    if (visited[r][c].has(dir)) continue;
    visited[r][c].add(dir);
    const mirrorType = layout[r][c] as MirrorType;
    const oppositeDirs = getOppositeDir(dir, mirrorType);
    oppositeDirs.forEach((oppositeDir) => {
      const [nextRow, nextCol] = getNextPos(r, c, oppositeDir);
      if (
        nextRow < 0 ||
        nextRow >= layout.length ||
        nextCol < 0 ||
        nextCol >= layout[0].length
      )
        return;
      stack.push({ r: nextRow, c: nextCol, dir: oppositeDir });
    });
  }
  return visited.reduce(
    (acc, row) => acc + row.reduce((acc, el) => acc + +(el.size > 0), 0),
    0
  );
};
interface Config {
  startRow: number;
  startCol: number;
  startDir: Dirs;
}
const solve16 = (layout: MirrorType[][], startConfigs: Config[]) => {
  return startConfigs.reduce(
    (max, config) => Math.max(max, getEnergisedCells(layout, config)),
    0
  );
};

const getAllConfigs = (layout: MirrorType[][]) => {
  if (!layout) return [{ startRow: 0, startCol: 0, startDir: Dirs.East }];
  const lastRow = layout.length - 1,
    lastCol = layout[0].length - 1;
  const goingNorthSouth = layout[0].map((el, i) => [
    { startRow: 0, startCol: i, startDir: Dirs.South },
    { startRow: lastRow, startCol: i, startDir: Dirs.North },
  ]);
  const goingEastWest = layout.map((row, i) => [
    { startRow: i, startCol: 0, startDir: Dirs.East },
    { startRow: i, startCol: lastCol, startDir: Dirs.West },
  ]);
  return [...goingEastWest, ...goingNorthSouth].flat();
};

const main16 = (totalLines: number, layoutStrings: string[]) => {
  const layout = layoutStrings.map((row) => row.split("")) as MirrorType[][];
  console.log(
    "Solution 1:", solve16(layout, getAllConfigs(null as unknown as MirrorType[][]))
  );
  console.log("Solution 2:", solve16(layout, getAllConfigs(layout)));
};
readInput();
