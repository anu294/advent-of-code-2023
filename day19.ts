import * as fs from "fs";
import _, { filter } from "lodash";

const Day19 = () => {
  const readInput = () => {
    let inputString = "";
    let totalLines = 0;

    const rs = fs.createReadStream("inputs/input19.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      const [rulesString, partsString] = inputString.split("\n\n");
      main([rulesString, partsString]);
    });
    return rs;
  };

  type Range = [number, number];
  type Types = "a" | "m" | "s" | "x";
  enum TypesMap {
    a,
    m,
    s,
    x,
  }
  type AdjList = Map<string, [string, string][]>;
  type Config = Record<string, number>;
  const getRule = (nameRulesString: string): [string, [string, string][]] => {
    const [name, ruleString] = nameRulesString.split(/[{}]+/g); // [ 'qqz{s>2770:qs,m<1801:hdj,R}' ]

    if (!name || !ruleString) {
      throw new Error(`Invalid nameRulesString: ${nameRulesString}`);
    }

    const exprs = ruleString
      .split(",")
      .map((fullExpr) => fullExpr.split(":") as [string, string]);
    return [name, exprs]; //[ 'qqz', [[ 's>2770', 'qs' ], [m<1801, 'hdj']] ]
  };

  const solveExpr = ([exprString]: string[], config: Config) => {
    const operator = exprString.includes("<") ? "<" : ">";
    const [property, value] = exprString.split(operator);
    switch (operator) {
      case ">":
        if (config[property] > parseInt(value)) return true;
        break;
      case "<":
        if (config[property] < parseInt(value)) return true;
        break;
    }
    return false;
  };

  const getNext = (exprs: string[][], config: Config) => {
    return (
      exprs.find((expr: string[]) => solveExpr(expr, config)) ?? [
        null,
        ...exprs[exprs.length - 1],
      ]
    );
  };

  const traverse = (adjList: AdjList, start: string, config: Config) => {
    let curr = start;
    while (!["A", "R"].includes(curr)) {
      const exprs = adjList.get(curr) as any;
      const [_, next] = getNext(exprs, config);
      curr = next as string;
    }
    if (curr === "A") {
      return Object.values(config).reduce((a, c) => a + c, 0);
    }
    return 0;
  };

  const findSum = (adjList: AdjList, configs: Config[]) => {
    return configs.reduce(
      (acc: number, config: Config) => acc + traverse(adjList, "in", config),
      0
    );
  };

  const getRangeForExpr = (exprString: string, range: Range[], inside: boolean) => {
    const rangeClone = _.cloneDeep(range);
    if (!exprString.includes("<") && !exprString.includes(">")) return rangeClone;
    const operator = exprString.includes("<") ? "<" : ">";
    const [property, value] = exprString.split(operator);
    if (value === null) return rangeClone;
      const rangeOfType: Range = rangeClone[TypesMap[property as Types]];
    switch (operator) {
      case ">":
        if (inside) rangeOfType[0] = Math.max(rangeOfType[0], parseInt(value));
        else rangeOfType[1] = Math.min(rangeOfType[1], parseInt(value)+1);
        break;
      case "<":
        if (inside) rangeOfType[1] = Math.min(rangeOfType[1], parseInt(value));
        else rangeOfType[0] = Math.max(rangeOfType[0], parseInt(value) - 1);
        break;
    }
    return rangeClone;
  };

  const findAll = (adjList: AdjList) => {
    const stack: [string, Range[]][] = [
        ["in", Array.from({ length: 4 }, () => [0, 4001])],
      ],
      acceptedRange: Range[][] = [];
    while (stack.length > 0) {
      let [curr, ranges] = stack.pop()!;
      if (["A", "R"].includes(curr)) {
        if (curr[0] === "A") acceptedRange.push(ranges);
        continue;
      }
      const exprs = adjList.get(curr);
      exprs &&
        stack.push(
          ...exprs.map((expr) => {
            const r = _.cloneDeep(getRangeForExpr(expr[0], ranges, true));
            ranges = getRangeForExpr(expr[0], ranges, false);
            return [
              expr[1] ?? expr[0],
              r,
            ] as [string, Range[]];
          })
        );
    }
    return acceptedRange;
  };

  const solve = (rulesString: string, partsString: string, part2: boolean) => {
    const ruleStrings = rulesString.split("\n");

    const adjList: AdjList = new Map(
      ruleStrings.map((ruleString) => getRule(ruleString))
    );
    const partsJsonString = partsString
      .replace(/([a-z])=/g, '"$1":') // Replace keys with double-quoted keys
      .replace(/\n/g, ","); // Replace closing curly braces

    const parts = JSON.parse(`[${partsJsonString}]`);
    if (!part2) return findSum(adjList, parts);
    const allRanges = findAll(adjList);
    // const filteredRanges = allRanges.filter((_, i) => {
    //   return !allRanges.some((_, j) => {
    //     if (i === j) return false;
    //     return allRanges[i].every(
    //       (range, k) =>
    //         allRanges[j][k][0] < allRanges[j][k][1] &&
    //         range[0] >= allRanges[j][k][0] &&
    //         range[1] <= allRanges[j][k][1]
    //     );
    //   });
    // });
    return allRanges.reduce(
      (acc, ranges: Range[]) =>
        acc +
        ranges.reduce((perms, range: Range) => {
          if (range[1] > range[0]) return perms * (range[1] - range[0] - 1);
          return 0;
        }, 1),
      0
    );
  };
  const main = ([rulesString, partsString]: [string, string]) => {
    console.time();
    console.log(solve(rulesString, partsString, false));
    console.timeEnd();

    console.time();
    console.log(solve(rulesString, partsString, true));
    console.timeEnd();
  };

  readInput();
};

Day19();
