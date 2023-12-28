"use strict";
const Graph = require("./graph");
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input4.txt");
  rs.on("data", (inputStdin) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

var graph = new Graph(6);

const getCards = (cardStrings) => {
  const cards = cardStrings.map((cardString) => {
    const card = cardString.split(":");
    const cardNumber = parseInt(card[0].split(" ").pop().trim(" "), 10);
    const cardValueGroups = card[1].split("|");
    const winningNumbers = cardValueGroups[0].split(" ").map((value) => parseInt(value.trim(' '), 10)).filter(value => isNaN(value) === false);
    const receivedValues = cardValueGroups[1]
      .split(" ")
      .map((value) => parseInt(value.trim(" "), 10))
      .filter((value) => isNaN(value) === false);
    return { cardNumber, winningNumbers, receivedValues };
  });
  return cards;
}

const getMatchingValues = (winningNumbers, receivedValues) => {
  const matchingValues = receivedValues.filter((value) => winningNumbers.includes(value));
  return matchingValues;
}

const getMatchingValuesForCards = (cards) => {
  const matchingValues = cards.map((card) => 
     getMatchingValues(card.winningNumbers, card.receivedValues));
     return matchingValues;
}

const getPointsForCards = (matchingValuesPerCard) => {
  const pointsPerCard = matchingValuesPerCard.map((matchingValues) => {
    const points =
      matchingValues.length > 0 ? Math.pow(2, matchingValues.length - 1) : 0;
    return points;
  });
  return pointsPerCard;
};

const createGraph = (cards) => {
  cards.forEach((card) => {
    const cardNumber = card.cardNumber;
    const matchingValues = getMatchingValues(
      card.winningNumbers,
      card.receivedValues
    );
    graph.addVertex(cardNumber);
    matchingValues.forEach ((match, index)  => {
      graph.addVertex(cardNumber + index + 1);
      graph.addEdge(cardNumber, cardNumber + index + 1);
    });
  });
}

const calculatePointsForGraph = (cards) => {
  const totalPointsMap = new Map();
  const pointsMap = new Map();
  const callback = (node, startingNode) => {
    if (totalPointsMap.has(startingNode)) {
      const points = totalPointsMap.get(node);
      const totalPoints = totalPointsMap.get(startingNode);
      totalPointsMap.set(startingNode, points + totalPoints);
    } else {
      pointsMap.set(node, 1);
      totalPointsMap.set(startingNode, 1);
    }
  }


  cards.reverse().forEach((card) => {
    const cardNumber = card.cardNumber;
    const children = graph.getChildren(cardNumber);
    callback(cardNumber, cardNumber);
    children.forEach((child) => {
      callback(child, cardNumber);
    });
    pointsMap.set(cardNumber, totalPointsMap.get(cardNumber));
  });
  return totalPointsMap;
}

/* Example card
Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
*/
const main = (totalLines, cardStrings) => {
  // Part 1
  const cards = getCards(cardStrings);
  console.log("cards", cards);
  const matchingValuesPerCard = getMatchingValuesForCards(cards);
  const pointsPerCard = getPointsForCards(matchingValuesPerCard);
  console.log("points", pointsPerCard);

  /// Part 2
  createGraph(cards);
  const pointsForGraph = calculatePointsForGraph(cards);
  console.log(pointsPerCard.reduce((acc, curr) => acc + curr, 0));
  console.log(
    "totalPointsPart2",
    Array.from(pointsForGraph.values()).reduce((acc, curr) => acc + curr, 0)
  );
};

readInput();
