const validators = require("../../inflowValidators");

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
    let fromBusiness;
    try {
        person = await validators.validatePerson(request, database);
        fromBusiness = await validators.validateFrom(
            request,
            database,
            request.jsonBody.fromName,
            request.jsonBody.fromBusiness
        );
        validators.validateAmount(request);
        validators.validateFees(request);
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
                "INSERT INTO inflows (person_id, from_name, from_business_id, amount, fees, description, start_date, end_date, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    person.id,
                    request.jsonBody.fromName,
                    fromBusiness?.id ?? null,
                    request.jsonBody.amount,
                    request.jsonBody.fees,
                    request.jsonBody.description,
                    request.jsonBody.startDate,
                    request.jsonBody.endDate,
                    request.jsonBody.date
                ]
            )
        )[0].insertId;
        await database.query("UPDATE people SET balance=ROUND(balance+?, 2) WHERE person_id=?", [
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
    path: "/inflows",
    method: "POST",
    requiresAuth: true
};
