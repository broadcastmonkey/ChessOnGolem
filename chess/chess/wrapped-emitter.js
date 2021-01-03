var commonEmitter = require("./sockets/commonEvents").commonEmitter;
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };

const events = __importStar(
  require("../node_modules/yajsapi/dist/runner/events")
);

const WrappedEmitter = (event) => {
  const eventName = event.constructor.name;
  console.log("EVENT : " + eventName);

  if (eventName === events.CommandExecuted.name) {
    if (!event["success"]) {
      events.emit("worker_failed", { workerName: "workerName" });
    }
  }
  if (eventName === events.WorkerFinished.name) {
    console.log(JSON.stringify(event, null, 4));
    if (event["exception"] !== null) {
      events.emit("worker_failed", { workerName: "workerName" });
    }
  }
};

module.exports = WrappedEmitter;
