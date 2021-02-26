//tapping into yajsapi's event loop

const eventsEmitter = require("./sockets/event-emitter");
const toBool = require("to-bool");
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
const { getTaskIdHash } = require("./helpers/get-task-hash-id");
const { eventNames } = require("./sockets/event-emitter");
const events = __importStar(require("../node_modules/yajsapi/dist/executor/events"));

class WrappedEmitter {
    constructor(gameId, stepId) {
        this.reset();
        this.gameId = gameId;
        this.stepId = stepId;
        //this.TaskId = task;
        this.numbers = 0;
        this.Active = true;
    }

    getTaskId = () => {
        return getTaskIdHash(this.gameId, this.stepId);
    };
    reset = () => {
        this.log_active = false;
        this.start_time = process.hrtime();
        this.received_proposals = new Set();
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
        console.log("stopping emitter " + this.getTaskId());
        this.Active = false;
    };

    ShouldReturn = () => {
        return this.gameId === undefined || this.gameId === null || this.Active === false;
    };

    handleComputationFinished = (event) => {
        console.log("1");
        this.debugLog("handleComputationFinished", event);
        console.log("2");
        if (this.finished === true) return;
        console.log("3");
        this.finished = true;
        var hrend = process.hrtime(this.start_time);
        console.log("4");
        const timeInMs = (hrend[0] * 1000000000 + hrend[1]) / 1000000;
        console.log("5");
        this.emitEvent("computation_finished", { time: timeInMs });
        console.log("computation finished");
    };
    handleComputationStarted = (event) => {
        this.debugLog("handleComputationStarted", event);
        this.emitEvent("computation_started", {});
        this.reset();
    };
    handleNoProposalsConfirmed = (event) => {
        this.debugLog("handleNoProposalsConfirmed", event);
    };
    handleReceivedProposals = (event) => {
        this.debugLog("handleReceivedProposals", event);
        this.received_proposals[event.prop_id];

        this.emitEvent("proposals_received", { proposalsCount: this.received_proposals.size });
    };
    handleProposalConfirmed = (event) => {
        this.debugLog("handleProposalConfirmed", event);
        this.confirmed_proposals.add(event["prop_id"]);
        const confirmed_providers = new Set(
            [...this.confirmed_proposals].map((prop_id) => this.received_proposals[prop_id]),
        );
        this.emitEvent("offers_received", { offersCount: confirmed_providers.size });
    };
    handleCommandExecuted = (event) => {
        this.debugLog("handleCommandExecuted", event);
        if (!event["success"]) {
            const provider_name = this.agreement_provider_name[event["agr_id"]];
            this.emitEvent("provider_failed", { providerName: provider_name });
        }
    };
    handleWorkerFinished = (event) => {
        console.log("a");
        this.debugLog("handleWorkerFinished", event);
        console.log("b");
        const provider_name = this.agreement_provider_name[event["agr_id"]];
        console.log("c");
        this.log(console.log(JSON.stringify(event, null, 4)));
        console.log("d");
        if (event["exception"] !== null) {
            this.emitEvent("provider_failed", { providerName: provider_name });
            console.log("e");
        } else {
            console.log("f");
            this.log(" computation finished...");
            this.handleComputationFinished(event);
        }
        console.log("g");
    };
    handleInvoiceReceived = (event) => {
        console.log("invoice1");
        this.debugLog("handleInvoiceReceived", event);
        const provider_name = this.agreement_provider_name[event["agr_id"]];
        let cost = this.provider_cost[provider_name] || 0;
        cost += parseFloat(event["amount"]);
        this.provider_cost[provider_name] = cost;
        this.emitEvent("invoice_received", {
            providerName: provider_name,
            totalCost: event["amount"] /*cost,*/,
            eventCost: event["amount"],
        });
        this.log(
            `Received an invoice from ${provider_name}. Amount: ${event["amount"]}; (so far: ${cost} from this provider).`,
        );
        console.log("invoice9");
    };
    handleAgreementCreated = (event) => {
        this.debugLog("\n\n\n\n\n\n\nhandleAgreementCreated", event);
        let provider_name = event["provider_info"].name._value;

        if (!provider_name) {
            this.numbers++;
            provider_name = `provider-${numbers}`;
        }
        console.log("name: " + provider_name);
        this.agreement_provider_name[event["agr_id"]] = provider_name;
        console.log("2");
        this.log(`Agreement proposed to provider '${provider_name}'`);
        this.emitEvent("agreement_created", { providerName: provider_name });
    };

    handleAgreementConfirmed = (event) => {
        this.debugLog("handleAgreementConfirmed", event);
        let provider_name = this.agreement_provider_name[event["agr_id"]];
        this.log(`Agreement confirmed by provider '${provider_name}'`);
        this.emitEvent("agreement_confirmed", { providerName: provider_name });
    };

    Process = (event) => {
        if (this.ShouldReturn()) return;

        const eventName = event.constructor.name;
        this.debugAllEvents(`process / ${eventName}`, event);
        if (eventName === events.ComputationStarted.name) {
            this.handleComputationStarted(event);
        } else if (eventName === events.ComputationFinished.name) {
            this.handleComputationFinished(event);
        } else if (eventName === events.NoProposalsConfirmed.name) {
            this.handleNoProposalsConfirmed(event);
        } else if (eventName === events.ProposalReceived.name) {
            this.handleReceivedProposals(event);
        } else if (eventName === events.ProposalConfirmed.name) {
            this.handleProposalConfirmed(event);
        } else if (eventName === events.CommandExecuted.name) {
            this.handleCommandExecuted(event);
        } else if (eventName === events.WorkerFinished.name) {
            this.handleWorkerFinished(event);
        } else if (eventName === events.InvoiceReceived.name) {
            this.handleInvoiceReceived(event);
        } else if (eventName === events.AgreementCreated.name) {
            this.handleAgreementCreated(event);
        } else if (eventName === events.AgreementConfirmed.name) {
            this.handleAgreementConfirmed(event);
        }
    };
    emitEvent = (eventName, data) => {
        const payload = {
            gameId: this.gameId,
            stepId: this.stepId,
            ...data,
        };
        if (toBool(process.env.LOG_ENABLED_YAJSAPI_EVENTS_EMITTED_EVENTS))
            console.log(
                `> sending task  ${eventName}   with payload ` + JSON.stringify(payload, null, 4),
            );

        eventsEmitter.emit(eventName, payload);
    };
    log = (message) => {
        if (toBool(process.env.LOG_ENABLED_YAJSAPI_EVENTS_ADDITIONAL_DATA))
            console.log(`> Yagna %%% Task  ${this.getTaskId()}   -   ${message}`);
    };
    debugAllEvents = (functionName, data) => {
        if (toBool(process.env.LOG_ENABLED_YAJSAPI_EVENTS_ALL_EVENTS))
            console.log(`! Yagna::${functionName} ` + JSON.stringify(data, null, 4));
    };
    debugLog = (functionName, data) => {
        if (toBool(process.env.LOG_ENABLED_YAJSAPI_EVENTS_FUNCTION_HEADER))
            console.log(`> Yagna::${functionName} ` + JSON.stringify(data, null, 4));
    };
}

module.exports = WrappedEmitter;
