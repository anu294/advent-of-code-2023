"use strict";

const { match } = require("assert");
const Graph = require("./graph");
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input7.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

enum HandStrength {
  '2n', '5n', '3n', '4n', '6n', '7n', '8n', '9n', 'T', 'J', 'Q', 'K', 'A',
}

enum HandStrength2 {
  'J','2n','3n','4n','5n','6n','7n','8n','9n','T','Q','K','A',
}

interface Bid {
  initial: (keyof typeof HandStrength)[];
  hands: (keyof typeof HandStrength)[];
  amount: number;
  strength?: any;
}

const useJoker = (map: Map<keyof typeof HandStrength, number>) => {
  const jStrength = map.get("J");
  if (jStrength) {
    //cardWithLargestValue
    const c: [keyof typeof HandStrength, number] | undefined = [
      ...map.entries(),
    ].find(([key]) => key !== "J") ?? ["A", 0];
    map.set(c[0], c[1] + jStrength);
    map.delete("J");
  }
};

const getUniqueHands = (hands: (keyof typeof HandStrength)[], part: 1 | 2) => {
  const map = hands.reduce((acc, hand) => {
    if (!acc.get(hand)) {
      acc.set(hand, 1);
    } else acc.set(hand, acc.get(hand) + 1);
    return acc;
  }, new Map());
  const sortedMap = new Map(
    [...map.entries()].sort((a: number[], b: number[]) => {
      return b[1] - a[1];
    })
  );
  if (part === 2)
    useJoker(sortedMap);
  return sortedMap;
};

const sortBids = (bids: Bid[], part: 1 | 2) => {
  return bids.sort((a, b) => {
    if (a.strength.size === b.strength.size) {
      const aEntries: [keyof typeof HandStrength, number][] = Array.from(
        a.strength.entries()
      );
      const bEntries: [keyof typeof HandStrength, number][] = Array.from(
        b.strength.entries()
      );

      let bIsLarger: "b" | "a" | null = null;
      bEntries.forEach(
        ([_, bStrength]: [keyof typeof HandStrength, number], i) => {
          if (bIsLarger) return;
          if (bStrength !== aEntries[i][1]) {
            bIsLarger = bStrength - aEntries[i][1] > 0 ? "b" : "a";
            return;
          }
        }
      );

      //  return bIsLarger ==='b' ? -1 : 1;
      if (bIsLarger === "b") return -1;
      else if (bIsLarger === "a") return 1;
      else {
        for (let i = 0; i < 5; i++) {
          if (part === 1) {
            if (HandStrength[a.initial[i]] === HandStrength[b.initial[i]])
              continue;
            else return HandStrength[a.initial[i]] - HandStrength[b.initial[i]];
          } else {
            if (HandStrength2[a.initial[i]] === HandStrength2[b.initial[i]])
              continue;
            else
              return HandStrength2[a.initial[i]] - HandStrength2[b.initial[i]];
          }
        }
      }
    }
    return b.strength.size - a.strength.size;
  });
};

const createBids = (bidString: string, part: 1 | 2) => {
  const bid = bidString.split(" ");
  const amount = parseInt(bid[1]);
  const initial = bid[0]
    .split("")
    .map(
      (hand) =>
        (isNaN(parseInt(hand))
          ? hand
          : hand + "n") as unknown as keyof typeof HandStrength
    );
  const hands = [...initial].sort((a, b) => HandStrength[b] - HandStrength[a]);
  const strength = getUniqueHands(hands, part);
  return { hands, amount, strength, initial };
};

const solvePart1 = (bidStrings: string[]) => {
  const bids: Bid[] = bidStrings.map((bidString) => createBids(bidString, 1));
  const sortedBids = sortBids(bids, 1);
  console.log(
    "Solution to Part 1: ",
    sortedBids.reduce((acc, curr, i) => curr.amount * (i + 1) + acc, 0)
  );
};
const solvePart2 = (bidStrings: string[]) => {
  const bids: Bid[] = bidStrings.map((bidString) => createBids(bidString, 2));
  const sortedBids = sortBids(bids, 2);
  console.log(
    "Solution to Part 2: ",
    sortedBids.reduce((acc, curr, i) => curr.amount * (i + 1) + acc, 0)
  );
};

const main = (totalLines: number, bidStrings: string[]) => {
  solvePart1(bidStrings);
  solvePart2(bidStrings);
};
readInput();
