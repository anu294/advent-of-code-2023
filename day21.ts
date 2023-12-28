import * as fs from "fs";
import _, { filter } from "lodash";

const Day21 = () => {
  const readInput = () => {
    let inputString = "";
    let totalLines = 0;

    const rs = fs.createReadStream("inputs/input21.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  type Dirs = "U" | "D" | "L" | "R";
  const DIR: Record<Dirs, [number, number]> = {
    U: [-1, 0],
    D: [1, 0],
    L: [0, -1],
    R: [0, 1],
  };

  const isOutwards = (
    nyu: [number, number],
    old: [number, number],
    center: [number, number]
  ) => {
    const ans =
      Math.abs(nyu[0] - center[0]) >= Math.abs(old[0] - center[0]) &&
      Math.abs(nyu[1] - center[1]) >= Math.abs(old[1] - center[1]);
    return ans;
  };

  const normalizeToRange = (value:  number, min: number, max: number) =>{
    // Calculate the modulo within the specified range
    const modResult =
      (((value - min) % (max - min)) + (max - min)) % (max - min);

    // Adjust the result to be within the range [min, max]
    const normalizedValue = modResult + min;

    return normalizedValue;
  }

  const solve1 = (layoutString: string, maxSteps: number) => {
    const layout = layoutString
      .split("\n")
      .map((line: string) => line.split(""));
    // Find cell position whihc contains S
    const [startR, startC] = layout.reduce(
      (acc, row, r) => {
        const c = row.indexOf("S");
        layout[r][c] = ".";
        return c !== -1 ? [r, c] : acc;
      },
      [-1, -1]
    );
    const rowCount = layout.length,
      colCount = layout[0].length;
    console.log("start", startR, startC);
    let queue1Down: [number, number][] = Object.values(DIR)
      .map(([dr, dc]) => [startR + dr, startC + dc] as [number, number])
      .filter(
        ([nr, nc]) =>
          layout[nr % rowCount]?.[nc % colCount] === "." &&
          isOutwards([nr, nc], [startR, startC], [startR, startC])
      );
    console.log(queue1Down);
    let total2Down = 1,
      total1Down = 2;
    let steps = 0;
    const set = new Set<string>();
    const set2Down = new Set<string>([[startR, startC].join()]);
    const set1Down = new Set<string>(
      queue1Down.map(([r, c]) => [r, c].join())
    );
    while (steps < (maxSteps - 1)) {
      set.clear();
      while (queue1Down.length) {
        const [r, c] = queue1Down.shift()!;
        const children: [number, number][] = Object.values(DIR)
          .map(([dr, dc]) => [r + dr, c + dc] as [number, number])
          .filter(
            ([nr, nc]) =>
              layout[normalizeToRange(nr, 0, rowCount)]?.[
                normalizeToRange(nc, 0, colCount)
              ] === "." && !set2Down.has([nr, nc].join())
          );
        children.forEach(([nr, nc]) => set.add([nr, nc].join()));
      }

      const temp = total1Down;
      total1Down = total2Down + set.size;
      total2Down = temp;
      queue1Down.push(
        ...(Array.from(set.values()).map((s) => s.split(",").map(Number)) as [
          number,
          number
        ][])
      );
      set2Down.clear();
      Array.from(set1Down.values()).forEach((s) => set2Down.add(s));
      set1Down.clear();
      Array.from(set.values()).forEach((s) => set1Down.add(s));
      steps++;
      console.log("Step", steps, total1Down, total2Down, set.size);

      // const display = Array.from({ length: layout.length }, (_, r: number) =>
      //   Array.from({ length: layout[0].length }, (_, c: number) => layout[r][c])
      // );
      // queue1Down.forEach(([r, c]) => (display[r][c] = "O"));
      // console.log(
      //   display.map((row) => row.join("")).join("\n"),
      //   "______________________"
      // );
    }
    // const display = Array.from({length: layout.length}, () => Array.from({length: layout[0].length}, () => '.'));
    // queue.forEach(([r, c]) => display[r][c] = 'O');
    // console.log(display.map(row => row.join('')).join('\n'), '______________________')
    return total1Down;
  };

  const solve2 = (layoutString: string, maxSteps: number) => {
    const layout = layoutString
      .split("\n")
      .map((line: string) => line.split(""));
    // Find cell position whihc contains S
    const [startR, startC] = layout.reduce(
      (acc, row, r) => {
        const c = row.indexOf("S");
        layout[r][c] = ".";
        return c !== -1 ? [r, c] : acc;
      },
      [-1, -1]
    );
    const tots:number[] =[];
    let set = new Set([[startR, startC].join()]);
    const rowCount = layout.length, colCount = layout[0].length;
    console.log(rowCount, colCount)
      for (let i = 0; i < maxSteps; i++) {
        const newSet = new Set<string>();
        for (const p of set) {
          const [r, c] = p.split(",").map(Number);
          for (const [dr, dc] of Object.values(DIR)) {
            const nr = r + dr;
            const nc = c + dc;

            if (
              layout[normalizeToRange(nr, 0, rowCount)][
                normalizeToRange(nc, 0, colCount)
              ] === "."
            ) {
              newSet.add([nr, nc].join());
            }
          }
        }

        set = newSet;
        if ((i + 1) % rowCount === maxSteps % rowCount) {
          if (
            tots.length >= 3 &&
            set.size - 2 * tots.slice(-1)[0] + tots.slice(-2)[0] ===
              tots.slice(-1)[0] - 2 * tots.slice(-2)[0] + tots.slice(-3)[0]
          ) {
            break;
          }
          tots.push(set.size);
        }
      }
      console.log(tots)
      const secondDifferential = tots.slice(-1)[0] - 2 * tots.slice(-2)[0] + tots.slice(-3)[0];
      for (
        let i = tots.length * rowCount + (maxSteps % rowCount);
        i <= maxSteps;
        i += rowCount
      ) {
        tots.push(
          secondDifferential + 2 * tots.slice(-1)[0] - tots.slice(-2)[0]
        );
      }
      console.log(tots);
      console.log(tots.slice(-1)[0]);
  }

  const main = (layoutString: string) => {
    console.time();
    console.log(solve1(layoutString, 200));
    console.timeEnd();
    console.time();
    console.log(solve2(layoutString, 5000));
    console.timeEnd();
  };

  readInput();
};

Day21();
