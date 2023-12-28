import * as fs from "fs";
import { cloneDeep } from "lodash";
import { AnySort, Arith, Expr, RatNum, init } from "z3-solver";

const Day21 = () => {
  const readInput = () => {
    let inputString = "";
    let totalLines = 0;

    const rs = fs.createReadStream("inputs/input24.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  //   interface Point {
  //     x: number,
  //     y: number,
  //     z: number
  //   }
  // interface Velocity {
  //     dx: number,
  //     dy: number,
  //     dz: number
  //   }
  type Point = [number, number, number];
  type Velocity = [number, number, number];
  type Hail = [Point, Velocity];
  const TEST_AREA_MIN = 200000000000000;
  const TEST_AREA_MAX = 400000000000000;

  // interface Hail {
  //   position: Point,
  //   velocity: Velocity
  // }

  const parse = (inputString: string) => {
    return inputString
      .split("\n")
      .map(
        (posSlope) =>
          posSlope
            .split("@")
            .map((e) => e.split(",").map((e) => Number(e.trim()))) as [
            [number, number, number],
            [number, number, number]
          ]
      );
    // .map(
    //   ([[x, y, z], [dx, dy, dz]]) =>
    //     ({ position: { x, y, z }, velocity: { dx, dy, dz } } as Hail)
    // );
  };

  const findIntersection = (
    [[x1, y1, z1], [dx1, dy1, dz1]]: Hail,
    [[x2, y2, z2], [dx2, dy2, dz2]]: Hail
  ) => {
    const crossProduct = dy2 * dx1 - dx2 * dy1;
    if (crossProduct == 0) return [];
    const sec1 = (dx2 * (y1 - y2) - dy2 * (x1 - x2)) / crossProduct;
    //const sec2 = ((dx1) * (y1 - y2) - (dy2) * (x1 - x2)) / denom; // Checking if the distance needs to be equal - it does not
    return [x1 + sec1 * dx1, y1 + sec1 * dy1];
  };

  const findTotalCollissions = (hails: Hail[]) => {
    const len = hails.length;
    let count = 0;
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const [intX, intY] = findIntersection(hails[i], hails[j])!;
        if (intX == null || intY == null) continue;

        const [[x1, y1], [dx1, dy1]]: Hail = hails[i];
        const [[x2, y2], [dx2, dy2]]: Hail = hails[j];
        if (
          intX > x1 == dx1 > 0 && // can't use xor here - check why js does not support 
          intY > y1 == dy1 > 0 &&
          intX > x2 == dx2 > 0 &&
          intY > y2 == dy2 > 0 &&
          intX >= TEST_AREA_MIN &&
          intX <= TEST_AREA_MAX &&
          intY >= TEST_AREA_MIN &&
          intY <= TEST_AREA_MAX
        )
          count++;
      }
    }
    return count;
  };

  const findStartOfCommonIntersectionLine = async (hails: Hail[]) => {
const { Context } = await init();
const { Solver, Real } = Context("main");
const solver = new Solver();
    let vars = {} as Record<
      "x" | "y" | "z" | "vx" | "vy" | "vz",
      Arith<"main">
    >;
    for (const v of ["x", "y", "z", "vx", "vy", "vz"] as const)
      vars[v] = Real.const(v);

    for (let i = 0; i < 3; i++) {
      const [[x, y, z], [dx, dy, dz]] = hails[i];
      const tk = Real.const("tk" + i);

      solver.add(tk.mul(dx).add(x).eq(tk.mul(vars.vx).add(vars.x)));
      solver.add(tk.mul(dy).add(y).eq(tk.mul(vars.vy).add(vars.y)));
      solver.add(tk.mul(dz).add(z).eq(tk.mul(vars.vz).add(vars.z)));
    }

    const solved = await solver.check(); // Actually solves the thing
    if (solved === "unsat") throw new Error("Unable to solve equation");
    const model = solver.model();

    function parseRatNum(expr: Expr<"main", AnySort<"main">, unknown>): number {
      const value = (expr as RatNum).value();
      const num = Number(value.numerator.toString().replace("n", ""));
      const denom = Number(value.denominator.toString().replace("n", ""));
      return num / denom;
    }
    
    return parseRatNum(model.eval(vars.x.add(vars.y).add(vars.z)));
  };
  const solve = async (positionSlopeStrings: string) => {
    const hails = parse(positionSlopeStrings);
    const totalCollissions = findTotalCollissions(hails);
    const startPoint = await findStartOfCommonIntersectionLine(hails);
    return { totalCollissions, startPoint };
  };

  const main = async(positionSlopeStrings: string) => {
    const { totalCollissions, startPoint } = await solve(positionSlopeStrings);
    console.time();
    console.log("Solution 1:", totalCollissions );
    console.timeEnd();
    console.time();
    console.log("Solution 2:", startPoint);
    console.timeEnd();
    
  };

  readInput();
};

Day21();
