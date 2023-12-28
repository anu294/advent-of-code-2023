"use strict";

const { match } = require("assert");
const Graph = require("./graph");
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input11.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

const solve = (galaxyMatrix: number[][], factor: number) => {
  const colLen = galaxyMatrix[0].length,
    rowLen = galaxyMatrix.length;
  const emptyRows: number[] = [];
  galaxyMatrix.forEach((row, i) => {
    if (!row.some(Boolean)) {
      emptyRows.push(i);
    }
  });
  const emptyCols: number[] = [];
  for (let i = 0; i < colLen; i++) {
    if (!galaxyMatrix.some((row) => Boolean(row[i]))) {
      emptyCols.push(i);
    }
  }
  const galaxyList = galaxyMatrix.map((row, r) => row.map((char, c) => [r,c])).flat().filter(([r,c])=>galaxyMatrix[r][c]);
  console.log(emptyCols, emptyRows, galaxyList);

  let sum = 0;
  for (let i = 0; i < galaxyList.length-1; i++) {
    const [r1, c1] = galaxyList[i];
    for (let j = i+1; j < galaxyList.length; j++) {
      const [r2, c2] = galaxyList[j];
      const rows = [Math.min(r1, r2), Math.max(r1, r2)];
      const cols = [Math.min(c1, c2), Math.max(c1, c2)];
      let move = 0;
      move += emptyRows.filter(r => rows[0] < r && r < rows[1]).length
      move += emptyCols.filter((c) => cols[0] < c && c < cols[1]).length; 
      sum += (rows[1] - rows[0]) + (cols[1] - cols[0]) + (move * (factor - 1));
    }
  }
  return sum;
};
  

const main = (totalLines: number, galaxyRowStrings: string[]) => {
  const galaxyMatrix = galaxyRowStrings.map((row) => row.split("").map((char) => +(char === "#")))
  console.log("Solution 1: ", solve(galaxyMatrix, 2));
  console.log("Solution 2: ", solve(galaxyMatrix, 1000000));
};
readInput();
