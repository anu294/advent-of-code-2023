"use strict";

const { match } = require("assert");
const Graph = require("./graph");
const fs = require("fs");

const readInput = () => {
  let inputString = "";
  let totalLines = 0;

  const rs = fs.createReadStream("inputs/input6.txt");
  rs.on("data", (inputStdin: string) => {
    inputString += inputStdin;
  });
  rs.on("end", () => {
    const inputs = inputString.split("\n");
    totalLines = inputString.length;
    main(totalLines, inputs);
  });
};

interface Race {
  id: number;
  duration: number;
  record: number;
}

const getRaces = (durationRecordStrings: string[]) => {
  const recordStrings = durationRecordStrings[1]
    .split(":")[1]
    .trim()
    .split(/\s+/);
  console.log(recordStrings);
  const distanceStrings = durationRecordStrings[0]
    .split(":")[1]
    .trim()
    .split(/\s+/);
  console.log(distanceStrings);
  const races = distanceStrings.map((durationString, index) => ({
    id: index,
    duration: parseInt(durationString),
    record: parseInt(recordStrings[index]),
  }));
  return races;
};

const getRaceNoSpaces = (durationRecordStrings: string[]) => {
  const recordString = durationRecordStrings[1]
    .split(":")[1].replace(/\s/g, '');
  console.log(recordString);
  const durationString = durationRecordStrings[0]
    .split(":")[1]
    .replace(/\s/g, "");
  console.log(durationString);
  const race = {
    id: 0,
    duration: parseInt(durationString),
    record: parseInt(recordString),
  };
  return race;
};

const getWinningSpeed = (race: Race) => {
    console.log("HEY")
    const winningSpeeds : number[]= [];
    for (let i = Math.floor(race.duration/2); i >= 0; i--) {
        const dist = i  * (race.duration - i);
        //console.log(race, i, dist);
        if (dist > race.record) {
            if (i * 2 === race.duration) winningSpeeds.push(i);
            else winningSpeeds.push(...[race.duration - i, i]);
        }
    }
    return winningSpeeds;
}

const main = (totalLines: number, durationRecordStrings: string[]) => {
    const races: Race[] = getRaces(durationRecordStrings);
    const raceNoSpaces: Race = getRaceNoSpaces(durationRecordStrings);
    console.log(races);
    const winningSpeedPerRace: number[][] = races.map(race => getWinningSpeed(race));
    //console.log(winningSpeedPerRace);
    console.log("Solution to Part 1: ", winningSpeedPerRace.map((raceSpeeds) => raceSpeeds.length).reduce((a, b) => a*b));
    console.log("Solution to Part 2: ", getWinningSpeed(raceNoSpaces).length);
};

readInput();
