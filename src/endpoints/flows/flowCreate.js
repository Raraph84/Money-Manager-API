const { getPeople, getAccounts, getBusinesses } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    if (!request.jsonBody) {
        request.end(400, "Invalid JSON");
        return;
    }

    if (typeof request.jsonBody.fromAccount === "undefined") {
        request.end(400, "Missing from account");
        return;
    }

    if (typeof request.jsonBody.fromAccount !== "number") {
        request.end(400, "From account must be a number");
        return;
    }

    if (typeof request.jsonBody.toAccount === "undefined") {
        request.end(400, "Missing to account");
        return;
    }

    if (typeof request.jsonBody.toAccount !== "number") {
        request.end(400, "To account must be a number");
        return;
    }

    if (typeof request.jsonBody.amount === "undefined") {
        request.end(400, "Missing amount");
        return;
    }

    if (typeof request.jsonBody.amount !== "number") {
        request.end(400, "Amount must be a number");
        return;
    }

    if (typeof request.jsonBody.date === "undefined") {
        request.end(400, "Missing date");
        return;
    }

    if (typeof request.jsonBody.date !== "number") {
        request.end(400, "Date must be a number");
        return;
    }

    let fromAccount;
    try {
        fromAccount = (await getAccounts(database, [request.jsonBody.fromAccount]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    if (!fromAccount) {
        request.end(400, "From account does not exist");
        return;
    }

    let toAccount;
    try {
        toAccount = (await getAccounts(database, [request.jsonBody.toAccount]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    if (!toAccount) {
        request.end(400, "To account does not exist");
        return;
    }

    if (fromAccount.id === toAccount.id) {
        request.end(400, "From and to accounts must be different");
        return;
    }

    let id;
    try {
        id = (await database.query("INSERT INTO flows (from_account_id, to_account_id, amount, date) VALUES (?, ?, ?, ?)", [fromAccount.id, toAccount.id, request.jsonBody.amount, request.jsonBody.date]))[0].insertId;
        await database.query("UPDATE accounts SET balance=ROUND(balance-?, 2) WHERE account_id=?", [request.jsonBody.amount, fromAccount.id]);
        await database.query("UPDATE accounts SET balance=ROUND(balance+?, 2) WHERE account_id=?", [request.jsonBody.amount, toAccount.id]);
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    request.end(200, { id });
}

module.exports.infos = {
    path: "/flows",
    method: "POST",
    requiresAuth: true
}
