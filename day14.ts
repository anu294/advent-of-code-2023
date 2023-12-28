"use strict";
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input14.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};
const enum Directions {
  North = "north",
  East = "east",
  South = "south",
  West = "west",
}

const tiltInDirection = (layout: string[][], direction: Directions) => {
  for (let i = 0; i < layout.length; i++) {
    for (let j = 0; j < layout[0].length; j++) {
      let row, col; const rowLen = layout.length - 1, colLen = layout[0].length - 1;
      switch (direction) {
        case Directions.North:
          row = i; col = j;
          while (layout[row][col] === "O" && layout[row-1]?.[col] === ".") {
            layout[row][col] = ".";
            layout[--row][col] = "O";
          }
          break;
        case Directions.South:
          row = rowLen - i; col = j;
          while (
            layout[row][col] === "O" &&
            layout[row + 1]?.[col] === "."
          ) {
            layout[row][col] = ".";
            layout[++row][col] = "O";
          }
          break;
        case Directions.East:
           row = i; col = colLen - j;
          while (layout[row][col] === "O" && layout[row]?.[col+1] === ".") {
            layout[row][col] = ".";
            layout[row][++col] = "O";
          }
          break;
        case Directions.West:
          row = i, col = j;
          while (layout[row][col] === "O" && layout[row]?.[col - 1] === ".") {
            layout[row][col] = ".";
            layout[row][--col] = "O";
          }
          break;
        }
    }
  }
  return layout;
};
const directionsArray: Directions[] = [Directions.North, Directions.West, Directions.South, Directions.East];

const spin = (layout: string[][], times: number) => {
  let newLayout = layout, loads: number[]=[];
  for (let i = 0; i < times; i++) {
    Object.values(directionsArray).reduce(
      (acc, curr) => { (newLayout = tiltInDirection(acc, curr));
        return newLayout;},
      newLayout
    );

        loads.push(calculateLoad(newLayout));

  }
  return loads;
}
    


const calculateLoad = (layout: string[][]) => {
  const rowLen = layout.length;
  const load = layout.map((row, index) => 
      row.reduce((acc, curr) => acc + +(curr === "O"), 0) *
      (rowLen - index)
    );
  return load.reduce((acc, curr) => acc + curr, 0);
}

const solve14 = (rockLines: string[], shouldSpin: boolean) => {
  const layout = rockLines.map((line) => line.split(""));
  if (!shouldSpin) {
    const tiltedLayout = tiltInDirection(layout, Directions.North);
    return calculateLoad(tiltedLayout);
  }
  const loadsAfterEachSpin = spin(layout, 1000);
    let period = 0;
    for (let i = 0; i < 20; i++) {
      const idx = loadsAfterEachSpin.length - 1 - i;
      period = Math.max(
        period,
        idx - loadsAfterEachSpin.lastIndexOf(loadsAfterEachSpin[idx], idx - 1)
      );
    }
    const remainder = 1000000000 % period;
    
    return loadsAfterEachSpin.at(
        -1 - period - (loadsAfterEachSpin.length % period) + remainder
      )
    
};
    

const main = (totalLines: number, rockLines: string[]) => {
  console.log("Solution 1:", solve14(rockLines, false));
  console.log("Solution 2:", solve14(rockLines, true));
};
readInput();
