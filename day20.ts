import * as fs from "fs";
import _, { filter } from "lodash";

const Day20 = () => {
  const readInput = () => {
    let inputString = "";
    let totalLines = 0;

    const rs = fs.createReadStream("inputs/input20.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };

  interface Comms {
    dest: string;
    pulse: number;
    source: string;
  }
  interface Details {
    kind: "ff" | "con" | "op";
    outputs: string[];
    pulse?: number;
    inputs?: { module: string; pulse: number }[];
  }
  type AdjList = Record<string, Details>;

  const createAdjList = (inputs: string[], initialQueue: Comms[]) => {
    const adjList: AdjList = {};
    for (const line of inputs) {
      let [source, destStrings] = line.split(" -> ");
      switch (true) {
        case source === "broadcaster":
          initialQueue.push(
            ...destStrings.split(", ").map((module: string) => ({
              dest: module,
              pulse: 0,
              source: "button",
            }))
          );
          break;
        case source[0] === "%":
          adjList[source.substring(1)] = {
            kind: "ff",
            outputs: destStrings.split(", "),
            pulse: 0,
          };
          break;
        case source[0] === "&":
          adjList[source.substring(1)] = {
            kind: "con",
            outputs: destStrings.split(", "),
            inputs: [],
          };
          break;
        default:
          adjList[source.substring(0)] = {
            kind: "op",
            outputs: [],
            inputs: [],
          };
      }
    }
    return adjList;
  };

  const populateMultiInputsForConjunction = (adjList: AdjList) => {
    for (const module in adjList) {
      const outputs = adjList[module].outputs;
      for (const output of outputs) {
        if (adjList[output]?.kind === "con") {
          adjList[output]?.inputs?.push({ module, pulse: 0 });
        }
      }
    }
  };

  const gcd = (a: number, b: number): number => {
    if (b === 0) return a;
    return gcd(b, a % b);
  };

  const lcm = (numbers: number[]) => {
    return numbers.reduce((a, b) => a * (b / gcd(a, b)));
  };
  const getUniqueSubCycles = (adjList: AdjList, last: string) => {
    const [source] = Object.entries(adjList).find(([_, v]) =>
      v.outputs.includes(last)
    )!;
    return Object.entries(adjList)
      .filter(([_, v]) => v.outputs.includes(source))!
      .reduce((acc: Record<string, number>, [k]) => {
        acc[k] = 0;
        return acc;
      }, {});
  };

  const findTotalCycles = (adjList: AdjList, initialQueue: Comms[]) => {
    // these lead to gq, which lead to rx
    const uniqueSubCycles: Record<string, any> = getUniqueSubCycles(
      adjList,
      "rx"
    );
    let i = 0;
    const nPulses = [0, 0];
    while (!Object.values(uniqueSubCycles).every(Boolean)) {
      const queue = [...initialQueue];
      nPulses[0]++;
      while (queue.length) {
        const { dest, pulse, source } = queue.shift()!;
        nPulses[pulse]++;
        if (dest in uniqueSubCycles && !pulse) {
          uniqueSubCycles[dest] ||= i;
        }
        const curr = adjList[dest];
        if (!curr) continue;

        if (curr.kind === "ff") {
          if (!pulse) {
            curr.pulse = +!curr.pulse;
            queue.push(
              ...curr.outputs.map((mod) => ({
                dest: mod,
                pulse: curr.pulse as number,
                source: dest,
              }))
            );
          }
        } else {
          curr.inputs = curr.inputs?.map((input) =>
            input.module === source ? { module: source, pulse } : input
          );
          queue.push(
            ...curr.outputs.map((out) => ({
              source: dest,
              pulse: +!curr.inputs?.every((inp) => inp.pulse) as number,
              dest: out,
            }))
          );
        }
      }
      i++;
      if (i === 1000) {
        console.log(nPulses[0] * nPulses[1]);
      }
    }
    console.log(
      Object.values(uniqueSubCycles).reduce((acc, n) => acc * ((n ?? 0) + 1), 1)
    );
  };

  const main = (inputString: string) => {
    console.time();
    const initialQueue: Comms[] = [],
      inputs: string[] = inputString.split("\n");

    const adjList: AdjList = createAdjList(inputs, initialQueue);
    console.log("start", initialQueue);
    populateMultiInputsForConjunction(adjList);
    findTotalCycles(adjList, initialQueue);
    console.timeEnd();
  };

  readInput();
};

Day20();
