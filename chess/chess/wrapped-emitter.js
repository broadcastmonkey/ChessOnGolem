//tapping into yajsapi's event loop

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
  require("../node_modules/yajsapi/dist/executor/events")
);

class WrappedEmitter {
  constructor(task) {
    this.reset();

    this.TaskId = task;
    this.numbers = 0;
    this.Active = true;
  }

  reset = () => {
    this.log_active = false;
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
    this.offersCount = 0;
    // time_waiting_for_proposals = dayjs_1.default.duration(0);
  };

  Log = (msg, param = false) => {
    (param || this.log_active) && console.log(msg);
  };

  Stop = () => {
    console.log("stopping emitter " + this.TaskId);
    this.Active = false;
  };

  ShouldReturn = () => {
    return (
      this.TaskId === undefined || this.TaskId === null || this.Active === false
    );
  };

  computationFinished = () => {
    if (this.finished === true) return;
    this.finished = true;
    //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%55 f1 ");
    var hrend = process.hrtime(this.start_time);
    //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%55 f2 ");
    const timeInMs = (hrend[0] * 1000000000 + hrend[1]) / 1000000;
    //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%55 f3 ");
    this.Log(
      `****************************** TASK ${this.TaskId} / total calculation time of  is ${timeInMs}'`
    );
    // console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%55 f4 ");
    eventsEmitter.emit("computation_finished", {
      time: timeInMs,
      taskId: this.TaskId,
    });
    //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%55 f5 ");
  };
  Process = (event) => {
    if (this.ShouldReturn()) return;

    const eventName = event.constructor.name;
    this.Log(
      `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} / EVENT : #${eventName}#'`
    );
    if (eventName === events.ComputationStarted.name) {
      this.Log(
        `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  computation started`,
        true
      );
      eventsEmitter.emit("computation_started", { taskId: this.TaskId });
      this.reset();
    } else if (eventName === events.ComputationFinished.name) {
      this.computationFinished();
    } else if (eventName === events.NoProposalsConfirmed.name) {
    } else if (eventName === events.ProposalReceived.name) {
      this.received_proposals[event["prop_id"]] = event["provider_id"];
    } else if (eventName === events.ProposalConfirmed.name) {
      this.confirmed_proposals.add(event["prop_id"]);
      const confirmed_providers = new Set(
        [...this.confirmed_proposals].map(
          (prop_id) => this.received_proposals[prop_id]
        )
      );
      eventsEmitter.emit("offers_received", {
        offersCount: confirmed_providers.size,
        taskId: this.TaskId,
      });
    } else if (eventName === events.CommandExecuted.name) {
      this.Log(
        `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  command executed...`
      );
      if (!event["success"]) {
        const provider_name = this.agreement_provider_name[event["agr_id"]];
        eventsEmitter.emit("provider_failed", {
          taskId: this.TaskId,
          providerName: provider_name,
        });
      }
    } else if (eventName === events.WorkerFinished.name) {
      this.Log(
        `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  worker finished...`
      );

      const provider_name = this.agreement_provider_name[event["agr_id"]];
      this.Log(console.log(JSON.stringify(event, null, 4)));
      if (event["exception"] !== null) {
        eventsEmitter.emit("provider_failed", {
          taskId: this.TaskId,
          providerName: provider_name,
        });
      } else {
        this.Log("???? computation finished...");
        this.computationFinished();
      }
    } else if (eventName === events.InvoiceReceived.name) {
      this.Log("@@@@@@@@@@@@@@@@@@@@ INVOICE ", true);
      const provider_name = this.agreement_provider_name[event["agr_id"]];
      let cost = this.provider_cost[provider_name] || 0;
      cost += parseFloat(event["amount"]);
      this.provider_cost[provider_name] = cost;
      eventsEmitter.emit("invoice_received", {
        taskId: this.TaskId,
        providerName: provider_name,
        totalCost: event["amount"] /*cost,*/,
        eventCost: event["amount"],
      });
      this.Log(
        ` @@@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  Received an invoice from ${provider_name}. Amount: ${event["amount"]}; (so far: ${cost} from this provider).`
      );
    } else if (eventName === events.AgreementCreated.name) {
      if (this.Active === false) return;
      let provider_name = event["provider_info"].name.value;
      if (!provider_name) {
        numbers++;
        provider_name = `provider-${numbers}`;
      }
      this.Log(
        `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  Agreement proposed to provider '${provider_name}'`
      );

      eventsEmitter.emit("agreement_created", {
        providerName: provider_name,
        taskId: this.TaskId,
      });

      this.agreement_provider_name[event["agr_id"]] = provider_name;
    } else if (eventName === events.AgreementConfirmed.name) {
      if (this.Active === false) return;
      let provider_name = this.agreement_provider_name[event["agr_id"]];

      this.Log(
        `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  Agreement confirmed by provider '${provider_name}'`
      );

      eventsEmitter.emit("agreement_confirmed", {
        providerName: provider_name,
        taskId: this.TaskId,
      });

      this.agreement_provider_name[event["agr_id"]] = provider_name;
    }
  };
}

module.exports = WrappedEmitter;
