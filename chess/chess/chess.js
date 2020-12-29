const path = require("path");
const repo_config = require("./config/repo_config");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
const { Engine, Task, utils, vm } = require("yajsapi");
const { program } = require("commander");

const ChessPath = require("./helpers/chess-temp-path-helper");
var fs = require('fs');
dayjs.extend(duration);

const { asyncWith, logUtils, range } = utils;

var globalGameId=123;
var globalStep=1;

async function PerformGolemCalculations(gameId, gameStep, subnetTag) {
  Paths = new ChessPath(gameId,gameStep);
  const _package = await vm.repo(repo_config.docker_id, repo_config.min_ram, repo_config.min_disk);
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

  async function* worker(ctx, tasks) {
    
    for await (let task of tasks) {

      console.log("*** worker starts");
      //var task_id=task.data();
      console.log("*** sending chessboard [" + Paths.InputFilePath+"]" + " >> " + fs.readFileSync(Paths.InputFilePath,"utf8"));
 
      ctx.send_file(Paths.InputFilePath, "/golem/work/input.txt");
      ctx.run("/bin/sh",["-c","node /golem/code2/chess_engine/bestmove.js > /golem/work/output2.txt"]);

      ctx.download_file("/golem/work/output.txt", Paths.OutputFilePath);
      ctx.download_file("/golem/work/output2.txt", Paths.OutputLogFilePath);
      console.log("*** downloading result for depth (19) ... ");      
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
  const timeout = dayjs.duration({ minutes: 15 }).asMilliseconds();

  await asyncWith(
    await new Engine(
      _package,
      1,
      timeout, //5 min to 30 min
      "0.02",
      undefined,
      subnetTag,
      logUtils.logSummary()
    ),
    async (engine) => {
      for await (let subtask of engine.map(
        worker,
        Subtasks.map((frame) => new Task(frame))
      )) {
        console.log("*** result =====> ", fs.readFileSync(subtask.output(),"utf8"));
      }
    }
  );
  return;
}

let subnet="community.3";



//utils.changeLogLevel("debug");
console.log(`Using subnet: ${subnet}`);

PerformGolemCalculations(globalGameId,globalStep, subnet);
