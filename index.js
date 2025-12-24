const { getConfig, TaskManager, HttpServer, filterEndpointsByPath } = require("raraph84-lib");
const fs = require("fs");
const path = require("path");
const myqsl = require("mysql2/promise");
const config = getConfig(__dirname);

require("dotenv").config({ path: [".env.local", ".env"] });

const tasks = new TaskManager();

const database = myqsl.createPool({
    password: process.env.DATABASE_PASSWORD,
    charset: "utf8mb4_general_ci",
    ...config.database
});
tasks.addTask(
    (resolve, reject) => {
        console.log("Connecting to the database...");
        database
            .query("SELECT 1")
            .then(() => {
                console.log("Connected to the database.");
                resolve();
            })
            .catch((error) => {
                console.log("Cannot connect to the database - " + error);
                reject();
            });
    },
    (resolve) => database.end().then(() => resolve())
);

const endpointsFiles = fs
    .readdirSync(path.join(__dirname, "src", "endpoints"), { recursive: true })
    .filter((file) => file.endsWith(".js"))
    .map((command) => require(path.join(__dirname, "src", "endpoints", command)));

const api = new HttpServer();
api.on("request", async (/** @type {import("raraph84-lib/src/Request")} */ request) => {
    const endpoints = filterEndpointsByPath(endpointsFiles, request);

    request.setHeader("Access-Control-Allow-Origin", "*");

    if (!endpoints[0]) {
        request.end(404, "Not found");
        return;
    }

    if (request.method === "OPTIONS") {
        request.setHeader("Access-Control-Allow-Methods", endpoints.map((endpoint) => endpoint.infos.method).join(","));
        if (request.headers["access-control-request-headers"])
            request.setHeader("Access-Control-Allow-Headers", request.headers["access-control-request-headers"]);
        request.setHeader("Vary", "Access-Control-Request-Headers");
        request.end(204);
        return;
    }

    const endpoint = endpoints.find((endpoint) => endpoint.infos.method === request.method);
    if (!endpoint) {
        request.end(405, "Method not allowed");
        return;
    }

    request.urlParams = endpoint.params;

    if (endpoint.infos.requiresAuth && !request.headers.authorization) {
        request.end(401, "Missing authorization");
        return;
    }

    if (request.headers.authorization) {
        let token;
        try {
            token = (
                await database.query("SELECT * FROM tokens WHERE token=? && date>?", [
                    request.headers.authorization,
                    request.date - 24 * 60 * 60 * 1000
                ])
            )[0][0];
        } catch (error) {
            request.end(500, "Internal server error");
            console.log(`SQL Error - ${__filename} - ${error}`);
            return;
        }

        if (!token || token.token !== request.headers.authorization) {
            request.end(401, "Invalid token");
            return;
        }

        request.authenticated = true;

        if (request.date > token.date) {
            database
                .query("UPDATE tokens SET date=? WHERE token=?", [request.date, token.token])
                .catch((error) => console.log(`SQL Error - ${__filename} - ${error}`));
        }
    }

    endpoint.run(request, database);
});
tasks.addTask(
    (resolve, reject) => {
        console.log("Starting the HTTP server...");
        api.listen(config.apiPort)
            .then(() => {
                console.log("HTTP server started on port " + config.apiPort + ".");
                resolve();
            })
            .catch((error) => {
                console.log("Cannot start the HTTP server - " + error);
                reject();
            });
    },
    (resolve) => api.close().then(() => resolve())
);

tasks.run();
