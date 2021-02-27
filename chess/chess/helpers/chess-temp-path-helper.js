var path = require("path");
var appDir = path.dirname(require.main.filename);

class ChessTempPathHelper {
    constructor(gameId, stepId) {
        this.DefaultFileName = path.join("step_" + stepId.toString().padStart(4, "0") + ".txt");
        this.OutputFolder = path.join(appDir, "../tmp", "game_" + gameId + "/output");
        this.InputFolder = path.join(appDir, "../tmp", "game_" + gameId + "/input");

        this.OutputFilePath = path.join(this.OutputFolder, this.DefaultFileName);
        this.InputFilePath = path.join(this.InputFolder, this.DefaultFileName);
        this.ChessBoardFilePath = path.join(this.InputFolder, "chessboard_" + this.DefaultFileName);

        this.OutputLogFilePath = path.join(this.OutputFolder, "log_" + this.DefaultFileName);

        /*this.MoveHash =
      "hash_" +
      gameId.toString().padStart(8, "0") +
      "_" +
      step.toString().padStart(4, "0");*/
    }
}

module.exports = ChessTempPathHelper;
