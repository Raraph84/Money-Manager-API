const { getOutflows } = require("../../resources");
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

    let sql = "UPDATE outflows ";
    const args = [];

    if (typeof request.jsonBody.toName !== "undefined" || typeof request.jsonBody.toBusiness !== "undefined") {
        let toBusiness;
        try {
            toBusiness = await validators.validateTo(request, database);
        } catch (error) {
            return;
        }

        sql += (!sql.includes("SET") ? " SET" : ",") + " to_name=?, to_business_id=?";
        args.push(request.jsonBody.toName, toBusiness?.id ?? null);
    }

    if (typeof request.jsonBody.description !== "undefined") {
        try {
            await validators.validateDescription(request);
        } catch (error) {
            return;
        }

        sql += (!sql.includes("SET") ? " SET" : ",") + " description=?";
        args.push(request.jsonBody.description);
    }

    if (typeof request.jsonBody.startDate !== "undefined" || typeof request.jsonBody.endDate !== "undefined") {
        try {
            await validators.validateStartEndDates(request);
        } catch (error) {
            return;
        }

        sql += (!sql.includes("SET") ? " SET" : ",") + " start_date=?, end_date=?";
        args.push(request.jsonBody.startDate, request.jsonBody.endDate);
    }

    if (typeof request.jsonBody.date !== "undefined") {
        try {
            await validators.validateDate(request);
        } catch (error) {
            return;
        }

        sql += (!sql.includes("SET") ? " SET" : ",") + " date=?";
        args.push(request.jsonBody.date);
    }

    if (!args.length) {
        request.end(400, "Nothing to update");
        return;
    }

    let outflow;
    try {
        outflow = (await getOutflows(database, [request.urlParams.outflowId]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!outflow) {
        request.end(400, "This outflow does not exist");
        return;
    }

    sql += " WHERE outflow_id=?";
    args.push(outflow.id);

    try {
        await database.query(sql, args);
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    request.end(204);
};

module.exports.infos = {
    path: "/outflows/:outflowId",
    method: "PATCH",
    requiresAuth: true
};
