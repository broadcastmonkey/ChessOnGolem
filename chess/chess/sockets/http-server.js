const express = require("express");
const https = require("https");
const fs = require("fs");
const toBool = require("to-bool");
class HttpServer {
    constructor() {
        this.useSSL = toBool(process.env.USE_SSL);
        const port = process.env.HTTP_PORT;
        const app = express();
        this.server = null;
        if (this.useSSL === true) {
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
            this.server = app.listen(port, () =>
                console.log(`HTTP Server running on port ${port}...`),
            );
        }
    }
    close = () => {
        if (this.useSSL === true) {
            this.server.close();
            console.log("ssl server closed");
        } else {
            this.server.close();
            console.log("server closed");
        }
    };
}

module.exports = HttpServer;
