"use strict";

const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input2.txt");
  rs.on("data", (inputStdin) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

const CUBE_COLORS_SET = new Set(["red", "green", "blue"]);

const getCubeColors = (colorStrings) => {
  const cubeCountMap = new Map();
  colorStrings.forEach((colorCount) => {
    const cubeColor = colorCount.split(" ")[2];

    if (CUBE_COLORS_SET.has(cubeColor)) {
      const cubeCount = parseInt(colorCount.split(" ")[1], 10);
      cubeCountMap.set(cubeColor, cubeCount);
    }
  });
  return cubeCountMap;
};

/*
  [
    Map(2) { 'blue' => 3, 'red' => 4 },
    Map(3) { 'red' => 1, 'green' => 2, 'blue' => 6 },
    Map(1) { 'green' => 2 }
  ]
*/
const getGameSets = (setsString) => {
  const cubesStrings = setsString.split(";");
  const sets = cubesStrings.map((cubesString) => {
    const colorStrings = cubesString.split(",");
    return getCubeColors(colorStrings);
  });
  return sets;
};

/*
[
  { id: 'Game 1', sets: [ { 'blue' => 3, 'red' => 4 }, [Map], [Map] ] },
  { id: 'Game 2', sets: [ [Map], [Map], [Map] ] },
  { id: 'Game 3', sets: [ [Map], [Map], [Map] ] },
]
*/
const getGames = (gameStrings) => {
  return gameStrings.map((gameString) => {
    const games = gameString.split(":");
    const gameSets = getGameSets(games[1]);
    return {
      id: games[0],
      sets: gameSets,
    };
  });
};

const getIdsOfPossibleGames = (games, maxCubes) => {
  const ids = games
    .map((game) => {
      const sets = game.sets;
      let isPossible = true;
      sets.forEach((cubes) => {
        cubes.forEach((value, key) => {
          if (value > maxCubes[key]) {
            isPossible = false;
          }
        });
      });
      if (isPossible) {
        return game.id;
      } else {
        return null;
      }
    })
    .filter((id) => id !== null)
    .map((id) => parseInt(id.split(" ")[1], 10));
  return ids;
};

const getMinSet = (sets) => {
  const minSet = { red: 0, green: 0, blue: 0 };
  sets.forEach((set) => {
    set.forEach((value, key) => {
      if (minSet[key] < value) minSet[key] = value;
    });
  });
  return minSet;
};

const getPowerOfMinimumSets = (minSet) => {
  return Object.entries(minSet).reduce((acc, curr) => {
    return acc * curr[1];
  }, 1);
};

const getGamePowersOfMinimum = (games) => {
  const minSetPowers = games.map((game) => {
    const sets = game.sets;
    const minSet = getMinSet(sets);
    const power = getPowerOfMinimumSets(minSet);
    return power;
  });
  return minSetPowers;
};

const main = (totalLines, gameStrings) => {
  const maxCubes = { red: 12, green: 13, blue: 14 };
  const games = getGames(gameStrings);
  const ids = getIdsOfPossibleGames(games, maxCubes);
  g(ids.reduce((curr, acc) => parseInt(curr, 10) + acc, 0));

  const minSetPower = getGamePowersOfMinimum(games);
  console.log(minSetPower.reduce((curr, acc) => curr + acc, 0));
};

/*
    1abc2
    pqr3stu8vwx
    a1b2c3d4e5f
    treb7uchet
*/

readInput();
