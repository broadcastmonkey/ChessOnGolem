const eventsEmitter = require("./event-emitter");
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

class WrappedEmitter {
  constructor(task) {
    this.reset();

    this.TaskId = task;
    this.numbers = 0;
  }

  reset = () => {
    this.start_time = process.hrtime();
    this.received_proposals = {};
    this.confirmed_proposals = new Set();
    this.agreement_provider_name = {};
    this.confirmed_agreements = new Set();
    this.task_data = {};
    this.provider_tasks = {};
    this.provider_cost = {};
    this.provider_failures = {};
    this.finished = false;
    this.error_occurred = false;
    // time_waiting_for_proposals = dayjs_1.default.duration(0);
  };

  Process = (event) => {
    const eventName = event.constructor.name;
    false &&
      console.log(
        `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} / EVENT : #${eventName}#'`
      );
    //console.log(this);
    // console.log("..." + events.ComputationStarted.name);
    if (eventName === events.ComputationStarted.name) {
      false &&
        console.log(
          `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  computation started`
        );
      this.reset();
    } else if (eventName === events.CommandExecuted.name) {
      if (!event["success"]) {
        const provider_name = this.agreement_provider_name[event["agr_id"]];
        eventsEmitter.emit("worker_failed", { workerName: provider_name });
      }
    } else if (eventName === events.WorkerFinished.name) {
      false &&
        console.log(
          `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  worker failed`
        );

      false && console.log(JSON.stringify(event, null, 4));
      if (event["exception"] !== null) {
        eventsEmitter.emit("worker_failed", { workerName: "workerName" });
      }
    } else if (eventName === events.InvoiceReceived.name) {
      const provider_name = this.agreement_provider_name[event["agr_id"]];
      let cost = this.provider_cost[provider_name] || 0;
      cost += parseFloat(event["amount"]);
      this.provider_cost[provider_name] = cost;
      false &&
        console.log(
          ` @@@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  Received an invoice from ${provider_name}. Amount: ${event["amount"]}; (so far: ${cost} from this provider).`
        );
    } else if (eventName === events.AgreementCreated.name) {
      let provider_name = event["provider_id"].name.value;
      if (!provider_name) {
        numbers++;
        provider_name = `provider-${numbers}`;
      }
      false &&
        console.log(
          `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  Agreement proposed to provider '${provider_name}'`
        );

      eventsEmitter.emit("agreement_created", {
        workerName: provider_name,
        taskId: this.TaskId,
      });

      this.agreement_provider_name[event["agr_id"]] = provider_name;
    } else if (eventName === events.AgreementConfirmed.name) {
      let provider_name = this.agreement_provider_name[event["agr_id"]];

      false &&
        console.log(
          `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  Agreement confirmed by provider '${provider_name}'`
        );

      eventsEmitter.emit("agreement_confirmed", {
        workerName: provider_name,
        taskId: this.TaskId,
      });

      this.agreement_provider_name[event["agr_id"]] = provider_name;
    } else if (eventName === events.ComputationFinished.name) {
      var hrend = process.hrtime(this.start_time);

      const timeInMs = (hrend[0] * 1000000000 + hrend[1]) / 1000000;

      false &&
        console.log(
          `****************************** TASK ${this.TaskId} / total calculation time of  is ${timeInMs}'`
        );
      eventsEmitter.emit("computation_finished", {
        time: timeInMs,
        taskId: this.TaskId,
      });
    }
  };
}

module.exports = WrappedEmitter;
