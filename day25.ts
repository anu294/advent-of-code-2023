import * as fs from "fs";

const Day21 = () => {
  const readInput = () => {
    let inputString = "";
    let totalLines = 0;

    const rs = fs.createReadStream("inputs/input25.txt");
    rs.on("data", (inputStdin: string) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      main(inputString);
    });
    return rs;
  };
  type Vertex = string;
  type Edge = [Vertex, Vertex];
  const parse = (str: string) => {
    const adjList = new Map<string, string[]>();
    const edges: Edge[] = [];
    const vertices = new Set<Vertex>();
    str
      .split("\n")
      .map((line) => line.split(":") as [string, string])
      .forEach(([source, connections]) => {
        vertices.add(source);
        adjList.set(source, connections.trim().split(" "));
        connections
          .trim()
          .split(" ")
          .forEach((dest: string) => {
            edges.push([source, dest].sort() as Edge);
            vertices.add(dest);
          });
      });
    return { adjList, edges, vertices };
  };
  const generateElements = function* (subsets: Set<string>[], edge: string) {
    for (const s in subsets) {
      if (subsets[s].has(edge)) yield Number(s);
    }
  };
  const randomChoice = function* <T>(arr: T[]) {
    while (true) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      yield arr[randomIndex];
    }
  };

  const isSetsEqual = <T>(set1: Set<T>, set2: Set<T>) =>
    set1.size === set2.size && [...set1].every((x) => set2.has(x));

  const countOfDisjointEdges = (edgesArr: Edge[], subsets: Set<Vertex>[]) => {
    return edgesArr.reduce((sum, [u, v]) => {
      const ss1 = subsets[generateElements(subsets, u).next().value as number];
      const ss2 = subsets[generateElements(subsets, v).next().value as number];
      return sum + (isSetsEqual(ss1, ss2) ? 0 : 1);
    }, 0);
  };
  const solve = (
    adjList: Map<Vertex, Vertex[]>,
    edges: Edge[],
    vertices: Set<Vertex>
  ) => {
    let subsets: Set<Vertex>[];
    const edgesArr = Array.from(edges.values());
    while (true) {
      subsets = Array.from(vertices.values()).map(
        (i) => new Set([i])
      );

      while (subsets.length > 2) {
        const randEdge = randomChoice(edgesArr).next().value;
        const [iss1, iss2]: [number, number] = [
          generateElements(subsets, randEdge[0]).next().value as number,
          generateElements(subsets, randEdge[1]).next().value as number,
        ];
        if (!isSetsEqual(subsets[iss1], subsets[iss2])) {
          Array.from(subsets[iss2].values()).forEach((v) =>
            subsets[iss1].add(v)
          );
          subsets.splice(iss2, 1);
        }
      }
      if (countOfDisjointEdges(edgesArr, subsets) < 4) break;
    }
    console.log(subsets)
    return subsets.reduce((acc, ss) => ss.size*acc, 1)
  };
  const main = async (adjListString: string) => {
    const { adjList, edges, vertices } = parse(adjListString);
    console.log(solve(adjList, edges, vertices));
  };

  readInput();
};

Day21();
