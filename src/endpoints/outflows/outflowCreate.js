const validators = require("../../flowValidators");

/**
 * @param {import("raraph84-lib/src/Request")} request
 * @param {import("mysql2/promise").Pool} database
 */
module.exports.run = async (request, database) => {
    if (!request.jsonBody) {
        request.end(400, "Invalid JSON");
        return;
    }

    let person;
    let toBusiness;
    try {
        person = await validators.validatePerson(request, database);
        toBusiness = await validators.validateTo(request, database);
        validators.validateAmount(request);
        validators.validateDescription(request);
        validators.validateStartEndDates(request);
        validators.validateDate(request);
    } catch (error) {
        return;
    }

    let id;
    try {
        id = (
            await database.query(
                "INSERT INTO outflows (person_id, to_name, to_business_id, amount, description, start_date, end_date, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    person.id,
                    request.jsonBody.toName,
                    toBusiness?.id ?? null,
                    request.jsonBody.amount,
                    request.jsonBody.description,
                    request.jsonBody.startDate,
                    request.jsonBody.endDate,
                    request.jsonBody.date
                ]
            )
        )[0].insertId;
        await database.query("UPDATE people SET balance=ROUND(balance-?, 2) WHERE person_id=?", [
            request.jsonBody.amount,
            person.id
        ]);
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    request.end(200, { id });
};

module.exports.infos = {
    path: "/outflows",
    method: "POST",
    requiresAuth: true
};
