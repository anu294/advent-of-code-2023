import * as fs from "fs";
import _ from "lodash";

const Day22 = () => {
  const readInput = () => {
    let inputString = "";
    let totalLines = 0;

    const rs = fs.createReadStream("inputs/input22.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  type Coordinate = [number, number, number];
  type Brick = [Coordinate, Coordinate, number];

  const fillLayout = (bricks: Brick[], layout: number[][][]) => {
    bricks.forEach(([[x1, y1, z1], [x2, y2, z2], i]: Brick) => {
      for (let z = z1; z <= z2; z++) {
        for (let y = y1; y <= y2; y++) {
          for (let x = x1; x <= x2; x++) {
            layout[z][y][x] = i + 1;
          }
        }
      }
    });
  };

  const settleDown = (layout: number[][][], bricks: Brick[]) => {
    let fallingBricks = new Set<number>();
    bricks.sort(([a1, a2, ai]: Brick, [b1, b2, bi]: Brick) => a1[2] - b1[2]);
    bricks.forEach(([[x1, y1, z1], [x2, y2, z2], i]: Brick, index) => {
      while (true) {
        for (let x = x1; x <= x2; x++) {
          for (let y = y1; y <= y2; y++) {
            if (!layout[z1 - 1] || layout[z1 - 1][y][x]) return;
          }
        }
        bricks[index] = [[x1, y1, z1 - 1], [x2, y2, z2 - 1], i];
        fallingBricks.add(i);

        //shift down in layout
        for (let x = x1; x <= x2; x++) {
          for (let y = y1; y <= y2; y++) {
            layout[z1 - 1][y][x] = i;
            layout[z2][y][x] = 0;
          }
        }
        z2--;
        z1--;
      }
    });
    return fallingBricks.size;
  };

  const solve = (bricksString: string) => {
    const brickStrings = bricksString.split("\n");
    let [maxX, maxY, maxZ] = [0, 0, 0];
    let countSafeBricks = 0,
      countChainBricks= 0;
    const bricks: Brick[] = [];
    brickStrings.forEach((brickStr: string, i: number) => {
      const [[x1, y1, z1], [x2, y2, z2]] = brickStr
        .split("~")
        .map((coordStr) => coordStr.split(",").map(Number));
      bricks.push([[x1, y1, z1], [x2, y2, z2], i + 1]);
      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);
      maxZ = Math.max(maxZ, z2);
    });

    const layout: number[][][] = Array.from({ length: maxZ + 1 }, () =>
      Array.from({ length: maxY + 1 }, () =>
        Array.from({ length: maxX + 1 }, () => 0)
      )
    );
    fillLayout(bricks, layout);
    settleDown(layout, bricks);

    bricks.forEach(([[x1, y1, z1], [x2, y2, z2], i]: Brick) => {
      const layoutBackup = _.cloneDeep(layout);
      const bricksBackup = _.cloneDeep(bricks);
      for (let z = z1; z <= z2; z++) {
        for (let y = y1; y <= y2; y++) {
          for (let x = x1; x <= x2; x++) {
            layoutBackup[z][y][x] = 0;
          }
        }
      }
      const fallingBricksCount = settleDown(layoutBackup, bricksBackup);
      countChainBricks+= fallingBricksCount;
      countSafeBricks +=  fallingBricksCount? 0 : 1;
    });
    return {countSafeBricks, countChainBricks};
  };

  const main = (bricksString: string) => {
    console.time();
    const {countChainBricks, countSafeBricks} = solve(bricksString);
    console.log("Solution 1: ", countSafeBricks);
    console.log("Solution 2: ", countChainBricks);
    console.timeEnd();
    // console.time();
    // console.log(solve2(layoutString, 5000));
    // console.timeEnd();
  };

  readInput();
};

Day22();
