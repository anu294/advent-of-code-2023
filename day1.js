"use strict";

const fs = require("fs");

const readInput = () =>{
    let inputString = "";
    let totalLines = 0;

    const rs = fs.createReadStream("inputs/input1.txt");
    rs.on("data", (inputStdin) => {
      inputString += inputStdin;
    });
    rs.on("end", () => {
      const inputs = inputString.split("\n");
      totalLines = inputString.length;
      main(totalLines, inputs);
    });
}

const getFirstLastDigit = (code) => {
    const nameToNumber = {
        'one': '1',
        'two': '2',
        'three': '3',
        'four': '4',
        'five': '5',
        'six': '6',
        'seven': '7',
        'eight': '8',
        'nine': '9',
    }
    const mapNameToNumber = (item) => nameToNumber[item] || item;

    const digits = Array.from(
      code.matchAll(/(?=(\d|one|two|three|four|five|six|seven|eight|nine))/g),
      (m) => m[1]
    );
    return parseInt(
      mapNameToNumber(digits[0]) + mapNameToNumber(digits[digits.length - 1]),
      10
    );
}

const getCaliberationValues = (totalLines, codes) => {
    return codes.map((code) => {
        return getFirstLastDigit(code);
    })
}

const main = (totalLines, codes) => {
    const caliberationValues = getCaliberationValues(totalLines, codes);
    const sum = caliberationValues.reduce((a, b) => a + b, 0);
    console.log(sum);
}

/*
    1abc2
    pqr3stu8vwx
    a1b2c3d4e5f
    treb7uchet
*/ 

readInput();