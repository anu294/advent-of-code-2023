const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input17.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputs.length;
    main17(totalLines, inputs);
  });
};

const DIR = {
  NORTH: [-1, 0],
  SOUTH: [1, 0],
  WEST: [0, -1],
  EAST: [0, 1],
};

const getPossibleNextDirs = (
  dir: number[],
  straight: number,
  maxStraight: number,
  minStraight: number
) => {
  const nextDirs: number[][] = [];

  switch (true) {
    case straight >= minStraight && dir === DIR.NORTH:
    case straight >= minStraight && dir === DIR.SOUTH:
      nextDirs.push(DIR.WEST);
      nextDirs.push(DIR.EAST);
      break;

    case straight >= minStraight && dir === DIR.WEST:
    case straight >= minStraight && dir === DIR.EAST:
      nextDirs.push(DIR.NORTH);
      nextDirs.push(DIR.SOUTH);
      break;
  }

  if (straight < maxStraight) {
    nextDirs.push(dir);
  }
  return nextDirs;
};

function solve17(
  input: string[],
  minStraight: number,
  maxStraight: number
): void {
  const layout: number[][] = input.map((line) => line.split("").map(Number));

  const queue: {
    r: number;
    c: number;
    heat: number;
    dir: number[];
    straight: number;
  }[] = [
    // row, col, heat, Direction, straight
    { r: 1, c: 0, heat: 0, dir: DIR.SOUTH, straight: 1 },
    { r: 0, c: 1, heat: 0, dir: DIR.EAST, straight: 1 },
  ];

  const visited: Record<string, number>[][] = layout.map((row) =>
    row.map(() => ({}))
  );

  while (queue.length) {
    const { r, c, heat, dir, straight } = queue.shift()!;
    const key = dir.concat(straight).join();

    if (!layout[r]?.[c] || visited[r][c][key]) {
      continue;
    }

    visited[r][c][key] = 1;

    if (
      r === layout.length - 1 &&
      c === layout[0].length - 1 &&
      straight >= minStraight
    ) {
      console.log(heat + layout[r][c]);
      break;
    }

    const nextDirs: number[][] = getPossibleNextDirs(
      dir,
      straight,
      maxStraight,
      minStraight
    );

    for (const nextDir of nextDirs) {
      const [di, dj] = nextDir;
      queue.push({
        r: r + di,
        c: c + dj,
        heat: heat + layout[r][c],
        dir: nextDir,
        straight:
          1 + +(dir[0] === nextDir[0] && dir[1] === nextDir[1]) * straight,
      });
    }

    queue.sort((a, b) => a.heat - b.heat);
  }
}

const main17 = (totalLines: number, inputStrings: string[]) => {
  console.time();
  solve17(inputStrings, 0, 3);
  console.timeEnd();

  console.time();
  solve17(inputStrings, 4, 10);
  console.timeEnd();
};

readInput();
