const { getInflows } = require("../../resources");
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

    let sql = "UPDATE inflows ";
    const args = [];

    if (typeof request.jsonBody.fromName !== "undefined" || typeof request.jsonBody.fromBusiness !== "undefined") {
        let fromBusiness;
        try {
            fromBusiness = await validators.validateFrom(request, database);
        } catch (error) {
            return;
        }

        sql += (!sql.includes("SET") ? " SET" : ",") + " from_name=?, from_business_id=?";
        args.push(request.jsonBody.fromName, fromBusiness?.id ?? null);
    }

    if (typeof request.jsonBody.fees !== "undefined") {
        try {
            await validators.validateFees(request);
        } catch (error) {
            return;
        }

        sql += (!sql.includes("SET") ? " SET" : ",") + " fees=?";
        args.push(request.jsonBody.fees);
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

    let inflow;
    try {
        inflow = (await getInflows(database, [request.urlParams.inflowId]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!inflow) {
        request.end(400, "This inflow does not exist");
        return;
    }

    sql += " WHERE inflow_id=?";
    args.push(inflow.id);

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
    path: "/inflows/:inflowId",
    method: "PATCH",
    requiresAuth: true
};
