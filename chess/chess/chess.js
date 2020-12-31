//const path = require("path");
const repo_config = require("./config/repo_config");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
const { Engine, Task, utils, vm } = require("yajsapi");
const {ExtractBestMove} = require("./helpers/best-move-extractor");

const WrappedEmitter = require("./wrapped-emitter");
//const { program } = require("commander");

const events = require("./event-emitter");
const ChessPath = require("./helpers/chess-temp-path-helper");
var fs = require('fs');
dayjs.extend(duration);

console.log("extract : "+ExtractBestMove("  bestmove e2e4 ponder e7e6  "));

const { asyncWith, logUtils, range } = utils;


LogChess = function LogChess(data)
{
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!! " +  JSON.stringify(data, null, 4));

}

LogMoveData = (data) => `[turnID]: ${data.turnId}, [gameId]: ${data.gameId}, [gameStep]: ${data.gameStep}`;





async function PerformGolemCalculations(moveData, subnetTag) {
  const {turnId, gameId, gameStep,chess} = moveData;
  var completed=false;
  


  events.emit("calculation_requested",{gameId,gameStep});

  Paths = new ChessPath(gameId,gameStep);
  const _package = await vm.repo(repo_config.docker_id, repo_config.min_ram, repo_config.min_disk,repo_config.min_cpu);
  console.log("input path: "+Paths.InputFilePath);

  console.log(Paths.OutputFolder);

if(!fs.existsSync(Paths.OutputFolder))
{
  fs.mkdirSync(Paths.OutputFolder,{ recursive: true });
}

if(!fs.existsSync(Paths.InputFolder))
{
  fs.mkdirSync(Paths.InputFolder,{ recursive: true });
}



// save fen position to file

var depth = turnId=="w"?17:8;
fs.writeFileSync(Paths.ChessBoardFilePath,chess.ascii());
fs.writeFileSync(Paths.InputFilePath,depth+"\n"+"position fen " + chess.fen());


  async function* worker(ctx, tasks) {
    
    for await (let task of tasks) {

      
      

      events.emit("calculation_started",{gameId,gameStep});
      console.log("*** worker starts // " + LogMoveData(moveData));
      //var task_id=task.data();
      console.log("*** sending chessboard [" + Paths.InputFilePath+"]" + " >> \n" + fs.readFileSync(Paths.InputFilePath,"utf8"));
 
      ctx.send_file(Paths.InputFilePath, "/golem/work/input.txt");
      ctx.run("/bin/sh",["-c","node /golem/code2/chess_engine/bestmove.js > /golem/work/output2.txt"]);

      ctx.download_file("/golem/work/output.txt", Paths.OutputFilePath);
      ctx.download_file("/golem/work/output2.txt", Paths.OutputLogFilePath);
      console.log("*** downloading result for depth ("+depth+") ... ");      
      yield ctx.commit();
      if(fs.readFileSync(Paths.OutputFilePath,"utf8").includes("bestmove"))
      {
        task.accept_task(Paths.OutputFilePath);
        console.log("*** task completed succesfully !");      
      }else{
        task.reject_task(msg="invalid file");
        console.log("*** task rejected !");      
      }
    }
    return;
  }

  const Subtasks = range(0, 1, 1);
  const timeout = dayjs.duration({ minutes: 6 }).asMilliseconds();

  await asyncWith(
    await new Engine(
      _package,
      1,
      timeout, //5 min to 30 min
      "0.02",
      undefined,
      subnetTag,
      logUtils.logSummary(WrappedEmitter)
      //LogChess
    ),
    async (engine) => {
      for await (let subtask of engine.map(
        worker,
        Subtasks.map((frame) => new Task(frame))
      )) 
      
      {
        var bestmove= ExtractBestMove( fs.readFileSync(subtask.output(),"utf8"));
        console.log("*** result =====> ", bestmove);
        completed=true;
        events.emit("calculation_completed",{gameId,gameStep,bestmove});
      }
    }
  );
  return completed;
}





module.exports = {
  PerformGolemCalculations
}