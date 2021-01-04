var stockfish = require("./stockfish.js/src/stockfish.js")();

var hrstart = process.hrtime();

let str = "";

const outputPath = "/golem/work/output.txt";
const inputPath = "/golem/work/input.txt";

var depth = 0;
var hash = "abc";
//const outputPath = "output.txt";
//const inputPath = "input.txt";

function writeToFile(outputData) {
  hrend = process.hrtime(hrstart);

  const timeInMs = (hrend[0] * 1000000000 + hrend[1]) / 1000000;

  outputData += "\nexec time:" + timeInMs;
  outputData += "\ndepth:" + depth;
  outputData += "\nhash:" + hash;
  fs.writeFile(outputPath, outputData, function (err) {
    if (err) return console.log(err);
    console.log("writing " + outputData + " to output.txt");

    process.exit(0);
  });
}

fs = require("fs");

fs.readFile(inputPath, "utf8", (err, data) => {
  var outputData = "processed [xxx] " + data;

  if (err) {
    //console.error(err)
    outputData = "no input data...";
    console.log("no data!!!");
    writeToFile("no data...?");
  } else {
    var lines = data.split(/\r?\n/);
    if (lines.length < 3) {
      console.log("wrong arguments count");
      writeToFile("wrong arguments count");
    }
    stockfish.onmessage = function (event) {
      if (event.includes("bestmove")) str += event;
      console.log("msg: " + event);
      if (event.includes("bestmove")) writeToFile(str);
    };
    stockfish.postMessage(lines[2]);

    depth = lines[1];
    hash = lines[0];

    stockfish.postMessage("go depth " + depth);
    console.log("calculating best move with depth: " + depth);
  }

  console.log(outputData);
});
