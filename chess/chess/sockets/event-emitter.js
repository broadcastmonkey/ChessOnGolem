var events = require("events");
var eventEmitter = new events.EventEmitter();
eventEmitter.setMaxListeners(256);
module.exports = eventEmitter;
