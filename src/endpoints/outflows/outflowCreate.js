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

    if (typeof request.jsonBody.person === "undefined") {
        request.end(400, "Missing person");
        return;
    }

    if (typeof request.jsonBody.person !== "number") {
        request.end(400, "Person must be a number");
        return;
    }

    if (typeof request.jsonBody.account === "undefined") {
        request.end(400, "Missing account");
        return;
    }

    if (typeof request.jsonBody.account !== "number") {
        request.end(400, "Account must be a number");
        return;
    }

    if (typeof request.jsonBody.toName === "undefined" && typeof request.jsonBody.toBusiness === "undefined") {
        request.end(400, "Missing to name or to business");
        return;
    }

    if (typeof request.jsonBody.toName !== "undefined" && typeof request.jsonBody.toBusiness !== "undefined") {
        request.end(400, "To name and to business cannot be both defined");
        return;
    }

    if (typeof request.jsonBody.toName !== "undefined" && typeof request.jsonBody.toName !== "string") {
        request.end(400, "To name must be a string");
        return;
    }

    if (typeof request.jsonBody.toName !== "undefined" && (request.jsonBody.toName.length < 2 || request.jsonBody.toName.length > 50)) {
        request.end(400, "To name must be between 2 and 50 characters");
        return;
    }

    if (typeof request.jsonBody.toBusiness !== "undefined" && typeof request.jsonBody.toBusiness !== "number") {
        request.end(400, "To business must be a number");
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

    if (typeof request.jsonBody.description === "undefined") {
        request.end(400, "Missing description");
        return;
    }

    if (typeof request.jsonBody.description !== "string" && request.jsonBody.description !== null) {
        request.end(400, "Description must be a string or null");
        return;
    }

    if (request.jsonBody.description !== null && (request.jsonBody.description.length < 2 || request.jsonBody.description.length > 100)) {
        request.end(400, "Description must be between 2 and 100 characters");
        return;
    }

    if (typeof request.jsonBody.startDate === "undefined") {
        request.end(400, "Missing start date");
        return;
    }

    if (typeof request.jsonBody.startDate !== "number" && request.jsonBody.startDate !== null) {
        request.end(400, "Start date must be a number or null");
        return;
    }

    if (typeof request.jsonBody.endDate === "undefined") {
        request.end(400, "Missing end date");
        return;
    }

    if (typeof request.jsonBody.endDate !== "number" && request.jsonBody.endDate !== null) {
        request.end(400, "End date must be a number or null");
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

    let person;
    try {
        person = (await getPeople(database, [request.jsonBody.person]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    if (!person) {
        request.end(400, "This person does not exist");
        return
    }

    let account;
    try {
        account = (await getAccounts(database, [request.jsonBody.account]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    if (!account) {
        request.end(400, "This account does not exist");
        return;
    }

    let toBusiness;
    if (typeof request.jsonBody.toBusiness !== "undefined") {
        try {
            toBusiness = (await getBusinesses(database, [request.jsonBody.toBusiness]))[0];
        } catch (error) {
            request.end(500, "Internal server error");
            console.log(`SQL Error - ${__filename} - ${error}`);
            return;
        }

        if (!toBusiness) {
            request.end(400, "This business does not exist");
            return;
        }
    }

    let id;
    try {
        id = (await database.query("INSERT INTO outflows (person_id, account_id, to_name, to_business_id, amount, description, start_date, end_date, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [person.id, account.id, request.jsonBody.toName ?? null, toBusiness?.id ?? null, request.jsonBody.amount, request.jsonBody.description, request.jsonBody.startDate, request.jsonBody.endDate, request.jsonBody.date]))[0].insertId;
        await database.query("UPDATE people SET balance=ROUND(balance-?, 2) WHERE person_id=?", [request.jsonBody.amount, person.id]);
        await database.query("UPDATE accounts SET balance=ROUND(balance-?, 2) WHERE account_id=?", [request.jsonBody.amount, account.id]);
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    request.end(200, { id });
}

module.exports.infos = {
    path: "/outflows",
    method: "POST",
    requiresAuth: true
}
