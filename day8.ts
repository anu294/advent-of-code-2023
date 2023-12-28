"use strict";

const { match } = require("assert");
const Graph = require("./graph");
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input8.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};
const extractTextInBrackets = (str: string) => {
  const regex = /\(([^)]+)\)/;
  const match = str.match(regex);

  // If there is a match, return the content within brackets; otherwise, return null
  return match ? match[1] : "";
};
const graph = new Graph();
const createGraph = (adjMatrixStrings: string[]) => {
  adjMatrixStrings.forEach((adjMatrixString) => {
    const [fromStr, toStr] = adjMatrixString.split(" = ");
    const from = fromStr.trim(),
      [to1, to2] = extractTextInBrackets(toStr).replace(/\s/g, "").split(",");
    graph.addVertex(from);
    graph.addEdge(from, to1 + "-L");
    graph.addEdge(from, to2 + "-R");
  });
  //graph.printGraph();
};

const gcd = (a: number, b: number): number => {
  if (b === 0) return a;
  return gcd(b, a % b);
};

const lcm = (numbers: number[]) => {
  return numbers.reduce((a, b) => a * (b / gcd(a, b)));
}
const followRoute = (route: string, startNode: string, isEndFn: (node:string)=>boolean) => {
    let node = startNode,
      step = 0;
  if (!graph.getChildren(node)) return 0;
  while (!isEndFn(node)) {
    const [left, right] = graph.getChildren(node);
    if (route[step % route.length] === "L") node = left.split("-")[0];
    else node = right.split("-")[0];
    step++;
  }
  return step;
};

const followRouteEndingAtoZ = (route: string) => {
  const nodes = graph.getNonLeafNodes().filter((node:string) => node.endsWith("A"));
  let steps: number[]= [];
  nodes.forEach ((node: string) => {
    steps.push(followRoute(route, node, (node) => node.endsWith("Z")));
  })
  return lcm(steps);
};

const solveQ8Part1 = (adjMatrixStrings: string[], route: string) => {
  console.log("Solution Part 1",followRoute(route, 'AAA', (node) => node === 'ZZZ'));
};
const solveQ8Part2 = (adjMatrixStrings: string[], route: string) => {
  console.log("Solution Part 2", followRouteEndingAtoZ(route));
};

const main = (totalLines: number, [route, ...adjMatrixStrings]: string[]) => {
  //const [route, adjMatrixStrings] = [instructions.slice(0,0), instructions.slice(2)];
  console.log(`"${route}"`);
  createGraph(adjMatrixStrings.slice(1));
  //solveQ8Part1(adjMatrixStrings.slice(1), route);
  solveQ8Part2(adjMatrixStrings.slice(1), route);
};
readInput();
