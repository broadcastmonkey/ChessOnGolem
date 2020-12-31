var stockfish = require("./stockfish.js/src/stockfish.js")();

let str="";

const outputPath="/golem/work/output.txt";
const inputPath="/golem/work/input.txt";


//const outputPath="output.txt";
//const inputPath= "input.txt";


function writeToFile(outputData)
{
	  fs.writeFile(outputPath, outputData, function (err) {
	  if (err) return console.log(err);
	  console.log("writing " +outputData + " to output.txt");
	});
}

fs = require('fs');


fs.readFile(inputPath, 'utf8' , (err, data) => {
	
  var outputData="processed [xxx] " + data;
  
 
  if (err) {
    //console.error(err)
    outputData = "no input data...";
	console.log("no data!!!");
	writeToFile("no data...?");
	
  }else{
	  var lines = data.split(/\r?\n/);
	  if(lines.length<2) 
	  {
		 console.log("wrong arguments count");
		writeToFile("wrong arguments count");
		  
	  }
	   stockfish.onmessage = function(event) {if(event.includes("bestmove")) str+=(event+"\r\n"); console.log("msg: "+event); if(event.includes("bestmove"))writeToFile(str); };
	   stockfish.postMessage(lines[1]);
	
	   var depth=lines[0];
	   
	   
		stockfish.postMessage('go depth '+depth);
		console.log("calculating best move with depth: "+depth);
		

  }
 
 console.log(outputData)
  
  
})


