"use strict";
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input15.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputs.length;
    main15(totalLines, inputs[0]);
  });
};

const hash = (str: string) => {
  let curr = 0;
  for (let i = 0; i < str.length; i++) {
    const asciiCode = str.charCodeAt(i);
    curr += asciiCode;
    curr *= 17;
    curr %= 256;
  }
  return curr;
};

const createMap = (initializationSeq: string) => {
  const seq = initializationSeq.split(",");
  const map = seq.reduce(
    (acc: string[][], currStr: string) => {
      if (currStr.includes("-")) {
        const label = currStr.split("-")[0];
        const hashCode = hash(label);
        const found = acc[hashCode].findIndex(
          (el) => el.split(" ")[0] === label
        );
        if (found !== -1) {
          acc[hashCode].splice(found, 1);
        }
      } else {
        // =
        const label = currStr.split("=")[0];
        const focalLength = currStr.split("=")[1];
        const hashCode = hash(label);
        const found = acc[hashCode].findIndex(
          (el) => el.split(" ")[0] === label
        );
        if (found !== -1) {
          acc[hashCode].splice(found, 1, `${label} ${focalLength}`);
        } else {
          acc[hashCode].push(`${label} ${focalLength}`);
        }
      }
      return acc;
    },
    Array.from({ length: 256 }, () => [])
  );
  return map;
};

const getFocalPower = (map: string[][]) => {
  return map.reduce(
    (acc, box, boxNumber) =>
      acc +
      box.reduce((tot, labelledLens, index) => {
        const [, focalLength] = labelledLens.split(" ");
        return tot + (boxNumber + 1) * (index + 1) * +focalLength;
      }, 0),
    0
  );
};

const main15 = (totalLines: number, initializationSeq: string) => {
  console.log(
    "Solution 1:",
    initializationSeq
      .split(",")
      .map(hash)
      .reduce((acc, curr) => acc + curr, 0)
  );
  console.log("Solution 2:", getFocalPower(createMap(initializationSeq)));
};
readInput();
