/*import * as Sentry from "@sentry/browser";*/
function init() {
  /*Sentry.init({
    dsn:
      "https://d058cb93e8144e539eb6d56d834f8b10@o377685.ingest.sentry.io/5200139",
  });*/
}

function log(error) {
  //Sentry.captureException(error);
  console.log(error);
}
function error(error) {
  //Sentry.captureException(error);
  console.log(error);
}

export default { init, log, error };
