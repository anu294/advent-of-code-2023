"use strict";

const { match } = require("assert");
const Graph = require("./graph");
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input12.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

interface SpringRecord {
  contigousSprings: string[];
  groupSizes: number[];
}


const solveForSpace = (record: SpringRecord, index: number, startAt: number, map:Map<string, number> ) => {
  if(index === record.groupSizes.length) {
    return 1;
  }
  if (startAt >= record.contigousSprings.length) {
    return 0;
  }

  const { contigousSprings, groupSizes } = record;
  let currentGroupSize = groupSizes[index], total = 0;
  const totalGroupSizeAfter = groupSizes.slice(index).reduce((a,b)=>a+b, 0);
  for (
    let start = startAt;
    start <= contigousSprings.length - totalGroupSizeAfter;
    start++
  ) {
    if (contigousSprings.slice(startAt, start).some((c) => c === "#")) {
      break;
    }
    if (map.has(`${index}-${start}`)) {
      total += map.get(`${index}-${start}`) ?? 0;
      continue;
    }
    let i = start;
    while (
      ["#", "?"].includes(contigousSprings[i]) &&
      i - start < currentGroupSize &&
      i < contigousSprings.length
    ) {
      i++;
    }
    if (i - start === currentGroupSize) {
      if (index === record.groupSizes.length - 1) {
        if (
          i <= contigousSprings.length &&
          !contigousSprings.slice(i).some((c) => c === "#")
        ) {
          map.set(`${index}-${start}`, 1);
          total += 1;
          continue;
        } else {
          map.set(`${index}-${start}`, 0);
          total += 0;
          continue;
        }
      }
      if (
        !["?", "."].includes(contigousSprings[i]) ||
        i === contigousSprings.length - 1
      ) {
        map.set(`${index}-${start}`, 0);
        continue;
      }
      const permutationsForRemaining = solveForSpace(
        { contigousSprings, groupSizes },
        index + 1,
        i + 1,
        map
      );
      map.set(`${index}-${start}`, permutationsForRemaining);
      total += permutationsForRemaining;
    }
  }
  return total;

}

const solve12 = (recordStrs: string[], multiplier: number) => {
  const springRecords: SpringRecord[] = recordStrs.map((row) => ({
    contigousSprings: Array(multiplier)
      .fill(row.split(" ")[0])
      .join("?")
      .split(""),
    groupSizes: Array(multiplier)
      .fill(row.split(" ")[1])
      .join(",")
      .split(",")
      .map(Number),
  }));
  return springRecords.map((record, index) => {
    return solveForSpace(record, 0, 0, new Map());
  });
};

const main = (totalLines: number, recordStrs: string[]) => {
  console.log("Solution 1:", solve12(recordStrs, 1).reduce((a,b)=>a+b, 0));
  console.log("Solution 2:", solve12(recordStrs, 5).reduce((a,b)=>a+b, 0));
};
readInput();
