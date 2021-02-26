const express = require("express");
const https = require("https");
const fs = require("fs");
const toBool = require("to-bool");
class HttpServer {
    constructor() {
        const useSSL = toBool(process.env.USE_SSL);
        const port = process.env.HTTP_PORT;

        this.server = null;
        if (useSSL === true) {
            const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH);
            const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH);
            const ca = fs.readFileSync(process.env.SSL_CA_PATH);
            const credentials = {
                key: privateKey,
                cert: certificate,
                ca: ca,
            };
            const httpsServer = https.createServer(credentials, app);

            this.server = httpsServer.listen(port, () => {
                console.log(`HTTPS Server running on port ${port}`);
            });
        } else {
            const app = express();
            this.server = app.listen(port, () =>
                console.log(`HTTP Server running on port ${port}...`),
            );
        }

        if (process.platform === "win32") {
            var rl = require("readline").createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            rl.on("SIGINT", function () {
                process.emit("SIGINT");
            });
        }

        process.on("SIGINT", () => {
            console.log("Caught interrupt signal... closing socket");

            if (useSSL === true) {
                this.server.close();
                console.log("ssl server closed");
            } else {
                this.server.close();
                console.log("server closed");
            }
            // if (i_should_exit)
            process.exit();
        });
    }
}

module.exports = HttpServer;
