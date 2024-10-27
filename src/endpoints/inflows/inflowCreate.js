const { getPeople, getBusinesses } = require("../../resources");

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

    if (typeof request.jsonBody.fromName === "undefined" && typeof request.jsonBody.fromBusiness === "undefined") {
        request.end(400, "Missing from name or from business");
        return;
    }

    if (typeof request.jsonBody.fromName !== "undefined" && typeof request.jsonBody.fromBusiness !== "undefined") {
        request.end(400, "From name and from business cannot be both defined");
        return;
    }

    if (typeof request.jsonBody.fromName !== "undefined" && typeof request.jsonBody.fromName !== "string") {
        request.end(400, "From name must be a string");
        return;
    }

    if (typeof request.jsonBody.fromName !== "undefined" && (request.jsonBody.fromName.length < 2 || request.jsonBody.fromName.length > 50)) {
        request.end(400, "From name must be between 2 and 50 characters");
        return;
    }

    if (typeof request.jsonBody.fromBusiness !== "undefined" && typeof request.jsonBody.fromBusiness !== "number") {
        request.end(400, "From business must be a number");
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

    let fromBusiness;
    if (typeof request.jsonBody.fromBusiness !== "undefined") {
        try {
            fromBusiness = (await getBusinesses(database, [request.jsonBody.fromBusiness]))[0];
        } catch (error) {
            request.end(500, "Internal server error");
            console.log(`SQL Error - ${__filename} - ${error}`);
            return;
        }

        if (!fromBusiness) {
            request.end(400, "This business does not exist");
            return;
        }
    }

    let id;
    try {
        id = (await database.query("INSERT INTO inflows (person_id, from_name, from_business_id, amount, description, start_date, end_date, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [person.id, request.jsonBody.fromName ?? null, fromBusiness?.id ?? null, request.jsonBody.amount, request.jsonBody.description, request.jsonBody.startDate, request.jsonBody.endDate, request.jsonBody.date]))[0].insertId;
        await database.query("UPDATE people SET balance=ROUND(balance+?, 2) WHERE person_id=?", [request.jsonBody.amount, person.id]);
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    request.end(200, { id });
}

module.exports.infos = {
    path: "/inflows",
    method: "POST",
    requiresAuth: true
}
