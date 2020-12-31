fs = require('fs');


fs.readFile('input.txt', 'utf8' , (err, data) => {
	
  var outputData="processed [xxx] " + data;
  if (err) {
    //console.error(err)
    outputData = "no input data...";
  }
 
 console.log(outputData)
  
  
  fs.writeFile('../output/output.txt', outputData, function (err) {
  if (err) return console.log(err);
  console.log("writing " +outputData + " to output.txt");
});

})


