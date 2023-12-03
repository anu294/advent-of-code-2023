"use strict";

const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input3.txt");
  rs.on("data", (inputStdin) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

class Graph {
  // defining vertex array and
  // adjacent list
  constructor(noOfVertices) {
    this.noOfVertices = noOfVertices;
    this.AdjList = new Map();
  }

  addVertex(v) {
    if (!this.AdjList.has(v)) this.AdjList.set(v, new Set());
  }
  addEdge(v, w) {
    this.AdjList.get(v).add(w);
  }

  getChildren(v) {
    return this.AdjList.get(v);
  }
  getNonLeafNodes() {
    return Array.from(this.AdjList.keys());
  }

  printGraph() {
    // get all the vertices
    var get_keys = this.AdjList.keys();

    // iterate over the vertices
    for (var i of get_keys) {
      // get the corresponding adjacency list
      // for the vertex
      var get_values = this.AdjList.get(i);
      var conc = "";

      // iterate over the adjacency list
      // concatenate the values into a string
      for (var j of get_values) conc += j + " ";

      // print the vertex and its adjacency list
      console.log(i + " -> " + conc);
    }
  }
}

var graph = new Graph(6);

const getSchematic = (schemaLines) => {
  const schematic = schemaLines.map((line) => {
    return (line + ".").split("");
  });
  return schematic;
};

const isSymbol = (schematic, row, col) => {
  let specialChars = /[`!@#$%^&*()_\-+=\[\]{};':"\\|,<>\/?~ ]/;
  return isInRange(schematic, row, col) &&
    specialChars.test(schematic[row][col])
    ? {
        isSymbol: true,
        symbol: `${schematic[row][col]}-${row}-${col}`,
      }
    : { isSymbol: false, symbol: null };
};

const isInRange = (schematic, newRowIndex, newColIndex) => {
  return (
    newRowIndex >= 0 &&
    newRowIndex < schematic.length &&
    newColIndex >= 0 &&
    newColIndex < schematic[newRowIndex].length
  );
};
const isSymbolNear = (schematic, lineIndex, charIndex) => {
  const leftDiagonal = [
    isSymbol(schematic, lineIndex - 1, charIndex - 1),
    isSymbol(schematic, lineIndex + 1, charIndex + 1),
  ];
  const rightDiagonal = [
    isSymbol(schematic, lineIndex - 1, charIndex + 1),
    isSymbol(schematic, lineIndex + 1, charIndex - 1),
  ];
  const sides = [
    isSymbol(schematic, lineIndex, charIndex - 1),
    isSymbol(schematic, lineIndex, charIndex + 1),
  ];
  const topBottom = [
    isSymbol(schematic, lineIndex - 1, charIndex),
    isSymbol(schematic, lineIndex + 1, charIndex),
  ];
  return {
    isSymbolNear: [leftDiagonal, rightDiagonal, sides, topBottom]
      .flat()
      .some((res) => res.isSymbol),
    symbols:
      [leftDiagonal, rightDiagonal, sides, topBottom]
        .flat()
        .map((res) => res.symbol)
        .filter((res) => res !== null) ?? [],
  };
};

const isSymbolBeforePartNumber = (symbol, row, col) => {
  const symbolRow = symbol.split("-")[1];
  const symbolCol = symbol.split("-")[2];
  return symbolRow <= row && symbolCol < col;
};

const findPartNumber = (schematic, lineIndex) => {
  const partNumbers = [];
  let partNumber = "",
    symbolSetNear = new Set(),
    hasSymbolNear = false;
  schematic[lineIndex].forEach((char, charIndex) => {
    if (!isNaN(char)) {
      partNumber += char;
      const symbolNear = isSymbolNear(schematic, lineIndex, charIndex);
      hasSymbolNear = hasSymbolNear || symbolNear.isSymbolNear;
      symbolNear.symbols.forEach((symbol) => {
        symbolSetNear.add(symbol);
      });
    } else {
      if (hasSymbolNear && partNumber.length > 0) {
        partNumbers.push(`${partNumber}-${lineIndex}-${charIndex}`);
        symbolSetNear.forEach((symbol) => {
        if (!symbol.startsWith("*")) return;
          graph.addVertex(symbol);
          graph.addEdge(symbol, `${partNumber}-${lineIndex}-${charIndex}`);
        });
      }
      partNumber = "";
      hasSymbolNear = false;
      symbolSetNear.clear();
    }
  });
  return partNumbers;
};

const findPotentialPartNumbers = (schematic) => {
  const partNumbers = [];
  const partNumsPerLine = schematic.map((line, lineIndex) =>
    findPartNumber(schematic, lineIndex)
  );
  return partNumsPerLine.flat();
};

const findGearRatioGroups = (partNumbers) => {
  const gearRatioGroups = partNumbers.map((partNumber) => {
    const group = graph.getChildren(partNumber);
    return Array.from(group);
  });
  return gearRatioGroups;
};

const multiplyGearRatiios = (gearRatioGroups) => {
  const ratios = gearRatioGroups.map((group) => {
    const ratio = group.reduce((acc, curr) => acc * Number.parseInt(curr), 1);
    return ratio;
  });
  return ratios;
}

const updatePartNumbers = (partNumbers, ratios, gearRatioGroups) => {
  const flattenedGearRatioGroups = gearRatioGroups.flat();
  const filteredPartNumbers = partNumbers.map((partNumber) => {
    if (!flattenedGearRatioGroups.includes(partNumber)) return partNumber;
    return null
  }).filter((partNumber) => partNumber !== null);
  return [...filteredPartNumbers, ...ratios];
}

const main = (totalLines, schemaStrings) => {
  const schematic = getSchematic(schemaStrings);
  const partNumbers = findPotentialPartNumbers(schematic);
  console.log(
    partNumbers.reduce((acc, curr) => acc + Number.parseInt(curr.split('-')[0]), 0)
  );
  graph.printGraph();
  const gearRatioGroups = findGearRatioGroups(graph.getNonLeafNodes());
  const ratios = multiplyGearRatiios(gearRatioGroups.filter((group) => group.length == 2));
  //const updatedPartNumbers = updatePartNumbers(partNumbers, ratios, gearRatioGroups);
  console.log(ratios.reduce((acc, curr) => acc + Number.parseInt(curr), 0));
};

readInput();
