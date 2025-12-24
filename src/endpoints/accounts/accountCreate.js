/**
 * @param {import("raraph84-lib/src/Request")} request
 * @param {import("mysql2/promise").Pool} database
 */
module.exports.run = async (request, database) => {
    if (!request.jsonBody) {
        request.end(400, "Invalid JSON");
        return;
    }

    if (typeof request.jsonBody.name === "undefined") {
        request.end(400, "Missing name");
        return;
    }

    if (typeof request.jsonBody.name !== "string") {
        request.end(400, "Name must be a string");
        return;
    }

    if (request.jsonBody.name.length < 2 || request.jsonBody.name.length > 50) {
        request.end(400, "Name must be between 2 and 50 characters");
        return;
    }

    let id;
    try {
        id = (await database.query("INSERT INTO accounts (name, balance) VALUES (?, 0)", [request.jsonBody.name]))[0]
            .insertId;
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    request.end(200, { id });
};

module.exports.infos = {
    path: "/accounts",
    method: "POST",
    requiresAuth: true
};
