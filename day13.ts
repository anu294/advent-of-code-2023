"use strict";
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input13.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

const getOffsetCount = (num1: number, num2:number) => {
  let offset = num1 ^ num2, count = 0;
  while(offset) {
    count += offset & 1;
    offset >>= 1;
  }
  return count;
}

const getReflectionPoint = (arr: number[], smudge: number) => {
  for (let i = 0; i < arr.length - 1; i++) {
      let smudgesRemaining = smudge;
      let leftPtr = i, rightPtr = i+1;
      while(leftPtr >= 0 && rightPtr < arr.length) {
        const smudgesRequired = getOffsetCount(arr[leftPtr], arr[rightPtr]);
        if (smudgesRequired > smudgesRemaining) break;
        smudgesRemaining -= smudgesRequired;
        leftPtr--;
        rightPtr++;
      }
      if((leftPtr === -1 || rightPtr === arr.length) && smudgesRemaining === 0) {
        return i+1;
      }
  }
  return 0;

}

const solve13 = (patternStrs: string[], smudge: number) => {
  let sum = 0;
  patternStrs.map((patternStr, i) => {
    const matrix = patternStr.split("\n").map(line => line.split(""));
    const transposedMatrix = matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    const numArr = matrix.map(row => parseInt(row.map(c => +(c === '#')).join(''), 2));
    const numArrTranspose = transposedMatrix.map(row => parseInt(row.map(c => +(c === '#')).join(''), 2));
    const rowsAbove = getReflectionPoint(numArr, smudge);
    const rowsLeft = getReflectionPoint(numArrTranspose, smudge);
    sum += rowsAbove*100
    sum += rowsLeft;

  })
  return sum;
};
    

const main = (totalLines: number, patternStrs: string[]) => {
  console.log("Solution 1:", solve13(patternStrs, 0));
  console.log("Solution 2:", solve13(patternStrs, 1));
};
readInput();
