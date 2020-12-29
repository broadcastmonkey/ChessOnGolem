var path = require('path');
var appDir = path.dirname(require.main.filename);

class ChessTempPathHelper {
    constructor(gameId, step) {
      this.DefaultFileName = path.join("step_"+step.toString().padStart(4,"0")+".txt");
      this.OutputFolder = path.join(appDir,"../tmp","game_"+gameId+ "/output");;
      this.InputFolder = path.join(appDir,"../tmp","game_"+gameId+ "/input");

      this.OutputFilePath = path.join(this.OutputFolder, this.DefaultFileName);
      this.InputFilePath = path.join(this.InputFolder, this.DefaultFileName);
      
      this.OutputLogFilePath = path.join(this.OutputFolder,"log_"+this.DefaultFileName);

      
    }
    
  }

module.exports = ChessTempPathHelper;