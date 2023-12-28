import * as fs from "fs";

const Day18 = () => {
  const readInput = () => {
    let inputString = "";
    let totalLines = 0;

    const rs = fs.createReadStream("inputs/input18.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      const inputs = inputString.split("\n");
      totalLines = inputs.length;
      main(totalLines, inputs);
    });
    return rs;
  };

  type Dirs = "U" | "D" | "L" | "R";

  const DIR: Record<Dirs, [number, number]> = {
    R: [0, 1],
    D: [1, 0],
    L: [0, -1],
    U: [-1, 0],
  };

  const solve = (inputStrings: string[], useHex: boolean) => {
    let curr = [0, 0], area = 0, perimeter=0;
    inputStrings.forEach((line: string) => {
      let [dir, stepsStr, color] = line.split(/[ ()]+/g)!;
      let steps = +(stepsStr);

      if (useHex) {
        dir = Object.keys(DIR)[+(((color as string).at(-1)) as any)];
        steps = parseInt(color.slice(1, -1), 16);
      } 
      let [dr, dc] = DIR[dir as Dirs];
      let [r, c] = curr;
      const nr = r + dr * steps;
      const nc = c + dc * steps;
      area += (nr*c - nc*r)/2;
      perimeter += steps;
      curr = [nr, nc]
    });
    return area + perimeter / 2 + 1;
  };

  const main = (totalLines: number, inputStrings: string[]) => {
    console.time();
    console.log(solve(inputStrings, false));
    console.timeEnd();

    console.time();
    console.log(solve(inputStrings, true));
    console.timeEnd();
  };

  readInput();
};

Day18();
