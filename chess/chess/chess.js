const repo_config = require("./config/repo-config");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
const { Executor, Task, utils, vm, WorkContext } = require("yajsapi");
const { ExtractBestMove } = require("./helpers/best-move-extractor");

const WrappedEmitter = require("./wrapped-emitter");
//const { program } = require("commander");

const events = require("./event-emitter");
const ChessPath = require("./helpers/chess-temp-path-helper");
var fs = require("fs");
dayjs.extend(duration);

console.log("extract : " + ExtractBestMove("  bestmove e2e4 ponder e7e6  "));

const { asyncWith, logUtils, range } = utils;

LogChess = function LogChess(data) {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!! " + JSON.stringify(data, null, 4));
};

LogMoveData = (data) =>
  `[turnID]: ${data.turnId}, [gameId]: ${data.gameId}, [gameStep]: ${data.gameStep}`;

async function PerformGolemCalculations(moveData, subnetTag) {
  const { turnId, gameId, gameStep, chess, depth, taskId } = moveData;
  var completed = false;

  events.emit("calculation_requested", { gameId, gameStep });

  Paths = new ChessPath(gameId, gameStep);
  const _package = await vm.repo({
    image_hash: repo_config.docker_id,
    min_mem_gib: repo_config.min_ram,
    min_storage_gib: repo_config.min_disk,
    min_cpu_count: repo_config.min_cpu,
  });
  console.log("input path: " + Paths.InputFilePath);

  console.log(Paths.OutputFolder);

  if (!fs.existsSync(Paths.OutputFolder)) {
    fs.mkdirSync(Paths.OutputFolder, { recursive: true });
  }

  if (!fs.existsSync(Paths.InputFolder)) {
    fs.mkdirSync(Paths.InputFolder, { recursive: true });
  }

  // save fen position to file

  fs.writeFileSync(Paths.ChessBoardFilePath, chess.ascii());
  fs.writeFileSync(
    Paths.InputFilePath,
    taskId + "\n" + depth + "\n" + "position fen " + chess.fen()
  );

  async function* worker(ctx, tasks) {
    for await (let task of tasks) {
      events.emit("calculation_started", { gameId, gameStep });
      console.log("*** worker starts // " + LogMoveData(moveData));
      //var task_id=task.data();
      console.log(
        "*** sending chessboard [" +
          Paths.InputFilePath +
          "]" +
          " >> \n" +
          fs.readFileSync(Paths.InputFilePath, "utf8")
      );

      ctx.send_file(Paths.InputFilePath, "/golem/work/input.txt");
      ctx.run("/bin/sh", [
        "-c",
        "node /golem/code2/chess_engine/bestmove.js > /golem/work/output2.txt",
      ]);

      ctx.download_file("/golem/work/output.txt", Paths.OutputFilePath);
      ctx.download_file("/golem/work/output2.txt", Paths.OutputLogFilePath);
      console.log("*** downloading result for depth (" + depth + ") ... ");
      yield ctx.commit({
        timeout: dayjs.duration({ seconds: 120 }).asMilliseconds(),
      });

      if (fs.readFileSync(Paths.OutputFilePath, "utf8").includes("bestmove")) {
        task.accept_result(Paths.OutputFilePath);
        console.log("*** task completed succesfully !");
      } else {
        task.reject_result((msg = "invalid file"));
        console.log("*** task rejected !");
      }
    }
    return;
  }

  const Subtasks = range(0, 1, 1);
  const timeout = dayjs.duration({ minutes: 15 }).asMilliseconds();

  var emitter = new WrappedEmitter(taskId);
  var engine = await new Executor(
    {
      task_package: _package,
      max_workers: 1,
      timeout, //5 min to 30 min
      budget: "0.02",
      driver: "zksync",
      subnet_tag: subnetTag,
      network: "rinkeby",

      event_consumer: logUtils.logSummary(emitter.Process),
    }
    //LogChess
  );
  await asyncWith(engine, async (engine) => {
    for await (let subtask of engine.submit(
      worker,
      Subtasks.map((frame) => new Task(frame))
    )) {
      if (fs.existsSync(subtask.result())) {
        var bestmove = ExtractBestMove(
          fs.readFileSync(subtask.result(), "utf8")
        );
        console.log(
          "*** result =====> ",
          bestmove.move +
            " time: " +
            bestmove.time +
            ", depth:" +
            bestmove.depth
        );
        completed = true;

        /*setTimeout(() => {
          //emitter.Stop();
          // engine.done();
        }, 360 * 1000);*/

        events.emit("calculation_completed", { gameId, gameStep, bestmove });
        return true;
      } else {
        //engine.done();
        //emitter.Stop();
        return false;
      }
    }
  });
  //engine.done();
  //emitter.Stop();
  return completed;
}

module.exports = {
  PerformGolemCalculations,
};
