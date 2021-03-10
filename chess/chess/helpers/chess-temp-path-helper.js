var path = require("path");
var appDir = path.dirname(require.main.filename);

class ChessTempPathHelper {
    constructor(gameId, stepId) {
        this.GamesFolder = path.join(appDir, "../tmp/games/");
        this.GameFile = path.join(
            this.GamesFolder,
            "game_" + gameId.toString().padStart(4, "0") + ".json",
        );
        this.UsersFolder = path.join(appDir, "../tmp/users/");
        this.UsersFilePath = path.join(this.UsersFolder, "users.json");

        this.DefaultFileName = path.join("step_" + stepId.toString().padStart(4, "0") + ".txt");
        this.OutputFolder = path.join(appDir, "../tmp", "game_" + gameId + "/output");
        this.InputFolder = path.join(appDir, "../tmp", "game_" + gameId + "/input");
        this.OutputFolder = path.join(appDir, "../tmp", "game_" + gameId + "/output");
        this.OutputFilePath = path.join(this.OutputFolder, this.DefaultFileName);
        this.InputFilePath = path.join(this.InputFolder, this.DefaultFileName);
        this.ChessBoardFilePath = path.join(this.InputFolder, "chessboard_" + this.DefaultFileName);

        this.OutputLogFilePath = path.join(this.OutputFolder, "log_" + this.DefaultFileName);
    }
}

module.exports = ChessTempPathHelper;
