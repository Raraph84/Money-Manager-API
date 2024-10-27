const { getInflows, getOutflows, getAccounts } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    if (!request.jsonBody) {
        request.end(400, "Invalid JSON");
        return;
    }

    if (typeof request.jsonBody.inflow === "undefined" && typeof request.jsonBody.fromAccount === "undefined") {
        request.end(400, "Missing inflow or from account");
        return;
    }

    if (typeof request.jsonBody.inflow !== "undefined" && typeof request.jsonBody.fromAccount !== "undefined") {
        request.end(400, "Inflow and from account cannot be both defined");
        return;
    }

    if (typeof request.jsonBody.inflow !== "undefined" && typeof request.jsonBody.inflow !== "number") {
        request.end(400, "Inflow must be a number");
        return;
    }

    if (typeof request.jsonBody.fromAccount !== "undefined" && typeof request.jsonBody.fromAccount !== "number") {
        request.end(400, "From account must be a number");
        return;
    }

    if (typeof request.jsonBody.outflow === "undefined" && typeof request.jsonBody.toAccount === "undefined") {
        request.end(400, "Missing outflow or to account");
        return;
    }

    if (typeof request.jsonBody.outflow !== "undefined" && typeof request.jsonBody.toAccount !== "undefined") {
        request.end(400, "Outflow and to account cannot be both defined");
        return;
    }

    if (typeof request.jsonBody.outflow !== "undefined" && typeof request.jsonBody.outflow !== "number") {
        request.end(400, "Outflow must be a number");
        return;
    }

    if (typeof request.jsonBody.toAccount !== "undefined" && typeof request.jsonBody.toAccount !== "number") {
        request.end(400, "To account must be a number");
        return;
    }

    if (typeof request.jsonBody.fromAccount === "undefined" && typeof request.jsonBody.toAccount === "undefined") {
        request.end(400, "Missing from account or to account");
        return;
    }

    if (typeof request.jsonBody.fromAccount !== "undefined" && typeof request.jsonBody.toAccount !== "undefined" && request.jsonBody.fromAccount === request.jsonBody.toAccount) {
        request.end(400, "From account and to account cannot be the same");
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

    let inflow;
    if (typeof request.jsonBody.inflow !== "undefined") {
        try {
            inflow = (await getInflows(database, [request.jsonBody.inflow]))[0];
        } catch (error) {
            request.end(500, "Internal server error");
            console.log(`SQL Error - ${__filename} - ${error}`);
            return;
        }

        if (!inflow) {
            request.end(400, "Inflow does not exist");
            return;
        }
    }

    let fromAccount;
    if (typeof request.jsonBody.fromAccount !== "undefined") {
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
    }

    let outflow;
    if (typeof request.jsonBody.outflow !== "undefined") {
        try {
            outflow = (await getOutflows(database, [request.jsonBody.outflow]))[0];
        } catch (error) {
            request.end(500, "Internal server error");
            console.log(`SQL Error - ${__filename} - ${error}`);
            return;
        }

        if (!outflow) {
            request.end(400, "Outflow does not exist");
            return;
        }
    }

    let toAccount;
    if (typeof request.jsonBody.toAccount !== "undefined") {
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
    }

    let id;
    try {
        id = (await database.query("INSERT INTO flows (inflow_id, from_account_id, outflow_id, to_account_id, amount, date) VALUES (?, ?, ?, ?, ?, ?)", [inflow?.id ?? null, fromAccount?.id ?? null, outflow?.id ?? null, toAccount?.id ?? null, request.jsonBody.amount, request.jsonBody.date]))[0].insertId;
        if (fromAccount) await database.query("UPDATE accounts SET balance=ROUND(balance-?, 2) WHERE account_id=?", [request.jsonBody.amount, fromAccount.id]);
        if (toAccount) await database.query("UPDATE accounts SET balance=ROUND(balance+?, 2) WHERE account_id=?", [request.jsonBody.amount, toAccount.id]);
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
