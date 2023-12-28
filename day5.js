"use strict";

const { match } = require("assert");
const Graph = require("./graph");
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input5.txt");
  rs.on("data", (inputStdin) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

const getDuoMaps = (blocks) => {
  const seeds = blocks[0]
    .split(" ")
    .slice(1)
    .map((seed) => parseInt(seed, 10));
  const mapBlocks = blocks.slice(1);
  const maps = mapBlocks.map((mapBlock) => {
    const mapBlockLines = mapBlock.split("\n");
    const map = mapBlockLines.slice(1).map((row) => row.split(" ").map(Number));
    return {
      key: mapBlockLines[0].split(" ")[0],
      map,
    };
  });
  return { seeds, duoMaps: maps };
};

const dfs = (almanac, seed) => {
  const data = { seed };
  let curr = seed;
  almanac.forEach(({ map, key }) => {
    const mapsTo = map.find((row) =>
      curr >= row[1] && curr <= row[1] + row[2] ? true : false
    );
    data[key.split("-to-")[1]] = !!mapsTo
      ? mapsTo[0] + (curr - mapsTo[1])
      : curr;
    curr = data[key.split("-to-")[1]];
  });
  return data;
};

const getDataFromAlmanacForSeeds = (almanac, seeds) => {
  const data = seeds.map((seed) => {
    const obj = dfs(almanac, seed);
    return obj;
  });
  return data;
};

const getDataFromAlmanacForSeedRanges = (almanac, seedRanges) => {
  let categoryRange = [...seedRanges];
  for (let range of almanac) {
    const mappedCategoryIds = [];
    let unmappedCategoryIds = [];
    for (const [dest, source, len] of range.map) {
      unmappedCategoryIds = [];
      for (const [start, end] of categoryRange) {
        if (start < source + len && end >= source) {
          mappedCategoryIds.push([
            Math.max(start, source) + (dest - source),
            Math.min(end, source + len - 1) + (dest - source),
          ]);
        }
        if (start < source) {
          unmappedCategoryIds.push([start, Math.min(end, source - 1)]);
        }
        if (end >= source + len) {
          unmappedCategoryIds.push([Math.max(start, source + len), end]);
        }
      }
      categoryRange = [...unmappedCategoryIds];
    }
    // new dest category range will be aggregate of all mapped and unmapped source category ranges
    categoryRange.push(...mappedCategoryIds);
  }
  // this will be the final category ie location
  return categoryRange;
};

const getSeedsFromRanges = (seedRanges) => {
  const seeds = [];
  for (let i = 0; i < seedRanges.length; i += 2) {
    const rangeLength = seedRanges[i + 1],
      seed = seedRanges[i];
    seeds.push([seed, seed + rangeLength - 1]);
  }
  return seeds;
};

const solvePart1 = (duoMaps, seeds) => {
  const seedDataPart1 = getDataFromAlmanacForSeeds(duoMaps, seeds);
  console.log(
    "Solution 1: ",
    seedDataPart1.reduce(
      (min, curr) => Math.min(min, curr.location),
      Number.MAX_SAFE_INTEGER
    )
  );
};
const solvePart2 = (duoMaps, seeds) => {
  const allSeedRanges = getSeedsFromRanges(seeds);
  const seedDataPart2 = getDataFromAlmanacForSeedRanges(duoMaps, allSeedRanges);
  console.log("Solution 2: ", Math.min(...seedDataPart2.flat()));
};

const main = (totalLines, mapStringsBlocks) => {
  const { seeds, duoMaps } = getDuoMaps(mapStringsBlocks);
  solvePart1(duoMaps, seeds);
  solvePart2(duoMaps, seeds);
};

readInput();
