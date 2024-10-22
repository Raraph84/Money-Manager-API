const { randomString } = require("raraph84-lib");
const bcrypt = require("bcrypt");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    if (!request.jsonBody) {
        request.end(400, "Invalid JSON");
        return;
    }

    if (typeof request.jsonBody.password === "undefined") {
        request.end(400, "Missing password");
        return;
    }

    if (typeof request.jsonBody.password !== "string") {
        request.end(400, "Password must be a string");
        return;
    }

    let fails;
    try {
        fails = (await database.query("SELECT * FROM login_fails WHERE ip=?", [request.ip]))[0][0];
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    if (fails && fails.fails >= 5 && fails.date >= request.date - 24 * 60 * 60 * 1000) {
        request.end(429, "Too many fails");
        return;
    }

    if (!await bcrypt.compare(request.jsonBody.password, process.env.PASSWORD)) {

        try {
            if (!fails || fails.date < request.date - 24 * 60 * 60 * 1000)
                await database.query("INSERT INTO login_fails (ip, fails, date) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE fails=1, date=?", [request.ip, request.date, request.date]);
            else
                await database.query("UPDATE login_fails SET fails=fails+1 WHERE IP=?", [request.ip]);
        } catch (error) {
            request.end(500, "Internal server error");
            console.log(`SQL Error - ${__filename} - ${error}`);
            return;
        }

        request.end(401, "Invalid password");
        return;
    }

    const token = randomString(100);

    try {
        await database.query("INSERT INTO tokens (token, date) VALUES (?, ?)", [token, request.date]);
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    request.end(200, { token });
}

module.exports.infos = {
    path: "/auth/login",
    method: "POST",
    requiresAuth: false
}
