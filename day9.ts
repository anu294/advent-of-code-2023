"use strict";

const { match } = require("assert");
const Graph = require("./graph");
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input9.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

const getPyramid = (sequence: number[]) => {
  const pyramids: number[][] = [sequence];
  while (!pyramids[pyramids.length - 1].every((n) => n === 0)) {
    const lastRow = pyramids[pyramids.length - 1];
    const newRow: number[] = [];
    for (let i: number = 0; i < lastRow.length - 1; i++) {
      newRow.push(lastRow[i + 1] - lastRow[i]);
    }
    pyramids.push(newRow);
  }
  return pyramids.slice(0, -1);
};

const calculateNextInPyramid = (pyramid: number[][]) => {
  const newRow: number[] = [];
  for (let i: number = pyramid.length - 2; i >= 0; i--) {
    pyramid[i].push(
      pyramid[i + 1][pyramid[i + 1].length - 1] +
        pyramid[i][pyramid[i].length - 1]
    );

    pyramid[i].unshift(pyramid[i][0] - pyramid[i + 1][0]);
  }
  return pyramid;
};

const getNextInSequence = (sequence: string) => {
  const pyramid = getPyramid(sequence.split(" ").map((s) => parseInt(s)));
  const largerPyramid = calculateNextInPyramid(pyramid);
  return [largerPyramid[0][0], largerPyramid[0][pyramid[0].length - 1]];
};

const main = (totalLines: number, sequences: string[]) => {
  const nextNumbers = sequences.map(getNextInSequence);
  console.log(
    "Solution Part 1",
    nextNumbers.reduce((a, b) => a + b[1], 0)
  );
  console.log(
    "Solution Part 2",
    nextNumbers.reduce((a, b) => a + b[0], 0)
  );
};
readInput();
