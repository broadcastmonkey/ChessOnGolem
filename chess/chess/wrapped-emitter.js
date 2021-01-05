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
    this.Active = true;
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
    this.offersCount = 0;
    // time_waiting_for_proposals = dayjs_1.default.duration(0);
  };
  Stop = () => {
    console.log("stopping emitter " + this.TaskId);
    this.Active = false;
  };

  Process = (event) => {
    if (this.TaskId === undefined || this.TaskId === null) return;
    if (this.Active === false) {
      return;
    }
    const eventName = event.constructor.name;
    false &&
      console.log(
        `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} / EVENT : #${eventName}#'`
      );
    //console.log(this);
    // console.log("..." + events.ComputationStarted.name);
    if (eventName === events.ComputationStarted.name) {
      if (this.Active === false) return;
      false &&
        console.log(
          `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  computation started`
        );
      eventsEmitter.emit("computation_started", { taskId: this.TaskId });
      this.reset();
    } else if (eventName === events.NoProposalsConfirmed.name) {
      if (this.Active === false) return;
      /*this.time_waiting_for_proposals = this.time_waiting_for_proposals.add({
        millisecond: parseInt(event["timeout"]),
      });
      let msg;
      if (event["num_offers"] === 0)
        msg = `No offers have been collected from the market for
      ${this.time_waiting_for_proposals.asSeconds()}s. `;
      else
        msg = `${
          event["num_offers"]
        } offers have been collected from the market, but no provider has responded for ${this.time_waiting_for_proposals.asSeconds()}s. `;
      msg +=
        "Make sure you're using the latest released versions of yagna and yajsapi, and the correct subnet.";
      logger.warn(msg);*/
    } /* else if (eventName === events.ProposalReceived.name) {
      /* if (this.Active === false) return;
      this.offersCount++;
      false &&
        console.log(
          `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  offers: ${this.offersCount}...`
        );

      eventsEmitter.emit("offers_received", {
        offersCount: this.offersCount,
        taskId: this.TaskId,
      });*/ else if (
      /*} */
      eventName === events.ProposalReceived.name
    ) {
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
      if (this.Active === false) return;
      if (!event["success"]) {
        const provider_name = this.agreement_provider_name[event["agr_id"]];
        eventsEmitter.emit("provider_failed", {
          taskId: this.TaskId,
          providerName: provider_name,
        });
      }
    } else if (eventName === events.WorkerFinished.name) {
      if (this.Active === false) return;
      true &&
        console.log(
          `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  worker finished...`
        );
      const provider_name = this.agreement_provider_name[event["agr_id"]];
      true && console.log(JSON.stringify(event, null, 4));
      if (event["exception"] !== null) {
        eventsEmitter.emit("provider_failed", {
          taskId: this.TaskId,
          providerName: provider_name,
        });
      }
    } else if (eventName === events.InvoiceReceived.name) {
      console.log("@@@@@@@@@@@@@@@@@@@@ INVOICE ");
      const provider_name = this.agreement_provider_name[event["agr_id"]];
      let cost = this.provider_cost[provider_name] || 0;
      cost += parseFloat(event["amount"]);
      this.provider_cost[provider_name] = cost;

      console.log(
        ` @@@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  Received an invoice from ${provider_name}. Amount: ${event["amount"]}; (so far: ${cost} from this provider).`
      );

      eventsEmitter.emit("invoice_received", {
        taskId: this.TaskId,
        providerName: provider_name,
        totalCost: cost,
        eventCost: event["amount"],
      });
    } else if (eventName === events.AgreementCreated.name) {
      if (this.Active === false) return;
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
        providerName: provider_name,
        taskId: this.TaskId,
      });

      this.agreement_provider_name[event["agr_id"]] = provider_name;
    } else if (eventName === events.AgreementConfirmed.name) {
      if (this.Active === false) return;
      let provider_name = this.agreement_provider_name[event["agr_id"]];

      false &&
        console.log(
          `@@@@@@@@@@@@@@@@@@@@ TASK ${this.TaskId} /  Agreement confirmed by provider '${provider_name}'`
        );

      eventsEmitter.emit("agreement_confirmed", {
        providerName: provider_name,
        taskId: this.TaskId,
      });

      this.agreement_provider_name[event["agr_id"]] = provider_name;
    } else if (eventName === events.ComputationFinished.name) {
      console.log("f1");
      var hrend = process.hrtime(this.start_time);
      console.log("f2");
      const timeInMs = (hrend[0] * 1000000000 + hrend[1]) / 1000000;
      console.log("f3");
      true &&
        console.log(
          `****************************** TASK ${this.TaskId} / total calculation time of  is ${timeInMs}'`
        );
      eventsEmitter.emit("computation_finished", {
        time: timeInMs,
        taskId: this.TaskId,
      });
      console.log("f5");
    }
  };
}

module.exports = WrappedEmitter;
