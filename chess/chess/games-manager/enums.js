const GameType = {
    GOLEM_VS_GOLEM: "Golem vs Golem",
    PLAYER_VS_GOLEM: "Player vs Golem",
    UNKNOWN: "not a game",
};
const TurnType = {
    GOLEM: "Golem",
    PLAYER: "Player",
};
const PlayerType = {
    WHITE: "white",
    BLACK: "black",
};
const StatusType = {
    NON_INITIATED: "Not initiated",
    INITIATED: "Game Initiated",
    STARTED: "Game started",
    WAITING_FOR_HUMAN_MOVE: "Waiting for player's move",
    WAITING_FOR_GOLEM_CALCULATION: "Waiting for golem's calculation",
    FINISHED: "Game finished",
    ERROR: "Error occured",
};

const MoveStatus = {
    GAME_CONTINUES: "OK",
    ERROR: "ERROR",
    GAME_FINISHED: "GAME FINISHED",
};

const WinnerType = {
    DRAW: "draw",
    CHECKMATE: "checkmate",
    NONE: "",
};

const Authorization = {
    SERVER: "server",
    LOCAL: "local",
    NONE: "none",
};
module.exports = {
    Authorization,
    GameType,
    TurnType,
    PlayerType,
    StatusType,
    MoveStatus,
    WinnerType,
};
